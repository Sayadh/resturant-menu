import type { Restaurant, ThemeId } from '~/models/types'
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

/** Restaurant profile + theme selection (fully API-backed). */
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
}
