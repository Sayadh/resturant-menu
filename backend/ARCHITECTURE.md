# QR Menu Platform — Database Architecture

Multi-tenant SaaS. One NestJS backend, one PostgreSQL database (`qr_menu_platform`),
one Prisma schema. Every tenant-owned row carries a `restaurantId`; tenants are
isolated by that key, not by separate tables or databases.

## Conventions

- **UUID primary keys** everywhere (`@db.Uuid`) — safe to expose in URLs/APIs,
  non-enumerable, and friendly to future sharding/replication.
- **`createdAt` / `updatedAt`** on every business table for auditing, sorting,
  and cache invalidation.
- **Cascade deletes** flow from `Restaurant` down through all tenant-owned data,
  so offboarding a client is a single, safe delete.
- **Indexes** on every foreign key plus the columns we actually filter on
  (`slug`, `domain`, `restaurantId + section`, `categoryId + sortOrder`, …).
- **Money** stored as `Decimal(12,2)` — never floats.
- **Soft delete**: important tenant-owned tables carry a nullable `deletedAt`.
  Deletes set the timestamp; default reads filter `deletedAt IS NULL`. Rows are
  never physically removed (they may be referenced by orders, analytics, audit).

## Soft delete

`deletedAt DateTime?` is added to: **Restaurant, User, Domain, Category,
Product, ProductImage**. Rules:

- Service `delete()` methods perform `UPDATE ... SET deletedAt = now()`.
- All default queries add `where: { deletedAt: null }` (centralised via a Prisma
  middleware / extension so no query forgets it).
- **Product is never hard-deleted** — `OrderDraftItem`, analytics and audit rows
  point at it, so a soft delete preserves historical integrity.
- A partial index `@@index([restaurantId])` combined with the `deletedAt IS NULL`
  filter keeps "live menu" reads fast.

## Why each model exists

| Model | Purpose |
|---|---|
| **Restaurant** | The tenant root. Everything else hangs off it by `restaurantId`. |
| **User** | Back-office accounts. `role` (enum) gives RBAC; `restaurantId` scopes them (null = SUPER_ADMIN). |
| **Domain** | A restaurant can be reached on many hosts (subdomain, custom domain). `isPrimary`/`isVerified` drive routing & SSL. |
| **Theme** | Global, reusable visual themes (Aria/Maison/…). Restaurants store only `themeId` — themes are never duplicated. |
| **RestaurantSettings** | 1:1 controlled customization (colors, font, toggles, socials). Kept separate so the hot `Restaurant` row stays small. |
| **Language** | Platform-wide list of supported languages. |
| **RestaurantLanguage** | Which languages a restaurant enabled, their order and default. |
| **Category** | Menu category with a `SectionType` (FOOD/DRINKS/ALCOHOL) and self-nesting (`parentId`) for sub-categories. |
| **Product** | A menu item, scoped to a restaurant + category, with availability/flags/sortOrder. |
| **ProductImage** | Many images per product, one `isMain` — gallery-ready. |
| **Badge** | Reusable labels. `restaurantId = null` → system badge (Hit/New/Spicy…); set → custom per restaurant. Not hardcoded. |
| **ProductBadge** | M:N join product ⇆ badge. |
| ***Translation** tables | `RestaurantTranslation` (tagline + SEO), `CategoryTranslation`, `ProductTranslation`, `BadgeTranslation` — one row per language. No `nameHy/nameEn/nameRu`. |
| **Restaurant.address** | Simple free-text `String?` on Restaurant (v1). No maps / coordinates / place IDs / directions. |
| **OrderDraft / OrderDraftItem** | A guest's temporary order (no payment) shown to the waiter; items snapshot `unitPrice`. Draft also stores `tableCode`, `sessionId`, `totalPriceSnapshot`. |
| **Favorite** | Guest favorites, device-scoped now, ready for customer accounts later. |
| **RestaurantWorkingHour** | Structured weekly schedule (one row per weekday) so admins edit hours per day and the frontend can compute "Open now / Closed now". Replaces the freeform `workingHours` string. |
| **AuditLog** | Immutable history of admin actions (who/what/when, old → new value). Lets owners review every change. |
| **MenuView** | One row per public menu page view — basis for daily-views & language-usage analytics. |
| **ProductView** | One row per product detail/lightbox open — basis for "most viewed products". |
| **QRCodeScan** | One row per QR scan (per table code) — basis for "scans by table". |

## Why the translations are designed this way

Instead of `nameHy`, `nameEn`, `nameRu` columns (which break the moment you add a
4th language), each translatable entity has a sibling `*Translation` table keyed
by `(entityId, languageId)` with a real foreign key. Adding **Spanish** = inserting
rows, zero migrations. We chose per-entity translation tables over one polymorphic
`Translation(entityType, entityId, …)` table on purpose: per-entity tables keep
**referential integrity** (real FKs + cascade), are **type-safe** in Prisma, and
are **indexable/joinable** efficiently — exactly what a polymorphic blob loses.

## Structured working hours

`RestaurantWorkingHour` — one row per weekday per restaurant:
`restaurantId`, `dayOfWeek` (enum `DayOfWeek`), `openTime` ("HH:mm"),
`closeTime` ("HH:mm"), `isClosed`, `sortOrder`. Unique `(restaurantId, dayOfWeek)`.
Enables per-day editing and a real "Open now / Closed now" computation
(restaurant `timezone` + current weekday/time).

## Audit log

`AuditLog` is append-only (no update/delete). Fields:
`id`, `restaurantId`, `userId`, `entityType` (e.g. "Product"), `entityId`,
`action` (string, e.g. `UPDATE_PRODUCT_PRICE`), `oldValue Json?`, `newValue Json?`,
`createdAt`. `action` is a **string** (not enum) on purpose — new audited
actions must not require a migration. Indexed by `(restaurantId, createdAt)` and
`(entityType, entityId)` for "history of this product".

## Analytics-ready (collect now, dashboard later)

Three thin, append-only event tables. We capture events today; aggregation
(daily rollups / materialized views) comes later without schema changes.

- **MenuView** — `restaurantId`, `domain`, `path`, `language`, `userAgent`,
  `ipHash` (hashed, GDPR-friendly — never raw IP), `referrer`, `createdAt`.
- **ProductView** — `restaurantId`, `productId`, `createdAt`.
- **QRCodeScan** — `restaurantId`, `tableCode?`, `domain`, `createdAt`.

`OrderDraft` gains `tableCode?`, `sessionId`, `totalPriceSnapshot Decimal` so a
draft ties back to a QR scan/table and we can analyze basket value later.

### Analytics indexes (time-series read patterns)

| Table | Index | Powers |
|---|---|---|
| MenuView | `(restaurantId, createdAt)` | daily views per restaurant |
| MenuView | `(restaurantId, language, createdAt)` | language-usage over time |
| ProductView | `(restaurantId, createdAt)` | views per day |
| ProductView | `(productId, createdAt)` | most-viewed product, trend |
| QRCodeScan | `(restaurantId, createdAt)` | scans per day |
| QRCodeScan | `(restaurantId, tableCode, createdAt)` | scans by table |
| OrderDraft | `(restaurantId, createdAt)` | drafts/basket value over time |

These tables are **write-heavy, append-only**. They keep `restaurantId` so all
analytics stay tenant-scoped, and they are intentionally denormalized (store
`domain`, `language`, `tableCode` as captured) so event reads never need joins.
Later, scheduled jobs can roll them into `DailyStat`-style summary tables.

## Why it scales (1000+ restaurants, 100k+ products)

- Every query is keyed by `restaurantId` and backed by a composite index, so a
  restaurant's menu loads in O(its own rows) regardless of total platform size.
- UUID PKs avoid global sequence contention and allow horizontal scaling.
- Small, normalized rows + dedicated translation/image/settings tables keep the
  frequently-read tables compact (better cache hit rates).
- No duplication: one menu, one set of products — themes only change presentation.

## Why it's backend-ready (NestJS + REST)

The schema maps 1:1 to NestJS modules/services:

```
RestaurantModule → restaurant.service  → Restaurant, Domain, Settings, RestaurantLanguage
MenuModule       → category.service    → Category (+ translations)
                 → product.service     → Product (+ translations, images, badges)
AuthModule       → user.service        → User (JWT, roles guard)
ThemeModule      → theme.service       → Theme
OrderModule      → orderDraft.service  → OrderDraft / OrderDraftItem
```

Public read endpoints (used by the Nuxt frontend's service layer today):

```
GET /api/public/restaurants/by-slug/:slug
GET /api/public/restaurants/:id/menu          // categories + products + translations
GET /api/public/domains/:host/resolve         // host → restaurantId
```

The frontend already calls a service layer with these exact shapes — swapping the
mock services for `$fetch` to these endpoints requires **no UI/theme/routing
changes**.

## Migrate

```bash
createdb qr_menu_platform
npx prisma migrate dev --name init
npx prisma generate
```
