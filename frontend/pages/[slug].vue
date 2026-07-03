<script setup lang="ts">
// Public tenant route: /<restaurant-slug>
// Restaurant is fetched once per slug. The menu is fetched in the ACTIVE
// language only (one request) and refetched whenever the language changes.
import { restaurantService, menuService } from '~/services'
import type { Lang } from '~/data/menu'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

// Optional render-only theme override via ?theme= (used by the landing demo
// preview so switching a theme opens the demo in that theme). Never persisted.
const VALID_THEMES = ['aria', 'atelier', 'maison', 'heritage']
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

useHead(() => {
  const r = restaurant.value
  const title = r ? `${r.name} — Մենյու` : 'Մենյու'
  const desc = r ? r.tagline?.hy || r.tagline?.en || `${r.name} — թվային մենյու` : 'Թվային մենյու'
  return {
    title,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
    ],
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
