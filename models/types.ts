// ─────────────────────────────────────────────────────────────────────────
// Universal QR-Menu platform — backend-ready domain model.
//
// These interfaces describe the data exactly as a real API would return it.
// Today they are served by the mock service layer (services/*), tomorrow by a
// REST/GraphQL backend — the shape stays identical so nothing downstream needs
// to change. The admin panel and every public theme consume THIS model.
// ─────────────────────────────────────────────────────────────────────────

/** Supported interface / content languages. */
export type LangCode = 'hy' | 'en' | 'ru'

/** A translatable string. Always carries all supported languages. */
export interface Translation {
  hy: string
  en: string
  ru: string
}

/** Product highlight badges. */
export type Badge = 'hit' | 'new' | 'recommended' | 'spicy' | 'vegan' | 'affordable'

/** Available public theme identifiers. */
export type ThemeId = 'aria' | 'atelier' | 'maison' | 'heritage' | 'noir'

// ── Menu ────────────────────────────────────────────────────────────────
/** A dynamic, per-restaurant top-level section (Food, Drinks, …). */
export interface Section {
  id: string
  restaurantId: string
  name: Translation
  icon: string
  sortOrder: number
  active: boolean
}

export interface Category {
  id: string
  restaurantId: string
  sectionId: string
  name: Translation
  description: Translation
  icon: string
  image: string
  sortOrder: number
  active: boolean
}

export interface Product {
  id: string
  restaurantId: string
  categoryId: string
  /** Resolved from the product's category (read-only convenience). */
  sectionId: string
  name: Translation
  description: Translation
  /** Price in minor-less AMD (whole drams). */
  price: number
  image: string
  badges: Badge[]
  active: boolean
  available: boolean
  sortOrder: number
}

// ── Order (client-side, no payment) ───────────────────────────────────────
export interface OrderItem {
  productId: string
  qty: number
}

// ── Theme ──────────────────────────────────────────────────────────────
export interface Theme {
  id: ThemeId
  name: string
  description: string
  bestFor: string
  /** Screenshot/preview asset (placeholder until real screenshots exist). */
  screenshot: string
  accent: string
  /** Whether the theme is implemented and selectable. */
  available: boolean
}

/** Controlled, theme-safe customization applied on top of any theme. */
export interface ThemeSettings {
  themeId: ThemeId
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  accentColor: string
  fontStyle: 'classic' | 'modern' | 'editorial'
  logo: string
  coverImage: string
  cardRadius: number
  showRating: boolean
  showOrderBasket: boolean
  showFavorites: boolean
  showProductDescriptions: boolean
}

// ── Restaurant ──────────────────────────────────────────────────────────
export interface RestaurantSettings {
  active: boolean
  subdomain: string
  customDomain: string
  seoTitle: Translation
  seoDescription: Translation
  currency: string
  /** Optional service/tax percentage (0 = none). */
  servicePercent: number
}

export interface Restaurant {
  id: string
  name: string
  slug: string
  /** The public theme this restaurant renders with. */
  themeId: ThemeId
  logo: string
  coverImage: string
  tagline: Translation
  /** Simple free-text address (v1; no maps/coordinates). */
  address: string
  workingHours: string
  rating: number
  defaultLanguage: LangCode
  activeLanguages: LangCode[]
}

// ── Service result envelope (mirrors a typical API response) ──────────────
export interface ApiList<T> {
  data: T[]
  total: number
}
