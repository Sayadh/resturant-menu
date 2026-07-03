# Staging environment (staging.menus.am)

A safe second copy of the app on the **same VPS**, fully isolated from production.

> Monorepo layout: the repo now has `backend/` and `frontend/` side by side.
> All frontend commands run from `frontend/`, all backend commands from `backend/`.

| | Production | Staging |
|---|---|---|
| Folder | `/var/www/resturant-menu` | `/var/www/menus-staging` |
| Git branch | `main` | `staging` |
| Domain | `menus.am` | `staging.menus.am` |
| Backend port | 4000 | 4001 |
| Frontend port | 3000 | 3001 |
| pm2 names | `api`, `web` | `api-staging`, `web-staging` |
| Database | prod Supabase | **separate** Supabase (recommended) |

Workflow: edit on `staging` branch → deploy to staging → test at `staging.menus.am`
→ when happy, merge to `main` → deploy to production. Prod is never touched while testing.

DNS: your wildcard `* → 91.195.254.29` already covers `staging.menus.am` ✅ (no DNS change needed).

---

## 0. One-time: create a `staging` branch (local)

```bash
cd ~/Desktop/resturant-menu
git checkout -b staging
git push -u origin staging
git checkout main    # keep main as your default
```

## 1. One-time: separate database (recommended)

Create a **new free Supabase project** for staging (so tests never touch real data).
Grab its Session-pooler URL (port 5432). You'll put it in the staging backend `.env`.
*(If you don't want a second DB now, you can reuse prod's — but any test edit hits real data. Not recommended.)*

## 2. One-time: clone + set up staging on the VPS

```bash
ssh root@91.195.254.29
cd /var/www
git clone -b staging https://github.com/Sayadh/resturant-menu.git menus-staging
cd menus-staging
```

### Backend (port 4001)
```bash
cd /var/www/menus-staging/backend
nano .env
```
```env
NODE_ENV=production
PORT=4001
DATABASE_URL=<STAGING Supabase URL>
JWT_ACCESS_SECRET=<any strong value>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<any strong value>
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGINS=https://staging.menus.am
TELEGRAM_BOT_TOKEN=<same or a test bot>
TELEGRAM_CHAT_ID=<your chat id>
```
```bash
npm install --include=dev
npm run build
pm2 start dist/main.js --name api-staging
# seed the staging DB (only if it's a fresh/separate DB):
npm run db:seed && npm run create:demo && npm run add:superadmin
```

### Frontend (port 3001)
```bash
cd /var/www/menus-staging/frontend
nano .env
```
```env
NUXT_PUBLIC_USE_API=true
NUXT_PUBLIC_API_BASE=/api/v1
NUXT_API_BASE_SERVER=http://127.0.0.1:4001/api/v1
```
```bash
npm install
npm run build
PORT=3001 pm2 start .output/server/index.mjs --name web-staging
pm2 save
```

## 3. One-time: Nginx for staging.menus.am

```bash
nano /etc/nginx/sites-available/staging.menus.am
```
```nginx
server {
    listen 80;
    server_name staging.menus.am;

    location /api/v1/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
ln -s /etc/nginx/sites-available/staging.menus.am /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d staging.menus.am
```

Now `https://staging.menus.am` works.

---

## Daily workflow

**Develop** (edit code) — either locally on the `staging` branch, or via VS Code
Remote-SSH directly in `/var/www/menus-staging`. Commit + push to `staging`.

**Deploy to staging + test:**
```bash
cd /var/www/menus-staging
git pull
cd backend  && npm install --include=dev && npm run build && pm2 restart api-staging
cd ../frontend && npm install && npm run build && pm2 restart web-staging
```
Open `https://staging.menus.am`, test everything.

**Promote to production** (when staging looks good):
```bash
# local: merge staging → main
git checkout main && git merge staging && git push

# VPS prod:
cd /var/www/resturant-menu
git pull
cd backend  && npm install --include=dev && npm run build && pm2 restart api
cd ../frontend && npm install && npm run build && pm2 restart web
```

Handy: `pm2 status` (shows api, web, api-staging, web-staging), `pm2 logs api-staging`.
