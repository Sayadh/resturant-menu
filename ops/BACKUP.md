# Բազայի backup (Supabase → VPS)

Ամենօրյա ավտոմատ backup Supabase-ի PostgreSQL-ից VPS-ի վրա։ Եթե Supabase-ի հետ
խնդիր լինի (ջնջում, corruption, outage, plan pause), տվյալները վերականգնում ես
VPS-ի պատճեններից։

Ֆայլերը՝ `ops/backup-db.sh` (script), սա՝ ուղեցույցը։

---

## 1. Նախապատրաստում (VPS-ում, մեկ անգամ)

**ա) Տեղադրիր `pg_dump`/`pg_restore`** (client-ը պիտի ≥ Supabase-ի server version)․
```bash
sudo apt update && sudo apt install -y postgresql-client
pg_dump --version   # պիտի 15+ լինի (Supabase = PG15/17)
```
Եթե version-ը հին է, ավելացրու PGDG repo-ն ու տեղադրիր `postgresql-client-17`։

**բ) Վերցրու Session Pooler connection string-ը**
Supabase Dashboard → Project Settings → **Database → Connection pooling → Session**
(port **5432**, IPv4)։ Ձևը՝
```
postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```
> Կարևոր՝ **Session** pooler-ը (5432), ոչ Transaction (6543) — `pg_dump`-ը transaction mode-ում չի աշխատում։ Ուղիղ `db.<ref>.supabase.co` host-ը հաճախ միայն IPv6 է, VPS-ը կարող է չկապվել — դրա համար pooler-ը (IPv4)։

**գ) Դիր connection string-ը backend-ի `.env`-ում** (նույն ֆայլը, մեկ source)․
```
BACKUP_DATABASE_URL="postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require"
```

**դ) Դիր script-ը տեղում ու դարձրու executable**․
```bash
sudo mkdir -p /var/backups/menus-db
sudo chmod +x /var/www/menus-staging/ops/backup-db.sh
```

---

## 2. Ձեռքով թեստ

```bash
sudo /var/www/menus-staging/ops/backup-db.sh
ls -lh /var/backups/menus-db/
```
Պիտի ստեղծի `menus_<ամսաթիվ>.dump` ֆայլ ու տպի `Backup OK (<size>)`։

Փոփոխականներ (ընտրովի override)․
```bash
ENV_FILE=/var/www/menus-staging/backend/.env \
BACKUP_DIR=/var/backups/menus-db \
RETENTION_DAYS=14 \
/var/www/menus-staging/ops/backup-db.sh
```

---

## 3. Ամենօրյա cron (ինքնաշխատ)

```bash
sudo crontab -e
```
Ավելացրու (օրական 03:30-ին, log-ը՝ ֆայլում)․
```
30 3 * * * /var/www/menus-staging/ops/backup-db.sh >> /var/log/menus-backup.log 2>&1
```
Ստուգիր՝ `sudo tail -f /var/log/menus-backup.log`։

---

## 4. Վերականգնում (restore)

**Ամբողջ բազան** դատարկ/նոր բազա վերականգնելու համար․
```bash
pg_restore --clean --if-exists --no-owner --no-privileges \
  -d "postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require" \
  /var/backups/menus-db/menus_2026-07-21_03-30-00.dump
```
- `--clean --if-exists` → նախ drop է անում գոյություն ունեցող օբյեկտները, հետո restore։
- Կարող ես restore անել նաև **նոր/տեղական** Postgres-ի մեջ (նույն հրաման, ուրիշ `-d` URL)։

**Ընտրովի** (միայն մեկ table, օր. products)․
```bash
pg_restore --data-only -t products -d "<URL>" menus_....dump
```

Backup-ի պարունակությունը դիտել առանց restore-ի․
```bash
pg_restore --list menus_....dump | less
```

---

## 5. Անվտանգություն և լավագույն փորձ (senior)

- **Թեստավորիր restore-ը** ամիսը մեկ (dump, որ չես կարող restore անել, անօգուտ է)։
- **Off-site պատճեն**՝ VPS-ի disk-ի խափանման դեպքում ունենալ նաև 2-րդ տեղ։ Ավելացրու script-ի վերջում, օր.՝
  - `rclone copy "$OUT" remote:menus-backups/` (Backblaze B2 / S3 / Google Drive), կամ
  - `scp "$OUT" user@other-host:/backups/`
- `.env`-ը (BACKUP_DATABASE_URL-ով) **git-ում մի commit արա** — secret է։
- Backup-ի պանակը՝ միայն root-ի համար (`chmod 700 /var/backups/menus-db`)։
- **Նկարներ**՝ սա DB backup է; Supabase Storage-ի ֆայլերը (logo/banner/ֆոտո) առանձին են։ Դրանք backup անելու համար կարելի է պարբերաբար `rclone sync` անել Storage bucket-ը (առանձին քայլ, ասա՝ կավելացնեմ)։
