import * as Joi from 'joi'

// Fail fast on boot if required env vars are missing/invalid.
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(4000),
  CORS_ORIGINS: Joi.string().optional(),
  PUBLIC_BASE_DOMAIN: Joi.string().allow('').optional(),
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(8).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(8).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  TELEGRAM_BOT_TOKEN: Joi.string().allow('').optional(),
  TELEGRAM_CHAT_ID: Joi.string().allow('').optional(),
})
