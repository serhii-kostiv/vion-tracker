import * as Joi from 'joi';

/**
 * Joi schema для валідації environment variables
 * Забезпечує fail-fast підхід - додаток не запуститься без необхідних змінних
 */
export const envValidationSchema = Joi.object({
  // Application
  // NODE_ENV: Joi.string()
  //   .valid('development', 'production', 'test')
  //   .default('development'),
  APPLICATION_PORT: Joi.number().port().default(4000),
  APPLICATION_URL: Joi.string().uri().required(),
  ALLOWED_ORIGIN: Joi.string().uri().required(),

  // Database
  DATABASE_URL: Joi.string().uri().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});
