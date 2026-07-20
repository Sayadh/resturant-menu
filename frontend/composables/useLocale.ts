// ─────────────────────────────────────────────────────────────────────────
// Locale is derived from the URL prefix: hy at the root, `/ru`, `/en`.
// This gives every language its own crawlable, SSR-rendered URL (real
// multi-language SEO) instead of a client-only cookie switch.
// ─────────────────────────────────────────────────────────────────────────
export type Locale = 'hy' | 'ru' | 'en'
export const LOCALES: Locale[] = ['hy', 'ru', 'en']
const SITE_URL = 'https://menus.am'

const prefixOf = (path: string): Locale | null => {
  const seg = path.split('/')[1]
  return seg === 'ru' || seg === 'en' ? seg : null
}

export function useLocale() {
  const route = useRoute()

  const locale = computed<Locale>(() => prefixOf(route.path) ?? 'hy')

  // The path with any locale prefix removed, always starting with '/'.
  const basePath = computed(() => {
    const p = prefixOf(route.path)
    if (!p) return route.path
    const rest = route.path.slice(p.length + 1)
    return rest === '' ? '/' : rest
  })

  // Build the path for a base route in a given locale (hy → no prefix).
  const toLocale = (base: string, loc: Locale) => {
    const clean = base === '/' ? '' : base
    return loc === 'hy' ? clean || '/' : `/${loc}${clean}`
  }

  // Absolute URL (no trailing slash on the root).
  const absolute = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`

  return { locale, basePath, toLocale, absolute, locales: LOCALES }
}
