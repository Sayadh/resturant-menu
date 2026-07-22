# Deploy Runbook — menus.am (staging)

Այս ֆայլը deploy-ի քայլ առ քայլ հրահանգներն են։ Ամեն deploy արա **նույն հերթականությամբ**, որ ոչ մի քայլ բաց չմնա։

- **VPS:** `91.195.254.29` · path `/var/www/menus-staging`
- **PM2:** `api-staging` (backend, port 4000) · `web-staging` (frontend, port 3001)
- **Branch:** `staging`
- **DB:** Supabase PostgreSQL (schema-ի փոփոխությունները անում ենք ձեռքով SQL-ով, ոչ migration-ով)

---

## 0. Deploy-ից առաջ (local)

```bash
cd ~/Desktop/resturant-menu

# Համոզվիր՝ ամեն ինչ compile է լինում
cd backend && npm run build && cd ..

# Push staging
git push origin staging
```

Եթե schema.prisma փոխվել է, տես՝ ինչ նոր սյուներ կան․
```bash
git diff origin/staging -- backend/prisma/schema.prisma
```

---

## 1. Database (Supabase → SQL Editor)

Միայն եթե schema-ում **նոր դաշt/աղյուսակ** կա։ Գործարկիր `ADD COLUMN IF NOT EXISTS`-ով (անվտանգ է, կրկնվող)։

> ⚠️ Local-ն ու prod-ը նույն Supabase բազան են → SQL-ը գործարկվում է **մեկ անգամ**։

---

## 2. VPS deploy

```bash
ssh root@91.195.254.29
cd /var/www/menus-staging
git pull origin staging

# ── Backend ──
cd backend
npm ci
npx prisma generate          # պարտադիր՝ schema փոխվելուց հետո
npm run build
pm2 restart api-staging --update-env

# ── Frontend ──
cd ../frontend
npm ci
npm run build
pm2 restart web-staging --update-env

# Ստուգիր՝ երկուսն էլ online են
pm2 status
```

> `--update-env` — PM2-ն env-ը cache անում է start-ի պահին. առանց սրա `.env`-ի նոր փոփոխությունները չեն կիրառվի։

---

## 2b. Մասնակի deploy (միայն մեկ կողմ)

Երբ փոփոխությունը միայն մեկ կողմում է, պետք չէ ամեն ինչ rebuild անել։

**Միայն frontend** (CSS, SFC, themes, UI — ոչ SQL, ոչ backend)
```bash
cd /var/www/menus-staging
git pull origin staging
cd frontend
npm run build            # npm ci միայն եթե package.json փոխվել է
pm2 restart web-staging --update-env
```
> `git pull`-ը backend կոդն էլ բերում է, բայց քանի որ `api-staging`-ը չես restart անում՝ աշխատող backend-ն անփոփոխ է։ CSS-ի փոփոխությունից հետո՝ hard refresh (cache)։

**Միայն backend** (API, DTO, service — ոչ frontend)
```bash
cd /var/www/menus-staging
git pull origin staging
cd backend
npx prisma generate      # միայն եթե schema.prisma փոխվել է
npm run build            # npm ci միայն եթե package.json փոխվել է
pm2 restart api-staging --update-env
```
> Եթե schema նոր դաշt ունի՝ նախ գործարկիր SQL-ը (Քայլ 1), հետո prisma generate։

---

## 3. Ստուգում (smoke test)

- [ ] `pm2 status` → `api-staging` և `web-staging` = online
- [ ] Public էջ բացվում է (`/<slug>`)
- [ ] Admin login աշխատում է
- [ ] Նոր feature-ը աշխատում է (ըստ deploy-ի)
- [ ] Backend log-երում error չկա՝ `pm2 logs api-staging --lines 50`

---

## Troubleshooting

| Խնդիր | Պատճառ / լուծում |
|---|---|
| `column ... does not exist` | SQL-ը չի գործարկվել Supabase-ում (Քայլ 1) |
| Prisma type errors build-ի ժամանակ | `npx prisma generate` backend-ի ֆոլդերից (ոչ root) |
| Lead/Telegram 503 | `.env`-ում token/chat_id չկա → restart `--update-env`-ով |
| git pull conflict (chmod-ված script) | `git checkout -- <file> && git pull` |
| Vite `#app-manifest` error | stale cache → `rm -rf .nuxt .output node_modules/.vite && npm run build` |

---

## Հերթի սպասող schema փոփոխություններ (այս deploy-ի համար)

Supabase SQL Editor-ում գործարկիր՝

```sql
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "showCartTotal" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "serviceChargeEnabled" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "serviceChargeMode" TEXT DEFAULT 'percent',
  ADD COLUMN IF NOT EXISTS "serviceChargePercent" INTEGER DEFAULT 10;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS "bannerTextColor" TEXT;
```

Ինչ է ներառում այս թողարկումը՝
- Զամբյուղի կարգավորումներ (ընդհանուր գումարի ցուցադրում + սպասարկման վճար՝ % կամ նշում) — paid plan
- Super-admin panel՝ հասցե + հեռախոս + owner login (email/password reset)
- Կատեգորիայի banner-ի տեքstի գույն (light/dark)

SQL-ը գործարկելուց հետո՝ Քայլ 2 (prisma generate + build + restart)։
