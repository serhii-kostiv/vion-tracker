import * as Joi from 'joi';

/**
 * Joi schema для валідації environment variables
 * Забезпечує fail-fast підхід - додаток не запуститься без необхідних змінних
 */
export const envValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APPLICATION_PORT: Joi.number().port().default(4000),
  APPLICATION_URL: Joi.string().uri().required(),
  ALLOWED_ORIGIN: Joi.string().uri().required(),

  // Database
  DATABASE_URL: Joi.string().uri().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Redis
  REDIS_USER: Joi.string().default('default'),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_URI: Joi.string().required(),

  // Mail
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().port().default(465),
  MAIL_LOGIN: Joi.string().email().required(),
  MAIL_PASSWORD: Joi.string().required(),

  // Session
  SESSION_SECRET: Joi.string().min(16).required(),
  SESSION_NAME: Joi.string().default('vion.sid'),
  SESSION_DOMAIN: Joi.string().default('localhost'),
  SESSION_MAX_AGE: Joi.string().default('7d'),
  SESSION_HTTP_ONLY: Joi.string().valid('true', 'false').default('true'),
  SESSION_SECURE: Joi.string().valid('true', 'false').default('false'),
  SESSION_FOLDER: Joi.string().default('vion:session:'),
});
