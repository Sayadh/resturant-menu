-- Per-dish "show a picture" switch, the guest Wi-Fi columns that were added to
-- schema.prisma earlier without a migration of their own, and the catalogue row
-- for the Opaline theme.
--
-- Every statement is idempotent, so this is safe to run on a database that
-- already received any of it through `prisma db push`.

-- Products: does this dish show a picture on the public menu?
-- Defaults to true so every existing dish keeps behaving exactly as before.
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "showImage" BOOLEAN NOT NULL DEFAULT true;

-- Restaurants: guest Wi-Fi shown on the public menu (both optional).
ALTER TABLE "restaurants"
  ADD COLUMN IF NOT EXISTS "wifiName" TEXT;

ALTER TABLE "restaurants"
  ADD COLUMN IF NOT EXISTS "wifiPassword" TEXT;

-- `themes` is a fixed catalogue, not tenant data: the sixth theme has to exist
-- as a row before a restaurant can be pointed at it from the admin panel.
-- ON CONFLICT keeps this a no-op on any database that already has it, and it
-- means deploying needs no seed run against production.
INSERT INTO "themes" ("id", "key", "name", "description", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'opaline', 'Opaline', 'Light, refined, editorial', true, now(), now())
ON CONFLICT ("key") DO NOTHING;
