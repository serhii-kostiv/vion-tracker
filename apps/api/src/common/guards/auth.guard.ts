import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PrismaService } from '@/core/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Перевіряємо чи endpoint публічний
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request.session as any)?.userId;

    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Завантажуємо користувача і кладемо в request.user
    const user = await this.prisma.user.findUnique({
      where: { id: userId as string },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isDeactivated) {
      throw new UnauthorizedException('Account is deactivated');
    }

    (request as any).user = user;

    return true;
  }
}
