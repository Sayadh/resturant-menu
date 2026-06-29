<script setup lang="ts">
// Public tenant route: /<restaurant-slug>
// Resolves the restaurant + its menu through the service layer, then hands the
// normalized data to ThemeRenderer. Works on direct access / refresh (SSR) and
// on client-side navigation for ANY slug from the database.
import { restaurantService, menuService } from '~/services'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const load = async () => {
  const restaurant = await restaurantService.getRestaurantBySlug(slug.value)
  if (!restaurant) return { restaurant: null as Awaited<ReturnType<typeof restaurantService.getRestaurantBySlug>>, menu: null }
  const menu = await menuService.getMenu(restaurant.id)
  return { restaurant, menu: menu ?? { levels: [], categories: [] } }
}

const { data, pending, refresh: reload } = await useAsyncData(`tenant-${slug.value}`, load, {
  watch: [slug],
})

// Refresh resilience: if SSR couldn't resolve the tenant (e.g. the SSR runtime
// momentarily failed to reach the API), retry once on the client — where the
// fetch is reliable — before deciding the restaurant doesn't exist. This makes
// a hard refresh behave exactly like client-side navigation.
const settled = ref(false)
onMounted(async () => {
  if (!data.value?.restaurant) await reload()
  settled.value = true
})

const restaurant = computed(() => data.value?.restaurant ?? null)
// Only declare "not found" after the client retry has settled, so a transient
// SSR miss never flashes the not-found screen.
const notFound = computed(() => settled.value && !pending.value && !restaurant.value)

useHead(() => ({
  title: restaurant.value ? `${restaurant.value.name} — Menu` : 'Menu',
}))
</script>

<template>
  <RestaurantNotFound v-if="notFound" :slug="slug" />
  <ThemeRenderer
    v-else-if="restaurant && data?.menu"
    :restaurant="restaurant"
    :levels="data.menu.levels"
    :categories="data.menu.categories"
  />
  <div v-else class="flex min-h-screen items-center justify-center bg-[#F5EFE2]">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-[#E4D6C2] border-t-[#C69A5A]"></span>
  </div>
</template>
