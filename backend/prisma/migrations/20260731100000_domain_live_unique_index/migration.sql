-- MED-4 — enforce one live custom domain per host.
--
-- `Domain.domain` has no uniqueness in schema.prisma: Prisma cannot express a
-- PARTIAL unique index, and the intent was parked in prisma/raw-indexes.sql,
-- which is not a migration. Production verification showed the index does not
-- exist, so two restaurants could hold the same verified host and
-- PublicService.resolve()'s findFirst would return a non-deterministic tenant.
--
-- Partial (WHERE "deletedAt" IS NULL) so a soft-deleted host can be re-added
-- later — a plain UNIQUE constraint would block that.
--
-- Safety: verified before writing this migration that there are currently 0
-- duplicate live domains, so index creation cannot fail. The table is tiny, so
-- the brief lock is negligible; CONCURRENTLY is deliberately NOT used because
-- it cannot run inside Prisma's migration transaction.
--
-- NOTE: Prisma does not manage this index. Keep using `migrate deploy` in
-- production — `migrate dev` may offer to drop objects it doesn't know about.

CREATE UNIQUE INDEX IF NOT EXISTS "uq_domains_live"
  ON "domains" ("domain")
  WHERE "deletedAt" IS NULL;
