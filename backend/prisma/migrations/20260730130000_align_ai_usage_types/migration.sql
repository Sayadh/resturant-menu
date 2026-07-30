-- HIGH-4 (follow-up) — align the hand-created ai_usage table with schema.prisma.
--
-- `ai_usage` was created manually, with slightly different DDL than Prisma
-- generates. `prisma migrate diff --from-schema-datasource` against production
-- reported exactly the four statements below, so this is copied from verified
-- output rather than guessed.
--
-- What differs and why it is safe to fix:
--   • "id" carries a database-side DEFAULT. Prisma's @default(uuid()) is
--     generated in the client, so the DB default is dead weight — dropping it
--     changes no behaviour.
--   • "createdAt"/"updatedAt" are not TIMESTAMP(3). Left alone, every future
--     `migrate diff` keeps reporting drift; worse, a timestamptz/timestamp
--     mismatch can shift stored values. Both columns are metadata on a monthly
--     AI counter — no business logic reads them.
--
-- Safety: ai_usage holds at most one row per restaurant per month, so the
-- rewrite implied by SET DATA TYPE is effectively instant and the lock is
-- negligible. No data is deleted. On a fresh database the table is created
-- correctly by 20260730120000_catch_up_manual_schema and these statements are
-- no-ops (DROP DEFAULT on a column without one is allowed).

ALTER TABLE "ai_usage" ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
  ALTER COLUMN "updatedAt" DROP DEFAULT,
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);
