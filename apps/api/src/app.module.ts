import { MailModule } from './libs/mail/mail.module';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@/core/config/config.module';
import { PrismaModule } from '@/core/prisma/prisma.module';
import { RedisModule } from '@/core/redis/redis.module';
import { HealthModule } from '@/modules/health/health.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { AuthGuard } from '@/common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    MailModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
