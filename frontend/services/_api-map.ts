// ─────────────────────────────────────────────────────────────────────────
// Mapping between the NestJS API payloads and the frontend domain model.
// Backend speaks: dynamic Section ids, single-language menu rows, translations[]
// with language.code, price as Int (AMD), badge keys.
// Frontend speaks: levels(=sections) + LocalizedText (AM/EN/RU), Translation, Badge[].
// ─────────────────────────────────────────────────────────────────────────
import type {
  Category,
  Product,
  Restaurant,
  Section,
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
} from '~/data/menu'

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
  sections: {
    id: string
    icon: string | null
    image: string | null
    sortOrder: number
    name: string
  }[]
  categories: {
    id: string
    sectionId: string | null
    icon: string | null
    iconImage: string | null
    image: string | null
    mobileImage: string | null
    sortOrder: number
    name: string
    description: string | null
  }[]
  products: {
    id: string
    categoryId: string
    sectionId: string | null
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

// The menu API returns ONE localized language per request. We mirror that text
// across all LocalizedText slots so the theme's active-language read always
// shows it; the page refetches when the user switches language.
const mirror = (s: string): LocalizedText => ({ AM: s, EN: s, RU: s })

/**
 * Build a MenuPayload from a single-language menu response. Each Section becomes
 * a top-level "level" (tab); each category's `level` is its sectionId. This lets
 * the existing level-driven themes render dynamic sections with no changes.
 */
export function buildMenu(payload: ApiMenuResponse): { levels: MenuLevel[]; categories: MenuCategory[] } {
  const levels: MenuLevel[] = payload.sections.map((s) => ({
    id: s.id,
    icon: s.icon ?? '🍽',
    image: s.image ?? '',
    title: mirror(s.name),
  }))

  const catMap = new Map<string, MenuCategory>()
  const order: string[] = []

  for (const c of payload.categories) {
    catMap.set(c.id, {
      id: c.id,
      level: c.sectionId ?? '',
      group: undefined,
      icon: c.icon ?? '🍽',
      iconImage: c.iconImage ?? '',
      title: mirror(c.name),
      description: mirror(c.description ?? ''),
      image: c.image ?? '',
      mobileImage: c.mobileImage ?? '',
      items: [],
      sortOrder: c.sortOrder,
      active: true,
    })
    order.push(c.id)
  }

  for (const p of payload.products) {
    const cat = catMap.get(p.categoryId)
    if (!cat) continue
    cat.items.push({
      id: p.id,
      image: p.image ?? p.images[0] ?? '',
      price: p.price,
      name: mirror(p.name),
      description: mirror(p.description ?? ''),
      badge: primaryBadge(p.badges, p),
      badges: p.badges,
      available: p.isAvailable,
      active: true,
      sortOrder: p.sortOrder,
    })
  }

  const categories = order.map((id) => catMap.get(id)!).filter(Boolean)
  return { levels, categories }
}

// ════════════════════════════════════════════════════════════════════════
// SECTIONS (admin + summary) ↔ frontend Section
// ════════════════════════════════════════════════════════════════════════
export interface ApiSectionRow {
  id: string
  icon: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  translations: ApiTranslationRow[]
}

export function mapSection(s: ApiSectionRow): Section {
  const { title } = rowsToLocalized(s.translations)
  return {
    id: s.id,
    restaurantId: '',
    name: ltToTranslation(title),
    icon: s.icon ?? '',
    image: s.imageUrl ?? '',
    sortOrder: s.sortOrder,
    active: s.isActive,
  }
}

export function sectionDraftToDto(d: Omit<Section, 'id' | 'restaurantId'>) {
  return {
    icon: d.icon || undefined,
    imageUrl: d.image || undefined,
    sortOrder: d.sortOrder,
    isActive: d.active,
    translations: translationToRows(d.name),
  }
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
    workingHoursText?: string | null
    rating?: number | null
    currency: string
  }
  // themeId on the restaurant is a FK uuid; the human key lives on theme.key.
  theme: { id: string; key: string } | null
  translations?: { tagline: string | null; language: { code: string } }[]
  languages: { code: string; isDefault: boolean }[]
}

const themeKeyToId = (key: string | null): ThemeId => {
  const allowed: ThemeId[] = ['aria', 'atelier', 'maison', 'heritage', 'noir']
  return (allowed.includes(key as ThemeId) ? key : 'aria') as ThemeId
}

export interface ApiRestaurantSummary {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  theme: { id: string; key: string } | null
  translations?: { tagline: string | null; language: { code: string } }[]
}

/** Lightweight list item → Restaurant (landing cards). */
export function mapRestaurantSummary(r: ApiRestaurantSummary): Restaurant {
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
    coverImage: '',
    tagline,
    address: '',
    workingHours: '',
    rating: 0,
    defaultLanguage: 'hy',
    activeLanguages: ['hy', 'en', 'ru'],
  }
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
    address: r.restaurant.address ?? '',
    workingHours: r.restaurant.workingHoursText ?? '',
    rating: r.restaurant.rating ?? 0,
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
  address: string | null
  workingHoursText: string | null
  rating: number | null
  logoUrl: string | null
  coverImageUrl: string | null
  currency: string
  theme: { id: string; key: string } | null
  plan?: { key: string; maxProducts?: number | null; maxCategories?: number | null } | null
  translations?: { tagline: string | null; language: { code: string } }[]
  languages?: { isDefault: boolean; language: { code: string } }[]
  defaultLanguage?: { code: string } | null
}

export function mapAdminRestaurant(r: ApiAdminRestaurant): Restaurant {
  const tagline: Translation = { hy: '', en: '', ru: '' }
  for (const t of r.translations ?? []) {
    const k = t.language.code as keyof Translation
    if (k in tagline) tagline[k] = t.tagline ?? ''
  }
  const codes = (r.languages ?? [])
    .map((l) => l.language.code)
    .filter((c) => ['hy', 'en', 'ru'].includes(c)) as LangCode[]
  const def = (r.defaultLanguage?.code
    ?? r.languages?.find((l) => l.isDefault)?.language.code) as LangCode | undefined
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    themeId: themeKeyToId(r.theme?.key ?? null),
    logo: r.logoUrl ?? '',
    coverImage: r.coverImageUrl ?? '',
    tagline,
    address: r.address ?? '',
    workingHours: r.workingHoursText ?? '',
    rating: r.rating ?? 0,
    defaultLanguage: def ?? codes[0] ?? 'hy',
    activeLanguages: codes.length ? codes : ['hy'],
    planKey: (r.plan?.key as Restaurant['planKey']) ?? 'free',
    maxProducts: r.plan?.maxProducts ?? null,
    maxCategories: r.plan?.maxCategories ?? null,
  }
}

/** Restaurant patch → admin update DTO (only API-supported fields). */
export function restaurantPatchToDto(patch: Partial<Restaurant>) {
  const dto: Record<string, unknown> = {}
  if (patch.name !== undefined) dto.name = patch.name
  if (patch.address !== undefined) dto.address = patch.address || undefined
  if (patch.workingHours !== undefined) dto.workingHours = patch.workingHours || undefined
  if (patch.rating !== undefined) dto.rating = patch.rating
  // Send the raw value (incl. '' ) so the backend can CLEAR a removed image and
  // delete the old file from storage. `|| undefined` would swallow the clear.
  if (patch.logo !== undefined) dto.logoUrl = patch.logo
  if (patch.coverImage !== undefined) dto.coverImageUrl = patch.coverImage
  if (patch.tagline !== undefined) dto.tagline = patch.tagline
  if (patch.activeLanguages !== undefined) dto.activeLanguages = patch.activeLanguages
  if (patch.defaultLanguage !== undefined) dto.defaultLanguage = patch.defaultLanguage
  return dto
}

// ════════════════════════════════════════════════════════════════════════
// ADMIN: list rows → frontend models
// ════════════════════════════════════════════════════════════════════════
export interface ApiCategoryRow {
  id: string
  sectionId: string | null
  icon: string | null
  iconUrl: string | null
  imageUrl: string | null
  mobileImageUrl: string | null
  sortOrder: number
  isActive: boolean
  translations: ApiTranslationRow[]
}

export function mapCategory(c: ApiCategoryRow): Category {
  const { title, desc } = rowsToLocalized(c.translations)
  return {
    id: c.id,
    restaurantId: '',
    sectionId: c.sectionId ?? '',
    name: ltToTranslation(title),
    description: ltToTranslation(desc),
    icon: c.icon ?? '',
    iconImage: c.iconUrl ?? '',
    image: c.imageUrl ?? '',
    mobileImage: c.mobileImageUrl ?? '',
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

export function mapProduct(p: ApiProductRow, sectionByCat: Map<string, string>): Product {
  const { title, desc } = rowsToLocalized(p.translations)
  const main = p.images.find((i) => i.isMain) ?? p.images[0]
  return {
    id: p.id,
    restaurantId: '',
    categoryId: p.categoryId,
    sectionId: sectionByCat.get(p.categoryId) ?? '',
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
    sectionId: d.sectionId,
    icon: d.icon || undefined,
    iconUrl: d.iconImage || undefined,
    imageUrl: d.image || undefined,
    mobileImageUrl: d.mobileImage || undefined,
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
