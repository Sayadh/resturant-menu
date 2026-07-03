# menus.am — QR Menu SaaS հարթակ

Multi-tenant (բազմավարձակալ) QR մենյուի հարթակ։ **Մեկ** backend + **մեկ** բազա +
**մեկ** admin սպասարկում է **շատ** ռեստորան, որոնք իրարից բաժանված են
`restaurantId`-ով։ Ամեն ռեստորան ունի իր հրապարակային էջը (`menus.am/<slug>`),
իր մենյուն, թեման և լեզուները։

> 📖 Այս ֆայլը **գլխավոր index**-ն է։ Մանրամասն փաստաթղթերը՝ [`docs/`](./docs) թղթապանակում։
> Ամեն մեծ թղթապանակ ունի նաև իր `CLAUDE.md`-ն՝ AI-ի/մշակողի համար արագ կողմնորոշիչ։

---

## Ի՞նչ է սա (մեկ պարբերությամբ)

Ռեստորանը գրանցվում է, ընտրում թեմա, լցնում մենյուն admin վահանակից, ստանում QR
կոդ։ Հաճախորդը սկանավորում է QR-ը → բացվում է `menus.am/<slug>` հրապարակային
մենյուն՝ ընտրված թեմայով, 3 լեզվով (hy/ru/en)։ Ամեն ինչ մեկ VPS-ի վրա է
(nginx same-origin), բազան՝ Supabase PostgreSQL։

## Տեխնոլոգիաներ

| Շերտ | Տեխնոլոգիա |
|---|---|
| Frontend | Nuxt 3, Vue 3 (Composition API), TypeScript, Pinia, Tailwind |
| Backend | NestJS 10, Prisma 6, class-validator, JWT (access+refresh) |
| Բազա | PostgreSQL (Supabase) |
| Deploy | Ինքնա-հոսթ VPS-ի վրա՝ Nginx + PM2 + Let's Encrypt |

## Կառուցվածք (monorepo)

```
resturant-menu/
├── backend/          NestJS API — Prisma + Supabase PostgreSQL
│   ├── src/          modules · guards · DTOs (URI-versioned /api/v1)
│   ├── prisma/       schema · seed · create-demo · add-super-admin
│   └── CLAUDE.md     backend-ի արագ ուղեցույց
│
├── frontend/         Nuxt 3 app
│   ├── pages/        / (landing) · /[slug] (public menu) · /admin
│   ├── components/   landing/* + shared UI + theme designs
│   ├── themes/       atelier · maison + registry (themeId → component)
│   ├── stores/       Pinia (auth · restaurant · menu · order)
│   ├── services/     API client-ներ (http · restaurant · menu · lead …)
│   ├── composables/  useLanguage · useAdminI18n · useLeadModal …
│   ├── data/         themeCatalog · menu (types)
│   ├── models/       types.ts — frontend-ի domain տիպերը
│   └── CLAUDE.md     frontend-ի արագ ուղեցույց
│
├── docs/             📖 մանրամասն փաստաթղթեր (տես ներքև)
├── DEPLOY-VPS.md     production deploy (menus.am)
├── DEPLOY-STAGING.md staging deploy (staging.menus.am)
└── package.json      root convenience scripts
```

Backend և frontend **անկախ** npm փաթեթներ են (ամեն մեկն իր `package.json`,
`node_modules`, `.env`)։ Root `package.json`-ը միայն delegating scripts է պահում։

## Փաստաթղթերի քարտեզ (`docs/`)

| Ֆայլ | Ինչի մասին է |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Ընդհանուր պատկեր, multi-tenant մոդել, request flow |
| [docs/BACKEND.md](./docs/BACKEND.md) | NestJS կառուցվածք, modules, guards, interceptors |
| [docs/FRONTEND.md](./docs/FRONTEND.md) | Nuxt կառուցվածք, pages, stores, services, i18n |
| [docs/DATABASE.md](./docs/DATABASE.md) | Prisma schema, բոլոր model-ները, կապերը |
| [docs/API.md](./docs/API.md) | Բոլոր endpoint-ների ամբողջական ցանկը |
| [docs/AUTH.md](./docs/AUTH.md) | JWT, refresh, role-եր, guard-եր, multi-tenant անվտանգություն |
| [docs/THEMES.md](./docs/THEMES.md) | Թեմաների համակարգ, ինչպես ավելացնել նոր թեմա |
| [docs/AI-GUIDE.md](./docs/AI-GUIDE.md) | «Ինչպես փոխել X»-ի recipe-ներ AI/մշակողի համար |

## Արագ մեկնարկ (local)

```bash
# մեկ անգամ՝ install երկուսն էլ
npm run install:all

# երկուսը միասին (նախ root-ում՝ npm install՝ npm-run-all-ի համար)
npm run dev
#  → backend  http://localhost:4000/api/v1
#  → frontend http://localhost:3000

# …կամ առանձին երկու terminal-ով
npm run dev:back
npm run dev:front
```

Admin՝ `http://localhost:3000/admin`։ Հրապարակային մենյու՝ `http://localhost:3000/<slug>`։

> ⚠️ Local dev-ում browser-ը ուղիղ խոսում է backend-ի հետ
> (`frontend/.env` → `NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1`), որովհետև
> Nitro-ն զբաղեցնում է `/api` namespace-ը։ Production-ում այն `/api/v1` է
> (same-origin, nginx-ի հետևում)։ Մանրամասն՝ [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)։

## Build

```bash
npm run build          # backend + frontend
npm run build:back     # → backend/dist
npm run build:front    # → frontend/.output
```

## Deploy

Ինքնա-հոսթ մեկ VPS-ի վրա (`91.195.254.29`)՝ Nginx reverse proxy (same-origin, no
CORS) + PM2 + Let's Encrypt, բազան՝ Supabase։ Տես [DEPLOY-VPS.md](./DEPLOY-VPS.md)
(production) և [DEPLOY-STAGING.md](./DEPLOY-STAGING.md) (staging)։

## Կարևոր սկզբունքներ (կարճ)

- **`restaurantId` միշտ JWT-ից** — երբեք body/params-ից (multi-tenant անվտանգություն)։
- **API-only** — frontend-ը ամբողջությամբ backend-ից է կարդում (mock/localStorage շերտ չկա)։
- **Թեման՝ registry-ով** — `themeId → component`, switch-ներ չկան (տես THEMES.md)։
- **3 լեզու ամենուր** — hy/ru/en, ամեն translatable դաշտ պահվում է 3-ով։
- **Response envelope** — backend-ը միշտ վերադարձնում է `{ success, data, message }`։
