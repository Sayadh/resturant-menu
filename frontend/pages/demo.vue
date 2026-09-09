<script setup lang="ts">
// /demo — renders the live "demo" tenant from the database (same as /[slug].vue
// but with slug hard-wired to "demo"). Supports ?theme= override for previews.
import { restaurantService, menuService } from '~/services'
import type { Lang, LocalizedText } from '~/data/menu'

const VALID_THEMES = ['aria', 'atelier', 'maison', 'heritage', 'noir', 'opaline']
const route = useRoute()
const themeOverride = computed(() => {
  const q = String(route.query.theme || '').toLowerCase()
  return VALID_THEMES.includes(q) ? q : ''
})

const { lang } = useLanguage()
const API_LANG: Record<Lang, string> = { AM: 'hy', EN: 'en', RU: 'ru' }
const apiLang = computed(() => API_LANG[lang.value])

// One server-rendered fetch for the whole page: the HTML already carries the
// menu, so the visitor is not left on a spinner through two client round trips.
const { data: page, pending } = useAsyncData(
  'demo-page',
  async () => {
    const r = await restaurantService.getRestaurantBySlug('demo')
    if (!r) return null
    const m = await menuService.getMenu(r.id, apiLang.value).catch(() => null)
    return { r, m }
  },
  { watch: [apiLang] },
)

const restaurant = computed(() => page.value?.r ?? null)
const menu = computed(() => page.value?.m ?? null)

const loadingInitial = computed(() => pending.value && page.value == null)
const notFound = computed(() => !pending.value && page.value === null)

// Apply theme override for rendering only (clone, don't mutate).
const displayRestaurant = computed(() =>
  restaurant.value && themeOverride.value
    ? { ...restaurant.value, themeId: themeOverride.value }
    : restaurant.value,
)

useHead({
  title: 'Demo — Մենյու | menus.am',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  link: [
    { rel: 'canonical', href: 'https://menus.am/demo' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Serif+Armenian:wght@400;500;600;700&display=swap',
    },
  ],
})
</script>

<template>
  <MenuLoading v-if="loadingInitial" />
  <RestaurantNotFound v-else-if="notFound" slug="demo" />
  <ThemeRenderer
    v-else-if="displayRestaurant && menu"
    :restaurant="displayRestaurant"
    :levels="menu.levels"
    :categories="menu.categories"
  />
  <MenuLoading v-else />
</template>
