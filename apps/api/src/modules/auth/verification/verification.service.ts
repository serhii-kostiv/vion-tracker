import { Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { TokenType, User } from '@repo/database';
import { PrismaService } from '@/core/prisma/prisma.service';
import { generateToken } from '@/shared/utils/generate-token.util';
import { saveSession } from '@/shared/utils/session.util';
import { getSessionMetadata } from '@/shared/utils/session-metadata.util';

import { MailService } from '@/libs/mail/mail.service';

import { VerificationDto } from './dto/verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailSerivce: MailService,
  ) {}

  async verify(req: Request, input: VerificationDto, userAgent: string) {
    const { token } = input;

    const existingToken = await this.prismaService.token.findFirst({
      where: {
        token,
        type: TokenType.EMAIL_VERIFY,
        expiresIn: {
          gt: new Date(),
        },
      },
    });

    if (!existingToken) {
      throw new NotFoundException('Token not found or expired');
    }

    const user = await this.prismaService.user.update({
      where: {
        id: existingToken.userId ?? undefined,
      },
      data: {
        isEmailVerified: true,
      },
    });

    await this.prismaService.token.delete({
      where: {
        id: existingToken.id,
      },
    });

    const metadata = getSessionMetadata(req, userAgent);

    return saveSession(req, user, metadata);
  }

  async sendVerificationToken(user: User) {
    const verificationToken = await generateToken(
      this.prismaService,
      user,
      TokenType.EMAIL_VERIFY,
      true,
    );

    await this.mailSerivce.sendVerificationToken(
      user.email,
      verificationToken.token,
    );

    return true;
  }
}
