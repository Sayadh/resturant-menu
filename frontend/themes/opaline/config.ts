// ─────────────────────────────────────────────────────────────────────────
// Opaline theme configuration
//
// "Opaline" (themeId: "opaline") is the lightest design in the catalogue —
// porcelain white, editorial, built for contemporary European fine dining.
// Unlike the single-scroll themes it presents the menu as a guided journey:
//   Home (sections) → Section (categories) → Category (products)
//
// Like every other theme it is rendered by its own root layout
// (themes/opaline/layouts/OpalineMenu.vue) and reads ALL data from the shared
// Pinia stores and composables, so switching themes never changes data,
// language, search, favourite, cart or order logic. This file owns only what
// is specific to the Opaline look: palette tokens and presentational copy.
//
// Design language: a printed menu from a light, quiet dining room — porcelain
// paper, hairline rules, one restrained coral accent, and a great deal of air.
// Deliberately NOT Atelier's navy + terracotta editorial system.
// ─────────────────────────────────────────────────────────────────────────
import type { LocalizedText } from '~/data/menu'

export const opalineThemeId = 'opaline' as const

/**
 * Porcelain palette. Mirrored as CSS custom properties in
 * styles/opaline.css (`.opaline-theme`), which is the single source the
 * components read through Tailwind arbitrary values.
 */
export const opalineColors = {
  // surfaces
  porcelain: '#FAFAF8', // page background
  paper: '#FFFFFF', // cards / raised surfaces
  pearl: '#F5F5F2', // secondary light surface, hover
  // text
  ink: '#172033', // primary text
  slate: '#747D90', // secondary text
  silver: '#A1A6B0', // faint / tertiary text
  // accent
  coral: '#D85F3D', // primary accent — used sparingly
  coralDeep: '#BF4F31', // accent hover / pressed
  coralMist: '#FBEDE8', // accent tint surface
  // lines
  line: '#E2E5E8', // primary hairline
  lineStrong: '#CCD1D7', // emphasised border
  // states
  sage: '#557A65', // success / available
  garnet: '#A04F4F', // error / unavailable
  overlay: 'rgba(23, 32, 51, 0.42)',
  // buttons
  inkHover: '#222D43',
} as const

// ── presentational copy ───────────────────────────────────────────────────
// Section, category and product NAMES always come from the API. The strings
// below are interface labels only — never menu content.

/** Label above the section grid on the home screen. */
export const opalineSectionsLabel: LocalizedText = {
  AM: 'Ընտրեք բաժինը',
  EN: 'Choose a section',
  RU: 'Выберите раздел',
}

/** Label above the category list on a section screen. */
export const opalineCategoriesLabel: LocalizedText = {
  AM: 'Կատեգորիաներ',
  EN: 'Categories',
  RU: 'Категории',
}

/** Back action. */
export const opalineBack: LocalizedText = { AM: 'Հետ', EN: 'Back', RU: 'Назад' }

/** Add-to-order label. */
export const opalineAdd: LocalizedText = { AM: 'Ավելացնել', EN: 'Add', RU: 'Добавить' }

/** Unit noun after a category count (“4 կատեգորիա”). */
export const opalineCategoryCount: LocalizedText = {
  AM: 'կատեգորիա',
  EN: 'categories',
  RU: 'категорий',
}

/** Close action — accessible label for icon-only close buttons. */
export const opalineClose: LocalizedText = { AM: 'Փակել', EN: 'Close', RU: 'Закрыть' }

/** Quantity steppers — accessible labels. */
export const opalineQty = {
  more: { AM: 'Ավելացնել', EN: 'Increase', RU: 'Добавить' } satisfies LocalizedText,
  less: { AM: 'Պակասեցնել', EN: 'Decrease', RU: 'Уменьшить' } satisfies LocalizedText,
} as const

/** Order / cart drawer copy. */
export const opalineOrder = {
  title: { AM: 'Ձեր պատվերը', EN: 'Your order', RU: 'Ваш заказ' } satisfies LocalizedText,
  subtitle: { AM: 'Ընտրված ուտեստներ', EN: 'Selected dishes', RU: 'Выбранные блюда' } satisfies LocalizedText,
  empty: {
    AM: 'Դուք դեռ ոչինչ չեք ընտրել։',
    EN: 'You haven’t chosen anything yet.',
    RU: 'Вы пока ничего не выбрали.',
  } satisfies LocalizedText,
  view: { AM: 'Դիտել պատվերը', EN: 'View order', RU: 'Открыть заказ' } satisfies LocalizedText,
} as const

/** Empty states — one per level of the journey. */
export const opalineEmpty = {
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
