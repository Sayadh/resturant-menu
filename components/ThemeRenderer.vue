<script setup lang="ts">
// ThemeRenderer — given a tenant's normalized data, load it into the shared
// stores and render the correct theme component from the registry. This is the
// single place that maps data → presentation; no theme-specific logic leaks out.
import type { Restaurant } from '~/models/types'
import type { MenuCategory, MenuLevel } from '~/data/menu'
import { getThemeComponent } from '~/themes/registry'

const props = defineProps<{
  restaurant: Restaurant
  levels: MenuLevel[]
  categories: MenuCategory[]
}>()

const menu = useMenuStore()
const rs = useRestaurantStore()

const apply = () => {
  rs.setCurrent(props.restaurant)
  menu.setTenant(props.restaurant.id, { levels: props.levels, categories: props.categories })
}

// Apply immediately, and whenever the tenant OR the menu data changes (e.g. a
// language refetch produces a new set of categories).
apply()
watch([() => props.restaurant.id, () => props.categories], apply)

const ThemeComponent = computed(() => getThemeComponent(props.restaurant.themeId))
</script>

<template>
  <component :is="ThemeComponent" />
</template>
