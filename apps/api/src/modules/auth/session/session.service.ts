import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import type { Request } from 'express';

import { PrismaService } from '@/core/prisma/prisma.service';
import { RedisService } from '@/core/redis/redis.service';
import { getSessionMetadata } from '@/shared/utils/session-metadata.util';
import { destroySession, saveSession } from '@/shared/utils/session.util';

import { VerificationService } from '../verification/verification.service';

import { LoginDto } from './dto/login.dto';

interface SessionData {
  userId: string;
  createdAt: Date;
  id: string;
  [key: string]: unknown;
}

export type { SessionData };

@Injectable()
export class SessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly verificationService: VerificationService,
  ) {}

  async findByUser(req: Request) {
    const userId = req.session.userId;

    if (!userId) {
      throw new NotFoundException('User not found in session');
    }

    const keys = await this.redisService.keys('*');
    const userSessions: SessionData[] = [];

    for (const key of keys) {
      const sessionData = await this.redisService.get(key);

      if (sessionData) {
        const session = JSON.parse(sessionData as string) as SessionData;

        if (session.userId === userId) {
          userSessions.push({
            ...session,
            id: key.split(':')[1],
          });
        }
      }
    }

    userSessions.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return userSessions.filter((session) => session.id !== req.sessionID);
  }

  async findCurrent(req: Request) {
    const sessionId = req.sessionID;
    const sessionData = await this.redisService.get(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`,
    );

    if (!sessionData) {
      throw new NotFoundException('Session not found');
    }

    const session = JSON.parse(sessionData as string) as SessionData;

    return {
      ...session,
      id: sessionId,
    };
  }

  async login(req: Request, dto: LoginDto, userAgent: string) {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    if (user.isDeactivated) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.isEmailVerified) {
      await this.verificationService.sendVerificationToken(user);
      throw new BadRequestException(
        'Email not verified, please check your email address',
      );
    }

    const metadata = getSessionMetadata(req, userAgent);

    return saveSession(req, user, metadata);
  }

  async logout(req: Request) {
    return destroySession(req, this.configService);
  }

  async clearSession(req: Request) {
    req.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
    return true;
  }

  async remove(req: Request, id: string) {
    if (req.sessionID === id) {
      throw new ConflictException('Cannot remove current session');
    }

    await this.redisService.del(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`,
    );

    return true;
  }
}
