import { defineStore } from 'pinia'

// ─────────────────────────────────────────────────────────────────────────
// Admin auth store. Access token lives in memory (per tab); the long-lived
// refresh token is persisted in localStorage so a reload stays signed in.
// Uses a RAW $fetch against the API base to avoid a circular dependency with
// the wrapped HTTP client (which itself calls this store on 401).
// ─────────────────────────────────────────────────────────────────────────

const REFRESH_KEY = 'qrmenu:refresh-token'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'EMPLOYEE'
  restaurantId: string | null
}

interface Envelope<T> {
  success: boolean
  data: T
  message?: string
}

interface TokenPair {
  accessToken: string
  refreshToken: string
  user?: AuthUser
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)
  const ready = ref(false) // initial restore attempt finished

  const isAuthenticated = computed(() => !!accessToken.value)

  const base = () => {
    const c = useRuntimeConfig()
    return (import.meta.server ? c.apiBaseServer : c.public.apiBase) as string
  }

  const persist = (rt: string | null) => {
    if (!import.meta.client) return
    if (rt) localStorage.setItem(REFRESH_KEY, rt)
    else localStorage.removeItem(REFRESH_KEY)
  }

  const setTokens = (t: TokenPair) => {
    accessToken.value = t.accessToken
    refreshToken.value = t.refreshToken
    if (t.user) user.value = t.user
    persist(t.refreshToken)
  }

  const clear = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    persist(null)
  }

  async function login(email: string, password: string): Promise<void> {
    const res = await $fetch<Envelope<TokenPair>>('/admin/auth/login', {
      baseURL: base(),
      method: 'POST',
      body: { email, password },
    })
    setTokens(res.data)
    if (!res.data.user) await fetchMe()
  }

  /** Rotate tokens. Returns the new access token, or null if refresh failed. */
  async function refresh(): Promise<string | null> {
    const rt = refreshToken.value
    if (!rt) return null
    try {
      const res = await $fetch<Envelope<TokenPair>>('/admin/auth/refresh', {
        baseURL: base(),
        method: 'POST',
        body: { refreshToken: rt },
      })
      setTokens(res.data)
      return res.data.accessToken
    } catch {
      clear()
      return null
    }
  }

  async function fetchMe(): Promise<void> {
    if (!accessToken.value) return
    const res = await $fetch<Envelope<{ user: AuthUser }>>('/admin/me', {
      baseURL: base(),
      headers: { Authorization: `Bearer ${accessToken.value}` },
    })
    user.value = res.data.user
  }

  async function logout(): Promise<void> {
    const rt = refreshToken.value
    if (rt) {
      try {
        await $fetch('/admin/auth/logout', { baseURL: base(), method: 'POST', body: { refreshToken: rt } })
      } catch {
        /* best-effort */
      }
    }
    clear()
  }

  /** Restore session from a persisted refresh token (client, once). */
  async function init(): Promise<void> {
    if (ready.value || !import.meta.client) {
      ready.value = true
      return
    }
    const rt = localStorage.getItem(REFRESH_KEY)
    if (rt) {
      refreshToken.value = rt
      const token = await refresh()
      if (token) {
        try {
          await fetchMe()
        } catch {
          clear()
        }
      }
    }
    ready.value = true
  }

  return {
    accessToken,
    refreshToken,
    user,
    ready,
    isAuthenticated,
    login,
    refresh,
    fetchMe,
    logout,
    init,
  }
})
