import { useApiClient } from './http'
import type { PlanKey } from '~/models/types'

// Platform-level (SUPER_ADMIN) API. Not tenant-scoped.
export interface AdminRestaurantRow {
  id: string
  slug: string
  name: string
  themeKey: string | null
  planKey: PlanKey
  isActive: boolean
  sections: number
  categories: number
  products: number
  createdAt: string
}

export interface CreateRestaurantInput {
  slug: string
  name: string
  themeKey?: string
  defaultLang?: string
  ownerEmail?: string
  ownerPassword?: string
}

export interface CreateRestaurantResult {
  restaurant: { id: string; slug: string; name: string }
  owner: { email: string; password: string }
}

export interface UpdateRestaurantInput {
  name?: string
  themeKey?: string
  defaultLang?: string
  isActive?: boolean
  planKey?: PlanKey
}

export const superAdminService = {
  // GET /api/v1/super-admin/restaurants
  list(): Promise<AdminRestaurantRow[]> {
    return useApiClient().get<AdminRestaurantRow[]>('/super-admin/restaurants')
  },

  // POST /api/v1/super-admin/restaurants
  create(input: CreateRestaurantInput): Promise<CreateRestaurantResult> {
    return useApiClient().post<CreateRestaurantResult>('/super-admin/restaurants', input)
  },

  // PATCH /api/v1/super-admin/restaurants/:id
  update(id: string, input: UpdateRestaurantInput): Promise<{ ok: boolean }> {
    return useApiClient().patch<{ ok: boolean }>(`/super-admin/restaurants/${id}`, input)
  },

  // DELETE /api/v1/super-admin/restaurants/:id
  remove(id: string): Promise<{ ok: boolean }> {
    return useApiClient().del<{ ok: boolean }>(`/super-admin/restaurants/${id}`)
  },
}
