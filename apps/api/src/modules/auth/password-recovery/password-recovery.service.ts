import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import type { Request } from 'express';

import { TokenType } from '@repo/database';
import { PrismaService } from '@/core/prisma/prisma.service';
import { generateToken } from '@/shared/utils/generate-token.util';

import { NewPasswordDto } from './dto/new-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '@/libs/mail/mail.service';
import { getSessionMetadata } from '@/shared/utils/session-metadata.util';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async resetPassword(
    req: Request,
    input: ResetPasswordDto,
    userAgent: string,
  ) {
    const { email } = input;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Не розкриваємо, чи існує користувач
      return {
        message:
          'If an account with this email exists, a password reset link has been sent',
      };
    }

    if (user.isDeactivated) {
      throw new BadRequestException('Account is deactivated');
    }

    const resetToken = await generateToken(
      this.prismaService,
      user,
      TokenType.PASSWORD_RESET,
      true, // UUID токен
    );

    const metadata = getSessionMetadata(req, userAgent);

    await this.mailService.sendPasswordResetToken(
      user.email,
      resetToken.token,
      metadata,
    );

    return true;
  }

  async newPassword(input: NewPasswordDto) {
    const { password, token } = input;

    const existingToken = await this.prismaService.token.findUnique({
      where: {
        token,
        type: TokenType.PASSWORD_RESET,
      },
    });

    if (!existingToken) {
      throw new NotFoundException('Token not found');
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date();

    if (hasExpired) {
      throw new BadRequestException('Token expired');
    }

    await this.prismaService.user.update({
      where: {
        id: existingToken.userId ?? undefined,
      },
      data: {
        password: await hash(password),
      },
    });

    await this.prismaService.token.delete({
      where: {
        id: existingToken.id,
        type: TokenType.PASSWORD_RESET,
      },
    });

    return true;
  }
}
