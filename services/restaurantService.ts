import type { Restaurant, RestaurantSettings, ThemeId } from '~/models/types'
import { delay, dbRead, dbWrite } from './db'
import { seedRestaurant, seedSettings } from './seed'
import { dataSource } from '~/repositories/dataSource'
import { useApiClient } from './http'
import {
  mapRestaurant,
  mapAdminRestaurant,
  restaurantPatchToDto,
  type ApiRestaurantBySlug,
  type ApiAdminRestaurant,
} from './_api-map'

const useApi = () => useRuntimeConfig().public.useApi as boolean

const R_KEY = 'qrmenu:restaurant'
const S_KEY = 'qrmenu:restaurant-settings'
const themeKey = (restaurantId: string) => `qrmenu:theme:${restaurantId}`

// Apply a per-restaurant theme override (set from the admin) over the default.
const withThemeOverride = (r: Restaurant): Restaurant => {
  const override = dbRead<string>(themeKey(r.id), '')
  return override ? { ...r, themeId: override as ThemeId } : r
}

/**
 * Restaurant profile + settings. Mock-backed today; each method maps 1:1 to a
 * future REST endpoint. Public lookups go through the normalized repository;
 * the admin's "current restaurant" edits persist locally.
 */
export const restaurantService = {
  // ── public, multi-tenant ──────────────────────────────────────
  // GET /api/public/restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    await delay()
    return dataSource.listRestaurants()
  },
  // GET /api/v1/public/restaurants/:slug
  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    if (useApi()) {
      try {
        const data = await useApiClient().get<ApiRestaurantBySlug>(`/public/restaurants/${slug}`)
        return mapRestaurant(data)
      } catch {
        return null
      }
    }
    await delay()
    const r = dataSource.findRestaurantBySlug(slug)
    return r ? withThemeOverride(r) : null
  },
  // GET /api/public/restaurants/:id
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    await delay()
    const r = dataSource.findRestaurantById(id)
    return r ? withThemeOverride(r) : null
  },

  // PATCH /api/restaurants/:id/theme — set the active theme for a restaurant.
  async setTheme(restaurantId: string, themeId: ThemeId): Promise<void> {
    await delay()
    dbWrite(themeKey(restaurantId), themeId)
  },

  // ── admin, current restaurant (tenant from JWT) ───────────────
  // GET /api/v1/admin/restaurant
  async getRestaurant(): Promise<Restaurant> {
    if (useApi()) {
      const data = await useApiClient().get<ApiAdminRestaurant>('/admin/restaurant')
      return mapAdminRestaurant(data)
    }
    await delay()
    return withThemeOverride(dbRead<Restaurant>(R_KEY, seedRestaurant))
  },

  // PATCH /api/v1/admin/restaurant
  async updateRestaurant(patch: Partial<Restaurant>): Promise<Restaurant> {
    if (useApi()) {
      const data = await useApiClient().patch<ApiAdminRestaurant>('/admin/restaurant', restaurantPatchToDto(patch))
      return mapAdminRestaurant(data)
    }
    await delay()
    const next = { ...dbRead<Restaurant>(R_KEY, seedRestaurant), ...patch }
    dbWrite(R_KEY, next)
    return next
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
