# Frontend (Nuxt 3)

Տեղը՝ `frontend/`։ Nuxt 3 + Vue 3 (Composition API, `<script setup>`) +
TypeScript + Pinia + Tailwind։

## Pages (`pages/`)

| Route | Ֆայլ | Դեր |
|---|---|---|
| `/` | `pages/index.vue` | Landing (SaaS հրապարակային էջ) |
| `/<slug>` | `pages/[slug].vue` | Ռեստորանի հրապարակային մենյու (թեմայով) |
| `/admin` | `pages/admin.vue` | Admin վահանակ (login-ից հետո) |

`[slug].vue`՝ բեռնում է ռեստորանը slug-ով (`useLazyAsyncData`, `server: false`),
render է անում `ThemeRenderer`-ով, դնում է per-restaurant OG meta (`useHead`)։
`?theme=<aria|atelier|maison|heritage>` query-ով render-only override
(օգտագործվում է landing-ի demo-ում)։

## Stores (Pinia, `stores/`)

| Store | Ինչ է պահում |
|---|---|
| `auth.ts` | access/refresh token, current user, login/refresh/logout/init, `isAuthenticated` |
| `restaurant.ts` | ընթացիկ ռեստորանը, թեմաների catalog (fully API-backed) |
| `menu.ts` | մենյուի levels/categories/items (public render + admin preview), local CRUD helpers |
| `order.ts` | պատվերի զամբյուղ + favorites (հաճախորդի կողմ) |

## Services (`services/`)

Միակ շերտն է, որ գիտի HTTP/API-ի մասին։ Callers-ը (store/page) կանչում են
service-ի մեթոդներ, ոչ երբեք ուղիղ `$fetch`։

| Service | Endpoint-ներ |
|---|---|
| `http.ts` | HTTP client (envelope unwrap, Bearer token, 401→refresh→retry) |
| `restaurantService.ts` | public restaurants/slug, admin restaurant, setTheme |
| `menuService.ts` | public menu, admin sections/categories/products հավաքում |
| `sectionService.ts` / `categoryService.ts` / `productService.ts` | admin CRUD + reorder |
| `superAdminService.ts` | `/super-admin/restaurants` CRUD |
| `leadService.ts` | `POST /public/lead` (contact modal → Telegram) |
| `uploadService.ts` | նկար → data URL, link → og:image (`/api/resolve-image`) |
| `themeService.ts` | թեմաների catalog (`data/themeCatalog.ts`-ից) |
| `_api-map.ts` | **backend DTO ↔ frontend տիպ** mapper-ներ (`mapRestaurant`, `mapProduct` …) |
| `index.ts` | barrel — `import { ... } from '~/services'` |

**Կանոն.** Backend-ի ֆորմատը frontend-ի տիպերի հետ չհամընկնելիս՝ ձևափոխումը
գրվում է **միայն** `_api-map.ts`-ում, ոչ երբեք store/component-ում։

## HTTP client (`services/http.ts`)

- `useApiClient()` → `.get/.post/.patch/.delete`
- Base՝ SSR-ում `apiBaseServer`, client-ում `public.apiBase` (տես ARCHITECTURE.md)
- Ավտոմատ կցում է `Authorization: Bearer <accessToken>` (եթե login է)
- Unwrap է անում `{ success, data }` envelope-ը → վերադարձնում է միայն `data`
- 401 դեպքում authenticated call-ի՝ մեկ անգամ refresh + retry

## Composables (`composables/`)

| Composable | Դեր |
|---|---|
| `useLanguage.ts` | ընթացիկ hy/ru/en լեզուն + `tr()` helper (translation object → string) |
| `useAdminI18n.ts` | admin UI-ի թարգմանություններ (`t('save')` …) |
| `useLeadModal.ts` | contact/lead modal-ի բացում/փակում (landing) |
| `useBrand.ts` | ռեստորանի brand տվյալ (անուն/logo/գույն) themes-ի համար |
| `useDesign.ts` | design-related helper-ներ |

## Themes (`themes/`)

Ամեն թեմա՝ ինքնուրույն թղթապանակ (`atelier/`, `maison/`) layout + components +
styles-ով։ `aria` և `heritage`-ը՝ `components/DesignAria.vue` / `DesignHeritage.vue`։
Բոլորը կապվում են `themes/registry.ts`-ում (`themeId → component`)։ Մանրամասն՝
[THEMES.md](./THEMES.md)։

## Data & models

- `data/themeCatalog.ts` — `THEMES` (admin Design-ի catalog) + `emptyRestaurant` placeholder
- `data/menu.ts` — մենյուի frontend տիպերը (`MenuLevel`, `MenuCategory`) + ui labels
- `models/types.ts` — domain տիպեր (`Restaurant`, `Product`, `Category`, `LangCode`, `ThemeId` …)

## Components

- `components/landing/*` — landing-ի բլոկները (Hero, Features, Pricing, Faq, Cta,
  Footer, About, ContactModal, Nav, Demo, AdminPreview, Themes, HowItWorks, Reveal)
- `components/*` (shared) — `TheHeader`, `MenuCard`, `MenuBadge`, `CategoryNav`,
  `OrderSheet`, `LanguageSwitcher`, `ImageLightbox`, `AdminModal`, icon-ներ, և թեմա-
  design-ներ `DesignAria`/`DesignHeritage`, `ThemeRenderer`

> Nuxt-ի auto-import. `components/landing/LandingHero.vue` → `<LandingHero>`,
> `components/landing/Reveal.vue` → `<LandingReveal>` (թղթապանակ + ֆայլ անուն)։

## Config (`nuxt.config.ts`)

- `runtimeConfig` — `apiBaseServer` (SSR) + `public.apiBase` (client)
- `app.head` — global meta/OG + fonts (Inter, Cinzel, Cormorant, Noto Armenian)
- `modules` — `@nuxtjs/tailwindcss`, `@pinia/nuxt`

## `.env` (frontend)

```env
NUXT_PUBLIC_USE_API=true
NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1   # dev; prod-ում՝ /api/v1
NUXT_API_BASE_SERVER=http://127.0.0.1:4000/api/v1
NUXT_PUBLIC_DEFAULT_SLUG=tun-lahmajo
```
