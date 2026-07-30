-- ─────────────────────────────────────────────────────────────────────────
-- HIGH-4 — catch-up migration for schema applied MANUALLY in production.
--
-- Background: after 20260629062429_restaurant_info, several schema changes
-- were applied straight to the database with ad-hoc ALTER/CREATE statements
-- instead of migrations. Production therefore already HAS these objects, but
-- a fresh database built with `prisma migrate deploy` would not — and
-- `prisma migrate dev` sees the difference as drift and offers to reset.
--
-- This migration closes that gap. It was written against a verified snapshot
-- of production (information_schema + pg_indexes + _prisma_migrations), not
-- from assumptions:
--   • sections, section_translations, ai_usage  → ALREADY EXIST in prod
--   • categories.sectionId/iconUrl/mobileImageUrl/bannerTextColor → EXIST
--   • plans.maxCategories                        → EXISTS
--   • restaurants.showCartTotal / serviceCharge* → EXIST (but NULLABLE)
--   • categories.section (legacy enum)           → already DROP NOT NULL
--   • orphan categories: 0 · duplicate live domains: 0
--
-- Safety properties:
--   • Additive only — no DROP TABLE / DROP COLUMN / data deletion
--   • Idempotent — IF NOT EXISTS everywhere, constraints guarded by DO blocks,
--     so on production every statement is a no-op and on a fresh database it
--     builds the missing objects
--   • The only data write is a backfill of NULL → the column's intended
--     default, needed before SET NOT NULL (expected to affect 0 rows)
--   • ADD COLUMN with a constant default does not rewrite the table (PG 11+),
--     and every table involved is small → no meaningful lock time
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. sections ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "sections" (
    "id"           UUID         NOT NULL,
    "restaurantId" UUID         NOT NULL,
    "icon"         TEXT,
    "imageUrl"     TEXT,
    "sortOrder"    INTEGER      NOT NULL DEFAULT 0,
    "isActive"     BOOLEAN      NOT NULL DEFAULT true,
    "deletedAt"    TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sections_restaurantId_idx" ON "sections"("restaurantId");

DO $$ BEGIN
  ALTER TABLE "sections"
    ADD CONSTRAINT "sections_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. section_translations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "section_translations" (
    "id"         UUID NOT NULL,
    "sectionId"  UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "name"       TEXT NOT NULL,

    CONSTRAINT "section_translations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "section_translations_sectionId_languageId_key"
  ON "section_translations"("sectionId", "languageId");
CREATE INDEX IF NOT EXISTS "section_translations_languageId_idx"
  ON "section_translations"("languageId");

DO $$ BEGIN
  ALTER TABLE "section_translations"
    ADD CONSTRAINT "section_translations_sectionId_fkey"
    FOREIGN KEY ("sectionId") REFERENCES "sections"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "section_translations"
    ADD CONSTRAINT "section_translations_languageId_fkey"
    FOREIGN KEY ("languageId") REFERENCES "languages"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. ai_usage (no FK: the Prisma model declares no relation) ───────────
CREATE TABLE IF NOT EXISTS "ai_usage" (
    "id"           UUID         NOT NULL,
    "restaurantId" UUID         NOT NULL,
    "period"       TEXT         NOT NULL,
    "count"        INTEGER      NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_usage_restaurantId_period_key"
  ON "ai_usage"("restaurantId", "period");

-- ── 4. categories: new columns + legacy enum relaxed + indexes + FK ──────
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "sectionId"       UUID;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "iconUrl"         TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "mobileImageUrl"  TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "bannerTextColor" TEXT;

-- The legacy "section" enum is superseded by sectionId and is no longer
-- written by the application. Production is already nullable; this makes a
-- freshly built database match (otherwise every INSERT would fail).
ALTER TABLE "categories" ALTER COLUMN "section" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "categories_restaurantId_sectionId_idx"
  ON "categories"("restaurantId", "sectionId");
CREATE INDEX IF NOT EXISTS "categories_restaurantId_parentId_idx"
  ON "categories"("restaurantId", "parentId");
CREATE INDEX IF NOT EXISTS "categories_restaurantId_sortOrder_idx"
  ON "categories"("restaurantId", "sortOrder");

-- Verified before writing this migration: 0 orphan categories.
DO $$ BEGIN
  ALTER TABLE "categories"
    ADD CONSTRAINT "categories_sectionId_fkey"
    FOREIGN KEY ("sectionId") REFERENCES "sections"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 5. plans ─────────────────────────────────────────────────────────────
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "maxCategories" INTEGER;

-- ── 6. restaurants: cart settings ────────────────────────────────────────
-- Added nullable first so the statement is safe on a fresh database, then
-- backfilled and tightened to match schema.prisma (NOT NULL + default).
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "showCartTotal"        BOOLEAN;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "serviceChargeEnabled" BOOLEAN;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "serviceChargeMode"    TEXT;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "serviceChargePercent" INTEGER;

UPDATE "restaurants" SET "showCartTotal"        = true      WHERE "showCartTotal"        IS NULL;
UPDATE "restaurants" SET "serviceChargeEnabled" = false     WHERE "serviceChargeEnabled" IS NULL;
UPDATE "restaurants" SET "serviceChargeMode"    = 'percent' WHERE "serviceChargeMode"    IS NULL;
UPDATE "restaurants" SET "serviceChargePercent" = 10        WHERE "serviceChargePercent" IS NULL;

ALTER TABLE "restaurants" ALTER COLUMN "showCartTotal"        SET DEFAULT true;
ALTER TABLE "restaurants" ALTER COLUMN "serviceChargeEnabled" SET DEFAULT false;
ALTER TABLE "restaurants" ALTER COLUMN "serviceChargeMode"    SET DEFAULT 'percent';
ALTER TABLE "restaurants" ALTER COLUMN "serviceChargePercent" SET DEFAULT 10;

ALTER TABLE "restaurants" ALTER COLUMN "showCartTotal"        SET NOT NULL;
ALTER TABLE "restaurants" ALTER COLUMN "serviceChargeEnabled" SET NOT NULL;
ALTER TABLE "restaurants" ALTER COLUMN "serviceChargeMode"    SET NOT NULL;
ALTER TABLE "restaurants" ALTER COLUMN "serviceChargePercent" SET NOT NULL;
