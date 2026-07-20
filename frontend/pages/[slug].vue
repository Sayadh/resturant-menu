<script setup lang="ts">
// Public tenant route: /<restaurant-slug>
// Restaurant is fetched once per slug. The menu is fetched in the ACTIVE
// language only (one request) and refetched whenever the language changes.
import { restaurantService, menuService } from '~/services'
import type { Lang, LocalizedText } from '~/data/menu'
import { SITE } from '~/data/seo'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

// Optional render-only theme override via ?theme= (used by the landing demo
// preview so switching a theme opens the demo in that theme). Never persisted.
const VALID_THEMES = ['aria', 'atelier', 'maison', 'heritage', 'noir']
const themeOverride = computed(() => {
  const q = String(route.query.theme || '').toLowerCase()
  return VALID_THEMES.includes(q) ? q : ''
})

const { lang } = useLanguage()
const API_LANG: Record<Lang, string> = { AM: 'hy', EN: 'en', RU: 'ru' }
const apiLang = computed(() => API_LANG[lang.value])

// Restaurant — once per slug, language-independent.
const { data: restaurant, pending: restPending } = useLazyAsyncData(
  () => `rest-${slug.value}`,
  () => restaurantService.getRestaurantBySlug(slug.value),
  { server: false, watch: [slug] },
)

// Menu — active language only; refetches when restaurant or language changes.
const { data: menu } = useLazyAsyncData(
  () => `menu-${slug.value}-${apiLang.value}`,
  () => (restaurant.value ? menuService.getMenu(restaurant.value.id, apiLang.value) : Promise.resolve(null)),
  { server: false, watch: [() => restaurant.value?.id, apiLang] },
)

// Full loader only on the FIRST load; a language switch keeps the current menu
// visible (Nuxt retains previous data) until the new language arrives.
const loadingInitial = computed(() => restPending.value || (!!restaurant.value && menu.value == null))
const notFound = computed(() => !restPending.value && restaurant.value == null)

// Apply the theme override for rendering only (clone, don't mutate the source).
const displayRestaurant = computed(() =>
  restaurant.value && themeOverride.value
    ? { ...restaurant.value, themeId: themeOverride.value }
    : restaurant.value,
)

// SSR fetch dedicated to SEO: renders title/description/canonical/OG + the
// Restaurant/Menu JSON-LD into the INITIAL HTML (Google + social scrapers see
// real content, not an empty shell). The interactive UI keeps its lazy fetch.
const { data: seo } = useAsyncData(
  () => `seo-${slug.value}`,
  async () => {
    const r = await restaurantService.getRestaurantBySlug(slug.value)
    if (!r) return null
    const m = await menuService.getMenu(r.id, 'hy').catch(() => null)
    return { r, m }
  },
  { watch: [slug] },
)

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
      // pages stay light. Themes use these serif families.
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Serif+Armenian:wght@400;500;600;700&display=swap',
      },
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
