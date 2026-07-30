// ─────────────────────────────────────────────────────────────────────────
// Storage key parsing + tenant-ownership rules.
//
// Kept as pure functions (no Nest decorators, no I/O) so the security-critical
// logic is unit-testable in isolation and can never be bypassed by a caller
// forgetting to add a check: UploadsService routes EVERY delete through here.
//
// Threat model this module defends against:
//   • tenant A passing tenant B's public image URL (cross-tenant deletion)
//   • percent-encoded prefixes ("restaurants%2F<other-id>%2F...")
//   • path traversal ("restaurants/<own-id>/../<other-id>/x.jpg")
//   • prefix confusion ("restaurants/<own-id>-evil/..." vs "<own-id>")
//   • malformed / foreign / absolute-path URLs
// ─────────────────────────────────────────────────────────────────────────

/** Tenant-owned objects always live under this prefix (see UploadsService.uploadImage). */
export const TENANT_PREFIX = 'restaurants'

export type KeyRejectReason =
  | 'not-our-storage' // URL doesn't point at our Supabase bucket
  | 'malformed' // unparsable URL / undecodable key
  | 'unsafe-path' // traversal, empty segment, control chars, backslash
  | 'not-tenant-scoped' // key isn't under restaurants/<id>/...
  | 'foreign-tenant' // key belongs to a different restaurant

export type KeyResult =
  | { ok: true; key: string; restaurantId: string }
  | { ok: false; reason: KeyRejectReason }

/**
 * Extract the storage object key from one of OUR public URLs.
 * Returns null for anything that isn't ours (foreign CDN, malformed, etc.).
 *
 * Parsing is done with the URL API (not string slicing) so query strings,
 * fragments and odd hosts can't smuggle a different path through.
 */
export function keyFromPublicUrl(
  baseUrl: string,
  bucket: string,
  url: string | null | undefined,
): string | null {
  if (!url || !baseUrl || !bucket) return null

  let parsed: URL
  let base: URL
  try {
    parsed = new URL(url)
    base = new URL(baseUrl)
  } catch {
    return null // malformed → not ours
  }

  // Must be the exact same origin as our configured Supabase endpoint.
  if (parsed.origin !== base.origin) return null

  // Only the public-object route is a valid source of deletable keys.
  const prefix = `/storage/v1/object/public/${bucket}/`
  if (!parsed.pathname.startsWith(prefix)) return null

  const raw = parsed.pathname.slice(prefix.length)
  if (!raw) return null

  // Decode once: Supabase stores the key decoded, and an encoded prefix
  // ("restaurants%2F<other>") must not slip past the ownership check below.
  let key: string
  try {
    key = decodeURIComponent(raw)
  } catch {
    return null // invalid percent-encoding → refuse
  }
  return key
}

/** Reject anything that could escape or confuse the tenant prefix. */
function isSafeKey(key: string): boolean {
  if (!key || key.length > 512) return false
  // Control characters (incl. NUL / newline) and backslashes never appear in
  // a key we generate, and are classic separator-confusion vectors.
  for (const ch of key) {
    const code = ch.codePointAt(0) ?? 0
    if (code < 0x20 || code === 0x7f || ch === '\\') return false
  }
  if (key.startsWith('/')) return false // absolute path
  const segments = key.split('/')
  // No empty ("//"), current ("."), or parent ("..") segments anywhere.
  return segments.every((s) => s.length > 0 && s !== '.' && s !== '..')
}

/**
 * Resolve a public URL to a key AND verify it belongs to `restaurantId`.
 *
 * `restaurantId` must come from the authenticated request context (JWT →
 * RestaurantScopeGuard → req.restaurantId), never from a DTO or query param.
 *
 * Ownership is decided by EXACT segment equality (`segments[1] === id`), not
 * `startsWith`, so "restaurants/<id>-other/x.jpg" can never pass as "<id>".
 */
export function resolveOwnedKey(
  baseUrl: string,
  bucket: string,
  restaurantId: string | null | undefined,
  url: string | null | undefined,
): KeyResult {
  if (!restaurantId) return { ok: false, reason: 'not-tenant-scoped' }

  const key = keyFromPublicUrl(baseUrl, bucket, url)
  if (key === null) return { ok: false, reason: url ? 'not-our-storage' : 'malformed' }
  if (!isSafeKey(key)) return { ok: false, reason: 'unsafe-path' }

  const segments = key.split('/')
  // restaurants/<restaurantId>/<file...> → at least 3 segments.
  if (segments.length < 3 || segments[0] !== TENANT_PREFIX) {
    return { ok: false, reason: 'not-tenant-scoped' }
  }
  if (segments[1] !== restaurantId) return { ok: false, reason: 'foreign-tenant' }

  return { ok: true, key, restaurantId }
}
