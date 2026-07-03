# backend/ — NestJS API (արագ ուղեցույց)

Ամբողջական փաստաթուղթ՝ [`../docs/BACKEND.md`](../docs/BACKEND.md),
[`../docs/API.md`](../docs/API.md), [`../docs/DATABASE.md`](../docs/DATABASE.md),
[`../docs/AUTH.md`](../docs/AUTH.md)։

## Հիմնականը

- NestJS 10 + Prisma 6 + PostgreSQL (Supabase)։ Route-եր՝ `/api/v1/*`։
- Կառուցվածք՝ `Controller (routing/validation) → Service (logic) → Prisma (DB)`։
- Ամեն պատասխան՝ `{ success, data, message }` envelope (ResponseInterceptor)։
- Default-ով ամեն route պաշտպանված է (JwtAuthGuard) — բացիր `@Public()`-ով։

## Ոսկե կանոն

**`restaurantId` ՄԻՇՏ JWT-ից** (`@RestaurantId()`), երբեք body/params-ից։
Ամեն admin service մեթոդ առաջին արգումենտով ստանում է `restaurantId` և Prisma
query-ն ֆիլտրում է դրանով (multi-tenant անվտանգություն)։

## Module-ներ (`src/`)

`auth` · `restaurant` · `sections` · `categories` · `products` · `super-admin` ·
`public` · `health` · `prisma` · `common` (guards/decorators/interceptors/dto/utils)։
Բոլորը գրանցված՝ `src/app.module.ts`։

## Հաճախ պետք գործիքներ

```bash
npm run start:dev        # dev, watch
npm run build            # → dist/
npm run prisma:migrate   # schema փոխելուց հետո
npm run db:seed          # սկզբնական տվյալ
npm run create:demo      # demo ռեստորան
npm run add:superadmin   # SUPER_ADMIN user
```

## Նոր դաշտ/endpoint ավելացնելիս

տես [`../docs/AI-GUIDE.md`](../docs/AI-GUIDE.md) Recipe 1–3։ Կարգը՝
schema → DTO → service → controller → (frontend service + _api-map + types)։

## `.env` (gitignored)

`PORT`, `DATABASE_URL` (Supabase Session pooler :5432, password URL-encoded),
`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (+ expiry), `CORS_ORIGINS`,
`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` (optional)։
