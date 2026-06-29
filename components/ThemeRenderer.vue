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

// Apply immediately (SSR + client) and whenever the tenant changes.
apply()
watch(() => props.restaurant.id, apply)

const ThemeComponent = computed(() => getThemeComponent(props.restaurant.themeId))
</script>

<template>
  <component :is="ThemeComponent" />
</template>
