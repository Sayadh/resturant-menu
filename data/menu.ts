export type Lang = 'AM' | 'EN' | 'RU'

export type BadgeKey = 'hit' | 'best' | 'new'

// A "level" is now a dynamic Section id (per-restaurant), not a fixed value.
export type MenuLevelId = string

/** Sub-grouping used only inside the Drinks level. */
export type DrinkGroup = 'soft' | 'alcohol'

export interface LocalizedText {
  AM: string
  EN: string
  RU: string
}

export interface MenuItem {
  id: string
  image: string
  price: number
  name: LocalizedText
  description: LocalizedText
  /** Primary badge rendered by the public themes. */
  badge?: BadgeKey
  /** Full badge list (backend-ready); themes render `badge`. */
  badges?: string[]
  /** Undefined/true = available; false = currently sold out / unavailable. */
  available?: boolean
  /** Published state (backend-ready). */
  active?: boolean
  sortOrder?: number
}

export interface MenuCategory {
  id: string
  level: MenuLevelId
  /** Required for drinks categories: marks alcoholic vs non-alcoholic. */
  group?: DrinkGroup
  icon: string
  title: LocalizedText
  items: MenuItem[]
  /** Backend-ready extras (themes derive a banner from items if unset). */
  image?: string
  description?: LocalizedText
  active?: boolean
  sortOrder?: number
}

export interface MenuLevel {
  id: MenuLevelId
  icon: string
  title: LocalizedText
}

export interface DrinkGroupInfo {
  id: DrinkGroup
  icon: string
  title: LocalizedText
}

export const badgeLabels: Record<BadgeKey, { icon: string; text: LocalizedText }> = {
  hit: {
    icon: '🔥',
    text: { AM: 'Հիթ', EN: 'Hit', RU: 'Хит' },
  },
  best: {
    icon: '⭐',
    text: { AM: 'Ամենավաճառվող', EN: 'Bestseller', RU: 'Хит продаж' },
  },
  new: {
    icon: '🆕',
    text: { AM: 'Նոր', EN: 'New', RU: 'Новинка' },
  },
}

export const ui = {
  tagline: {
    AM: '«Ավանդական հայկական համեր»',
    EN: '“Traditional Armenian flavors”',
    RU: '«Традиционные армянские вкусы»',
  },
  city: { AM: 'Երևան', EN: 'Yerevan', RU: 'Ереван' },
  hours: { AM: '09:00 – 23:00', EN: '09:00 – 23:00', RU: '09:00 – 23:00' },
  openNow: { AM: 'Բաց է հիմա', EN: 'Open now', RU: 'Открыто сейчас' },
  rating: '4.9',
  reviews: {
    AM: '320 կարծիք',
    EN: '320 reviews',
    RU: '320 отзывов',
  },
  dishCount: { AM: 'ուտեստ', EN: 'items', RU: 'блюд' },
  soldOut: { AM: 'Սպառված է', EN: 'Sold out', RU: 'Распродано' },
  searchPlaceholder: {
    AM: 'Որոնել ուտեստ',
    EN: 'Search a dish',
    RU: 'Поиск блюда',
  },
  noResults: {
    AM: 'Համընկնող ուտեստ չի գտնվել',
    EN: 'No matching dishes found',
    RU: 'Блюда не найдены',
  },
  currency: { AM: '֏', EN: '֏', RU: '֏' },
  order: { AM: 'Իմ պատվերը', EN: 'My order', RU: 'Мой заказ' },
  orderEmpty: {
    AM: 'Պատվերը դատարկ է',
    EN: 'Your order is empty',
    RU: 'Заказ пуст',
  },
  total: { AM: 'Ընդամենը', EN: 'Total', RU: 'Итого' },
  clearOrder: { AM: 'Մաքրել', EN: 'Clear', RU: 'Очистить' },
  showWaiter: {
    AM: 'Ցույց տալ մատուցողին',
    EN: 'Show to waiter',
    RU: 'Показать официанту',
  },
  viewOrder: { AM: 'Պատվեր', EN: 'Order', RU: 'Заказ' },
  footerNote: {
    AM: 'Պատրաստված է սիրով և ավանդույթով',
    EN: 'Made with love and tradition',
    RU: 'Приготовлено с любовью и традицией',
  },
} as const


/** Second-level toggle inside the Drinks section. */
export const drinkGroups: DrinkGroupInfo[] = [
  { id: 'soft', icon: '🧃', title: { AM: 'Ոչ ալկոհոլային', EN: 'Non-Alcoholic', RU: 'Безалкогольные' } },
  { id: 'alcohol', icon: '🍷', title: { AM: 'Ալկոհոլային', EN: 'Alcoholic', RU: 'Алкогольные' } },
]

