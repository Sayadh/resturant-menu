import type { Section } from '~/models/types'
import { useApiClient } from './http'
import { mapSection, sectionDraftToDto, type ApiSectionRow } from './_api-map'

export type SectionDraft = Omit<Section, 'id' | 'restaurantId'>

/** Admin sections CRUD. Tenant comes from the JWT (RestaurantScopeGuard). */
export const sectionService = {
  async getSections(): Promise<Section[]> {
    const rows = await useApiClient().get<ApiSectionRow[]>('/admin/sections')
    return rows.map(mapSection)
  },

  async createSection(draft: SectionDraft): Promise<Section> {
    const row = await useApiClient().post<ApiSectionRow>('/admin/sections', sectionDraftToDto(draft))
    return mapSection(row)
  },

  async updateSection(id: string, draft: SectionDraft): Promise<void> {
    await useApiClient().patch(`/admin/sections/${id}`, sectionDraftToDto(draft))
  },

  async deleteSection(id: string): Promise<void> {
    await useApiClient().del(`/admin/sections/${id}`, { cascade: true })
  },

  /** Persist a new order: [{ id, sortOrder }, …]. */
  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    await useApiClient().patch('/admin/sections/reorder', { items })
  },
}
