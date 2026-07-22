#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Daily PostgreSQL backup of the Supabase database → local VPS storage.
#
# Why: if Supabase ever has an issue (corruption, accidental DELETE, provider
# outage, plan pause), you can restore every restaurant's data from the VPS.
# Keeps the last RETENTION_DAYS dumps and rotates the rest away.
#
# Format: pg_dump custom archive (-Fc) → compressed, restore with pg_restore.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Config (override via env) ───────────────────────────────────────────────
# DATABASE_URL must be the Supabase **Session Pooler** URI (IPv4, port 5432):
#   postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
# (Supabase Dashboard → Project Settings → Database → Connection pooling → Session)
# We read it from the backend .env so there is a SINGLE source of truth.
ENV_FILE="${ENV_FILE:-/var/www/menus-staging/backend/.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/menus-db}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
# Optional: which env var to read the connection string from.
URL_VAR="${URL_VAR:-BACKUP_DATABASE_URL}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── Resolve the connection string ───────────────────────────────────────────
# Priority: env DATABASE_URL → env $URL_VAR → backend .env ($URL_VAR then DATABASE_URL)
CONN="${DATABASE_URL:-${!URL_VAR:-}}"
if [[ -z "$CONN" && -f "$ENV_FILE" ]]; then
  CONN="$(grep -E "^${URL_VAR}=" "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"'\''' || true)"
  [[ -z "$CONN" ]] && CONN="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"'\''' || true)"
fi
if [[ -z "$CONN" ]]; then
  log "ERROR: no connection string (set DATABASE_URL / $URL_VAR, or add it to $ENV_FILE)"
  exit 1
fi

# ── Run the dump ────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
TS="$(date +%Y-%m-%d_%H-%M-%S)"
OUT="$BACKUP_DIR/menus_${TS}.dump"

log "Starting backup → $OUT"
# --no-owner/--no-privileges → portable restore into any Postgres/role.
pg_dump "$CONN" -Fc --no-owner --no-privileges -f "$OUT"

# ── Integrity check: a dump you cannot read is worthless ────────────────────
if ! pg_restore --list "$OUT" >/dev/null 2>&1; then
  log "ERROR: integrity check failed — removing bad file $OUT"
  rm -f "$OUT"
  exit 1
fi
log "Backup OK ($(du -h "$OUT" | cut -f1))"

# ── Rotate: keep only the last RETENTION_DAYS days ──────────────────────────
find "$BACKUP_DIR" -name 'menus_*.dump' -type f -mtime "+${RETENTION_DAYS}" -print -delete | while read -r f; do
  log "Rotated out: $f"
done
log "Done. Backups in $BACKUP_DIR (retention: ${RETENTION_DAYS} days)"
