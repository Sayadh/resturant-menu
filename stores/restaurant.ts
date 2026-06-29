import { defineStore } from 'pinia'
import type {
  Restaurant,
  RestaurantSettings,
  Theme,
  ThemeSettings,
} from '~/models/types'
import { restaurantService, themeService } from '~/services'
import { seedRestaurant, seedSettings, seedThemeSettings, THEMES } from '~/services/seed'

/**
 * Restaurant profile, settings, theme catalog and theme customization — the
 * non-menu side of the admin. Backed by the service layer; menu data lives in
 * the shared `useMenuStore` (consumed by every public theme).
 */
export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurant = ref<Restaurant>(seedRestaurant)
  const settings = ref<RestaurantSettings>(seedSettings)
  const themeSettings = ref<ThemeSettings>(seedThemeSettings)
  const themes = ref<Theme[]>(THEMES)
  const loading = ref(false)
  const loaded = ref(false)

  const load = async () => {
    loading.value = true
    try {
      const [r, s, t, list] = await Promise.all([
        restaurantService.getRestaurant(),
        restaurantService.getSettings(),
        themeService.getThemeSettings(),
        themeService.getThemes(),
      ])
      restaurant.value = r
      settings.value = s
      themeSettings.value = t
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
  const saveSettings = async (patch: Partial<RestaurantSettings>) => {
    settings.value = await restaurantService.updateSettings(patch)
  }
  const saveTheme = async (patch: Partial<ThemeSettings>) => {
    themeSettings.value = await themeService.updateTheme(patch)
  }

  return {
    restaurant,
    settings,
    themeSettings,
    themes,
    loading,
    loaded,
    load,
    setCurrent,
    saveRestaurant,
    saveSettings,
    saveTheme,
  }
})
