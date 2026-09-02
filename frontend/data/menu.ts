export type Lang = 'AM' | 'EN' | 'RU'

// The badge catalogue (keys, icons, labels) lives in `~/data/badges`, which is
// shared by the admin picker, the public themes and the backend seed.
import type { BadgeKey } from '~/data/badges'
export type { BadgeKey }

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
  /**
   * Whether this dish shows a picture at all on the public menu (admin switch).
   * `false` means the themes render NO image block -- not even the placeholder.
   * Undefined is treated as true, so older payloads keep their behaviour.
   */
  showImage?: boolean
  price: number
  name: LocalizedText
  description: LocalizedText
  /** Highest-priority badge (kept for payloads that carry only one). */
  badge?: BadgeKey
  /** Every badge on the dish; themes render the first few via `visibleBadges`. */
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
  /** Small category icon image (uploaded). Falls back to the emoji `icon`. */
  iconImage?: string
  /** Desktop banner (themes derive a banner from items if unset). */
  image?: string
  /** Mobile banner (falls back to `image`). */
  mobileImage?: string
  /** Banner title colour over the image: 'light' (white) or 'dark'. */
  bannerTextColor?: 'light' | 'dark'
  description?: LocalizedText
  active?: boolean
  sortOrder?: number
}

export interface MenuLevel {
  id: MenuLevelId
  icon: string
  title: LocalizedText
  /** Uploaded section image (set by buildMenu from the API). */
  image?: string
}

export interface DrinkGroupInfo {
  id: DrinkGroup
  icon: string
  title: LocalizedText
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
  dishCount: { AM: 'ապրանք', EN: 'items', RU: 'товаров' },
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
  subtotal: { AM: 'Ապրանքներ', EN: 'Subtotal', RU: 'Товары' },
  service: { AM: 'Սպասարկում', EN: 'Service', RU: 'Обслуживание' },
  serviceNote: { AM: '+ սպասարկման վճար', EN: '+ service charge', RU: '+ плата за обслуживание' },
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
  wifi: { AM: 'Wi-Fi', EN: 'Wi-Fi', RU: 'Wi-Fi' },
  wifiNetwork: { AM: 'Ցանց', EN: 'Network', RU: 'Сеть' },
  wifiPasswordLabel: { AM: 'Գաղտնաբառ', EN: 'Password', RU: 'Пароль' },
  wifiCopy: { AM: 'Պատճենել', EN: 'Copy', RU: 'Копировать' },
  wifiCopied: { AM: 'Պատճենվեց ✓', EN: 'Copied ✓', RU: 'Скопировано ✓' },
} as const


/** Second-level toggle inside the Drinks section. */
export const drinkGroups: DrinkGroupInfo[] = [
  { id: 'soft', icon: '🧃', title: { AM: 'Ոչ ալկոհոլային', EN: 'Non-Alcoholic', RU: 'Безалкогольные' } },
  { id: 'alcohol', icon: '🍷', title: { AM: 'Ալկոհոլային', EN: 'Alcoholic', RU: 'Алкогольные' } },
]

