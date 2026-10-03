-- The category's MOBILE banner (4:3) gets the same bundle the desktop banner
-- already has: an 800×600 copy guests are served (`mobileImageUrl`, existing),
-- a 1200×900 one for retina phones, the original kept so the admin can redo
-- the crop, and the editor state that restores the framing.
--
-- Additive and idempotent — existing rows keep their mobileImageUrl; the
-- admin re-crops from that URL when no original was kept.

ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "mobileImageHiResUrl"    TEXT,
  ADD COLUMN IF NOT EXISTS "mobileImageOriginalUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "mobileImageCrop"        JSONB;
