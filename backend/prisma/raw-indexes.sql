-- ─────────────────────────────────────────────────────────────────────────
-- Raw SQL indexes Prisma can't express in schema.prisma.
-- Run as a manual migration AFTER `prisma migrate dev`:
--   npx prisma migrate dev --create-only --name raw_indexes
--   (paste this file into the generated migration.sql, then `prisma migrate dev`)
--
-- NOTE: tables are snake_case (via @@map) but COLUMNS are camelCase (Prisma
-- default), so column identifiers are double-quoted below. If you later add
-- @map("snake_case") to columns, drop the quotes accordingly.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Partial indexes for soft-deleted hot tables: index only LIVE rows so the
--    "live menu" reads (which always add deletedAt IS NULL) stay small/fast.
CREATE INDEX IF NOT EXISTS idx_products_live
  ON products ("restaurantId", "categoryId", "sortOrder")
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_live_active
  ON products ("restaurantId", "isActive")
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_categories_live
  ON categories ("restaurantId", "section", "sortOrder")
  WHERE "deletedAt" IS NULL;

-- Domain uniqueness on LIVE rows only (so a soft-deleted host can be re-added).
CREATE UNIQUE INDEX IF NOT EXISTS uq_domains_live
  ON domains ("domain")
  WHERE "deletedAt" IS NULL;

-- System badges (restaurantId IS NULL) must be unique by key. The schema's
-- @@unique([restaurantId, key]) only covers custom (non-null) badges because
-- Postgres treats NULLs as distinct, so add a partial unique for system ones.
CREATE UNIQUE INDEX IF NOT EXISTS uq_badges_system_key
  ON badges ("key")
  WHERE "restaurantId" IS NULL;

-- 2) Time-series BRIN indexes for append-only analytics/audit tables. BRIN is
--    tiny and ideal for monotonically-increasing createdAt on huge tables.
CREATE INDEX IF NOT EXISTS brin_menu_views_created
  ON menu_views USING BRIN ("createdAt");

CREATE INDEX IF NOT EXISTS brin_product_views_created
  ON product_views USING BRIN ("createdAt");

CREATE INDEX IF NOT EXISTS brin_qr_scans_created
  ON qr_code_scans USING BRIN ("createdAt");

CREATE INDEX IF NOT EXISTS brin_audit_logs_created
  ON audit_logs USING BRIN ("createdAt");

-- 3) (LATER, at scale) Partition analytics tables by month, e.g.:
--    menu_views ... PARTITION BY RANGE ("createdAt"); + monthly partitions,
--    then a scheduled job rolls events into daily summary tables
--    (daily_menu_stats, daily_product_stats, …). Not needed for launch.
