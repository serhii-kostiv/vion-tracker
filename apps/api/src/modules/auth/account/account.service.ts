import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';

import { User } from '@repo/database';
import { PrismaService } from '@/core/prisma/prisma.service';

import { VerificationService } from '../verification/verification.service';

import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly verificationService: VerificationService,
  ) {}

  async me(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        defaultCurrency: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async create(input: CreateUserDto) {
    const { name, email, password } = input;

    const isEmailExist = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (isEmailExist) {
      throw new ConflictException('Email already exist');
    }

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: await hash(password),
      },
    });

    await this.verificationService.sendVerificationToken(user);

    return {
      message: 'User created successfully',
      user,
    };
  }

  async changeEmail(user: User, input: ChangeEmailDto) {
    const { email } = input;

    // Перевіряємо, чи email не зайнятий
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new ConflictException('Email already in use');
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        email,
        isEmailVerified: false, // Потрібна повторна верифікація
      },
    });

    return {
      message: 'Email changed successfully. Please verify your new email.',
    };
  }

  async changePassword(user: User, input: ChangePasswordDto) {
    const { oldPassword, newPassword } = input;

    const isValidPassword = await verify(user.password, oldPassword);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid old password');
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await hash(newPassword),
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
