import type { Category } from '~/models/types'
import { useApiClient } from './http'
import { mapCategory, categoryDraftToDto, type ApiCategoryRow } from './_api-map'

export type CategoryDraft = Omit<Category, 'id' | 'restaurantId'>

/** Admin categories CRUD. Tenant comes from the JWT (RestaurantScopeGuard). */
export const categoryService = {
  async getCategories(sectionId?: string): Promise<Category[]> {
    const rows = await useApiClient().get<ApiCategoryRow[]>('/admin/categories', {
      pageSize: 200,
      sectionId,
    })
    return rows.map(mapCategory)
  },

  async createCategory(draft: CategoryDraft): Promise<Category> {
    const row = await useApiClient().post<ApiCategoryRow>('/admin/categories', categoryDraftToDto(draft))
    return mapCategory(row)
  },

  async updateCategory(id: string, draft: CategoryDraft): Promise<void> {
    await useApiClient().patch(`/admin/categories/${id}`, categoryDraftToDto(draft))
  },

  async deleteCategory(id: string): Promise<void> {
    await useApiClient().del(`/admin/categories/${id}`, { cascade: true })
  },
}
