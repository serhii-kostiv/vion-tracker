import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import session from 'express-session';

import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from '@/core/prisma/prisma-exception.filter';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { TimingInterceptor } from '@/common/interceptors/timing.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RedisService } from '@/core/redis/redis.service';
import { parseBoolean } from '@/shared/utils/parse-boolean.util';
import { ms, type StringValue } from '@/shared/utils/ms.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const redis = app.get(RedisService);

  // Session middleware
  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
    }),
  );

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vion Tracker API')
    .setDescription('REST API для застосунку відстеження особистих фінансів')
    .setVersion('1.0')
    .addCookieAuth('session')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory);

  const port = config.getOrThrow<number>('APPLICATION_PORT');
  await app.listen(port);

  console.log('🚀 Application is starting...');
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(
    `🌐 CORS enabled for: ${config.getOrThrow<string>('ALLOWED_ORIGIN')}`,
  );
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
  console.log('� Session middleware enabled with Redis store');
  console.log('�📝 Global validation pipe enabled with security settings');
  console.log('   - whitelist: true (removes unknown fields)');
  console.log('   - forbidNonWhitelisted: true (rejects unknown fields)');
  console.log('   - transform: true (auto type conversion)');
}

void bootstrap();
