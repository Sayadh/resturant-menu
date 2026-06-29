import type { Product, SectionType, Badge } from '~/models/types'
import type { MenuCategory, MenuItem } from '~/data/menu'
import { useMenuStore } from '~/stores/menu'
import { delay } from './db'
import {
  RESTAURANT_ID,
  toTranslation,
  toLocalized,
  sectionOf,
  primaryBadge,
  badgeToBadges,
} from './_map'
import { useApiClient } from './http'
import {
  mapProduct,
  productDraftToDto,
  apiToSection,
  sectionToApi,
  type ApiProductRow,
  type ApiCategoryRow,
} from './_api-map'

const useApi = () => useRuntimeConfig().public.useApi as boolean

/** Build a categoryId→section map from the admin categories list. */
async function sectionMap(client: ReturnType<typeof useApiClient>): Promise<Map<string, SectionType>> {
  const rows = await client.get<ApiCategoryRow[]>('/admin/categories', { pageSize: 200 })
  return new Map(rows.map((c) => [c.id, apiToSection(c.section)]))
}

export type ProductDraft = Omit<Product, 'id' | 'restaurantId'>

const toModel = (item: MenuItem, cat: MenuCategory, index: number): Product => ({
  id: item.id,
  restaurantId: RESTAURANT_ID,
  categoryId: cat.id,
  section: sectionOf(cat),
  name: toTranslation(item.name),
  description: toTranslation(item.description),
  price: item.price,
  image: item.image,
  badges: (item.badges as Badge[] | undefined) ?? badgeToBadges(item.badge),
  active: item.active ?? item.available ?? true,
  available: item.available ?? true,
  sortOrder: item.sortOrder ?? index,
})

const draftToStoreInput = (draft: ProductDraft) => ({
  name: toLocalized(draft.name),
  description: toLocalized(draft.description),
  price: draft.price,
  image: draft.image,
  badge: primaryBadge(draft.badges),
  badges: draft.badges,
  available: draft.available,
  active: draft.active,
  sortOrder: draft.sortOrder,
})

/** Endpoints: GET/POST/PATCH/DELETE /admin/products.
 *  The HTTP client unwraps the envelope, so list endpoints return rows directly. */
export const productService = {
  async getProducts(opts?: { categoryId?: string; section?: SectionType }): Promise<Product[]> {
    if (useApi()) {
      const client = useApiClient()
      const [secMap, rows] = await Promise.all([
        sectionMap(client),
        client.get<ApiProductRow[]>('/admin/products', {
          pageSize: 500,
          categoryId: opts?.categoryId,
          section: opts?.section ? sectionToApi(opts.section) : undefined,
        }),
      ])
      return rows.map((p) => mapProduct(p, secMap))
    }
    await delay()
    const store = useMenuStore()
    const out: Product[] = []
    for (const cat of store.categories) {
      cat.items.forEach((item, i) => out.push(toModel(item, cat, i)))
    }
    let list = out
    if (opts?.categoryId) list = list.filter((p) => p.categoryId === opts.categoryId)
    if (opts?.section) list = list.filter((p) => p.section === opts.section)
    return list
  },

  async createProduct(draft: ProductDraft): Promise<void> {
    if (useApi()) {
      await useApiClient().post('/admin/products', productDraftToDto(draft))
      return
    }
    await delay()
    useMenuStore().addProduct(draft.categoryId, draftToStoreInput(draft))
  },

  async updateProduct(id: string, draft: ProductDraft): Promise<void> {
    if (useApi()) {
      await useApiClient().patch(`/admin/products/${id}`, productDraftToDto(draft))
      return
    }
    await delay()
    const store = useMenuStore()
    const found = store.findItem(id)
    if (!found) return
    // Moved to a different category → remove from old, add to new.
    if (found.category.id !== draft.categoryId) {
      store.removeProduct(found.category.id, id)
      store.addProduct(draft.categoryId, draftToStoreInput(draft))
      return
    }
    store.updateProduct(found.category.id, id, draftToStoreInput(draft))
  },

  async deleteProduct(id: string): Promise<void> {
    if (useApi()) {
      await useApiClient().del(`/admin/products/${id}`)
      return
    }
    await delay()
    const store = useMenuStore()
    const found = store.findItem(id)
    if (found) store.removeProduct(found.category.id, id)
  },

  async setAvailability(id: string, available: boolean): Promise<void> {
    if (useApi()) {
      await useApiClient().patch(`/admin/products/${id}/availability`, { isAvailable: available })
      return
    }
    await delay()
    const store = useMenuStore()
    const found = store.findItem(id)
    if (found) found.item.available = available
    store.save()
  },
}
