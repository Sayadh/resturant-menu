# frontend/components/ — կիսվող UI + landing

## Երկու խումբ

- **`components/landing/`** — landing-ի (`pages/index.vue`) բլոկները՝ `LandingHero`,
  `LandingFeatures`, `LandingPricing`, `LandingFaq`, `LandingCta`, `LandingFooter`,
  `LandingAbout`, `LandingContactModal`, `LandingNav`, `LandingDemo`,
  `LandingAdminPreview`, `LandingThemes`, `LandingHowItWorks`, `Reveal`։
- **`components/` (root)** — կիսվող՝ `TheHeader`, `MenuCard`, `MenuBadge`,
  `CategoryNav`, `OrderSheet`, `LanguageSwitcher`, `ImageLightbox`, `AdminModal`,
  icon-ներ (`Icon*`), design-ներ `DesignAria`/`DesignHeritage`, `ThemeRenderer`։

## Auto-import (Nuxt) — անուն = թղթապանակ + ֆայլ

- `landing/LandingHero.vue` → `<LandingHero>`
- `landing/Reveal.vue` → `<LandingReveal>`
- root `MenuCard.vue` → `<MenuCard>`

## Կանոններ

- Component-ը ներկայացում է. state՝ local UI-ի համար (`ref`), global-ը՝ store-երից։
- API կանչ չի անում — տվյալը գալիս է props-ով կամ store-ից։
- Landing-ի CSS-ը scoped է `.landing` root-ի ներսում (`index.vue`)։ Նոր landing
  բլոկ՝ ստեղծիր `landing/LandingX.vue` → ավելացրու `index.vue`-ում, փաթաթիր
  `<LandingReveal>`-ով scroll animation-ի համար։
- **Նկարներ**․ ամեն `<img>` → `imgUrl(src, width)` (`~/utils/image`, **բացահայտ**
  import-ով) + `loading="lazy" decoding="async"`։ Բացառություն՝ վերևի հատվածի
  լոգոն/hero-ն, որոնք eager են։ Չափերի աղյուսակը՝
  [`../../docs/THEMES.md`](../../docs/THEMES.md#նկարներ)։
- **Պիտակներ**․ `visibleBadges(item)` `~/data/badges`-ից — սեփական ցուցակ չկա։

Recipe-ներ՝ [`../../docs/AI-GUIDE.md`](../../docs/AI-GUIDE.md) (Recipe 5–6)։
