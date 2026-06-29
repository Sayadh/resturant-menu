import type { MenuCategory, MenuLevel } from '~/data/menu'
import type { LangCode } from '~/models/types'
import { delay } from './db'
import { dataSource } from '~/repositories/dataSource'
import { useApiClient } from './http'
import { mergeMenus, type ApiMenuResponse, type ApiRestaurantBySlug } from './_api-map'

export interface MenuPayload {
  levels: MenuLevel[]
  categories: MenuCategory[]
}

const useApi = () => useRuntimeConfig().public.useApi as boolean
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SUPPORTED: LangCode[] = ['hy', 'en', 'ru']

/**
 * Public menu for a tenant. Backend localizes to ONE language per request, so
 * we fetch every supported language in parallel and merge into the multi-lang
 * shape the themes consume (client-side language switch). Accepts a restaurant
 * id (uuid) or a slug.
 */
export const menuService = {
  async getMenu(restaurantIdOrSlug: string): Promise<MenuPayload | null> {
    if (useApi()) {
      try {
        const client = useApiClient()
        let id = restaurantIdOrSlug
        if (!UUID.test(id)) {
          const r = await client.get<ApiRestaurantBySlug>(`/public/restaurants/${id}`)
          id = r.restaurant.id
        }
        const results = await Promise.all(
          SUPPORTED.map((lang) =>
            client
              .get<ApiMenuResponse>(`/public/restaurants/${id}/menu`, { lang })
              .then((data) => [lang, data] as const)
              .catch(() => null),
          ),
        )
        const byLang: Partial<Record<LangCode, ApiMenuResponse>> = {}
        for (const r of results) if (r) byLang[r[0]] = r[1]
        if (!Object.keys(byLang).length) return null
        return mergeMenus(byLang)
      } catch {
        return null
      }
    }
    await delay()
    return dataSource.getMenu(restaurantIdOrSlug)
  },
}
