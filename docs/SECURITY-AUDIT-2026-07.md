# Security audit — 2026-07-31

Ամբողջ repository-ի read-only audit + remediation։ Այս ֆայլը պահում է՝ **ինչ
գտնվեց**, **ինչ ուղղվեց**, **ինչ է մնացել** — որ նույն վերլուծությունը զրոյից
չկրկնվի։

Deploy-ի հրահանգները՝ [`../DEPLOY.md`](../DEPLOY.md)։

---

## Ամփոփում

| Severity | Գտնված | Ուղղված |
|---|---|---|
| CRITICAL | 0 | — |
| HIGH | 4 | **4** ✅ |
| MEDIUM | 7 | **3** (MED-1, MED-4, MED-5) |
| LOW / INFO | 9 | 0 |

Tenant isolation-ը DB-ի մակարդակում **ամուր էր** (`ensureOwn` pattern ամենուր,
raw SQL չկա, guard-երի շղթան ճիշt է)։ Խախտումը **Storage-ի** շերտում էր։

---

## Ուղղված (commit-երով)

| ID | Խնդիր | Commit |
|---|---|---|
| **HIGH-1** | Cross-tenant Supabase Storage deletion | `c25af7f` |
| **HIGH-3** | Password change-ը session-ները չէր չեղարկում | `f73284a` |
| **HIGH-4** | Prisma schema drift (migration-ներ չկային) | `a1773f8` + `97f3a66` |
| **HIGH-2** | Shared default password (`password123`) | `1901acb` |
| **MED-1** | Ներքին error-ների արտահոսք client-ին | `b8b99cd` |
| **MED-5** | Կասեցված ռեստորանի admin access | `5707105` |
| **MED-4** | Domain uniqueness (`uq_domains_live`) | `bbcb6a0` |

### HIGH-1 — Cross-tenant Storage deletion
Image URL դաշtերը պարզ `@IsString()` էին, իսk `removeByUrl()`-ի prefix ստուգումը
ստուգում էր **միայն bucket-ը, ոչ tenant-ը**։ Tenant A-ն իր record-ում պահում էր
B-ի public URL, հետո փոխում → cleanup-ը ջնջում էր **B-ի ֆայլը**։

**Լուծում.** `src/uploads/storage-key.ts` — pure, unit-tested։ `new URL()` parsing,
decode **նախքան** ստուգումը, traversal/control-char/backslash մերժում, ownership՝
**exact segment equality** (`segments[1] === rid`)։ `remove()` դարձավ `private`;
unscoped `removeByUrl`/`removeManyByUrl` **հեռացված**; 7/7 call-site փոխանցում է
JWT-ից եկած `restaurantId`։

> ⚠️ **Root cause-ի երկրորդ շերտը բաց է.** օտար URL-ը դեռ կարող է *մտնել* DB
> (write-side validation չկա) — պարզապես այլևս ոչինչ չի ջնջում։

### HIGH-3 — Session invalidation
`upsertOwnerCredentials`-ը միայն `passwordHash` էր գրում։ Գողացված 30-օրյա
refresh token-ը շարունակում էր ռոտացվել → գաղտնաբառի փոփոխությունը attacker-ին
**դուրս չէր գցում**։

**Լուծում.** երկու շերտ **նույն `$transaction`-ում**․ refresh token-երի
revocation (scope՝ միայն այդ userId) + նոր `User.passwordChangedAt`, որով
`JwtAuthGuard`-ը մերժում է հին `iat`-ով access token-երը։ 1 վրկ grace window
(`iat`-ը վայրկյաններով է)։

### HIGH-4 — Schema drift
Ընդամենը **2** migration կար, մինչդեռ բազան շատ առաջ էր գնացել՝ ձեռքով SQL-ով։
Հետևանք՝ fresh DB-ի վրա `migrate deploy` → չաշխատող schema; `migrate dev` →
առաջարկում էր **DB reset**։

Production-ի ստուգված վիճակը (2026-07-31)․
- `sections`, `section_translations`, `ai_usage` — **կան** (ձեռքով)
- 9 սյուն (categories×4, plans×1, restaurants×4) — **կան**
- `categories.section` (legacy enum) — **արդեն nullable** ✓
- 4 cart-settings սյուն — կան, բայց **nullable** (Prisma-ն `NOT NULL` է սպասում)
- `raw-indexes.sql`-ի ինդեքսներից — **0 կիրառված**
- `restaurant_settings.facebookUrl/instagramUrl/websiteUrl` — production-ում **չկան**
- orphan categories: **0** · duplicate live domains: **0**
- `ai_usage`-ի սյուների տիպերը շեղված էին → ուղղված `97f3a66`-ով

**Լուծում.** additive + idempotent catch-up migration-ներ (`IF NOT EXISTS`,
DO-block guard-եր) — production-ում փաստացի no-op, fresh DB-ում՝ լրիվ schema։

### HIGH-2 — Default password
`'password123'` + կանխատեսելի `owner@<slug>.test` + հրապարակային ռեստորանների
ցանկ = ցանկացած նոր tenant-ի takeover մեկ գուշակությամբ։ `seed.ts`-ը նույն
գաղտնաբառով **SUPER_ADMIN** էր ստեղծում։

**Լուծում.** `generateInitialPassword()` — CSPRNG, 20 նիշ, 57-սիմվոլանոց
ոչ-երկիմաստ alphabet (~117 բիթ), rejection sampling։ Ops script-երը պահանջում են
`PASSWORD`/`SEED_PASSWORD`; seed/demo-ն հրաժարվում է աշխատել `NODE_ENV=production`-ում։

### MED-1 / MED-5 / MED-4
- Prisma-ի ներքին message-երն այլևս չեն հասնում client-ին production-ում;
  response-ը կրում է `REQUEST_ID`, log-ը՝ նույն id-ով։
- Կասեցված/soft-deleted ռեստորանի owner-ը ստանում է 403 (status-ը կարդացվում է
  JwtAuthGuard-ի **արդեն գոյություն ունեցող** query-ից → զրո լրացուցիչ hit)։
  `/admin/me`-ն դիտավորյալ բաց է, որ UI-ը կարողանա պատճառը ցույց տալ։
- `domains(domain) WHERE deletedAt IS NULL` partial unique index։

---

## Մնացած backlog

### MEDIUM
| ID | Խնդիր | Ֆայլ |
|---|---|---|
| MED-2 | 30-օրյա refresh token `localStorage`-ում → HttpOnly cookie | `frontend/stores/auth.ts` |
| MED-3 | CORS-ը թույլ է տալիս ցանկացած localhost + hardcoded cloudflare tunnel | `backend/src/main.ts`, `config/configuration.ts:4` |
| MED-6 | Ոչ մի outbound `fetch`-ում timeout չկա; AI quota-ն check-then-increment է | `ai.service.ts`, `lead.service.ts`, `uploads.service.ts` |
| MED-7 | Ռեստորանի hard delete + cascade, առանց confirmation | `super-admin.service.ts` |

### LOW / INFO
- `JWT_*_SECRET` min length 8 → պետք է ≥32 (`config/env.validation.ts`)
- Helmet / security headers backend-ում չկան (Nginx-ը չստուգված)
- `.env.example`-ում `SUPABASE_*` / `OPENAI_*` չկան
- `/public/restaurants` թվարկում է բոլոր tenant-ները (slug enumeration)
- Lint / CI չկա (test-երը կան՝ `npm test`, 55 հատ)
- `/admin` էջը ավելորդ SSR-վում է
- **Maison bug.** `MaisonHero.vue` / `MaisonHeader.vue` օգտագործում են
  `<MaisonLangSwitch>` **առանց import-ի**; Nuxt-ը auto-import է անում միայն
  `~/components`-ից → լեզվի փոխարկիչը փաստացի չի render-վում
- `raw-indexes.sql`-ի perf ինդեքսները կիրառված չեն; `idx_categories_live`-ը դեռ
  հղում է legacy `section` սյանը → պետք է `sectionId`-ի փոխել
- **Supabase Storage-ը backup չունի** (`ops/backup-db.sh`-ը միայն DB է)

---

## Ստուգված և ապահով (false positive-ներ)

Որ նորից չվերլուծվի — սրանք **ստուգվել են և խնդիր չեն**․

| Կասկած | Ինչու ՉԷ խնդիր |
|---|---|
| JSON-LD / meta XSS (`innerHTML: JSON.stringify(...)` tenant data-ով) | **Empirically հերքված** — unhead-ը escape է անում `</script>` → `<`, meta-ի `"` → `&quot;` |
| IDOR products/categories/sections | Ամեն mutation սկսվում է `ensureOwn(restaurantId, id)`-ով; reorder-ը՝ `count === ids.length` |
| super-admin endpoint-ները բաց են | `@SuperAdmin()` + global `RolesGuard` |
| Client-supplied `restaurantId` | `RestaurantScopeGuard`-ը սկանավորում է body/params/query/header → 403 |
| SQL injection | Զրո raw SQL; `parseSort` whitelist-ով |
| Mass assignment (role/planId/isActive) | Global `ValidationPipe({ whitelist, forbidNonWhitelisted })` + DTO-ներում այդ դաշtերը չկան |
| Cross-request SSR state leak | `AsyncLocalStorage` (ոչ module-level փոփոխական) |
| CSRF | Auth-ը `Authorization: Bearer` header է, ոչ cookie |
| Supabase / OpenAI key frontend-ում | Զրո հղում; `runtimeConfig.public`-ում միայն `apiBase` |
| Host header / cache poisoning | `/public/resolve`-ը **ոչ ոք չի կանչում**; resolution-ը միայն path slug-ով է |
| Refresh token DB-ում plaintext | sha256-hashed |

---

## Test-եր

`cd backend && npm test` → **55 tests**, առանց նոր dependency-ի
(Node-ի ներկառուցված runner + type stripping)։

| Ֆայլ | Ինչ է պաշտպանում |
|---|---|
| `test/storage-key.test.ts` (22) | HIGH-1 — cross-tenant deletion, encoded bypass, traversal, prefix confusion |
| `test/token-freshness.test.ts` (8) | HIGH-3 — stale access token, precision grace |
| `test/session-revocation.test.ts` (5) | HIGH-3 — revocation + credential write մեկ transaction-ում |
| `test/password.test.ts` (6) | HIGH-2 — randomness, alphabet, entropy, distribution |
| `test/error-sanitizer.test.ts` (6) | MED-1 — schema/DB-URL արտահոսք չկա |
| `test/tenant-status.test.ts` (8) | MED-5 — suspended/deleted/missing tenant |

Այլ script-եր՝ `npm run typecheck`, `npm run typecheck:test`, `npm run build`,
`npx prisma validate`։
