import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User as UserEntity } from '@repo/database';

export const User = createParamDecorator(
  (data: keyof UserEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: UserEntity }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
