import { SetMetadata } from '@nestjs/common'

export const PUBLIC_CACHE_KEY = 'publicCache'

/**
 * Marks a handler as safe for a shared HTTP cache.
 *
 * Only for unauthenticated endpoints whose URL fully identifies what is
 * returned — the public menu ones. Everything else stays `no-store`, because a
 * tenant is normally identified by the Authorization header and a cached
 * response could otherwise be served to the wrong one.
 *
 * The response is still revalidated on every request (`no-cache` + ETag), so an
 * admin edit is visible immediately; the win is a 304 with no body instead of a
 * fresh payload, on top of the in-process cache behind it.
 */
export const PublicCache = () => SetMetadata(PUBLIC_CACHE_KEY, true)
