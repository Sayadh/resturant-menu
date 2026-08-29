-- How the public language switcher labels each language: letters (AM/EN/RU)
-- or flags. Defaults to 'text' so every existing menu keeps its current look.
--
-- Idempotent, so it is safe on a database that already received the column.
ALTER TABLE "restaurants"
  ADD COLUMN IF NOT EXISTS "languageDisplay" TEXT NOT NULL DEFAULT 'text';
