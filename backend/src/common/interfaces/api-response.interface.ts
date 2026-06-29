export interface ApiError {
  field?: string
  code?: string
  message: string
}

export interface ApiMeta {
  page?: number
  pageSize?: number
  total?: number
  [key: string]: unknown
}

/** The single response envelope every endpoint returns. */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  message: string | null
  errors: ApiError[] | null
  meta: ApiMeta | null
}

/** Controllers may return this shape to pass pagination meta through. */
export interface Paginated<T> {
  data: T
  meta: ApiMeta
  message?: string
}
