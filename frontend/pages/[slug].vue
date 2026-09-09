<script setup lang="ts">
// Public tenant route: /<restaurant-slug>
// Restaurant is fetched once per slug. The menu is fetched in the ACTIVE
// language only (one request) and refetched whenever the language changes.
import { restaurantService, menuService } from '~/services'
import type { Lang, LocalizedText } from '~/data/menu'
import { SITE } from '~/data/seo'
import { themeFontsHref } from '~/themes/registry'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

// Optional render-only theme override via ?theme= (used by the landing demo
// preview so switching a theme opens the demo in that theme). Never persisted.
const VALID_THEMES = ['aria', 'atelier', 'maison', 'heritage', 'noir', 'opaline']
const themeOverride = computed(() => {
  const q = String(route.query.theme || '').toLowerCase()
  return VALID_THEMES.includes(q) ? q : ''
})

// The language the REQUEST uses is read from the raw switcher state, never
// from `useLanguage().lang`. That one is derived from the restaurant store —
// which this page's own render fills via ThemeRenderer — so watching it made
// the fetch re-trigger itself. `selected` only changes when a guest taps a
// language, so nothing here depends on state this page writes.
const selected = useState<Lang>('lang', () => 'AM')
const API_LANG: Record<Lang, string> = { AM: 'hy', EN: 'en', RU: 'ru' }
const requestedLang = computed(() => API_LANG[selected.value])

// ONE fetch for the whole page, rendered on the SERVER.
//
// This used to be two client-only fetches for the UI plus a third server one
// for the SEO tags — the same restaurant + menu fetched twice, and the guest
// staring at a spinner through two sequential round trips before anything
// appeared. Now the HTML arrives with the menu already in it, and the browser
// makes no request at all on first paint.
const { data: page, pending, refresh } = useAsyncData(
  () => `page-${slug.value}`,
  async () => {
    const r = await restaurantService.getRestaurantBySlug(slug.value)
    if (!r) return null
    // Honour the guest's pick only when the tenant actually serves it; the
    // tenant's own default otherwise — decided from `r`, not from the store.
    const code = r.activeLanguages.includes(requestedLang.value as never)
      ? requestedLang.value
      : r.defaultLanguage
    const m = await menuService.getMenu(r.id, code).catch(() => null)
    return { r, m }
  },
  { watch: [slug, requestedLang] },
)

// The server render is an OPTIMISATION, never a dependency: if it produced no
// usable payload the browser fetches once on mount, exactly as this page used
// to. `settled` holds the loader until that retry resolves, so a page whose
// server render failed never flashes "not found" at the guest.
const settled = ref(false)
onMounted(async () => {
  if (!page.value?.m) await refresh()
  settled.value = true
})

const restaurant = computed(() => page.value?.r ?? null)
// Which display faces this tenant's theme needs (null = the theme loads its own).
const fontsHref = computed(() => themeFontsHref(themeOverride.value || restaurant.value?.themeId || ''))
const menu = computed(() => page.value?.m ?? null)

// Full loader only on the FIRST load; a language switch keeps the current menu
// visible (Nuxt retains the previous value) until the new language arrives.
const loadingInitial = computed(() => (pending.value || !settled.value) && page.value?.m == null)
const notFound = computed(() => settled.value && !pending.value && !page.value)

// Apply the theme override for rendering only (clone, don't mutate the source).
const displayRestaurant = computed(() =>
  restaurant.value && themeOverride.value
    ? { ...restaurant.value, themeId: themeOverride.value }
    : restaurant.value,
)

// title/description/canonical/OG + the Restaurant/Menu JSON-LD are built from
// the SAME payload the page renders, so Google and the social scrapers see the
// real content in the initial HTML without a second fetch.
const seo = page

const ltPick = (lt?: LocalizedText) => lt?.AM || lt?.EN || lt?.RU || ''

// schema.org Restaurant + Menu → rich results + ranks for "<name> menu".
const restaurantSchema = computed(() => {
  const d = seo.value
  if (!d?.r) return null
  const url = `${SITE.url}/${d.r.slug}`
  const sections = (d.m?.categories ?? [])
    .filter((c) => c.items.length)
    .map((c) => ({
      '@type': 'MenuSection',
      name: ltPick(c.title),
      hasMenuItem: c.items.map((i) => ({
        '@type': 'MenuItem',
        name: ltPick(i.name),
        ...(ltPick(i.description) ? { description: ltPick(i.description) } : {}),
        offers: { '@type': 'Offer', price: String(i.price), priceCurrency: 'AMD' },
      })),
    }))
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: d.r.name,
    url,
    image: d.r.coverImage || d.r.logo || SITE.ogImage,
    ...(d.r.address ? { address: { '@type': 'PostalAddress', streetAddress: d.r.address, addressLocality: 'Yerevan', addressCountry: 'AM' } } : {}),
    ...(d.r.tagline?.hy || d.r.tagline?.en ? { description: d.r.tagline.hy || d.r.tagline.en } : {}),
    ...(sections.length ? { hasMenu: { '@type': 'Menu', hasMenuSection: sections } } : {}),
  }
})

useHead(() => {
  const r = seo.value?.r || restaurant.value
  const url = `${SITE.url}/${slug.value}`
  const title = r ? `${r.name} — Մենյու | menus.am` : 'Մենյու | menus.am'
  const desc = r
    ? r.tagline?.hy || r.tagline?.en || `${r.name} — թվային մենյու QR կոդով՝ menus.am-ում։`
    : 'Թվային մենյու'
  const image = (r && (r.coverImage || r.logo)) || SITE.ogImage
  const ld = restaurantSchema.value
  return {
    title,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:type', content: 'restaurant.menu' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
    ],
    link: [
      { rel: 'canonical', href: url },
      // Tenant-menu display fonts are loaded here (not globally) so marketing
      // pages stay light — and only for the themes that actually render with
      // them; the registry decides, so a theme with its own faces (Opaline)
      // does not make the guest download three families it never uses.
      ...(fontsHref.value ? [{ rel: 'stylesheet', href: fontsHref.value }] : []),
    ],
    script: ld ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(ld) }] : [],
  }
})
</script>

<template>
  <MenuLoading v-if="loadingInitial" />
  <RestaurantNotFound v-else-if="notFound" :slug="slug" />
  <ThemeRenderer
    v-else-if="displayRestaurant && menu"
    :restaurant="displayRestaurant"
    :levels="menu.levels"
    :categories="menu.categories"
  />
  <MenuLoading v-else />
</template>
