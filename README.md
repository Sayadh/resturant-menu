# menus.am — QR Menu SaaS Platform

Multi-tenant QR menu platform. One backend + database + admin serves many
restaurants, separated by `restaurantId`.

## Structure

```
resturant-menu/
├── backend/          NestJS 10 API — Prisma + Supabase PostgreSQL
│   ├── src/          modules, guards, DTOs (URI-versioned /api/v1)
│   ├── prisma/       schema, seed, create-demo, add-super-admin scripts
│   └── .env          backend secrets (PORT, DATABASE_URL, JWT, Telegram)
│
├── frontend/         Nuxt 3 app — Vue 3 + TS + Pinia + Tailwind
│   ├── pages/        / (landing) · /[slug] (public menu) · /admin
│   ├── components/   landing/* + shared UI + theme designs
│   ├── composables/  useLeadModal, i18n, etc.
│   ├── services/     API clients (http, auth, menu, lead …)
│   ├── stores/       Pinia (auth, restaurant, menu, order)
│   ├── themes/       theme registry + renderer
│   └── .env          frontend runtime (NUXT_PUBLIC_*)
│
├── package.json      root convenience scripts (delegate to sub-apps)
└── README.md
```

Backend and frontend are **independent** npm packages — each has its own
`package.json`, `node_modules`, and `.env`. The root `package.json` only holds
convenience scripts that delegate into them.

## Local development

```bash
# one-time: install both
npm run install:all           # or: npm --prefix backend i && npm --prefix frontend i

# run both together (needs root deps: npm install once at root)
npm run dev

# …or run them separately in two terminals
npm run dev:back              # NestJS  → http://127.0.0.1:4000
npm run dev:front            # Nuxt    → http://localhost:3000
```

Frontend proxies `/api/*` → backend in dev (see `frontend/nuxt.config.ts`
`nitro.devProxy`), so it's a single origin with no CORS.

## Build

```bash
npm run build                 # builds backend then frontend
# or individually:
npm run build:back            # → backend/dist
npm run build:front           # → frontend/.output
```

## Deployment

Self-hosted on a single VPS behind Nginx (same-origin, no CORS) with PM2 +
Let's Encrypt. See `DEPLOY-VPS.md` (production) and `DEPLOY-STAGING.md`
(staging.menus.am). After the frontend/ restructure, all frontend build and PM2
paths live under `frontend/`.
