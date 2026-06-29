# QR Menu Platform — Full System Logic Review

A start-to-finish explanation of how the platform works, written for an
architecture review. Goal: decide what to keep, remove, simplify, or improve
before we continue building. No code here.

---

## 1. Full platform overview

One product, many tenants. A **single backend** (NestJS) talks to a **single
PostgreSQL database** and serves **one admin panel** and **many public menus**.
Every restaurant ("tenant") is just data tagged with a `restaurantId` — there
are no per-restaurant code copies, tables, or databases. A restaurant picks one
**theme** (visual skin) and is reachable on one or more **domains**. The menu is
stored once; themes only change how it looks. This is a classic
**single-database, shared-schema multi-tenant SaaS**.

---

## 2. User types

- **Public customer** — no login. Scans a QR / opens a link, browses the menu in
  their language, builds a temporary order to show the waiter.
- **Owner** — owns one restaurant; full control of its menu, theme, settings,
  domains, and its users; sees audit + analytics.
- **Manager** — manages menu, categories, products, theme/settings; **cannot**
  touch domains, billing, or owner-level users.
- **Employee** — operational only: toggle availability, upload images.
- **Super admin** — platform operator; not tied to one restaurant; creates and
  suspends restaurants, assigns plans, manages the theme catalog, supports
  tenants (can impersonate).

---

## 3. Public menu logic (step by step)

```
1. Guest scans QR or opens a link  → a URL hits the frontend.
2. The app extracts the HOST and the PATH.
3. Resolver: HOST/slug → restaurantId   (custom domain → subdomain → path slug).
4. Load restaurant summary: name, themeId, settings, active languages.
5. Load the menu for that restaurantId: categories + products + translations
   (for the chosen language) + images + badges.
6. ThemeRenderer picks the theme component by themeId and renders the data.
7. Guest browses, optionally adds items to an Order Draft.
8. Background analytics events fire (menu view, product view, QR scan).
```

The frontend already implements steps 2–7; the backend will own steps 3–5 once
the API replaces the mock services.

---

## 4. Admin panel logic

```
login (email + password) → access token + refresh token
  → token carries userId, role, restaurantId  → that becomes the "context"
  → every admin call is automatically scoped to that restaurantId
  → owner/manager edits: restaurant info, categories, products, prices, images,
    theme, settings, working hours, domains
  → on save: validated → written → AuditLog row → public menu reflects on next
    load (cache invalidated)
```

The admin never types a `restaurantId`; it always comes from the logged-in user.

---

## 5. Multi-tenant logic

Every tenant-owned row has a `restaurantId`. Isolation is enforced in two layers:
1. **Token** — admin requests derive `restaurantId` from the JWT, never from the
   request body or URL.
2. **Query** — every admin query adds `where: { restaurantId }`, and any `:id`
   in a URL is checked to belong to that restaurant (else 404, never 403, so we
   don't leak existence). A central guard/extension makes cross-tenant reads
   impossible by construction. Public reads only ever return one resolved
   restaurant's active, non-deleted rows.

---

## 6. Domain logic

Three ways to reach a restaurant, resolved in this priority:
1. **Custom domain** — `menu.tunlahmajo.am` → exact match in the Domain table
   (must be verified) → restaurantId.
2. **Subdomain** — `tun-lahmajo.yourdomain.am` → take the subdomain as the slug.
3. **Path slug** — `yourdomain.am/tun-lahmajo` → look up by slug.
4. None match → **Restaurant not found** page.

The resolver normalizes the host (lowercase, strip `www.`/port) and caches
`host → restaurantId` briefly. The frontend already mirrors this order.

---

## 7. Theme logic

Themes (**Aria, Atelier, Maison, Heritage, Noir**) are interchangeable visual
skins. They all consume the **same normalized data** (restaurant + categories +
products + settings) and only differ in layout, typography, motion, and color.
A **theme registry** maps `themeId → component`; `ThemeRenderer` renders the one
the restaurant selected. Changing a theme is a single setting (`themeId`) — the
menu is never duplicated per theme. Restaurant-specific tweaks (colors, font,
toggles) live in `RestaurantSettings` and are applied on top of the chosen theme
without changing its structure.

---

## 8. Menu data logic

- **Sections** — FOOD / DRINKS / ALCOHOL (a `section` field on each category).
- **Categories** — belong to a restaurant + section; support **subcategories**
  via a self-relation (`parentId`), `sortOrder`, `isActive`, and translations.
- **Products** — belong to one restaurant + one category; have `price`,
  `oldPrice?`, flags (`isPopular/isNew/isRecommended`), `isAvailable` (in stock),
  `isActive` (published), `sortOrder`, translations, images, and badges.
- **Badges** — reusable labels (Hit, New, Spicy, Vegan, Chef Choice…); system
  badges are global, custom ones are per restaurant. Many-to-many to products.
- **Images** — multiple per product, one marked main (gallery-ready).
- **Translations** — every name/description lives in a `*Translation` row keyed
  by language; adding a language is data, not a migration.
- **Sorting / active / availability** — `sortOrder` for display order, `isActive`
  to publish/unpublish, `isAvailable` for "sold out right now".

---

## 9. Order draft logic

No payment. A guest:
```
create draft (tied to sessionId + optional tableCode)
  → add item (snapshots unitPrice)
  → change quantity / remove item / clear
  → totalPriceSnapshot recomputed each change
  → "show to waiter" (status OPEN → SHOWN)
  → auto-expires after a TTL
```
Price snapshots mean later admin price edits never rewrite a guest's open draft.

---

## 10. Upload logic

```
admin requests a presigned upload URL (kind, type, size)
  → uploads the file directly to object storage (Cloudflare R2 first; S3/Supabase
    behind the same abstraction later)
  → attaches { url, storageKey } to the product/category/restaurant
```
DB stores only `url` (public/CDN) + `storageKey` (for delete/move). Allowed:
jpeg/png/webp (svg for logo); size caps per kind. Direct-to-storage keeps big
files off the API.

---

## 11. Auth logic

- **Access token** (JWT, short-lived) carries `userId, role, restaurantId`.
- **Refresh token** (long-lived) stored **hashed** in the DB, rotated on use,
  revocable.
- **Roles** — SUPER_ADMIN / OWNER / MANAGER / EMPLOYEE enforced by a roles guard.
- **Restaurant scope** — a guard injects `restaurantId` from the token so all
  data access is tenant-bound automatically.

---

## 12. Audit log logic

Append-only history of who changed what, when, with old → new values. Recorded
for: product create / price change / delete / update, category create / update /
delete, theme change, domain add / verify / set-primary, restaurant info &
settings updates, working-hours updates, login. Purpose: owners can review every
change and we have accountability/debugging. `action`/`entityType` are free-form
strings so new audited actions never need a migration.

---

## 13. Analytics logic

Thin, append-only event tables; capture now, dashboard later. We track:
**QR scans** (per table), **menu views** (with language + referrer), **product
views**, and we can derive **language usage** and **add-to-basket** from drafts.
IPs are hashed (never raw). No dashboards in v1 beyond a simple counts summary;
later, scheduled jobs roll events into daily summaries.

---

## 14. Database logic (human-readable)

- A **Restaurant** is the root; it **has** users, domains, languages, working
  hours, categories, products, badges, settings (1:1), translations, order
  drafts, audit logs, and analytics events.
- A **Category** belongs to a restaurant, has a section, can have a parent
  category and child categories, and has translations + products.
- A **Product** belongs to a restaurant and a category; has translations,
  images, badges, favorites, order-draft items, and product views.
- **Theme**, **Language**, and **Plan** are global/reusable; restaurants
  reference them by id.
- **Translations** are separate tables keyed by language.
- **Soft delete** (`deletedAt`) protects Restaurant, User, Domain, Category,
  Product, ProductImage so history (orders/analytics/audit) stays intact.

---

## 15. API logic

- **Public API** (`/api/v1/public/**`) — no auth, read-mostly, rate-limited:
  resolver, restaurant profile, menu, working hours, order-draft CRUD, analytics
  ingest, favorites.
- **Admin API** (`/api/v1/admin/**`) — JWT + restaurant scope: auth, restaurant
  info & settings, theme, categories, products, images/uploads, working hours,
  domains, QR, audit, analytics summary.
- **Super Admin API** (`/api/v1/super-admin/**`) — JWT + SUPER_ADMIN:
  restaurants, users, themes, plans, platform settings, impersonation.

All responses share one envelope (`success/data/message/errors/meta`).

---

## 16. Hosting logic

- **Local** — `localhost:3001/tun-lahmajo` (path slug). Works today.
- **One domain + paths** — `yourdomain.am/tun-lahmajo`. No infra change.
- **Subdomains** — `tun-lahmajo.yourdomain.am` via a wildcard DNS record
  (`*.yourdomain.am`) + wildcard TLS.
- **Custom domains** — `menu.tunlahmajo.am`: customer points DNS at us, we verify
  via a TXT token, issue TLS (e.g. via the CDN/proxy), and map the host to the
  restaurant. The resolver already supports all three with no app refactor.

---

## 17. What is necessary for MVP

**MVP must-have**
- Auth (access + refresh, roles), restaurant scope guard.
- Restaurant info + settings + theme select.
- Categories + products CRUD (with translations, price, availability, sort).
- Public resolver (path slug + subdomain) + public menu API.
- Image upload (R2) — or temporarily URL/link only.
- Order draft (add / qty / remove / show to waiter).
- 2–3 themes wired to live data.

**Can be delayed**
- Custom domains + verification (subdomain/slug is enough at first).
- Audit log (start with the most important actions only).
- Analytics ingest (add events once menus are live).
- Plans/billing, super-admin impersonation.
- Badge translations / custom badges (system badges first).

**Can be removed (for now)**
- Noir theme until it's designed.
- Favorites (nice-to-have).
- `oldPrice`, product gallery (single image is fine for MVP).

---

## 18. Complexity review (what may be over-built for v1)

- **Per-entity translation tables** are correct long-term but heavier to seed and
  query. *Keep* — but in v1 the admin can edit the default language and leave
  others optional.
- **Custom domains + verification** is real infra work. *Postpone* — ship
  subdomain + slug first.
- **Analytics tables + partitioning/BRIN** are ready but unused in v1.
  *Keep the tables, skip the partitioning/rollups* until traffic justifies it.
- **Badge system (M:N + custom + translations)** vs. the boolean flags
  (`isPopular/isNew/isRecommended`) overlap. *Simplify:* in v1 use the booleans
  for display, treat the Badge tables as future; pick one source of truth.
- **5 themes** multiply UI maintenance. *Simplify:* launch with 2–3 polished
  themes; add the rest later via the registry.
- **Working hours split shifts** are supported but most restaurants won't use
  them. *Keep the model* (cheap), default the admin UI to one shift/day.

None of these require schema changes to simplify — they're scope decisions.

---

## 19. Risks

- **Domain resolver** — wildcard DNS/TLS and custom-domain verification are the
  trickiest infra. Mitigate by shipping slug/subdomain first, caching lookups,
  and adding custom domains as a later, well-tested feature.
- **Uploads** — direct-to-R2 presigning, content-type/size validation, orphaned
  files. Mitigate with strict server-side validation and a cleanup job for
  unreferenced `storageKey`s.
- **Soft delete** — easy to forget the `deletedAt IS NULL` filter and leak
  deleted rows, or to hit unique-constraint collisions. Mitigate with a central
  Prisma extension + the partial unique indexes we already planned.
- **Analytics growth** — event tables grow fast. Mitigate with BRIN indexes now,
  partitioning/retention later; never join them into menu reads.
- **Permissions** — role checks must be consistent across every endpoint.
  Mitigate with declarative guards (`@Roles`) + tenant guard, tested centrally.
- **Theme complexity** — each theme is a full layout; bugs (scroll, hydration)
  multiply. Mitigate by sharing data/logic and keeping themes presentation-only.
- **Migrations** — column casing, nullable unique constraints, cascade surprises.
  Already addressed (quoted raw SQL, partial uniques, reviewed cascades); keep
  every change behind a reviewed migration.

---

## 20. Final recommendation

**Keep**
- Multi-tenant-by-`restaurantId` model, normalized translations, theme registry +
  ThemeRenderer, soft delete, audit/analytics tables (as scaffolding), the
  service-layer abstraction the frontend already uses.

**Remove / defer for v1**
- Noir theme, favorites, custom domains, plans/billing, impersonation, product
  gallery + `oldPrice`, custom badges. (Schema stays; just don't build the UI/flows yet.)

**Postpone**
- Analytics dashboards & partitioning, full audit coverage, multi-language admin
  editing (default language first).

**Implement first (recommended order)**
1. NestJS skeleton: Prisma module, config, response envelope, exception filter,
   JWT + roles + restaurant-scope guards.
2. Auth (login/refresh) + seed an owner.
3. Restaurant info/settings/theme (admin) — proves the scope guard end-to-end.
4. Public resolver + public menu API (slug + subdomain).
5. Categories + products CRUD (default language, price, availability, sort).
6. Uploads (R2) — or URL-only first.
7. Wire 2–3 themes to the live API (replace the mock services).
8. Then layer in audit, analytics events, custom domains, remaining themes.

This keeps the production-ready architecture intact while shipping a lean,
correct v1 fast — nothing here forces a redesign later.
