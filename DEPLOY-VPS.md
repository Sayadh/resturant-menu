# Production deploy (menus.am) — self-hosted VPS

Everything runs on one VPS (`91.195.254.29`) behind Nginx: same origin, no CORS.
PM2 keeps processes alive; Certbot handles SSL. Supabase hosts PostgreSQL.

> Monorepo layout: `backend/` and `frontend/` are side by side.
> Backend commands run from `backend/`, frontend commands from `frontend/`.

| Piece | Value |
|---|---|
| Folder | `/var/www/resturant-menu` |
| Branch | `main` |
| Backend | port 4000 · pm2 `api` |
| Frontend | port 3000 · pm2 `web` |
| Domain | menus.am, www.menus.am |

---

## ⚠️ Migrating an EXISTING prod to the new frontend/ layout

If prod was deployed BEFORE the `frontend/` restructure, the old `web` process
pointed at the repo root. After pulling the restructured code, re-point it:

```bash
cd /var/www/resturant-menu
git pull

# backend unchanged
cd backend && npm install --include=dev && npm run build && pm2 restart api

# frontend now lives in frontend/ — recreate the web process
cd ../frontend
cp ../.env ./.env 2>/dev/null || nano .env    # move the old root frontend .env here if needed
npm install && npm run build
pm2 delete web 2>/dev/null || true
PORT=3000 pm2 start .output/server/index.mjs --name web
pm2 save
```

Delete the now-stale root `.nuxt`, `.output`, `node_modules` at the repo root
(they moved into `frontend/`):
```bash
cd /var/www/resturant-menu && rm -rf .nuxt .output node_modules
```

---

## First-time setup

```bash
ssh root@91.195.254.29
cd /var/www
git clone https://github.com/Sayadh/resturant-menu.git
cd resturant-menu
```

### Backend (port 4000)
```bash
cd /var/www/resturant-menu/backend
nano .env
```
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=<Supabase Session-pooler URL, port 5432>
JWT_ACCESS_SECRET=<strong random>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<strong random>
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGINS=https://menus.am,https://www.menus.am
TELEGRAM_BOT_TOKEN=<bot token>
TELEGRAM_CHAT_ID=<chat id>
```
```bash
npm install --include=dev
npm run build
pm2 start dist/main.js --name api
npm run db:seed && npm run create:demo && npm run add:superadmin   # first time only
```

### Frontend (port 3000)
```bash
cd /var/www/resturant-menu/frontend
nano .env
```
```env
NUXT_PUBLIC_USE_API=true
NUXT_PUBLIC_API_BASE=/api/v1
NUXT_API_BASE_SERVER=http://127.0.0.1:4000/api/v1
```
```bash
npm install
npm run build
PORT=3000 pm2 start .output/server/index.mjs --name web
pm2 save
pm2 startup    # follow the printed command so pm2 survives reboot
```

### Nginx + SSL
```bash
nano /etc/nginx/sites-available/menus.am
```
```nginx
server {
    listen 80;
    server_name menus.am www.menus.am;

    location /api/v1/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
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
ln -s /etc/nginx/sites-available/menus.am /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d menus.am -d www.menus.am
```

---

## Routine updates

```bash
cd /var/www/resturant-menu
git pull
cd backend  && npm install --include=dev && npm run build && pm2 restart api
cd ../frontend && npm install && npm run build && pm2 restart web
```

Handy: `pm2 status`, `pm2 logs api`, `pm2 logs web`.
