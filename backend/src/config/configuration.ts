export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,https://affiliation-consideration-ended-postage.trycloudflare.com')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Base domain for subdomain resolution (e.g. "qrmenu.am" → tun-lahmajo.qrmenu.am).
  publicBaseDomain: process.env.PUBLIC_BASE_DOMAIN ?? '',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  // Landing lead notifications → Telegram (both values live only in .env).
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
    chatId: process.env.TELEGRAM_CHAT_ID ?? '',
  },
  // Supabase Storage for image uploads (server-side; secret key only in .env).
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    secretKey: process.env.SUPABASE_SECRET_KEY ?? '',
    bucket: process.env.SUPABASE_BUCKET ?? 'menu-images',
  },
  // OpenAI for AI translation + description generation (server-side only).
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  },
})
