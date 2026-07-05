// ─────────────────────────────────────────────────────────────────────────
// Atelier theme configuration
//
// "Atelier" (themeId: "atelier") is an editorial, fine-dining QR menu — a
// completely independent design from Aria. It is rendered by
// themes/atelier/layouts/AtelierMenu.vue and reads ALL data from the shared
// Pinia stores, so switching themes never changes data, language, search or
// order logic. This file owns everything specific to the Atelier look:
// branding, palette tokens and presentational copy.
//
// Design language: printed-menu / magazine editorial. Ink + bone + clay.
// Inspiration: Michelin Guide, Aman, Aesop, Four Seasons, editorial layouts.
// ─────────────────────────────────────────────────────────────────────────
import type { LocalizedText } from '~/data/menu'

export const atelierThemeId = 'atelier' as const

/** Refined ink / bone / clay palette — intentionally unlike Aria's gold. */
export const atelierColors = {
  ink: '#16130F', // near-black — text & dark sections
  bone: '#EAE3D6', // page background (warm paper)
  paper: '#F6F2EA', // elevated light surfaces
  clay: '#A1502E', // single warm accent (terracotta)
  clayDeep: '#7E3D22',
  muted: '#857B6C', // secondary text
  line: '#D4C9B8', // hairlines
} as const

/** Restaurant branding shown across the Atelier layout. */
export const atelierBrand = {
  name: 'TUN LAHMAJO',
  monogram: 'TL',
  /** Editorial eyebrow above the wordmark. */
  established: 'EST. 1998 · YEREVAN',
  kicker: {
    AM: 'Հայկական խոհանոց',
    EN: 'Armenian Kitchen',
    RU: 'Армянская кухня',
  } satisfies LocalizedText,
  tagline: {
    AM: 'Ավանդական համեր, մատուցված ժամանակակից ձեռագրով',
    EN: 'Traditional flavors, plated with a modern hand',
    RU: 'Традиционные вкусы в современной подаче',
  } satisfies LocalizedText,
  rating: '4.9',
  reviews: {
    AM: '320 կարծիք',
    EN: '320 reviews',
    RU: '320 отзывов',
  } satisfies LocalizedText,
  city: { AM: 'Երևան, Հայաստան', EN: 'Yerevan, Armenia', RU: 'Ереван, Армения' } satisfies LocalizedText,
  hours: '09:00 — 23:00',
} as const

/** Alcohol gets its own tab title inside the Drinks level (data unchanged). */
export const atelierAlcoholTitle: LocalizedText = {
  AM: 'Ալկոհոլ',
  EN: 'Cellar',
  RU: 'Алкоголь',
}

/** Section eyebrow labels per top tab. */
export const atelierTabKicker: LocalizedText = {
  AM: 'Ընտրացանկ',
  EN: 'The Menu',
  RU: 'Меню',
}

/** Search placeholder per language. */
export const atelierSearchPlaceholder: LocalizedText = {
  AM: 'Որոնել ընտրացանկում',
  EN: 'Search the menu',
  RU: 'Поиск по меню',
}

/** "Signature" featured-section heading. */
export const atelierSignatureTitle: LocalizedText = {
  AM: 'Շեֆի ընտրանին',
  EN: 'The Chef’s Signatures',
  RU: 'Выбор шефа',
}
export const atelierSignatureKicker: LocalizedText = {
  AM: 'Առանձնահատուկ',
  EN: 'Featured',
  RU: 'Избранное',
}

/** Index (category navigation) heading. */
export const atelierIndexTitle: LocalizedText = {
  AM: 'Բովանդակություն',
  EN: 'Contents',
  RU: 'Содержание',
}

/** Order / bill drawer copy. */
export const atelierBill = {
  title: { AM: 'Ձեր սեղանը', EN: 'Your Table', RU: 'Ваш стол' } satisfies LocalizedText,
  subtitle: { AM: 'Ընտրված ուտեստներ', EN: 'Selected dishes', RU: 'Выбранные блюда' } satisfies LocalizedText,
  empty: {
    AM: 'Ձեր սեղանը դեռ դատարկ է։ Ընտրեք ուտեստ ընտրացանկից։',
    EN: 'Your table is still empty. Choose a dish from the menu.',
    RU: 'Ваш стол пока пуст. Выберите блюдо из меню.',
  } satisfies LocalizedText,
  label: { AM: 'Սեղան', EN: 'Table', RU: 'Стол' } satisfies LocalizedText,
  itemsWord: { AM: 'ապրանք', EN: 'items', RU: 'товаров' } satisfies LocalizedText,
  view: { AM: 'Դիտել սեղանը', EN: 'View table', RU: 'Открыть стол' } satisfies LocalizedText,
} as const

/** Footer closing line. */
export const atelierFooterNote: LocalizedText = {
  AM: 'Պատրաստված է ձեռքով, ամեն օր',
  EN: 'Handcrafted daily, with intention',
  RU: 'Готовится вручную, каждый день',
}

/** Editorial hero meta labels (Rating / Hours / Location). */
export const atelierMeta = {
  rating: { AM: 'Գնահատական', EN: 'Rating', RU: 'Рейтинг' } satisfies LocalizedText,
  hours: { AM: 'Ժամեր', EN: 'Hours', RU: 'Часы' } satisfies LocalizedText,
  location: { AM: 'Հասցե', EN: 'Location', RU: 'Адрес' } satisfies LocalizedText,
}

/** Add-to-order controls (theme uses a "table" metaphor). */
export const atelierAdd: LocalizedText = { AM: 'Ավելացնել', EN: 'Add', RU: 'Добавить' }
export const atelierAddToTable: LocalizedText = { AM: 'Ավելացնել սեղանին', EN: 'Add to table', RU: 'Добавить на стол' }
