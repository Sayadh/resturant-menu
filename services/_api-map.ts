// ─────────────────────────────────────────────────────────────────────────
// Mapping between the NestJS API payloads and the frontend domain model.
// Backend speaks: SectionType (FOOD/DRINKS/ALCOHOL), single-language menu rows,
// translations[] with language.code, price as Int (AMD), badge keys.
// Frontend speaks: level/group + LocalizedText (AM/EN/RU), Translation, Badge[].
// ─────────────────────────────────────────────────────────────────────────
import type {
  Category,
  Product,
  Restaurant,
  SectionType,
  Translation,
  Badge,
  ThemeId,
  LangCode,
} from '~/models/types'
import type {
  MenuCategory,
  MenuItem,
  MenuLevel,
  LocalizedText,
  BadgeKey,
  DrinkGroup,
} from '~/data/menu'

// ── enums ────────────────────────────────────────────────────────────────
export type ApiSection = 'FOOD' | 'DRINKS' | 'ALCOHOL'

export const sectionToApi = (s: SectionType): ApiSection =>
  s === 'food' ? 'FOOD' : s === 'alcohol' ? 'ALCOHOL' : 'DRINKS'

export const apiToSection = (s: ApiSection | string | null): SectionType =>
  s === 'FOOD' ? 'food' : s === 'ALCOHOL' ? 'alcohol' : 'drinks'

const sectionToLevelGroup = (s: ApiSection | string | null): { level: 'food' | 'drinks'; group?: DrinkGroup } =>
  s === 'FOOD' ? { level: 'food' } : s === 'ALCOHOL' ? { level: 'drinks', group: 'alcohol' } : { level: 'drinks', group: 'soft' }

// ── badges ────────────────────────────────────────────────────────────────
const KNOWN_BADGES: Badge[] = ['hit', 'new', 'recommended', 'spicy', 'vegan', 'affordable']

export const apiBadgesToBadges = (keys: string[] = []): Badge[] =>
  keys.filter((k): k is Badge => (KNOWN_BADGES as string[]).includes(k))

/** Primary badge the public themes render (hit | best | new). */
const primaryBadge = (keys: string[], flags: { isPopular?: boolean; isNew?: boolean; isRecommended?: boolean }): BadgeKey | undefined => {
  if (keys.includes('hit') || flags.isPopular) return 'hit'
  if (keys.includes('recommended') || flags.isRecommended) return 'best'
  if (keys.includes('new') || flags.isNew) return 'new'
  return undefined
}

// ── translations ────────────────────────────────────────────────────────
interface ApiTranslationRow {
  name: string
  description?: string | null
  language: { code: string }
}

const emptyLT = (): LocalizedText => ({ AM: '', EN: '', RU: '' })
const langToLT: Record<string, keyof LocalizedText> = { hy: 'AM', en: 'EN', ru: 'RU' }

/** translations[] → LocalizedText (AM/EN/RU), backfilling blanks from any present value. */
export const rowsToLocalized = (rows: ApiTranslationRow[] = []): { title: LocalizedText; desc: LocalizedText } => {
  const title = emptyLT()
  const desc = emptyLT()
  for (const r of rows) {
    const k = langToLT[r.language.code]
    if (!k) continue
    title[k] = r.name ?? ''
    desc[k] = r.description ?? ''
  }
  const anyTitle = title.AM || title.EN || title.RU
  for (const k of ['AM', 'EN', 'RU'] as const) if (!title[k]) title[k] = anyTitle
  return { title, desc }
}

const ltToTranslation = (lt: LocalizedText): Translation => ({ hy: lt.AM, en: lt.EN, ru: lt.RU })

/** Translation → backend translations[] (only languages that carry a name). */
export const translationToRows = (name: Translation, description?: Translation) => {
  const out: { languageCode: LangCode; name: string; description?: string }[] = []
  const langs: { code: LangCode; k: keyof Translation }[] = [
    { code: 'hy', k: 'hy' },
    { code: 'en', k: 'en' },
    { code: 'ru', k: 'ru' },
  ]
  for (const { code, k } of langs) {
    const n = name?.[k]?.trim()
    if (!n) continue
    out.push({ languageCode: code, name: n, description: description?.[k] || undefined })
  }
  // Guarantee at least one (backend requires ArrayMinSize 1).
  if (out.length === 0 && name?.hy) out.push({ languageCode: 'hy', name: name.hy })
  return out
}

// ════════════════════════════════════════════════════════════════════════
// PUBLIC: multi-language menu → MenuPayload (levels + nested categories)
// ════════════════════════════════════════════════════════════════════════
export interface ApiMenuResponse {
  categories: {
    id: string
    section: ApiSection | string
    icon: string | null
    image: string | null
    sortOrder: number
    name: string
    description: string | null
  }[]
  products: {
    id: string
    categoryId: string
    section: ApiSection | string | null
    price: number
    oldPrice: number | null
    isAvailable: boolean
    isPopular: boolean
    isNew: boolean
    isRecommended: boolean
    sortOrder: number
    name: string
    description: string | null
    image: string | null
    images: string[]
    badges: string[]
  }[]
}

const LEVELS: MenuLevel[] = [
  { id: 'food', icon: '🍽', title: { AM: 'Ուտեստներ', EN: 'Food', RU: 'Блюда' } },
  { id: 'drinks', icon: '🥤', title: { AM: 'Ըմպելիքներ', EN: 'Drinks', RU: 'Напитки' } },
]

/**
 * Merge one menu response per language into a single MenuPayload that carries
 * all languages (the public themes switch language client-side).
 */
export function mergeMenus(byLang: Partial<Record<LangCode, ApiMenuResponse>>): { levels: MenuLevel[]; categories: MenuCategory[] } {
  const langs = Object.keys(byLang) as LangCode[]
  const primaryLang = langs[0]
  const primary = primaryLang ? byLang[primaryLang] : undefined
  if (!primary) return { levels: [], categories: [] }

  const catMap = new Map<string, MenuCategory>()
  const order: string[] = []

  for (const c of primary.categories) {
    const { level, group } = sectionToLevelGroup(c.section)
    catMap.set(c.id, {
      id: c.id,
      level,
      group,
      icon: c.icon ?? '🍽',
      title: emptyLT(),
      description: emptyLT(),
      image: c.image ?? '',
      items: [],
      sortOrder: c.sortOrder,
      active: true,
    })
    order.push(c.id)
  }

  const itemMap = new Map<string, MenuItem>()
  for (const p of primary.products) {
    itemMap.set(p.id, {
      id: p.id,
      image: p.image ?? p.images[0] ?? '',
      price: p.price,
      name: emptyLT(),
      description: emptyLT(),
      badge: primaryBadge(p.badges, p),
      badges: p.badges,
      available: p.isAvailable,
      active: true,
      sortOrder: p.sortOrder,
    })
  }

  // Fill every language's text.
  for (const lang of langs) {
    const k = langToLT[lang]
    const payload = byLang[lang]
    if (!k || !payload) continue
    for (const c of payload.categories) {
      const cat = catMap.get(c.id)
      if (cat) {
        cat.title[k] = c.name
        if (cat.description) cat.description[k] = c.description ?? ''
      }
    }
    for (const p of payload.products) {
      const item = itemMap.get(p.id)
      if (item) {
        item.name[k] = p.name
        item.description[k] = p.description ?? ''
      }
    }
  }

  // Attach products to their categories, preserving order.
  for (const p of primary.products) {
    const item = itemMap.get(p.id)
    const cat = catMap.get(p.categoryId)
    if (item && cat) cat.items.push(item)
  }

  const categories = order.map((id) => catMap.get(id)!).filter(Boolean)
  const usedLevels = new Set(categories.map((c) => c.level))
  const levels = LEVELS.filter((l) => usedLevels.has(l.id))
  return { levels: levels.length ? levels : LEVELS, categories }
}

// ════════════════════════════════════════════════════════════════════════
// PUBLIC: restaurant (bySlug) → Restaurant
// ════════════════════════════════════════════════════════════════════════
export interface ApiRestaurantBySlug {
  restaurant: {
    id: string
    slug: string
    name: string
    themeId: string | null
    logoUrl: string | null
    coverImageUrl: string | null
    address: string | null
    phone: string | null
    workingHoursText?: string | null
    rating?: number | null
    currency: string
  }
  // themeId on the restaurant is a FK uuid; the human key lives on theme.key.
  theme: { id: string; key: string } | null
  settings: {
    customDomain?: string | null
    instagramUrl?: string | null
    facebookUrl?: string | null
    websiteUrl?: string | null
  } | null
  translations?: { tagline: string | null; language: { code: string } }[]
  languages: { code: string; isDefault: boolean }[]
}

const themeKeyToId = (key: string | null): ThemeId => {
  const allowed: ThemeId[] = ['aria', 'atelier', 'maison', 'heritage', 'noir']
  return (allowed.includes(key as ThemeId) ? key : 'aria') as ThemeId
}

export function mapRestaurant(r: ApiRestaurantBySlug): Restaurant {
  const langs = (r.languages.map((l) => l.code).filter((c) => ['hy', 'en', 'ru'].includes(c)) as LangCode[])
  const def = r.languages.find((l) => l.isDefault)?.code as LangCode | undefined
  const tagline: Translation = { hy: '', en: '', ru: '' }
  for (const t of r.translations ?? []) {
    const k = t.language.code as keyof Translation
    if (k in tagline) tagline[k] = t.tagline ?? ''
  }
  return {
    id: r.restaurant.id,
    name: r.restaurant.name,
    slug: r.restaurant.slug,
    themeId: themeKeyToId(r.theme?.key ?? null),
    logo: r.restaurant.logoUrl ?? '',
    coverImage: r.restaurant.coverImageUrl ?? '',
    tagline,
    phone: r.restaurant.phone ?? '',
    address: r.restaurant.address ?? '',
    workingHours: r.restaurant.workingHoursText ?? '',
    rating: r.restaurant.rating ?? 0,
    social: {
      instagram: r.settings?.instagramUrl ?? '',
      facebook: r.settings?.facebookUrl ?? '',
      website: r.settings?.websiteUrl ?? '',
    },
    defaultLanguage: def ?? langs[0] ?? 'hy',
    activeLanguages: langs.length ? langs : ['hy'],
  }
}

// ════════════════════════════════════════════════════════════════════════
// ADMIN: own restaurant (GET /admin/restaurant) → Restaurant
// ════════════════════════════════════════════════════════════════════════
export interface ApiAdminRestaurant {
  id: string
  slug: string
  name: string
  phone: string | null
  address: string | null
  workingHoursText: string | null
  rating: number | null
  logoUrl: string | null
  coverImageUrl: string | null
  currency: string
  theme: { id: string; key: string } | null
  settings: {
    instagramUrl?: string | null
    facebookUrl?: string | null
    websiteUrl?: string | null
  } | null
  translations?: { tagline: string | null; language: { code: string } }[]
}

export function mapAdminRestaurant(r: ApiAdminRestaurant): Restaurant {
  const tagline: Translation = { hy: '', en: '', ru: '' }
  for (const t of r.translations ?? []) {
    const k = t.language.code as keyof Translation
    if (k in tagline) tagline[k] = t.tagline ?? ''
  }
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    themeId: themeKeyToId(r.theme?.key ?? null),
    logo: r.logoUrl ?? '',
    coverImage: r.coverImageUrl ?? '',
    tagline,
    phone: r.phone ?? '',
    address: r.address ?? '',
    workingHours: r.workingHoursText ?? '',
    rating: r.rating ?? 0,
    social: {
      instagram: r.settings?.instagramUrl ?? '',
      facebook: r.settings?.facebookUrl ?? '',
      website: r.settings?.websiteUrl ?? '',
    },
    defaultLanguage: 'hy',
    activeLanguages: ['hy', 'en', 'ru'],
  }
}

/** Restaurant patch → admin update DTO (only API-supported fields). */
export function restaurantPatchToDto(patch: Partial<Restaurant>) {
  const dto: Record<string, unknown> = {}
  if (patch.name !== undefined) dto.name = patch.name
  if (patch.phone !== undefined) dto.phone = patch.phone || undefined
  if (patch.address !== undefined) dto.address = patch.address || undefined
  if (patch.workingHours !== undefined) dto.workingHours = patch.workingHours || undefined
  if (patch.rating !== undefined) dto.rating = patch.rating
  if (patch.logo !== undefined) dto.logoUrl = patch.logo || undefined
  if (patch.coverImage !== undefined) dto.coverImageUrl = patch.coverImage || undefined
  if (patch.tagline !== undefined) dto.tagline = patch.tagline
  return dto
}

// ════════════════════════════════════════════════════════════════════════
// ADMIN: list rows → frontend models
// ════════════════════════════════════════════════════════════════════════
export interface ApiCategoryRow {
  id: string
  section: ApiSection | string
  icon: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  translations: ApiTranslationRow[]
}

export function mapCategory(c: ApiCategoryRow): Category {
  const { title, desc } = rowsToLocalized(c.translations)
  return {
    id: c.id,
    restaurantId: '',
    section: apiToSection(c.section),
    name: ltToTranslation(title),
    description: ltToTranslation(desc),
    icon: c.icon ?? '',
    image: c.imageUrl ?? '',
    sortOrder: c.sortOrder,
    active: c.isActive,
  }
}

export interface ApiProductRow {
  id: string
  categoryId: string
  price: number
  oldPrice: number | null
  isAvailable: boolean
  isActive: boolean
  isPopular: boolean
  isNew: boolean
  isRecommended: boolean
  sortOrder: number
  translations: ApiTranslationRow[]
  images: { url: string; isMain: boolean }[]
  badges: { badge: { key: string } }[]
}

export function mapProduct(p: ApiProductRow, sectionByCat: Map<string, SectionType>): Product {
  const { title, desc } = rowsToLocalized(p.translations)
  const main = p.images.find((i) => i.isMain) ?? p.images[0]
  return {
    id: p.id,
    restaurantId: '',
    categoryId: p.categoryId,
    section: sectionByCat.get(p.categoryId) ?? 'food',
    name: ltToTranslation(title),
    description: ltToTranslation(desc),
    price: p.price,
    image: main?.url ?? '',
    badges: apiBadgesToBadges(p.badges.map((b) => b.badge.key)),
    active: p.isActive,
    available: p.isAvailable,
    sortOrder: p.sortOrder,
  }
}

// ── drafts → backend DTOs ─────────────────────────────────────────────────
export function categoryDraftToDto(d: Omit<Category, 'id' | 'restaurantId'>) {
  return {
    section: sectionToApi(d.section),
    icon: d.icon || undefined,
    imageUrl: d.image || undefined,
    sortOrder: d.sortOrder,
    isActive: d.active,
    translations: translationToRows(d.name, d.description),
  }
}

export function productDraftToDto(d: Omit<Product, 'id' | 'restaurantId'>) {
  const keys = d.badges ?? []
  return {
    categoryId: d.categoryId,
    price: d.price,
    isAvailable: d.available,
    isActive: d.active,
    isPopular: keys.includes('hit'),
    isNew: keys.includes('new'),
    isRecommended: keys.includes('recommended'),
    sortOrder: d.sortOrder,
    badges: keys.length ? keys : undefined,
    images: d.image ? [{ url: d.image, isMain: true }] : undefined,
    translations: translationToRows(d.name, d.description),
  }
}
