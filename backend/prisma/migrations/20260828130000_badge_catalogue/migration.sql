-- System badge catalogue — the marks a restaurant can put on a dish.
-- Mirrors frontend/data/badges.ts, which is the source of truth for the keys,
-- icons and labels; a key with no row here is silently dropped when a product
-- is saved (ProductsService.resolveBadgeIds), so the rows must exist.
--
-- Every statement is idempotent: missing badges are inserted, existing ones get
-- their icon refreshed, and labels are upserted for each installed language.
-- System badges have "restaurantId" IS NULL; Postgres does not enforce the
-- unique index over NULLs, hence the explicit NOT EXISTS guard.

-- 1 · the badges themselves
INSERT INTO "badges" ("id", "key", "icon", "isSystem", "restaurantId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), v.key, v.icon, true, NULL, now(), now()
FROM (VALUES
    ('hit', '🔥'),
    ('bestseller', '🏆'),
    ('recommended', '⭐'),
    ('new', '✨'),
    ('seasonal', '📅'),
    ('affordable', '💰'),
    ('best_price', '🏷️'),
    ('mild_spicy', '🌶️'),
    ('spicy', '🌶️🌶️'),
    ('hot', '♨️'),
    ('cold', '🧊'),
    ('quick', '⏱️'),
    ('kids', '👶'),
    ('vegan', '🌱'),
    ('healthy', '🥑'),
    ('organic', '🍃'),
    ('light', '🥗'),
    ('sugar_free', '🚫🍬'),
    ('low_salt', '🧂'),
    ('alcohol_free', '🚫🍷'),
    ('halal', '🕌')
) AS v(key, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM "badges" b WHERE b."key" = v.key AND b."restaurantId" IS NULL
);

-- 2 · refresh the icons of the ones that already existed
UPDATE "badges" b
SET "icon" = v.icon, "updatedAt" = now()
FROM (VALUES
    ('hit', '🔥'),
    ('bestseller', '🏆'),
    ('recommended', '⭐'),
    ('new', '✨'),
    ('seasonal', '📅'),
    ('affordable', '💰'),
    ('best_price', '🏷️'),
    ('mild_spicy', '🌶️'),
    ('spicy', '🌶️🌶️'),
    ('hot', '♨️'),
    ('cold', '🧊'),
    ('quick', '⏱️'),
    ('kids', '👶'),
    ('vegan', '🌱'),
    ('healthy', '🥑'),
    ('organic', '🍃'),
    ('light', '🥗'),
    ('sugar_free', '🚫🍬'),
    ('low_salt', '🧂'),
    ('alcohol_free', '🚫🍷'),
    ('halal', '🕌')
) AS v(key, icon)
WHERE b."key" = v.key AND b."restaurantId" IS NULL AND b."icon" IS DISTINCT FROM v.icon;

-- 3 · labels, for whichever of hy / en / ru the platform has installed
INSERT INTO "badge_translations" ("id", "badgeId", "languageId", "label")
SELECT gen_random_uuid(), b."id", l."id", v.label
FROM (VALUES
    ('hit', 'hy', 'Հիթ'),
    ('hit', 'en', 'Hit'),
    ('hit', 'ru', 'Хит'),
    ('bestseller', 'hy', 'Բեսթսելեր'),
    ('bestseller', 'en', 'Bestseller'),
    ('bestseller', 'ru', 'Бестселлер'),
    ('recommended', 'hy', 'Խորհուրդ'),
    ('recommended', 'en', 'Recommended'),
    ('recommended', 'ru', 'Рекомендуем'),
    ('new', 'hy', 'Նոր'),
    ('new', 'en', 'New'),
    ('new', 'ru', 'Новинка'),
    ('seasonal', 'hy', 'Սեզոնային'),
    ('seasonal', 'en', 'Seasonal'),
    ('seasonal', 'ru', 'Сезонное'),
    ('affordable', 'hy', 'Մատչելի'),
    ('affordable', 'en', 'Great value'),
    ('affordable', 'ru', 'Доступно'),
    ('best_price', 'hy', 'Լավագույն գին'),
    ('best_price', 'en', 'Best price'),
    ('best_price', 'ru', 'Лучшая цена'),
    ('mild_spicy', 'hy', 'Միջին կծու'),
    ('mild_spicy', 'en', 'Mildly spicy'),
    ('mild_spicy', 'ru', 'Средне острое'),
    ('spicy', 'hy', 'Կծու'),
    ('spicy', 'en', 'Spicy'),
    ('spicy', 'ru', 'Острое'),
    ('hot', 'hy', 'Տաք'),
    ('hot', 'en', 'Served hot'),
    ('hot', 'ru', 'Горячее'),
    ('cold', 'hy', 'Սառը'),
    ('cold', 'en', 'Served cold'),
    ('cold', 'ru', 'Холодное'),
    ('quick', 'hy', 'Արագ պատրաստվող'),
    ('quick', 'en', 'Quick to serve'),
    ('quick', 'ru', 'Быстрая подача'),
    ('kids', 'hy', 'Մանկական'),
    ('kids', 'en', 'For kids'),
    ('kids', 'ru', 'Детское'),
    ('vegan', 'hy', 'Վեգան'),
    ('vegan', 'en', 'Vegan'),
    ('vegan', 'ru', 'Веган'),
    ('healthy', 'hy', 'Առողջ ընտրություն'),
    ('healthy', 'en', 'Healthy choice'),
    ('healthy', 'ru', 'Полезный выбор'),
    ('organic', 'hy', 'Օրգանական'),
    ('organic', 'en', 'Organic'),
    ('organic', 'ru', 'Органическое'),
    ('light', 'hy', 'Թեթև'),
    ('light', 'en', 'Light'),
    ('light', 'ru', 'Лёгкое'),
    ('sugar_free', 'hy', 'Առանց շաքարի'),
    ('sugar_free', 'en', 'Sugar-free'),
    ('sugar_free', 'ru', 'Без сахара'),
    ('low_salt', 'hy', 'Քիչ աղով'),
    ('low_salt', 'en', 'Low salt'),
    ('low_salt', 'ru', 'Мало соли'),
    ('alcohol_free', 'hy', 'Առանց ալկոհոլի'),
    ('alcohol_free', 'en', 'Alcohol-free'),
    ('alcohol_free', 'ru', 'Без алкоголя'),
    ('halal', 'hy', 'Հալալ'),
    ('halal', 'en', 'Halal'),
    ('halal', 'ru', 'Халяль')
) AS v(key, code, label)
JOIN "badges" b ON b."key" = v.key AND b."restaurantId" IS NULL
JOIN "languages" l ON l."code" = v.code
ON CONFLICT ("badgeId", "languageId") DO UPDATE SET "label" = EXCLUDED."label";
