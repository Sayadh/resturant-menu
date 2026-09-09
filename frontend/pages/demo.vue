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

// The language the REQUEST uses is read from the raw switcher state, never
// from `useLanguage().lang`. That one is derived from the restaurant store —
// which this page's own render fills via ThemeRenderer — so watching it made
// the fetch re-trigger itself. `selected` only changes when a guest taps a
// language, so nothing here depends on state this page writes.
const selected = useState<Lang>('lang', () => 'AM')
const API_LANG: Record<Lang, string> = { AM: 'hy', EN: 'en', RU: 'ru' }
const requestedLang = computed(() => API_LANG[selected.value])

// One server-rendered fetch for the whole page: the HTML already carries the
// menu, so the visitor is not left on a spinner through two client round trips.
const { data: page, pending, refresh } = useAsyncData(
  'demo-page',
  async () => {
    const r = await restaurantService.getRestaurantBySlug('demo')
    if (!r) return null
    // Honour the guest's pick only when the tenant actually serves it; the
    // tenant's own default otherwise — decided from `r`, not from the store.
    const code = r.activeLanguages.includes(requestedLang.value as never)
      ? requestedLang.value
      : r.defaultLanguage
    const m = await menuService.getMenu(r.id, code).catch(() => null)
    return { r, m }
  },
  { watch: [requestedLang] },
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
const fontsHref = computed(() => themeFontsHref(themeOverride.value || restaurant.value?.themeId || ''))
const menu = computed(() => page.value?.m ?? null)

const loadingInitial = computed(() => (pending.value || !settled.value) && page.value?.m == null)
const notFound = computed(() => settled.value && !pending.value && !page.value)

// Apply theme override for rendering only (clone, don't mutate).
const displayRestaurant = computed(() =>
  restaurant.value && themeOverride.value
    ? { ...restaurant.value, themeId: themeOverride.value }
    : restaurant.value,
)

// Function form: the font link depends on the previewed theme, which changes
// with ?theme=, so the head has to stay reactive.
useHead(() => ({
  title: 'Demo — Մենյու | menus.am',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  link: [
    { rel: 'canonical', href: 'https://menus.am/demo' },
    // Only the themes that render with Tailwind's serif/display families;
    // Opaline ships its own faces (see themes/registry).
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
