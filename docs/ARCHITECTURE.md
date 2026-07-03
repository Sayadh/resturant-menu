# Ճարտարապետություն (Architecture)

## Ընդհանուր պատկեր

menus.am-ը **multi-tenant SaaS** է. մեկ backend + մեկ բազա + մեկ admin կոդ
սպասարկում է շատ ռեստորան։ Ռեստորանները իրարից տարբերվում են `restaurantId`-ով
(բազայում) և `slug`-ով (URL-ում, օր. `menus.am/tun-lahmajo`)։

```
                         ┌─────────────────────────────┐
   Հաճախորդ (QR) ───────▶│  Nginx (menus.am, :443)     │
   Ռեստորան (admin) ────▶│  same-origin reverse proxy  │
                         └──────────────┬──────────────┘
                    / (UI)              │  /api/v1/* (API)
                    ▼                   ▼
        ┌───────────────────┐   ┌───────────────────┐
        │ Nuxt 3 (PM2 :3000)│   │ NestJS (PM2 :4000)│
        │ SSR + client      │   │ /api/v1 REST      │
        └─────────┬─────────┘   └─────────┬─────────┘
                  │ SSR-ը ուղիղ            │ Prisma
                  │ կանչում է backend      ▼
                  └──────────────▶ ┌───────────────────┐
                                   │ Supabase Postgres │
                                   └───────────────────┘
```

## Երեք մուտքակետ (entry points)

1. **Landing** — `frontend/pages/index.vue` → `menus.am/`
   Հրապարակային SaaS էջը (hero, features, pricing, demo, about, contact modal)։
   Բաղկացած է `components/landing/*`-ից։

2. **Հրապարակային մենյու** — `frontend/pages/[slug].vue` → `menus.am/<slug>`
   Բեռնում է ռեստորանը slug-ով, render անում ընտրված **թեմայով**
   (`ThemeRenderer` → `themes/registry.ts`)։ `?theme=` query-ով կարելի է
   ժամանակավոր override անել (միայն preview-ի համար)։

3. **Admin** — `frontend/pages/admin.vue` → `menus.am/admin`
   Login-ից հետո՝ ռեստորանի կառավարում (info, menu, products, design, languages,
   QR)։ SUPER_ADMIN-ը ստանում է առանձին «Restaurants» tab (ստեղծել/խմբագրել/ջնջել)։

## Request flow (հրապարակային մենյու, օրինակ)

```
Browser → GET menus.am/tun-lahmajo
  → Nuxt SSR (pages/[slug].vue)
    → useLazyAsyncData → restaurantService.getRestaurantBySlug('tun-lahmajo')
      → http.ts → GET /api/v1/public/restaurants/tun-lahmajo
        → (SSR) ուղիղ http://127.0.0.1:4000, (client) same-origin /api/v1
      → NestJS PublicController → PublicService → Prisma → Postgres
    → mapRestaurant() backend→frontend տիպերի փոխակերպում (_api-map.ts)
    → ThemeRenderer → getThemeComponent(themeId) → <AtelierMenu> / <MaisonExperience> …
```

## Request flow (admin CRUD, օրինակ)

```
admin.vue → productService.createProduct(draft)
  → http.ts (Bearer <accessToken>) → POST /api/v1/admin/products
    → JwtAuthGuard (token վավեր?) → RolesGuard (role թույլ?)
    → ProductsController → ProductsService
      → restaurantId վերցվում է JWT-ից (ոչ body-ից!) → Prisma create
    → ResponseInterceptor փաթաթում է { success, data }
  → 401 դեպքում http.ts ինքնաշխատ refresh անում է մեկ անգամ ու կրկնում
```

## API base — dev vs prod (կարևոր)

Frontend-ը API-ի հասցեն վերցնում է `runtimeConfig`-ից (`nuxt.config.ts`)՝

| Միջավայր | `apiBase` (client) | `apiBaseServer` (SSR) |
|---|---|---|
| **Local dev** | `http://localhost:4000/api/v1` (ուղիղ, CORS) | `http://127.0.0.1:4000/api/v1` |
| **Production** | `/api/v1` (same-origin, nginx) | `http://127.0.0.1:4000/api/v1` |

Ինչու՞ dev-ում ուղիղ. Nitro-ն (Nuxt server) զբաղեցնում է `/api` namespace-ը
(`server/api/resolve-image.get.ts`-ի պատճառով), ուստի `devProxy`-ն չի աշխատում։
Դրա փոխարեն browser-ը ուղիղ խոսում է `:4000`-ի հետ, իսկ backend-ի CORS-ը թույլ է
տալիս `localhost`։ Production-ում ամեն ինչ same-origin է nginx-ի հետևում՝ CORS
պետք չէ։ Արժեքները դրվում են `frontend/.env`-ում։

## Ինչ շերտ ինչ գիտի (separation of concerns)

- **pages/** — routing + data բեռնում (`useLazyAsyncData`), UI հավաքում
- **components/** — ներկայացում (presentation), state չեն պահում (բացի local UI)
- **stores/** (Pinia) — application state (auth token, current restaurant, menu, order)
- **services/** — HTTP կանչեր backend → domain տիպեր (միակ տեղը որ API գիտի)
- **_api-map.ts** — backend DTO ↔ frontend տիպերի փոխակերպում (mapper-ներ)
- **themes/** — զուտ presentation, կարդում են shared store-երից, logic չեն պարունակում

Backend-ում՝ `Controller → Service → Prisma`։ Controller-ը routing/validation է,
Service-ը՝ business logic, Prisma-ն՝ բազա։

## Multi-tenancy — ինչպես է աշխատում

- Ամեն tenant-ի տվյալ ունի `restaurantId` FK։
- **Admin endpoint-ներում** `restaurantId`-ը վերցվում է **JWT-ից**
  (`@RestaurantId()` decorator), երբեք body/params-ից → ռեստորանը չի կարող
  ուրիշի տվյալ կարդալ/փոխել (403)։
- **Public endpoint-ներում** tenant-ը որոշվում է URL-ի `slug`-ով։
- **SUPER_ADMIN**-ը tenant չունի — platform role է, առանձին endpoint-ներ
  (`/super-admin/restaurants`)։

Մանրամասն՝ [AUTH.md](./AUTH.md)։
