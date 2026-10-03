import type { Category } from '~/models/types'
import { useApiClient } from './http'
import {
  mapCategory,
  categoryDraftToDto,
  categoryImageToDto,
  categoryMobileImageToDto,
  type ApiCategoryRow,
  type CategoryBannerSlot,
} from './_api-map'

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

  /** Save only one banner photo (partial PATCH — every other field untouched). */
  async updateCategoryImage(id: string, draft: CategoryDraft, slot: CategoryBannerSlot): Promise<void> {
    const body = slot === 'desktop' ? categoryImageToDto(draft) : categoryMobileImageToDto(draft)
    await useApiClient().patch(`/admin/categories/${id}`, body)
  },

  async deleteCategory(id: string): Promise<void> {
    await useApiClient().del(`/admin/categories/${id}`, { cascade: true })
  },

  /** Undo a delete — brings back the category and the products it took with it. */
  async restoreCategory(id: string): Promise<void> {
    await useApiClient().post(`/admin/categories/${id}/restore`, {})
  },

  /** Persist a new order: [{ id, sortOrder }, …]. */
  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    await useApiClient().patch('/admin/categories/reorder', { items })
  },
}
