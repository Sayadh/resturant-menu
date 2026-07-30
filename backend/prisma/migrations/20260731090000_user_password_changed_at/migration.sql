-- HIGH-3: session invalidation on credential change.
--
-- Additive and idempotent:
--   • nullable column, no default, no backfill required
--     (NULL = "credentials never changed" = every existing token stays valid,
--      so deploying this cannot sign anyone out)
--   • IF NOT EXISTS keeps it safe if the column was already added by hand
--   • ADD COLUMN with no default does not rewrite the table → no long lock

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);
