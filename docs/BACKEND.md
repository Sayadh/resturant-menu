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
| Public | `public/` | `public` | հրապարակային՝ menu, restaurants, **search**, lead, resolve |
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
  - `@PublicCache()` — HTTP cache թույլատրում է (տես ստորև)
  - `@Roles(...)` / `roles.decorator` — թույլատրված role-եր
  - `@RestaurantId()` — JWT-ից քաշում է `restaurantId`-ն (multi-tenant բանալի)
  - `@CurrentUser()` — JWT-ի payload-ը
- `guards/` — `jwt-auth.guard`, `roles.guard`, `restaurant-scope.guard`
- `cache/public-cache.service` — հրապարակային payload-ների in-memory cache
- `interceptors/response.interceptor` — envelope + cache header-ներ
- `interceptors/cache-invalidation.interceptor` — cache-ի մաքրում գրառումից հետո
- `filters/all-exceptions.filter` — error envelope
- `context/` — request-context middleware (request-id, և այլն)
- `dto/` — կիսվող DTO-ներ (`list-query`, `reorder`, `translation-input`)
- `utils/` — `duration` (JWT expiry parse), `sort`, `translations`

## Public cache

Բազան այլ ռեգիոնում է, և Prisma-ն ամեն `include`-ը լուծում է առանձին query-ով,
ուստի մեկ `getMenu` արժեր ~2 վրկ (չափված production-ում)։ Հյուրի մենյուն կարդացվում
է անընդհատ, գրվում՝ օրական մի քանի անգամ, ուստի կարդալու ուղին cache-վում է․

```
PublicService.cached(key, tenantOf, load)
  → PublicCacheService  (Map, խմբավորված ըստ restaurantId)
```

**Ճշտությունը գալիս է invalidation-ից, ոչ թե TTL-ից։** `CacheInvalidationInterceptor`-ը
գլոբալ է․ ամեն **հաջողված ոչ-GET** հարցումից հետո ջնջում է այդ tenant-ի բոլոր
entry-ները։ Կախված է հարցումից (ոչ թե service-ի մեթոդներից), ուստի նոր admin
endpoint ավելացնելիս ոչինչ չի մոռացվում։ TTL-ը (10 րոպե) միայն ապահովագրություն է։

Header-ները՝ `ResponseInterceptor`-ում․

| Route | Header | Ինչու |
|---|---|---|
| Սովորական | `Cache-Control: no-store` + `Vary: Authorization` | Tenant-ը գալիս է header-ից — cache-ը կարող էր մեկի տվյալը մյուսին տալ |
| `@PublicCache()` | `Cache-Control: public, no-cache` + ETag | URL-ը լիովին որոշում է պատասխանը; չփոխված մենյուն ստանում է 304՝ առանց body-ի |

`@PublicCache()` դիր **միայն** չաուտենտիֆիկացված GET-երի վրա, որոնց URL-ը լրիվ
նկարագրում է վերադարձվողը (`public.controller.ts`-ի հինգ route-ը)։

⚠️ Cache-ը **մեկ պրոցեսի ներսում է**։ API-ն աշխատում է pm2 fork ռեժիմում (մեկ
instance) — այնտեղ սա ճիշտ է։ `pm2 -i > 1` կամ երկրորդ սերվեր անցնելիս պետք կլինի
Redis, այլապես invalidation-ը կհասնի միայն մեկ instance-ի։

Query-ների կողմից՝ `select` ամենուր (ոչ `include`), translation-ները ֆիլտրվում են
ըստ լեզվի, badge key-երը գալիս են զուգահեռ մեկ catalogue query-ով — ամեն ավելորդ
relation հավասար է ևս մեկ round-trip դեպի հեռավոր բազա։

## Ուտեստների որոնում (`GET /public/restaurants/:id/search?q=&lang=`)

Հյուրի որոնումը backend-ում է․ համեմատվում է ամեն ուտեստի անունն ու նկարագրությունը
**բոլոր լեզուներով** (հայերեն մենյուում «cola» գրելը գտնում է «Կոլա»-ն)։

- **Ֆիլտր** (`PublicService.search`)՝ ակտիվ ուտեստ → ակտիվ կատեգորիա → ակտիվ բաժին
  (կամ առանց բաժնի) → ակտիվ ռեստորան։ Ամեն բառ պետք է գտնվի (AND), `ILIKE`։
- **Դասավորություն** (`public/menu-search.ts`, մաքուր ֆունկցիաներ, թեստ՝
  `test/menu-search.test.ts`)՝ ճիշտ անուն → անունը սկսվում է → բառն է սկսվում →
  անվան ներսում → միայն նկարագրության մեջ։ Հավասարի դեպքում՝ հյուրի լեզուն, ապա `sortOrder`։
- **Պատասխան**՝ `{ query, total, items: [{ id, categoryId, name }] }` (առավելագույնը 30)։
  Frontend-ը id-ներով վերցնում է արդեն բեռնված ուտեստները (`useMenuSearch`)՝ նույն քարտը,
  նույն գինը, նույն «+»-ը։
- **Cache չկա դիտավորյալ**․ ամեն տարբեր query կդառնար cache entry և դուրս կմղեր իրական
  մենյուները 300-entry cache-ից։ Փոխարենը՝ սեփական rate limit (120/րոպե/IP — մի ամբողջ
  դահլիճ մեկ Wi-Fi IP-ից), `ParseUUIDPipe` id-ի վրա, `q`-ն՝ ≤64 նիշ, < 2 նիշ → դատարկ։

## Բաժանորդային վճարումներ (super-admin)

`RestaurantPayment` (`restaurant_payments`)՝ «ռեստորանը վճարել է `months` ամսվա
համար՝ սկսած `paidAt` օրից»։ **Միայն հաշվառում է** — ոչինչ չի միացնում/անջատում։

| Route (SUPER_ADMIN) | Ինչ |
|---|---|
| `GET /super-admin/restaurants` | ամեն տողում `payment`՝ ամենաերկար ժամկետով վճարումը կամ `null` |
| `GET /super-admin/restaurants/:id/payments` | պատմությունը, նորից հին |
| `POST /super-admin/restaurants/:id/payments` | `{ paidAt: 'YYYY-MM-DD', months: 1\|3\|6\|12 }` |
| `DELETE /super-admin/restaurants/:id/payments/:paymentId` | սխալ գրառման ջնջում (միայն այդ ռեստորանի) |

- Օրերը **օրացույցային** են (`DATE`, ոչ timestamp)՝ `'YYYY-MM-DD'` տողերով։
- `paidUntil = paidAt + months`՝ ամսվա վերջին օրով սահմանափակված (Jan 31 + 1 → Feb 28),
  հաշվում է backend-ը (`super-admin/billing.ts`, թեստ՝ `test/billing.test.ts`) և պահում։
- Բազայում CHECK-եր՝ `months IN (1,3,6,12)` և `paidUntil > paidAt`։

## Կատեգորիայի բաններների նկարներ

`categories`-ում desktop և mobile բաններից յուրաքանչյուրը նույն փաթեթն է.

| | Desktop (16:5) | Mobile (4:3) |
|---|---|---|
| Ցուցադրվող | `imageUrl` (960×300) | `mobileImageUrl` (800×600) |
| Retina | `imageHiResUrl` (1600×500) | `mobileImageHiResUrl` (1200×900) |
| Original | `imageOriginalUrl` | `mobileImageOriginalUrl` |
| Կադրում | `imageCrop` | `mobileImageCrop` |

- Migration՝ `20261003120000_category_mobile_image_crop` (additive, idempotent)։
- `PATCH /admin/categories/:id`-ը partial է․ admin-ը մեկ բանները պահպանում է առանձին։ Փոխարինված/մաքրված URL-ների ֆայլերը (6-ն էլ) ջնջվում են storage-ից, իսկ մաքրված նկարի `crop`-ը դառնում է `NULL`։
- Public menu-ն վերադարձնում է `imageHiRes` և `mobileImageHiRes`։ Original-ն ու crop-ը միայն admin-ի համար են։

## Ջնջում և «Վերադարձնել» (undo)

Ապրանքը, կատեգորիան և բաժինը ջնջվում են soft (`deletedAt`)։ Մեկ ջնջումը նույն `deletedAt`-ն է դնում նաև այն ամենին, ինչ cascade-ով գնաց (կատեգորիա → ապրանքներ, բաժին → կատեգորիաներ → ապրանքներ)։

- `POST /admin/{products|categories|sections}/:id/restore` (owner/manager) — վերադարձնում է հենց այդ ջնջումը. նախկինում առանձին ջնջվածները ջնջված են մնում։
- Թույլատրվում է ջնջումից `RESTORE_WINDOW_MS` (60 վ, `common/utils/restore-window.ts`) ընթացքում․ ադմինը կոճակը ցույց է տալիս 10 վ։ Հետո՝ `410 Gone`։
- Idempotent (չջնջվածի վրա՝ `200`), tenant-ը JWT-ից (այլ ռեստորանի id → `404`), plan limit-ը ստուգվում է (`assertCanCreate(…, adding)`), ծնողը պետք է կենդանի լինի (`409`)։
- Public cache-ը մաքրվում է `CacheInvalidationInterceptor`-ով։

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
DATABASE_URL=postgresql://...@...pooler.supabase.com:5432/postgres?connection_limit=5&pool_timeout=20   # Session pooler (pool_size 15 — keep connection_limit so one process can't take them all)
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
