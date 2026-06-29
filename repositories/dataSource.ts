// ─────────────────────────────────────────────────────────────────────────
// In-memory data source — the single normalized "database" for the mock layer.
// Services talk ONLY to this repository, never to mock files directly. To go
// live, replace this module with HTTP calls (or a Prisma/Nest data source) and
// keep the same method signatures — services and UI stay untouched.
// ─────────────────────────────────────────────────────────────────────────
import type { Restaurant, ThemeSettings } from '~/models/types'
import { restaurants } from '~/mock/restaurants'
import { menusByRestaurant, type RestaurantMenu } from '~/mock/menus'
import { seedThemeSettings } from '~/services/seed'

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

export const dataSource = {
  listRestaurants(): Restaurant[] {
    return clone(restaurants)
  },

  findRestaurantBySlug(slug: string): Restaurant | null {
    const r = restaurants.find((x) => x.slug.toLowerCase() === slug.toLowerCase())
    return r ? clone(r) : null
  },

  findRestaurantById(id: string): Restaurant | null {
    const r = restaurants.find((x) => x.id === id)
    return r ? clone(r) : null
  },

  getMenu(restaurantId: string): RestaurantMenu | null {
    const m = menusByRestaurant[restaurantId]
    return m ? clone(m) : null
  },

  getThemeSettings(restaurantId: string): ThemeSettings {
    const r = restaurants.find((x) => x.id === restaurantId)
    return { ...clone(seedThemeSettings), themeId: r?.themeId ?? 'aria' }
  },
}
