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
  // Supabase Storage (image uploads). Optional so the app still boots without
  // it; the uploads endpoint returns a clear error until it's configured.
  SUPABASE_URL: Joi.string().uri().allow('').optional(),
  SUPABASE_SECRET_KEY: Joi.string().allow('').optional(),
  SUPABASE_BUCKET: Joi.string().default('menu-images'),
  // OpenAI (AI translation + descriptions). Optional so the app boots without
  // it; the /ai endpoints return a clear error until it's configured.
  OPENAI_API_KEY: Joi.string().allow('').optional(),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
})
