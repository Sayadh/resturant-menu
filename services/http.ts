// ─────────────────────────────────────────────────────────────────────────
// HTTP client for the real NestJS API.
//  • Prefixes the configured apiBase (.../api/v1)
//  • Attaches the admin Bearer token (when signed in)
//  • Unwraps the standard { success, data, message } envelope
//  • On 401 for an authenticated call: refreshes once and retries
// Public endpoints work without a token; admin endpoints require one.
// ─────────────────────────────────────────────────────────────────────────

interface Envelope<T> {
  success: boolean
  data: T
  message?: string
  errors?: unknown
}

type Query = Record<string, string | number | boolean | undefined>

interface RequestOpts {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Query
  body?: unknown
  /** Force-attach the auth token even for otherwise public calls. */
  auth?: boolean
}

export function useApiClient() {
  const config = useRuntimeConfig()
  // SSR hits the backend directly (absolute, local); the client uses the
  // relative path which Nitro proxies to the backend (single origin).
  const base = (import.meta.server ? config.apiBaseServer : config.public.apiBase) as string
  const auth = useAuthStore()

  async function raw<T>(path: string, opts: RequestOpts, retry = true): Promise<T> {
    const headers: Record<string, string> = {}
    if (auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`

    try {
      const res = await $fetch<Envelope<T>>(path, {
        baseURL: base,
        method: opts.method ?? 'GET',
        query: opts.query,
        body: opts.body as Record<string, unknown> | undefined,
        headers,
      })
      return res.data
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      // Token expired → refresh once, then retry the original request.
      if (status === 401 && retry && auth.refreshToken) {
        const token = await auth.refresh()
        if (token) return raw<T>(path, opts, false)
      }
      throw normalizeError(err)
    }
  }

  return {
    get: <T>(path: string, query?: Query) => raw<T>(path, { method: 'GET', query }),
    post: <T>(path: string, body?: unknown) => raw<T>(path, { method: 'POST', body }),
    patch: <T>(path: string, body?: unknown) => raw<T>(path, { method: 'PATCH', body }),
    del: <T>(path: string, query?: Query) => raw<T>(path, { method: 'DELETE', query }),
  }
}

/** Surface the backend's error message instead of a generic fetch error. */
function normalizeError(err: unknown): Error {
  const data = (err as { data?: { message?: string; errors?: unknown } })?.data
  const msg = data?.message || (err as Error)?.message || 'Request failed'
  const e = new Error(msg)
  ;(e as Error & { errors?: unknown }).errors = data?.errors
  return e
}
