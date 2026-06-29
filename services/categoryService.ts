import type { Category, SectionType } from '~/models/types'
import type { MenuCategory } from '~/data/menu'
import { useMenuStore } from '~/stores/menu'
import { delay } from './db'
import {
  RESTAURANT_ID,
  toTranslation,
  toLocalized,
  emptyTranslation,
  sectionOf,
  sectionToLevelGroup,
} from './_map'
import { useApiClient } from './http'
import {
  mapCategory,
  categoryDraftToDto,
  sectionToApi,
  type ApiCategoryRow,
} from './_api-map'

const useApi = () => useRuntimeConfig().public.useApi as boolean

export type CategoryDraft = Omit<Category, 'id' | 'restaurantId'>

const toModel = (cat: MenuCategory, index: number): Category => ({
  id: cat.id,
  restaurantId: RESTAURANT_ID,
  section: sectionOf(cat),
  name: toTranslation(cat.title),
  description: cat.description ? toTranslation(cat.description) : emptyTranslation(),
  icon: cat.icon,
  image: cat.image || cat.items.find((i) => i.image)?.image || '',
  sortOrder: cat.sortOrder ?? index,
  active: cat.active ?? true,
})

/** GET/POST/PATCH/DELETE /admin/categories. The HTTP client already unwraps the
 *  envelope, so a list endpoint returns the rows array directly. */
export const categoryService = {
  async getCategories(section?: SectionType): Promise<Category[]> {
    if (useApi()) {
      const rows = await useApiClient().get<ApiCategoryRow[]>('/admin/categories', {
        pageSize: 200,
        section: section ? sectionToApi(section) : undefined,
      })
      return rows.map(mapCategory)
    }
    await delay()
    const store = useMenuStore()
    const list = store.categories.map((c, i) => toModel(c, i))
    return section ? list.filter((c) => c.section === section) : list
  },

  async createCategory(draft: CategoryDraft): Promise<Category> {
    if (useApi()) {
      const row = await useApiClient().post<ApiCategoryRow>('/admin/categories', categoryDraftToDto(draft))
      return mapCategory(row)
    }
    await delay()
    const store = useMenuStore()
    const { level, group } = sectionToLevelGroup(draft.section)
    const id = store.addCategory({
      level,
      group,
      icon: draft.icon,
      title: toLocalized(draft.name),
      image: draft.image,
      description: toLocalized(draft.description),
      active: draft.active,
      sortOrder: draft.sortOrder,
    })
    const cat = store.categoryById(id as string)
    return toModel(cat as MenuCategory, draft.sortOrder ?? 0)
  },

  async updateCategory(id: string, draft: CategoryDraft): Promise<void> {
    if (useApi()) {
      await useApiClient().patch(`/admin/categories/${id}`, categoryDraftToDto(draft))
      return
    }
    await delay()
    const store = useMenuStore()
    const { level, group } = sectionToLevelGroup(draft.section)
    store.updateCategory(id, {
      level,
      group,
      icon: draft.icon,
      title: toLocalized(draft.name),
      image: draft.image,
      description: toLocalized(draft.description),
      active: draft.active,
      sortOrder: draft.sortOrder,
    })
  },

  async deleteCategory(id: string): Promise<void> {
    if (useApi()) {
      await useApiClient().del(`/admin/categories/${id}`, { cascade: true })
      return
    }
    await delay()
    useMenuStore().removeCategory(id)
  },
}
