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
styles-ով (`heritage/`-ը ներառյալ)։ `aria`-ն՝ `components/DesignAria.vue`։
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
  design `DesignAria` (+ հին `DesignHeritage`՝ rollback-ի համար, չի օգտագործվում), `ThemeRenderer`

> Nuxt-ի auto-import. `components/landing/LandingHero.vue` → `<LandingHero>`,
> `components/landing/Reveal.vue` → `<LandingReveal>` (թղթապանակ + ֆայլ անուն)։

## Նկարների կադրում (admin)

Ապրանքի նկարը և կատեգորիայի երկու բանները անցնում են `AdminImageCropEditor`-ով։ Նկարը կադրվում և «թխվում» է հենց այն ձևով, ինչով ցուցադրվում է (`CROP_PRESETS`, `utils/image.ts`).

| Slot (`admin.vue` → `CROP_SLOTS`) | Preset | Ձև | Պահվող չափսեր |
|---|---|---|---|
| `product` | `product` | 4:3 | 1200×900 + 800×600 |
| `category` (desktop) | `banner` | 16:5 | 1600×500 + 960×300 |
| `categoryMobile` | `mobileBanner` | 4:3 | 1200×900 + 800×600 |

- Ամեն նկար = 3 ֆայլ (ցուցադրվող, retina, original) + `crop` վիճակ։ Original-ը պահվում է, որ «Փոխել կադրումը»-ն նորից կադրի զրոյից։
- `CropState`-ի offset-ները պահվում են 320px լայնությամբ կադրի միավորներով (`CROP_REF_W`), ուստի նույն կադրումը նույնն է editor-ում և ամեն չափսում (`drawCropped`-ը մեկն է preview-ի և թխման համար)։
- **Առկա** ապրանքի/կատեգորիայի վրա «Կիրառել»-ը և «Հեռացնել»-ը միանգամից պահպանում են միայն այդ նկարը (partial PATCH)․ հին ֆայլերը backend-ն է ջնջում։ Նորի դեպքում նկարը պահպանվում է ձևի «Պահպանել»-ով։
- Հրապարակային բանները (`MenuSection`, `DesignAria`) նախընտրում են retina-ն (`imageHiRes`, `mobileImageHiRes`), standard-ը fallback է։

## Արագության կանոններ

Հրապարակային մենյուն բացվում է հեռախոսից, հաճախ դանդաղ կապով։ Չորս բան, որ
ամեն նոր կոդում պետք է պահպանվի (մանրամասն՝ [THEMES.md](./THEMES.md))․

| Կանոն | Ինչու |
|---|---|
| Ամեն `<img>` → `imgUrl(src, width)` (`utils/image.ts`) | Վերբեռնման պահին ոչինչ չի չափափոխվում — առաստաղը դրվում է ցուցադրման կետում |
| `loading="lazy" decoding="async"` (բացի լոգո/hero) | Սքրոլից ներքև եղածը չի բեռնվում առաջին վայրկյանին |
| Ֆոնտերը՝ ըստ թեմայի (`themeFontsHref`) | Cinzel/Cormorant-ը պետք չէ սեփական տառատեսակ ունեցող թեմային |

Backend-ի կողմից հրապարակային endpoint-երը cache-վում են և invalidate-վում ամեն
admin գրառումից հետո — տես [BACKEND.md](./BACKEND.md#public-cache)։

## SSR-ի թակարդներ

- `useAsyncData`-ի handler-ում **բոլոր composable-ները կանչիր առաջին `await`-ից
  առաջ**․ SSR-ում `await`-ից հետո Nuxt instance-ը կորչում է և `useRuntimeConfig()`
  ընկնում է։ Հետևանքը լուռ է՝ service-ի ներսի `catch`-ը կուլ է տալիս, արժեքը
  դառնում է `null`, և էջը մնում է loader-ի վրա։ Հենց դրա պատճառով tenant-ի էջը
  **երկու fetch** է անում client-ից՝ ոչ թե մեկը SSR-ից․ երկրորդ կանչը
  (`menuService.getMenu`) միշտ առաջինից հետո է։ Մեկ SSR fetch-ի անցնելու համար
  պետք է կա՛մ `callWithNuxt`, կա՛մ backend endpoint, որ ռեստորանն ու մենյուն
  վերադարձնի **մեկ** պատասխանով։
- Nuxt-ի payload-ը **devalue** ձևաչափով է (հարթ զանգված՝ ինդեքսային հղումներով)։
  HTML-ում `"key":null` փնտրելը ոչինչ չի ապացուցում — payload-ը այդպես չի գրվում։
- Էջի fetch-ը **չկապես restaurant store-ից ածանցված արժեքի**․ store-ը լցնում է հենց
  այդ էջի render-ը (`ThemeRenderer`), և ստացվում է օղակ։ Լեզուն վերցրու հում
  `useState<Lang>('lang')`-ից, ոչ թե `useLanguage().lang`-ից։
- Nuxt-ի `experimental.*` դրոշներ **մի՛ ավելացրու** առանց առանձին փորձարկման —
  `asyncContext: true`-ն SSR-ը փլել է (էջը վերադարձնում էր 0 բայթ)։

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
