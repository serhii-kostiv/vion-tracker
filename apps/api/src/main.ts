import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from '@/core/prisma/prisma-exception.filter';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { TimingInterceptor } from '@/common/interceptors/timing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // Global ValidationPipe з security settings
  app.useGlobalPipes(
    new ValidationPipe({
      // Security: видаляє поля, які не визначені в DTO
      whitelist: true,
      // Security: викидає помилку якщо є невідомі поля
      forbidNonWhitelisted: true,
      // Автоматична трансформація типів (string -> number, тощо)
      transform: true,
      // Включає implicit type conversion
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  // Global timing interceptor для performance monitoring
  app.useGlobalInterceptors(new TimingInterceptor());

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  const port = config.getOrThrow<number>('APPLICATION_PORT');
  await app.listen(port);

  console.log('🚀 Application is starting...');
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(
    `🌐 CORS enabled for: ${config.getOrThrow<string>('ALLOWED_ORIGIN')}`,
  );
  console.log('📝 Global validation pipe enabled with security settings');
  console.log('   - whitelist: true (removes unknown fields)');
  console.log('   - forbidNonWhitelisted: true (rejects unknown fields)');
  console.log('   - transform: true (auto type conversion)');
}

void bootstrap();
