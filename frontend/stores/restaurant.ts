import { defineStore } from 'pinia'
import type { Restaurant, Theme } from '~/models/types'
import { restaurantService, themeService } from '~/services'
import { emptyRestaurant, THEMES } from '~/data/themeCatalog'

/**
 * Restaurant profile + theme catalog — the non-menu side of the admin.
 * Fully API-backed (menu data lives in the shared `useMenuStore`).
 */
export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurant = ref<Restaurant>(emptyRestaurant)
  const themes = ref<Theme[]>(THEMES)
  const loading = ref(false)
  const loaded = ref(false)

  const load = async () => {
    loading.value = true
    try {
      const [r, list] = await Promise.all([
        restaurantService.getRestaurant(),
        themeService.getThemes(),
      ])
      restaurant.value = r
      themes.value = list
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  // Set the active tenant (public render path; no persistence).
  const setCurrent = (r: Restaurant) => {
    restaurant.value = r
  }

  const saveRestaurant = async (patch: Partial<Restaurant>) => {
    restaurant.value = await restaurantService.updateRestaurant(patch)
  }

  return {
    restaurant,
    themes,
    loading,
    loaded,
    load,
    setCurrent,
    saveRestaurant,
  }
})
