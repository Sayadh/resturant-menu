import type { Restaurant, RestaurantSettings, ThemeId } from '~/models/types'
import { delay, dbRead, dbWrite } from './db'
import { seedSettings } from './seed'
import { useApiClient } from './http'
import {
  mapRestaurant,
  mapRestaurantSummary,
  mapAdminRestaurant,
  restaurantPatchToDto,
  type ApiRestaurantBySlug,
  type ApiRestaurantSummary,
  type ApiAdminRestaurant,
} from './_api-map'

// Settings (SEO / subdomain / currency) aren't modelled 1:1 in the backend yet,
// so they persist locally. Everything else (profile, theme, menu) is API-backed.
const S_KEY = 'qrmenu:restaurant-settings'

/** Restaurant profile (API) + local settings/theme customization. */
export const restaurantService = {
  // ── public, multi-tenant ──────────────────────────────────────
  // GET /api/v1/public/restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    const rows = await useApiClient().get<ApiRestaurantSummary[]>('/public/restaurants')
    return rows.map(mapRestaurantSummary)
  },

  // GET /api/v1/public/restaurants/:slug
  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    try {
      const data = await useApiClient().get<ApiRestaurantBySlug>(`/public/restaurants/${slug}`)
      return mapRestaurant(data)
    } catch {
      return null
    }
  },

  // ── admin, current restaurant (tenant from JWT) ───────────────
  // GET /api/v1/admin/restaurant
  async getRestaurant(): Promise<Restaurant> {
    const data = await useApiClient().get<ApiAdminRestaurant>('/admin/restaurant')
    return mapAdminRestaurant(data)
  },

  // PATCH /api/v1/admin/restaurant
  async updateRestaurant(patch: Partial<Restaurant>): Promise<Restaurant> {
    const data = await useApiClient().patch<ApiAdminRestaurant>('/admin/restaurant', restaurantPatchToDto(patch))
    return mapAdminRestaurant(data)
  },

  // PATCH /api/v1/admin/restaurant/theme — persist the active theme (by key).
  async setTheme(_restaurantId: string, themeId: ThemeId): Promise<void> {
    await useApiClient().patch('/admin/restaurant/theme', { themeKey: themeId })
  },

  async getSettings(): Promise<RestaurantSettings> {
    await delay()
    return dbRead<RestaurantSettings>(S_KEY, seedSettings)
  },

  async updateSettings(patch: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    await delay()
    const next = { ...dbRead<RestaurantSettings>(S_KEY, seedSettings), ...patch }
    dbWrite(S_KEY, next)
    return next
  },
}
