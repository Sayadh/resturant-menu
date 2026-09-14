-- A dish photo is now a small bundle rather than one URL: the 800×600 copy that
-- guests are served, a 1200×900 one for retina, and the original kept so the
-- admin can redo the crop later. `focalX`/`focalY` drive CSS object-position so
-- the right part of the dish stays centred; `crop` restores the editor's state.
--
-- Additive and idempotent — existing rows keep their url and fall back to a
-- centred focal point (NULL is read as 50 by the API).

ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "imageHiResUrl"    TEXT,
  ADD COLUMN IF NOT EXISTS "imageOriginalUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "imageFocalX"      INTEGER,
  ADD COLUMN IF NOT EXISTS "imageFocalY"      INTEGER,
  ADD COLUMN IF NOT EXISTS "imageCrop"        JSONB;

ALTER TABLE "product_images"
  ADD COLUMN IF NOT EXISTS "hiResUrl"    TEXT,
  ADD COLUMN IF NOT EXISTS "originalUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "focalX"      INTEGER,
  ADD COLUMN IF NOT EXISTS "focalY"      INTEGER,
  ADD COLUMN IF NOT EXISTS "crop"        JSONB;
