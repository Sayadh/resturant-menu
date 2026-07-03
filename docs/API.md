# API տեղեկագիր (Endpoints)

Base՝ բոլոր route-երը `/api/v1`-ից են սկսվում։ Պատասխանը միշտ envelope՝
`{ success: boolean, data: T, message?: string, errors?: unknown }`։

Legend՝ 🔓 public (token պետք չէ) · 🔒 admin (Bearer token) · 👑 SUPER_ADMIN only։

## Auth — `admin/auth` (🔓 login/refresh, 🔒 logout)

| Method | Path | Դեր |
|---|---|---|
| POST | `/admin/auth/login` | `{ email, password }` → `{ accessToken, refreshToken, user }` |
| POST | `/admin/auth/refresh` | `{ refreshToken }` → նոր token զույգ + user |
| POST | `/admin/auth/logout` | `{ refreshToken }` → invalidate |
| GET | `/admin/me` 🔒 | ընթացիկ օգտատերը |

## Restaurant (ընթացիկ tenant) — `admin/restaurant` 🔒

| Method | Path | Դեր |
|---|---|---|
| GET | `/admin/restaurant` | ընթացիկ ռեստորանի profile (tenant JWT-ից) |
| PATCH | `/admin/restaurant` | profile թարմացում |
| PATCH | `/admin/restaurant/settings` | կարգավորումներ |
| PATCH | `/admin/restaurant/theme` | `{ themeKey }` → ակտիվ թեմա |

## Sections — `admin/sections` 🔒

| Method | Path | Դեր |
|---|---|---|
| GET | `/admin/sections` | ցանկ |
| POST | `/admin/sections` | ստեղծել |
| PATCH | `/admin/sections/reorder` | `{ ids[] }` վերադասավորում |
| GET | `/admin/sections/:id` | մեկը |
| PATCH | `/admin/sections/:id` | թարմացնել |
| DELETE | `/admin/sections/:id` | ջնջել |

## Categories — `admin/categories` 🔒

| Method | Path | Դեր |
|---|---|---|
| GET | `/admin/categories` | ցանկ (query filter-ներով) |
| POST | `/admin/categories` | ստեղծել |
| PATCH | `/admin/categories/reorder` | վերադասավորում |
| GET | `/admin/categories/:id` | մեկը |
| PATCH | `/admin/categories/:id` | թարմացնել |
| DELETE | `/admin/categories/:id` | ջնջել |

## Products — `admin/products` 🔒

| Method | Path | Դեր |
|---|---|---|
| GET | `/admin/products` | ցանկ (query filter-ներով) |
| POST | `/admin/products` | ստեղծել |
| PATCH | `/admin/products/reorder` | վերադասավորում |
| GET | `/admin/products/:id` | մեկը |
| PATCH | `/admin/products/:id` | թարմացնել |
| PATCH | `/admin/products/:id/availability` | `{ isAvailable }` (sold-out toggle) |
| DELETE | `/admin/products/:id` | ջնջել |

## Super Admin — `super-admin/restaurants` 👑

| Method | Path | Դեր |
|---|---|---|
| GET | `/super-admin/restaurants` | բոլոր ռեստորանները (+ _count) |
| POST | `/super-admin/restaurants` | նոր ռեստորան (+ languages + default sections + owner) |
| PATCH | `/super-admin/restaurants/:id` | name/theme/lang/isActive |
| DELETE | `/super-admin/restaurants/:id` | hard delete (cascade) |

## Public — `public` 🔓

| Method | Path | Դեր |
|---|---|---|
| POST | `/public/lead` | contact form → Telegram (honeypot anti-spam) |
| GET | `/public/resolve` | link → og:image resolve |
| GET | `/public/restaurants` | ակտիվ ռեստորանների ցանկ |
| GET | `/public/restaurants/:slug` | ռեստորան slug-ով |
| GET | `/public/restaurants/:id/menu` | ամբողջ մենյուն |
| GET | `/public/restaurants/:id/hours` | աշխատաժամեր |

## Health — `health` 🔓

| Method | Path | Դեր |
|---|---|---|
| GET | `/health` | health check |

---

## Envelope օրինակներ

Հաջողություն՝
```json
{ "success": true, "data": { "id": "...", "name": "..." }, "message": null }
```

Սխալ (validation)՝
```json
{ "success": false, "data": null, "message": "Validation failed",
  "errors": [{ "message": "password must be longer than or equal to 6 characters" }] }
```

Frontend-ի `http.ts`-ը ինքնաշխատ unwrap է անում envelope-ը՝ վերադարձնում է միայն
`data`-ն (սխալի դեպքում throw)։ Նոր endpoint ավելացնելիս՝ տես [AI-GUIDE.md](./AI-GUIDE.md)։
