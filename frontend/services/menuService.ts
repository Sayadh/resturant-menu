import type { MenuCategory, MenuLevel } from '~/data/menu'
import { useApiClient } from './http'
import { buildMenu, type ApiMenuResponse, type ApiRestaurantBySlug } from './_api-map'

export interface MenuPayload {
  levels: MenuLevel[]
  categories: MenuCategory[]
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Public menu for a tenant in a SINGLE language. Pass `lang` ('hy' | 'en' | 'ru')
 * — only that language is fetched; the caller refetches when the language
 * changes. Accepts a restaurant id (uuid) or a slug.
 */
export const menuService = {
  async getMenu(restaurantIdOrSlug: string, lang?: string): Promise<MenuPayload | null> {
    try {
      const client = useApiClient()
      let id = restaurantIdOrSlug
      if (!UUID.test(id)) {
        const r = await client.get<ApiRestaurantBySlug>(`/public/restaurants/${id}`)
        id = r.restaurant.id
      }
      const data = await client.get<ApiMenuResponse>(`/public/restaurants/${id}/menu`, { lang })
      return buildMenu(data)
    } catch {
      return null
    }
  },
}
