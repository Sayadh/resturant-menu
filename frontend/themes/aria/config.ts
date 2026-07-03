// ─────────────────────────────────────────────────────────────────────────
// Aria theme configuration
//
// "Aria" is one selectable design (themeId: "aria"). It is rendered by
// components/DesignAria.vue and reads all menu data from the shared Pinia
// stores, so switching themes never changes data, language, or order logic.
//
// This file centralises everything that is *specific* to the Aria look:
// branding, palette tokens and a few presentational labels. Keeping it here
// makes Aria self-contained and easy to tweak without touching logic.
// ─────────────────────────────────────────────────────────────────────────
import type { LocalizedText } from '~/data/menu'

export const ariaThemeId = 'aria' as const

/** Warm, soft-luxury Armenian palette used across the Aria design. */
export const ariaColors = {
  bg: '#F5EFE2', // page background
  card: '#FFF9EF', // elevated surfaces
  brown: '#3E2723', // primary dark brown
  brownLight: '#5A4038',
  gold: '#C69A5A', // gold / caramel accent
  goldDark: '#A87E42',
  goldLight: '#DBBA82',
  green: '#6F8B4A', // natural herb accent
  border: '#E4D6C2',
  muted: '#7A6654', // muted text
} as const

/** Restaurant branding shown in the Aria header / footer. */
export const ariaBrand = {
  name: 'TUN LAHMAJO',
  monogram: 'TL',
  tagline: {
    AM: 'Ավանդական հայկական համեր',
    EN: 'Traditional Armenian flavors',
    RU: 'Традиционные армянские вкусы',
  } satisfies LocalizedText,
  rating: '4.8',
  reviews: {
    AM: '320 կարծիք',
    EN: '320 reviews',
    RU: '320 отзывов',
  } satisfies LocalizedText,
  city: { AM: 'Երևան', EN: 'Yerevan', RU: 'Ереван' } satisfies LocalizedText,
  hours: '09:00–23:00',
} as const

/** Alcohol gets its own tab title inside the Drinks level (data is unchanged). */
export const ariaAlcoholTitle: LocalizedText = {
  AM: 'Ալկոհոլ',
  EN: 'Alcohol',
  RU: 'Алкоголь',
}

/** Search placeholder per language. */
export const ariaSearchPlaceholder: LocalizedText = {
  AM: 'Որոնել ուտեստ կամ խմիչք...',
  EN: 'Search a dish or drink...',
  RU: 'Поиск блюда или напитка...',
}

/** Floating basket label per language. */
export const ariaBasketLabel: LocalizedText = {
  AM: 'Զամբյուղ',
  EN: 'Basket',
  RU: 'Корзина',
}

/** "items" word for the basket counter. */
export const ariaItemsWord: LocalizedText = {
  AM: 'ապրանք',
  EN: 'items',
  RU: 'товаров',
}
