import { Module } from '@nestjs/common';
import { ConfigModule } from '@/core/config/config.module';
import { PrismaModule } from '@/core/prisma/prisma.module';
import { HealthModule } from '@/modules/health/health.module';

@Module({
  imports: [ConfigModule, PrismaModule, HealthModule],
})
export class AppModule {}
