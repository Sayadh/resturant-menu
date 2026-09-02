import type { LocalizedText } from '~/data/menu'

// ─────────────────────────────────────────────────────────────────────────
// Badge catalogue — ONE source of truth for every badge in the product.
//
// The admin picker, the public themes and the backend seed/migration all read
// the same keys, icons and labels from here, so a badge is added in exactly
// one place. The array ORDER is also the display priority: a dish can carry
// many badges, but a card only has room for the first `max` of them.
//
// Keys must match the `badges.key` rows in the database — a key with no row is
// silently dropped when a product is saved (see ProductsService.resolveBadgeIds).
// ─────────────────────────────────────────────────────────────────────────

export type BadgeKey =
  // promo
  | 'hit'
  | 'bestseller'
  | 'recommended'
  | 'new'
  | 'seasonal'
  // price
  | 'affordable'
  | 'best_price'
  // taste & serving
  | 'mild_spicy'
  | 'spicy'
  | 'hot'
  | 'cold'
  | 'quick'
  | 'kids'
  // dietary
  | 'vegan'
  | 'healthy'
  | 'organic'
  | 'light'
  | 'sugar_free'
  | 'low_salt'
  | 'alcohol_free'
  | 'halal'

export type BadgeGroup = 'promo' | 'price' | 'serving' | 'diet'

export interface BadgeDef {
  key: BadgeKey
  group: BadgeGroup
  /** Emoji mark — shown in the admin picker and in the icon-bearing themes. */
  icon: string
  text: LocalizedText
}

/** Admin picker groups, in the order they are rendered. */
export const BADGE_GROUPS: { id: BadgeGroup; title: LocalizedText }[] = [
  { id: 'promo', title: { AM: 'Առաջխաղացում', EN: 'Promotion', RU: 'Промо' } },
  { id: 'price', title: { AM: 'Գին', EN: 'Price', RU: 'Цена' } },
  { id: 'serving', title: { AM: 'Համ և մատուցում', EN: 'Taste & serving', RU: 'Вкус и подача' } },
  { id: 'diet', title: { AM: 'Սննդակարգ', EN: 'Dietary', RU: 'Питание' } },
]

/** The catalogue. Order = display priority on the public menu. */
export const BADGES: BadgeDef[] = [
  // ── Promotion ───────────────────────────────────────────────
  { key: 'hit', group: 'promo', icon: '🔥', text: { AM: 'Հիթ', EN: 'Hit', RU: 'Хит' } },
  { key: 'bestseller', group: 'promo', icon: '🏆', text: { AM: 'Բեսթսելեր', EN: 'Bestseller', RU: 'Бестселлер' } },
  { key: 'recommended', group: 'promo', icon: '⭐', text: { AM: 'Խորհուրդ', EN: 'Recommended', RU: 'Рекомендуем' } },
  { key: 'new', group: 'promo', icon: '✨', text: { AM: 'Նոր', EN: 'New', RU: 'Новинка' } },
  { key: 'seasonal', group: 'promo', icon: '📅', text: { AM: 'Սեզոնային', EN: 'Seasonal', RU: 'Сезонное' } },

  // ── Price ───────────────────────────────────────────────────
  { key: 'affordable', group: 'price', icon: '💰', text: { AM: 'Մատչելի', EN: 'Great value', RU: 'Доступно' } },
  { key: 'best_price', group: 'price', icon: '🏷️', text: { AM: 'Լավագույն գին', EN: 'Best price', RU: 'Лучшая цена' } },

  // ── Taste & serving ─────────────────────────────────────────
  { key: 'mild_spicy', group: 'serving', icon: '🌶️', text: { AM: 'Միջին կծու', EN: 'Mildly spicy', RU: 'Средне острое' } },
  { key: 'spicy', group: 'serving', icon: '🌶️🌶️', text: { AM: 'Կծու', EN: 'Spicy', RU: 'Острое' } },
  { key: 'hot', group: 'serving', icon: '♨️', text: { AM: 'Տաք', EN: 'Served hot', RU: 'Горячее' } },
  { key: 'cold', group: 'serving', icon: '🧊', text: { AM: 'Սառը', EN: 'Served cold', RU: 'Холодное' } },
  { key: 'quick', group: 'serving', icon: '⏱️', text: { AM: 'Արագ պատրաստվող', EN: 'Quick to serve', RU: 'Быстрая подача' } },
  { key: 'kids', group: 'serving', icon: '👶', text: { AM: 'Մանկական', EN: 'For kids', RU: 'Детское' } },

  // ── Dietary ─────────────────────────────────────────────────
  { key: 'vegan', group: 'diet', icon: '🌱', text: { AM: 'Վեգան', EN: 'Vegan', RU: 'Веган' } },
  { key: 'healthy', group: 'diet', icon: '🥑', text: { AM: 'Առողջ ընտրություն', EN: 'Healthy choice', RU: 'Полезный выбор' } },
  { key: 'organic', group: 'diet', icon: '🍃', text: { AM: 'Օրգանական', EN: 'Organic', RU: 'Органическое' } },
  { key: 'light', group: 'diet', icon: '🥗', text: { AM: 'Թեթև', EN: 'Light', RU: 'Лёгкое' } },
  { key: 'sugar_free', group: 'diet', icon: '🚫🍬', text: { AM: 'Առանց շաքարի', EN: 'Sugar-free', RU: 'Без сахара' } },
  { key: 'low_salt', group: 'diet', icon: '🧂', text: { AM: 'Քիչ աղով', EN: 'Low salt', RU: 'Мало соли' } },
  { key: 'alcohol_free', group: 'diet', icon: '🚫🍷', text: { AM: 'Առանց ալկոհոլի', EN: 'Alcohol-free', RU: 'Без алкоголя' } },
  { key: 'halal', group: 'diet', icon: '🕌', text: { AM: 'Հալալ', EN: 'Halal', RU: 'Халяль' } },
]

export const BADGE_KEYS: BadgeKey[] = BADGES.map((b) => b.key)

const BY_KEY = new Map<string, BadgeDef>(BADGES.map((b) => [b.key, b]))
const RANK = new Map<string, number>(BADGES.map((b, i) => [b.key, i]))

/** Keys that older data may still carry, mapped to their catalogue entry. */
const LEGACY_KEYS: Record<string, BadgeKey> = { best: 'bestseller' }

export const isBadgeKey = (key: string): key is BadgeKey => BY_KEY.has(key)

export const badgeByKey = (key?: string | null): BadgeDef | undefined =>
  key ? BY_KEY.get(LEGACY_KEYS[key] ?? key) : undefined

/** A dish as the themes see it — either shape is accepted. */
interface BadgeCarrier {
  badge?: string | null
  badges?: string[] | null
}

/**
 * The badges a card should actually render: catalogue-ordered, de-duplicated
 * and capped (a card has room for two, a detail view for a few more). Falls
 * back to the single `badge` field for payloads that carry only that.
 */
export const visibleBadges = (item: BadgeCarrier, max = 2): BadgeDef[] => {
  const keys = item.badges?.length ? item.badges : item.badge ? [item.badge] : []
  const defs = keys.map((k) => badgeByKey(k)).filter((b): b is BadgeDef => Boolean(b))
  const unique = [...new Map(defs.map((b) => [b.key, b])).values()]
  unique.sort((a, b) => (RANK.get(a.key) ?? 99) - (RANK.get(b.key) ?? 99))
  return unique.slice(0, max)
}

/** True when the dish carries a promotional badge (hit / bestseller / …). */
export const hasPromoBadge = (item: BadgeCarrier): boolean =>
  visibleBadges(item, BADGES.length).some((b) => b.group === 'promo')
