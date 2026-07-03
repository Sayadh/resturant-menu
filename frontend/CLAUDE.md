# frontend/ — Nuxt 3 app (արագ ուղեցույց)

Ամբողջական փաստաթուղթ՝ [`../docs/FRONTEND.md`](../docs/FRONTEND.md),
[`../docs/THEMES.md`](../docs/THEMES.md), [`../docs/AI-GUIDE.md`](../docs/AI-GUIDE.md)։

## Հիմնականը

- Nuxt 3 + Vue 3 (`<script setup>`, Composition API) + TS + Pinia + Tailwind։
- 3 էջ՝ `pages/index.vue` (landing) · `pages/[slug].vue` (public menu) · `pages/admin.vue`։
- API-only — ոչ մի mock/localStorage data շերտ (հանված է)։

## Շերտերի պատասխանատվություն

| Շերտ | Ինչ է անում | Ինչ ՉԻ անում |
|---|---|---|
| `pages/` | routing, data բեռնում, UI հավաքում | business logic |
| `components/` | ներկայացում | API կանչ, global state |
| `stores/` | Pinia state (auth, restaurant, menu, order) | UI markup |
| `services/` | HTTP → domain տիպ (**միակ** API տեղը) | UI |
| `services/_api-map.ts` | backend DTO ↔ frontend տիպ | ուրիշ ամեն ինչ |
| `themes/` | հրապարակային տեսք, կարդում է store-երից | logic/API |

## Ոսկե կանոններ

1. API կանչ **միայն** `services/`-ից, ոչ ուղիղ `$fetch` page/store-ում։
2. Backend↔frontend փոխակերպում **միայն** `_api-map.ts`-ում։
3. Թեմաներ՝ `themes/registry.ts` (switch չգրես)։
4. Translatable դաշտ = `{ hy, en, ru }`։

## Auto-import (Nuxt)

- `components/landing/LandingHero.vue` → `<LandingHero>`
- `components/landing/Reveal.vue` → `<LandingReveal>`
- `composables/*` և `stores/*` ավտոմատ հասանելի են (import պետք չէ)

## Dev

```bash
npm run dev      # → http://localhost:3000  (backend-ը պիտի աշխատի :4000-ում)
```

Local-ում browser-ը ուղիղ խոսում է `:4000`-ի հետ (`.env` → `NUXT_PUBLIC_API_BASE`)։
Prod-ում՝ `/api/v1` same-origin։ Տես [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)։

## Ենթա-թղթապանակների CLAUDE.md

`services/`, `stores/`, `themes/`, `components/` ունեն իրենց CLAUDE.md՝ լրացուցիչ մանրամասնով։
