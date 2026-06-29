# QR Menu Platform — Backend Blueprint

Production multi-tenant SaaS. One NestJS backend, one PostgreSQL DB
(`qr_menu_platform`), one admin panel, many restaurants / themes / domains.
Tenant isolation by `restaurantId` everywhere.

Stack: **NestJS · PostgreSQL · Prisma · JWT · REST** (Swagger/OpenAPI + S3/R2
uploads later). This document is the contract the implementation follows so we
never have to re-architect.

---

## 1. System Overview

```
                      ┌──────────────────────────────────────┐
   QR / link  ─────►  │  Public Menu (Nuxt)  →  Public API    │
                      └──────────────────────────────────────┘
                                     │  resolve host/slug → restaurantId
                      ┌──────────────▼───────────────────────┐
   Owner login ────►  │  Admin Panel (Nuxt /admin) → Admin API│
                      └──────────────────────────────────────┘
                                     │
                      ┌──────────────▼───────────────────────┐
                      │   NestJS Backend (modules + guards)   │
                      │   Auth · Restaurant · Menu · Theme    │
                      │   Domain · Upload · Audit · Analytics │
                      └──────────────┬───────────────────────┘
                          Prisma     │            │  presigned URLs
                      ┌──────────────▼────┐   ┌────▼──────────────┐
                      │ PostgreSQL (1 DB, │   │ Object storage     │
                      │ tenant by id)     │   │ (Cloudflare R2/S3) │
                      └───────────────────┘   └────────────────────┘
```

- **Public menu** — read-only, fast, cache-friendly; resolves a host or slug to
  one restaurant and renders its theme with its menu.
- **Admin panel** — authenticated; scoped to the signed-in user's restaurant.
- **Backend** — single NestJS app, modular; every request that touches tenant
  data is restaurant-scoped by a guard.
- **Database** — single Postgres; rows separated by `restaurantId`.
- **Storage** — images live in object storage; DB stores `storageKey` + `url`.
- **Themes** — global, reusable; restaurant stores only `themeId` + settings.
- **Custom domains** — a host map points many domains/subdomains to one
  restaurant.

---

## 2. Main User Flows

**Public customer**
```
QR scan / open link
  → resolve host (custom domain → subdomain → path slug) → restaurantId
  → GET restaurant + themeId + themeSettings + languages
  → GET menu (categories + products + translations for chosen language)
  → browse → add to OrderDraft → "show to waiter"
  → analytics events fire in background (menu view, product view, QR scan)
```

**Admin (Owner/Manager/Employee)**
```
login (email+password) → JWT (carries userId, role, restaurantId)
  → all calls auto-scoped to restaurantId
  → edit restaurant info / categories / products / images / theme / hours / domains
  → save → AuditLog row written → public menu reflects on next load (cache bust)
```

**Super admin**
```
login → no restaurant scope
  → create/suspend restaurants, assign plan, manage domains, manage themes,
    impersonate for support, see platform-wide stats
```

---

## 3. API Architecture

Three surfaces, three guards.

- **Public API** (`/api/public/**`) — unauthenticated, read-mostly, rate-limited.
  Resolver, menu, order draft, analytics ingest.
- **Admin API** (`/api/admin/**`) — JWT required; `RestaurantScopeGuard` injects
  and enforces `restaurantId` from the token. Auth, restaurant info, categories,
  products, images, theme settings, QR, domains, working hours, audit.
- **Super Admin API** (`/api/superadmin/**`) — JWT + `SUPER_ADMIN` role.
  Restaurants, users, themes, plans, platform settings.

---

## 4. Endpoint List

Conventions: all responses use the envelope in §8. `:rid` is never taken from the
client on Admin routes — it comes from the JWT.

### Public API

| Method | URL | Purpose | Auth | Request | Response | Validation |
|---|---|---|---|---|---|---|
| GET | `/api/public/resolve?host=&slug=` | Host/slug → restaurant summary (id, themeId, name, slug) | public | query | `{ restaurant }` | host or slug required |
| GET | `/api/public/restaurants/:slug` | Public restaurant profile + settings + languages | public | – | `{ restaurant, settings, languages }` | slug exists & active |
| GET | `/api/public/restaurants/:id/menu?lang=hy` | Full menu: categories + products + translations(lang) + images + badges | public | query `lang` | `{ categories[], products[] }` | lang in active languages (fallback default) |
| GET | `/api/public/restaurants/:id/hours` | Weekly hours + computed openNow | public | – | `{ hours[], openNow }` | – |
| POST | `/api/public/order-drafts` | Create a draft for a session/table | public | `{ restaurantId, tableCode?, sessionId }` | `{ draft }` | restaurant active |
| POST | `/api/public/order-drafts/:id/items` | Add item | public | `{ productId, quantity, note? }` | `{ draft }` | product belongs to restaurant; qty ≥ 1; available |
| PATCH | `/api/public/order-drafts/:id/items/:itemId` | Update qty | public | `{ quantity }` | `{ draft }` | qty ≥ 1 |
| DELETE | `/api/public/order-drafts/:id/items/:itemId` | Remove item | public | – | `{ draft }` | item in draft |
| DELETE | `/api/public/order-drafts/:id` | Clear draft | public | – | `{ ok }` | – |
| POST | `/api/public/events/menu-view` | Analytics: menu view | public | `{ restaurantId, domain, path, language, referrer }` | `204` | rate-limited; ipHash server-side |
| POST | `/api/public/events/product-view` | Analytics: product view | public | `{ restaurantId, productId }` | `204` | product in restaurant |
| POST | `/api/public/events/qr-scan` | Analytics: QR scan | public | `{ restaurantId, tableCode?, domain }` | `204` | – |
| POST | `/api/public/favorites/toggle` | Toggle favorite (device-scoped) | public | `{ restaurantId, productId, deviceId }` | `{ favorited }` | – |

### Admin API (JWT, restaurant-scoped)

| Method | URL | Purpose | Auth | Request | Response | Validation |
|---|---|---|---|---|---|---|
| POST | `/api/admin/auth/login` | Login | public | `{ email, password }` | `{ token, user }` | valid creds; user active |
| POST | `/api/admin/auth/refresh` | Refresh token | refresh token | – | `{ token }` | – |
| GET | `/api/admin/me` | Current user + restaurant | JWT | – | `{ user, restaurant }` | – |
| GET | `/api/admin/restaurant` | Get own restaurant + settings | OWNER/MANAGER/EMPLOYEE | – | `{ restaurant, settings }` | – |
| PATCH | `/api/admin/restaurant` | Update info | OWNER/MANAGER | `{ name?, phone?, email?, currency?, timezone?, logoUrl?, coverImageUrl?, translations? }` | `{ restaurant }` | audited |
| PATCH | `/api/admin/restaurant/settings` | Theme settings/toggles | OWNER/MANAGER | `{ colors, font, toggles… }` | `{ settings }` | – |
| PATCH | `/api/admin/restaurant/theme` | Change theme | OWNER/MANAGER | `{ themeId }` | `{ restaurant }` | theme exists & active; audited (CHANGE_THEME) |
| GET | `/api/admin/categories` | List (filter/sort/paginate) | all | query | `{ data[], meta }` | – |
| POST | `/api/admin/categories` | Create | OWNER/MANAGER | `{ section, parentId?, icon?, imageUrl?, sortOrder?, translations[] }` | `{ category }` | parent same restaurant & section |
| PATCH | `/api/admin/categories/:id` | Update | OWNER/MANAGER | partial | `{ category }` | belongs to restaurant; audited |
| DELETE | `/api/admin/categories/:id` | Soft delete | OWNER/MANAGER | – | `{ ok }` | block if active products (see §15) |
| PATCH | `/api/admin/categories/reorder` | Bulk sort | OWNER/MANAGER | `{ items:[{id,sortOrder}] }` | `{ ok }` | all in restaurant |
| GET | `/api/admin/products` | List (filter/sort/paginate) | all | query | `{ data[], meta }` | – |
| POST | `/api/admin/products` | Create | OWNER/MANAGER | `{ categoryId, price, oldPrice?, badges[], flags, translations[], images[] }` | `{ product }` | category in restaurant; price > 0 |
| PATCH | `/api/admin/products/:id` | Update | OWNER/MANAGER | partial | `{ product }` | belongs to restaurant; price change audited |
| PATCH | `/api/admin/products/:id/availability` | Toggle in-stock | OWNER/MANAGER/EMPLOYEE | `{ isAvailable }` | `{ product }` | – |
| DELETE | `/api/admin/products/:id` | Soft delete | OWNER/MANAGER | – | `{ ok }` | audited (DELETE_PRODUCT) |
| PATCH | `/api/admin/products/reorder` | Bulk sort | OWNER/MANAGER | `{ items[] }` | `{ ok }` | – |
| POST | `/api/admin/uploads/sign` | Get presigned upload URL | OWNER/MANAGER/EMPLOYEE | `{ kind, contentType, size }` | `{ uploadUrl, storageKey, publicUrl }` | type/size limits (§10) |
| POST | `/api/admin/products/:id/images` | Attach image | OWNER/MANAGER | `{ url, storageKey, isMain? }` | `{ image }` | product in restaurant |
| DELETE | `/api/admin/products/:id/images/:imageId` | Soft delete image | OWNER/MANAGER | – | `{ ok }` | – |
| GET/PUT | `/api/admin/working-hours` | Get/replace weekly hours | OWNER/MANAGER | `{ rows[] }` | `{ hours[] }` | valid times; intervals don't overlap |
| GET | `/api/admin/domains` | List | OWNER | – | `{ data[] }` | – |
| POST | `/api/admin/domains` | Add domain (returns verify token) | OWNER | `{ domain }` | `{ domain, verificationToken }` | domain globally unique |
| POST | `/api/admin/domains/:id/verify` | Verify (DNS/TXT) | OWNER | – | `{ verified }` | token matches |
| PATCH | `/api/admin/domains/:id/primary` | Set primary | OWNER | – | `{ ok }` | verified |
| DELETE | `/api/admin/domains/:id` | Soft delete | OWNER | – | `{ ok }` | not last primary |
| GET | `/api/admin/qr?domain=&tableCode=` | QR payload/PNG for a URL | all | query | `{ url, pngBase64 }` | – |
| GET | `/api/admin/audit?entityType=&entityId=` | Change history | OWNER/MANAGER | query | `{ data[], meta }` | – |
| GET | `/api/admin/analytics/summary?from=&to=` | Basic counts (views/scans/top products) | OWNER/MANAGER | query | `{ summary }` | date range capped |

### Super Admin API (JWT + SUPER_ADMIN)

| Method | URL | Purpose |
|---|---|---|
| GET/POST | `/api/superadmin/restaurants` | List / create restaurants |
| PATCH | `/api/superadmin/restaurants/:id` | Update / suspend / set plan |
| POST | `/api/superadmin/restaurants/:id/impersonate` | Issue scoped support token |
| GET/POST/PATCH | `/api/superadmin/users` | Manage users across tenants |
| GET/POST/PATCH | `/api/superadmin/themes` | Manage theme catalog |
| GET/POST | `/api/superadmin/plans` | Subscription plans |
| GET/PATCH | `/api/superadmin/settings` | Platform settings |

---

## 5. Auth & Permissions

JWT payload: `{ sub: userId, role, restaurantId | null }`. Roles:

- **SUPER_ADMIN** — platform operator; no restaurant scope; full access incl.
  super-admin API and impersonation.
- **OWNER** — full control of *their* restaurant: info, theme, domains, users,
  menu, settings, billing.
- **MANAGER** — menu + settings + theme; cannot manage domains/users/billing.
- **EMPLOYEE** — operational: toggle availability, upload images; no destructive
  edits, no settings/theme/domains.

### Permissions matrix

| Capability | SUPER_ADMIN | OWNER | MANAGER | EMPLOYEE |
|---|---|---|---|---|
| Platform / other tenants | ✅ | – | – | – |
| Restaurant info / settings | ✅ | ✅ | ✅ | – |
| Theme change | ✅ | ✅ | ✅ | – |
| Domains | ✅ | ✅ | – | – |
| Users of restaurant | ✅ | ✅ | – | – |
| Categories CRUD | ✅ | ✅ | ✅ | – |
| Products CRUD | ✅ | ✅ | ✅ | – |
| Toggle availability | ✅ | ✅ | ✅ | ✅ |
| Upload images | ✅ | ✅ | ✅ | ✅ |
| View audit / analytics | ✅ | ✅ | ✅ | – |

Enforced by `@Roles()` decorator + `RolesGuard`, after `JwtAuthGuard` and
`RestaurantScopeGuard`.

---

## 6. Tenant Isolation

- Admin requests: `restaurantId` is read **from the JWT**, never from the body or
  URL. `RestaurantScopeGuard` sets `req.restaurantId`; every Prisma query in
  admin services adds `where: { restaurantId }`. A central Prisma extension can
  assert this for tenant models to make cross-tenant access impossible by
  construction.
- Any `:id` in an admin URL is validated to belong to `req.restaurantId` (404 if
  not — never 403, to avoid leaking existence).
- Public requests resolve `restaurantId` from the host/slug (§7); they only ever
  read that restaurant's `isActive`, non-deleted rows.

---

## 7. Domain Resolver

```
resolve(host, slug?):
  host = normalize(host)            // strip www., lowercase, drop port
  1. Domain table lookup by exact host  (custom domain / subdomain)
        → if found & verified & restaurant active → restaurantId
  2. if host is "<sub>.qrmenu.am"   → lookup restaurant by slug = sub
  3. if slug provided (path)        → lookup restaurant by slug
  4. else → 404 RESTAURANT_NOT_FOUND
  cache (host → restaurantId) in memory/Redis with short TTL
```

Frontend already mirrors this order; the backend becomes the source of truth.

---

## 8. Data Response Standards

**Success**
```json
{ "success": true, "data": { }, "message": null, "errors": null,
  "meta": { "page": 1, "pageSize": 20, "total": 134 } }
```
**Error**
```json
{ "success": false, "data": null, "message": "Validation failed",
  "errors": [{ "field": "price", "code": "POSITIVE", "message": "must be > 0" }],
  "meta": null }
```
A global `ResponseInterceptor` wraps controller returns; a global
`AllExceptionsFilter` maps thrown errors → this shape. HTTP status stays correct
(200/201/400/401/403/404/409/422). Error `code`s are stable, client-friendly
constants.

---

## 9. Pagination / Filtering / Sorting

Query params (admin lists): `page` (default 1), `pageSize` (default 20, max 100),
`sort` (e.g. `sortOrder:asc`, `createdAt:desc`), `search`, plus entity filters
(`section`, `categoryId`, `isActive`, `isAvailable`). Offset pagination for admin
tables; `meta` returns `page/pageSize/total`. Cursor pagination reserved for any
future infinite public lists. All filters are whitelisted (no arbitrary fields).

---

## 10. Upload Architecture

```
admin → POST /uploads/sign { kind, contentType, size }
      ← { uploadUrl(presigned), storageKey, publicUrl }
admin → PUT file directly to storage (R2/S3)
admin → attach { url, storageKey } to entity (product/category/restaurant)
```
- **Kinds:** `PRODUCT_IMAGE`, `CATEGORY_IMAGE`, `LOGO`, `COVER`.
- **Allowed types:** `image/jpeg|png|webp` (+ `svg` only for logo).
- **Size limits:** product/category 5 MB, logo 1 MB, cover 8 MB.
- **Keys:** `restaurants/{rid}/{kind}/{uuid}.{ext}` (tenant-prefixed).
- DB stores `storageKey` (for delete/move) + `url` (public/CDN). Direct-to-storage
  upload keeps large files off the API. Validation re-checked server-side on
  attach. Today's mock `uploadService` (file→dataURL, link→og:image) maps onto
  this without frontend changes.

---

## 11. Audit Log

Write an `AuditLog` row (append-only) for: `CREATE_PRODUCT`,
`UPDATE_PRODUCT_PRICE` (price/oldPrice change), `DELETE_PRODUCT`,
`UPDATE_PRODUCT`, `CREATE_CATEGORY`, `UPDATE_CATEGORY`, `DELETE_CATEGORY`,
`CHANGE_THEME`, `ADD_DOMAIN`/`VERIFY_DOMAIN`/`SET_PRIMARY_DOMAIN`,
`UPDATE_RESTAURANT_INFO`, `UPDATE_SETTINGS`, `UPDATE_WORKING_HOURS`, `LOGIN`.
Each: `userId`, `entityType`, `entityId`, `action`, `oldValue`, `newValue`,
`createdAt`. Implemented via an `@Audit()` interceptor/decorator so services stay
clean. `action`/`entityType` are strings (no migration to add new actions).

---

## 12. Analytics-ready API

Fire-and-forget ingest endpoints (§4 Public) write thin append-only rows:
`MenuView`, `ProductView`, `QRCodeScan` (+ `OrderDraft` for basket value, +
favorites). Events are validated lightly, rate-limited, batched if needed, and
`ipHash`ed server-side (never raw IP). No dashboard now; later a scheduled job
rolls events into daily summaries. Read side starts with one
`/api/admin/analytics/summary` returning counts + top products for a date range.

---

## 13. Order Draft Logic

No payment. Lifecycle:
```
create  → POST /order-drafts { restaurantId, tableCode?, sessionId } → OPEN
add     → POST .../items { productId, quantity, note? }   (snapshot unitPrice)
update  → PATCH .../items/:itemId { quantity }
remove  → DELETE .../items/:itemId
clear   → DELETE /order-drafts/:id
show    → status OPEN → SHOWN (guest taps "show to waiter")
total   → totalPriceSnapshot recomputed from item unitPrice × qty on each change
expire  → background job sets EXPIRED after TTL
```
`unitPrice` and `totalPriceSnapshot` are snapshots so later price edits don't
rewrite a guest's draft. `tableCode`/`sessionId` tie a draft to a QR scan.

---

## 14. Theme System

`GET /restaurants/:id/menu` + `/restaurants/:slug` return **one** normalized
payload: `restaurant`, `themeId`, `themeSettings`, `categories`, `products`. The
frontend picks the theme component from a registry by `themeId` and renders the
same data. The menu is stored once — themes only change presentation. Changing a
theme is a single `PATCH /restaurant/theme`.

---

## 15. Validation Rules

- `price > 0`; `oldPrice` (if set) `> price`.
- `slug` globally unique; `domain` globally unique (normalized).
- Product's `categoryId` must belong to the same `restaurantId`.
- Child category `section` must equal parent's `section`.
- Working-hour intervals per day must not overlap; `openTime < closeTime`.
- Category delete: blocked (409) if it has non-deleted products, unless the
  client opts into cascading soft-delete of those products.
- Domain: cannot delete the last primary verified domain; can't set unverified
  domain as primary.
- All translations require at least the restaurant's default language.

---

## 16. Future Scalability

- **1000+ restaurants / 100k+ products** — every read is `restaurantId`-keyed on
  composite indexes; UUID PKs avoid sequence contention and allow sharding.
- **Languages** — translation tables keyed by language; new language = data, no
  migration.
- **Themes** — registry pattern; new theme = new frontend component + catalog
  row.
- **Custom domains** — host→restaurant map with caching (Redis later).
- **Analytics** — separate append-only tables, partition by month + BRIN on
  `createdAt`, roll up to summaries; never touches menu read paths.
- **Caching** — public menu cached (HTTP/edge + Redis), busted on admin save.
- **Storage** — direct-to-CDN uploads keep the API stateless and light.

---

## 17. Implementation Order

1. **Prisma schema** (apply the 5 confirmed corrections) + migrate
2. **Seed** (themes, languages, demo restaurants: tun-lahmajo/yasaman/karas)
3. **Auth** (JWT, login/refresh, guards, roles)
4. **Restaurant** (info, settings, theme — admin) + RestaurantScopeGuard
5. **Public resolver** (host/slug → restaurant) + caching
6. **Categories** (CRUD, translations, reorder, soft delete)
7. **Products** (CRUD, translations, badges, flags, availability, reorder)
8. **Uploads** (presign + attach + limits)
9. **Themes** (catalog + public menu payload)
10. **Admin API polish** (pagination/filter/sort, working hours, domains, QR)
11. **Audit** (interceptor + history endpoint)
12. **Analytics events** (ingest endpoints + summary)

Each step ships behind the standard response envelope and the same guards, so no
later step forces an architecture change.
