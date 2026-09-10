<script setup lang="ts">
// /demo — renders the live "demo" tenant from the database (same as /[slug].vue
// but with slug hard-wired to "demo"). Supports ?theme= override for previews.
import { restaurantService, menuService } from '~/services'
import { themeFontsHref } from '~/themes/registry'
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

// Restaurant — fetched once by slug "demo".
const { data: restaurant, pending: restPending } = useLazyAsyncData(
  'rest-demo',
  () => restaurantService.getRestaurantBySlug('demo'),
  { server: false },
)

// Menu — active language only; refetches when language changes.
const { data: menu } = useLazyAsyncData(
  () => `menu-demo-${apiLang.value}`,
  () => (restaurant.value ? menuService.getMenu(restaurant.value.id, apiLang.value) : Promise.resolve(null)),
  { server: false, watch: [() => restaurant.value?.id, apiLang] },
)

const loadingInitial = computed(() => restPending.value || (!!restaurant.value && menu.value == null))
const notFound = computed(() => !restPending.value && restaurant.value == null)

// Apply theme override for rendering only (clone, don't mutate).
const displayRestaurant = computed(() =>
  restaurant.value && themeOverride.value
    ? { ...restaurant.value, themeId: themeOverride.value }
    : restaurant.value,
)

const fontsHref = computed(() => themeFontsHref(themeOverride.value || restaurant.value?.themeId || ''))

useHead(() => ({
  title: 'Demo — Մենյու | menus.am',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  link: [
    { rel: 'canonical', href: 'https://menus.am/demo' },
    ...(fontsHref.value ? [{ rel: 'stylesheet', href: fontsHref.value }] : []),
  ],
}))
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
