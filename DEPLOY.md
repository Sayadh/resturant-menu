# Deploy Runbook — menus.am

**Այս ֆայլը deploy-ի միակ ճշմարտության աղբյուրն է.** ամեն deploy արա այստեղից,
նույն հերթականությամբ։ `DEPLOY-VPS.md` և `DEPLOY-STAGING.md` մնում են **միայն
առաջին անգամ setup-ի** համար (Nginx, Certbot, PM2 process-երի ստեղծում)։

---

## 1. Իրական ինֆրակառուցվածքը

> Ստուգված է սերվերի վրա `pm2 describe` + `git branch --show-current` +
> `.env`-ի fingerprint-ներով (2026-07-31)։ Ենթադրություն չկա։

Մեկ VPS՝ `91.195.254.29`, վրան **երկու առանձին deployment**․

| | 🔴 PRODUCTION | 🟡 STAGING |
|---|---|---|
| Թղթապանակ | `/var/www/resturant-menu` | `/var/www/menus-staging` |
| PM2 backend | **`api`** | **`api-staging`** |
| PM2 frontend | **`web`** | **`web-staging`** |
| Backend port | 4000 | 4001 |
| Frontend port | 3000 | 3001 |
| Դոմեն | menus.am | staging.menus.am |
| Git branch | **`staging`** ⚠️ | `staging` |
| Բազա | Supabase #1 | Supabase #2 (**առանձին**) |

⚠️ **Ուշադրություն.** `DEPLOY-VPS.md`-ը գրում է, թե production-ը `main` branch-ից
է։ **Դա այլևս ճիշt չէ** — երկու deployment-ն էլ ներկայում `staging` branch-ի վրա են։
`main` branch-ը ոչ մի տեղ deploy չի արվում։ Կա՛մ պահիր այս վիճակը, կա՛մ
վերադարձրու prod-ը `main`-ի վրա — բայց մի՛ ենթադրիր, ստուգիր՝
`git -C /var/www/resturant-menu branch --show-current`։

⚠️ **Երկու բազան ԱՌԱՆՁԻՆ են** → migration-ը պետք է գործարկվի **երկուսի վրա էլ**,
և ամեն մեկի drift կարող է տարբեր լինել։

Նույն սերվերին կա նաև անկապ նախագիծ՝ `evakuators-backend` / `evakuators-frontend`։
**Երբեք մի՛ դիպչիր դրանց։**

### Ո՞ր բազան որն է (secret չի բացահայտվում)

```bash
# VPS-ում
for d in /var/www/resturant-menu /var/www/menus-staging; do
  echo "$(basename $d): $(grep '^DATABASE_URL=' $d/backend/.env | sha256sum | cut -c1-12)"
done

# Mac-ում — որի՞ն է միանում քո local-ը
cd ~/Desktop/resturant-menu && grep '^DATABASE_URL=' backend/.env | sha256sum | cut -c1-12
```
Համեմատիր 12-նիշանոց fingerprint-ները։ Սա կարևոր է՝ որ իմանաս, թե `prisma
migrate diff`-ը Mac-ից գործարկելիս **որ** բազան ես ստուգում։

---

## 2. Migration-ի ոսկե կանոնները

| ✅ Օգտագործիր | ❌ ԵՐԲԵՔ սերվերի վրա |
|---|---|
| `npx prisma migrate deploy` | `prisma migrate dev` |
| `npx prisma migrate diff` (read-only) | `prisma db push` |
| | `prisma migrate reset` |

**Ինչու.** `migrate dev`-ը drift տեսնելիս առաջարկում է **DB reset** (ամբողջական
կորուստ), իսk repo-ում կան օբյեկտներ, որոնց մասին Prisma-ն չգիտի
(`uq_domains_live` partial unique index) — `migrate dev`-ը կուզի ջնջել դրանք։

**Deploy-ից առաջ միշտ գործարկիր drift ստուգումը** (read-only, ոչինչ չի փոխում)․
```bash
cd <deployment>/backend
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel   prisma/schema.prisma \
  --script
```
> `--from-url "$DATABASE_URL"` **մի՛ օգտագործիր** — shell-ում այդ փոփոխականը
> սովորաբար դատարկ է (Prisma-ն `.env`-ը ինքն է կարդում), և կստանաս
> «0 `--from-...` provided» սխալը։

**Կարմիր դրոշ.** եթե ելքում երևա `DROP TABLE`, `DROP COLUMN` կամ `DROP INDEX` —
**կանգ առ**, մի՛ գործարկիր `migrate deploy`։

---

## 3. Deploy — քայլ առ քայլ

### Քայլ 0 · Mac-ի վրա

```bash
cd ~/Desktop/resturant-menu

cd backend  && npm run typecheck && npm test && npm run build && cd ..
cd frontend && npm run build && cd ..      # ⚠️ պարտադիր — CI չկա

git push origin staging
```

### Քայլ 1 · STAGING (միշտ առաջինը)

```bash
ssh root@91.195.254.29
cd /var/www/menus-staging

bash ops/backup-db.sh                 # backup
git pull origin staging

cd backend
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma --script      # ← ստուգիր ելքը
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart api-staging --update-env

cd ../frontend
npm run build
pm2 restart web-staging --update-env

pm2 status
```
Հետո smoke test արա `staging.menus.am`-ի վրա (տես §4)։

### Քայլ 2 · PRODUCTION (միայն staging-ը ստուգելուց հետո)

```bash
cd /var/www/resturant-menu

bash ops/backup-db.sh
git pull origin staging               # ⚠️ ոչ թե main — տես §1

cd backend
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma --script      # ← ՏԱՐԲԵՐ բազա է,
                                                           #   ելքն էլ կարող է տարբեր լինել
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart api --update-env          # ⚠️ `api`, ոչ թե `api-staging`

cd ../frontend
npm run build
pm2 restart web --update-env          # ⚠️ `web`, ոչ թե `web-staging`

pm2 status
```

### Քայլ 3 · Հաստատում

```bash
cd /var/www/resturant-menu/backend
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma --script
# Դատարկ ելք = զրո drift ✅
```

### Մասնակի deploy

Եթե փոփոխությունը միայն մեկ կողմում է՝

**Միայն frontend** (CSS, SFC, themes)
```bash
cd <deployment>/frontend && npm run build && pm2 restart <web|web-staging> --update-env
```
**Միայն backend**
```bash
cd <deployment>/backend
npx prisma generate     # միայն եթե schema.prisma փոխվել է
npm run build && pm2 restart <api|api-staging> --update-env
```
`npm ci` պետք է **միայն** երբ `package.json`-ի **dependencies**-ն է փոխվել
(script ավելացնելը բավարար չէ)։

---

## 4. Smoke test

- [ ] `pm2 status` → բոլորը `online`
- [ ] Public մենյուն բացվում է (`/<slug>`)
- [ ] Admin login-ը աշխատում է
- [ ] `pm2 logs <api|api-staging> --lines 50` → error չկա
- [ ] Super-admin → owner-ի գաղտնաբառի փոփոխություն → հին session-ը **401**
- [ ] Նոր ռեստորան առանց password → **պատահական** գաղտնաբառ է վերադարձնում
- [ ] Կատեգորիայի նկարի փոխարինում → հին ֆայլը ջնջվում է
- [ ] Ուրիշ tenant-ի image URL դնել + փոխել → ֆայլը **մնում է** (log՝ `foreign-tenant`)

---

## 5. Rollback

```bash
cd <deployment>
git reset --hard <last-good-commit>
cd backend  && npx prisma generate && npm run build && pm2 restart <api|api-staging> --update-env
cd ../frontend && npm run build && pm2 restart <web|web-staging> --update-env
```

**DB rollback սովորաբար պետք չէ** — migration-ները additive են (`ADD COLUMN`,
`SET NOT NULL`, `CREATE INDEX`), հին կոդը նոր schema-ի հետ նորմալ աշխատում է։
Տվյալի կորստի դեպքում՝ `ops/BACKUP.md`։

---

## 6. Troubleshooting

| Խնդիր | Պատճառ / լուծում |
|---|---|
| `column ... does not exist` | `migrate deploy` չի գործարկվել այդ **բազայի** վրա |
| Prisma type errors build-ի ժամանակ | `npx prisma generate` **backend/**-ից (ոչ root) |
| `0 --from-... parameter(s) provided` | `--from-url "$DATABASE_URL"` ես օգտագործել → անցիր `--from-schema-datasource`-ի |
| `git add frontend/` → `did not match any files` | Դու frontend-ի **ներսում** ես; գնա repo-ի արմատ |
| Lead/Telegram 503 | `.env`-ում token չկա → restart `--update-env`-ով |
| git pull conflict (chmod-ված script) | `git checkout -- <file> && git pull` |
| Vite `#app-manifest` error | `rm -rf .nuxt .output node_modules/.vite && npm run build` |
| `invalid ELF header` / `binding-darwin-arm64` | macOS-ի `node_modules`-ը Linux-ում. սերվերում արա `npm ci` |

---

## 7. Ի՞նչ փոխվեց 2026-07-31-ի security deploy-ով

Մանրամասները՝ [`docs/SECURITY-AUDIT-2026-07.md`](./docs/SECURITY-AUDIT-2026-07.md)։
Deploy-ից հետո սպասվող **վարքագծի** փոփոխությունները․

- **Կասեցված ռեստորանի** (`isActive=false`) owner-ը admin API-ում կստանա **403**
  (նախկինում միայն public էջն էր փակվում)։ Ստուգիր նախապես՝
  ```sql
  SELECT slug, "isActive", "deletedAt" FROM restaurants
  WHERE "isActive" = false OR "deletedAt" IS NOT NULL;
  ```
- **Error message-երը** production-ում դառնում են generic + `REQUEST_ID`;
  մանրամասնը՝ `pm2 logs`-ում, նույն id-ով։
- **Ոչ ոք logout չի լինում** (բոլորի `passwordChangedAt` = NULL)։
- Ամեն authenticated request +1 PK lookup (session freshness + tenant status)։

Ցանկության դեպքում՝ բոլոր session-ների միանգամյա չեղարկում․
```sql
UPDATE refresh_tokens SET "revokedAt" = now() WHERE "revokedAt" IS NULL;
```

---

## 8. Օգտակար read-only հարցումներ

Supabase → SQL Editor։ Ոչինչ չեն փոխում։

```sql
-- Ի՞նչ migration է կիրառված
SELECT migration_name, finished_at, rolled_back_at
FROM _prisma_migrations ORDER BY started_at;

-- Կասեցված / ջնջված ռեստորաններ
SELECT slug, "isActive", "deletedAt" FROM restaurants
WHERE "isActive" = false OR "deletedAt" IS NOT NULL;

-- Կրկնվող live domain (պետք է 0 տող)
SELECT domain, count(*) FROM domains WHERE "deletedAt" IS NULL
GROUP BY domain HAVING count(*) > 1;

-- Orphan կատեգորիաներ (պետք է 0)
SELECT count(*) FROM categories c WHERE c."sectionId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM sections s WHERE s.id = c."sectionId");
```
Բացարձակ երաշխիքի համար՝ `BEGIN TRANSACTION READ ONLY; ... COMMIT;`
