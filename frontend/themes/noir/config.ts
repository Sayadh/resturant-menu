// ─────────────────────────────────────────────────────────────────────────
// Noir theme configuration
//
// "Noir" (themeId: "noir") is the darkest, most restrained design in the
// catalogue — built for fine dining, steakhouses, wine bars, lounges and
// luxury hospitality. Like every other theme it is rendered by its own root
// layout (themes/noir/layouts/NoirMenu.vue) and reads ALL data from the shared
// Pinia stores, so switching themes never changes data, language, search or
// order logic. This file owns only what is specific to the Noir look:
// palette tokens and presentational copy.
//
// Design language: private dining room — black marble, smoked glass, matte
// metal and very fine platinum detailing. Depth comes from layering blacks,
// never from glow, neon or heavy gold.
// ─────────────────────────────────────────────────────────────────────────
import type { LocalizedText } from '~/data/menu'

export const noirThemeId = 'noir' as const

/**
 * Monochrome obsidian / platinum palette — intentionally unlike Aria (light),
 * Atelier (navy + terracotta), Maison (burgundy + rose) and Heritage
 * (forest + stone). Mirrored as CSS variables in styles/noir.css.
 */
export const noirColors = {
  // surfaces, from deepest to most elevated
  obsidian: '#0B0C0E', // page background
  carbon: '#121417', // primary dark surface
  graphite: '#191B1F', // cards / raised surfaces
  smoked: '#202329', // modals, drawers, highest elevation
  polished: '#272A30', // hover surface
  pressed: '#30333A', // pressed surface
  // text
  ivory: '#F1EEE8', // primary text
  platinumText: '#A8A8A5', // secondary text
  silver: '#777A7E', // faint / tertiary text
  // lines
  line: '#303339', // primary border
  hairline: '#25282D', // subtle divider
  // accents
  platinum: '#B8B4AC', // main accent — brushed platinum
  palePlatinum: '#D0CBC1', // premium accent (prices, active indicators)
  burnished: '#9A8060', // rare warm metal accent
  focus: '#C7C2B8', // focus outline
  activeLine: '#A9A49B', // active border
  // states
  emerald: '#668B78', // success / available
  garnet: '#A45B5B', // error / unavailable
  amber: '#A9895F', // warning / premium
  disabledBg: '#1A1C20',
  disabledText: '#5F6267',
  disabledLine: '#282B30',
} as const

/** Alcohol gets its own tab title inside the Drinks level (data unchanged). */
export const noirAlcoholTitle: LocalizedText = {
  AM: 'Ալկոհոլ',
  EN: 'Cellar',
  RU: 'Алкоголь',
}

/** Section eyebrow above the category rail. */
export const noirNavKicker: LocalizedText = {
  AM: 'Ընտրացանկ',
  EN: 'The Menu',
  RU: 'Меню',
}

/** Search placeholder. */
export const noirSearchPlaceholder: LocalizedText = {
  AM: 'Որոնել ընտրացանկում',
  EN: 'Search the menu',
  RU: 'Поиск по меню',
}

/** Add-to-order label. */
export const noirAdd: LocalizedText = { AM: 'Ավելացնել', EN: 'Add', RU: 'Добавить' }

/** Order / selection drawer copy. */
export const noirOrder = {
  title: { AM: 'Ձեր ընտրությունը', EN: 'Your Selection', RU: 'Ваш выбор' } satisfies LocalizedText,
  subtitle: { AM: 'Ընտրված ուտեստներ', EN: 'Selected dishes', RU: 'Выбранные блюда' } satisfies LocalizedText,
  empty: {
    AM: 'Ձեր ընտրությունը դեռ դատարկ է։',
    EN: 'Your selection is still empty.',
    RU: 'Ваш выбор пока пуст.',
  } satisfies LocalizedText,
  view: { AM: 'Դիտել ընտրությունը', EN: 'View selection', RU: 'Открыть выбор' } satisfies LocalizedText,
} as const
