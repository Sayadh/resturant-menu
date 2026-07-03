# Backend (NestJS)

Տեղը՝ `backend/`։ NestJS 10 + Prisma 6 + PostgreSQL (Supabase)։
Բոլոր route-երը՝ `/api/v1/...` (global prefix `api` + URI versioning `v1`)։

## Bootstrap (`src/main.ts`)

- `setGlobalPrefix('api')` + `enableVersioning({ type: URI, prefix: 'v', defaultVersion: '1' })` → `/api/v1/*`
- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) —
  չգրանցված դաշտերը մերժվում են, տիպերը ավտոմատ ձևափոխվում։
- CORS՝ configured origins (prod domains) + `localhost`/`127.0.0.1` (dev) + no-origin (curl/SSR)։
- Port՝ `PORT` env (default 4000)։

## Modules (`src/`)

| Module | Path | Route prefix | Դեր |
|---|---|---|---|
| Auth | `auth/` | `admin/auth`, `admin/me` | login/refresh/logout, current user |
| Restaurant | `restaurant/` | `admin/restaurant` | ընթացիկ tenant-ի profile/theme |
| Sections | `sections/` | `admin/sections` | մենյուի բաժիններ (CRUD + reorder) |
| Categories | `categories/` | `admin/categories` | կատեգորիաներ (CRUD + reorder) |
| Products | `products/` | `admin/products` | ապրանքներ (CRUD + reorder + availability) |
| SuperAdmin | `super-admin/` | `super-admin/restaurants` | ռեստորանների կառավարում (platform) |
| Public | `public/` | `public` | հրապարակային՝ menu, restaurants, lead, resolve |
| Health | `health/` | `health` | health check |
| Prisma | `prisma/` | — | `PrismaService` (DB հասանելիություն) |

Բոլորը գրանցված են `src/app.module.ts`-ում։

## Global providers (`app.module.ts`)

Կիրառվում են **ամբողջ** app-ի վրա հերթականությամբ՝

1. `APP_INTERCEPTOR: ResponseInterceptor` — ամեն պատասխան փաթաթում է
   `{ success: true, data, message }` envelope-ի մեջ։
2. `APP_FILTER: AllExceptionsFilter` — ամեն error → `{ success: false, message, errors }`։
3. `APP_GUARD: JwtAuthGuard` — **default-ով ամեն route պաշտպանված է**. token
   պարտադիր է, բացի `@Public()`-ով նշվածներից։
4. `APP_GUARD: RolesGuard` — ստուգում է `@Roles(...)` / `@SuperAdmin()` role-երը։

## Common (`src/common/`)

- `decorators/`
  - `@Public()` — route-ը բացում է առանց token-ի (public endpoint-ներ)
  - `@Roles(...)` / `roles.decorator` — թույլատրված role-եր
  - `@RestaurantId()` — JWT-ից քաշում է `restaurantId`-ն (multi-tenant բանալի)
  - `@CurrentUser()` — JWT-ի payload-ը
- `guards/` — `jwt-auth.guard`, `roles.guard`, `restaurant-scope.guard`
- `interceptors/response.interceptor` — envelope
- `filters/all-exceptions.filter` — error envelope
- `context/` — request-context middleware (request-id, և այլն)
- `dto/` — կիսվող DTO-ներ (`list-query`, `reorder`, `translation-input`)
- `utils/` — `duration` (JWT expiry parse), `sort`, `translations`

## Controller → Service → Prisma օրինակ

```ts
// controller — routing + validation
@Post()
create(@RestaurantId() restaurantId: string, @Body() dto: CreateProductDto) {
  return this.products.create(restaurantId, dto)   // id JWT-ից, ոչ body-ից
}

// service — business logic
async create(restaurantId: string, dto: CreateProductDto) {
  return this.prisma.product.create({ data: { restaurantId, ...map(dto) } })
}
```

## Config (`src/config/`)

- `configuration.ts` — `.env` → typed config (`port`, `corsOrigins`, `jwt`, `telegram` …)
- `env.validation.ts` — env-ի ստուգում boot-ի ժամանակ (պարտադիր vs optional)

## Prisma (`backend/prisma/`)

- `schema.prisma` — բոլոր model-երը (տես [DATABASE.md](./DATABASE.md))
- `seed.ts` — բազայի սկզբնական տվյալ (`npm run db:seed`)
- `create-demo.ts` — demo ռեստորան (clone tun-lahmajo, generic անուն) — `npm run create:demo`
- `add-super-admin.ts` — SUPER_ADMIN user — `npm run add:superadmin`
- `add-restaurant.ts` — նոր ռեստորան CLI-ից — `npm run add:restaurant`
- `clone-menu.ts` — մենյու կլոնավորում ռեստորանից ռեստորան — `npm run clone:menu`

## npm scripts (`backend/package.json`)

| Script | Ինչ է անում |
|---|---|
| `start:dev` | `nest start --watch` (dev, auto-reload) |
| `build` | `nest build` → `dist/` |
| `start` / `start:prod` | `node dist/main.js` |
| `prisma:generate` | Prisma client generate |
| `prisma:migrate` | `prisma migrate dev` |
| `db:seed` / `create:demo` / `add:superadmin` / `add:restaurant` / `clone:menu` | տես վերև |

## `.env` (backend)

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...@...pooler.supabase.com:5432/postgres   # Session pooler
JWT_ACCESS_SECRET=<strong>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<strong>
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGINS=https://menus.am,https://www.menus.am
TELEGRAM_BOT_TOKEN=<optional, lead-ի համար>
TELEGRAM_CHAT_ID=<optional>
```

> Գաղտնաբառում հատուկ նշանները պիտի URL-encoded լինեն (`@`→`%40`, `&`→`%26`)։
> Endpoint-ների ամբողջ ցանկը՝ [API.md](./API.md)։ Auth-ը՝ [AUTH.md](./AUTH.md)։
