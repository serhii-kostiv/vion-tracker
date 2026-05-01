import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { envValidationSchema } from './env.validation';

/**
 * Config module з валідацією environment variables
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'), // apps/api/.env (якщо є)
        resolve(process.cwd(), '../../.env'), // корінь монорепо
      ],
      expandVariables: true, // Підтримка ${VAR} інтерполяції
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true, // Дозволяємо інші env variables
        abortEarly: false, // Показуємо всі помилки валідації одразу
      },
    }),
  ],
})
export class ConfigModule {}
