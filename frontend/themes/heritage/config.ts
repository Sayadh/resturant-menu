// ─────────────────────────────────────────────────────────────────────────
// Heritage theme configuration
//
// "Heritage" (themeId: "heritage") keeps its original look — stone & olive,
// caramel hairlines, Cinzel caps, wheat and sprig ornaments — but presents
// the menu as a guided journey instead of one long scroll:
//
//     Home (sections) → Section (categories) → Category (dishes)
//
// The palette lives in the shared Heritage components it reuses (TheHeader,
// MenuSection, MenuCard, ImageLightbox …), so this file owns only interface
// copy. Section, category and dish NAMES always come from the API.
// ─────────────────────────────────────────────────────────────────────────
import type { LocalizedText } from '~/data/menu'

export const heritageThemeId = 'heritage' as const

/** Label above the section tiles on the home screen. */
export const heritageSectionsLabel: LocalizedText = {
  AM: 'Մեր մենյուն',
  EN: 'Our menu',
  RU: 'Наше меню',
}

/** Back action. */
export const heritageBack: LocalizedText = { AM: 'Հետ', EN: 'Back', RU: 'Назад' }

/** Unit noun after a section's category count (“4 կատեգորիա”). */
export const heritageCategoryCount: LocalizedText = {
  AM: 'կատեգորիա',
  EN: 'categories',
  RU: 'категорий',
}

/** Order (paid plans only) — accessible labels and the basket button. */
export const heritageOrder = {
  add: { AM: 'Ավելացնել պատվերին', EN: 'Add to order', RU: 'Добавить в заказ' } satisfies LocalizedText,
  more: { AM: 'Ավելացնել', EN: 'Increase', RU: 'Добавить' } satisfies LocalizedText,
  less: { AM: 'Պակասեցնել', EN: 'Decrease', RU: 'Уменьшить' } satisfies LocalizedText,
  basket: { AM: 'Պատվեր', EN: 'Order', RU: 'Заказ' } satisfies LocalizedText,
} as const

/** Heading above search results on the home screen. */
export const heritageResults: LocalizedText = {
  AM: 'Որոնման արդյունքներ',
  EN: 'Search results',
  RU: 'Результаты поиска',
}

/** Empty states — one per level of the journey. */
export const heritageEmpty = {
  sections: {
    AM: 'Մենյուն դեռ պատրաստվում է։',
    EN: 'The menu is being prepared.',
    RU: 'Меню ещё готовится.',
  } satisfies LocalizedText,
  categories: {
    AM: 'Այս բաժնում դեռ կատեգորիաներ չկան։',
    EN: 'This section has no categories yet.',
    RU: 'В этом разделе пока нет категорий.',
  } satisfies LocalizedText,
  products: {
    AM: 'Այս կատեգորիայում դեռ ուտեստներ չկան։',
    EN: 'This category has no dishes yet.',
    RU: 'В этой категории пока нет блюд.',
  } satisfies LocalizedText,
} as const
