import type { Product } from '~/models/types'
import { useApiClient } from './http'
import {
  mapProduct,
  productDraftToDto,
  type ApiProductRow,
  type ApiCategoryRow,
} from './_api-map'

export type ProductDraft = Omit<Product, 'id' | 'restaurantId'>

/** Build a categoryId→sectionId map from the admin categories list. */
async function sectionMap(client: ReturnType<typeof useApiClient>): Promise<Map<string, string>> {
  const rows = await client.get<ApiCategoryRow[]>('/admin/categories', { pageSize: 200 })
  return new Map(rows.map((c) => [c.id, c.sectionId ?? '']))
}

/** Admin products CRUD. Tenant comes from the JWT (RestaurantScopeGuard). */
export const productService = {
  async getProducts(opts?: { categoryId?: string; sectionId?: string }): Promise<Product[]> {
    const client = useApiClient()
    const [secMap, rows] = await Promise.all([
      sectionMap(client),
      client.get<ApiProductRow[]>('/admin/products', {
        pageSize: 500,
        categoryId: opts?.categoryId,
        sectionId: opts?.sectionId,
      }),
    ])
    return rows.map((p) => mapProduct(p, secMap))
  },

  async createProduct(draft: ProductDraft): Promise<void> {
    await useApiClient().post('/admin/products', productDraftToDto(draft))
  },

  async updateProduct(id: string, draft: ProductDraft): Promise<void> {
    await useApiClient().patch(`/admin/products/${id}`, productDraftToDto(draft))
  },

  async deleteProduct(id: string): Promise<void> {
    await useApiClient().del(`/admin/products/${id}`)
  },

  async setAvailability(id: string, available: boolean): Promise<void> {
    await useApiClient().patch(`/admin/products/${id}/availability`, { isAvailable: available })
  },
}
