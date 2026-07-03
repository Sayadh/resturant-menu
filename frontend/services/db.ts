// ─────────────────────────────────────────────────────────────────────────
// Tiny persistence + transport helpers for the mock service layer.
// Simulates network latency and persists to localStorage so the demo behaves
// like a real backend. Swap these out for `$fetch` calls when the API is ready.
// ─────────────────────────────────────────────────────────────────────────

/** Simulated network latency so loading states are exercised. */
export const delay = (ms = 160) => new Promise<void>((r) => setTimeout(r, ms))

/** Generate a backend-style id. */
export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function dbRead<T>(key: string, fallback: T): T {
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function dbWrite(key: string, value: unknown): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / serialization — non-fatal for the demo */
  }
}
