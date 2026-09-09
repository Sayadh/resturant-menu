import { Injectable, Logger } from '@nestjs/common'

/**
 * In-memory cache for the PUBLIC menu payloads.
 *
 * Why it exists: the database lives in another region, and Prisma resolves an
 * `include` with one query per relation, so a single `getMenu` costs a dozen
 * round trips (~2s measured). A guest menu is read constantly and written a few
 * times a day, so the read path is cached and every admin write drops the
 * tenant's entries immediately (CacheInvalidationInterceptor) — the guest never
 * sees a stale menu.
 *
 * The API runs as ONE pm2 process (fork mode, see DEPLOY-VPS.md), so a plain Map
 * is a correct cache here. Moving to `pm2 -i > 1` or a second server would need
 * Redis instead — the TTL below is only a safety net, not the correctness story.
 */
@Injectable()
export class PublicCacheService {
  private readonly logger = new Logger(PublicCacheService.name)

  /** Safety net for an invalidation path nobody thought of. */
  private readonly ttlMs = 10 * 60_000
  /** Rough bound on memory (a large menu is ~100 KB). */
  private readonly maxEntries = 300

  private readonly store = new Map<string, { value: unknown; expires: number }>()
  /** restaurantId → its keys, so one write clears exactly that tenant. */
  private readonly byTenant = new Map<string, Set<string>>()
  /** Keys that belong to no single tenant (e.g. the restaurant list). */
  private readonly shared = new Set<string>()

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key)
    if (!hit) return undefined
    if (hit.expires <= Date.now()) {
      this.drop(key)
      return undefined
    }
    return hit.value as T
  }

  /** `restaurantId` null = shared entry, dropped on any invalidation. */
  set(key: string, value: unknown, restaurantId: string | null): void {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      // Oldest insertion first — Map preserves insertion order.
      const oldest = this.store.keys().next().value
      if (oldest) this.drop(oldest)
    }
    this.store.set(key, { value, expires: Date.now() + this.ttlMs })
    if (restaurantId) {
      const keys = this.byTenant.get(restaurantId) ?? new Set<string>()
      keys.add(key)
      this.byTenant.set(restaurantId, keys)
    } else {
      this.shared.add(key)
    }
  }

  /** Drop one tenant's cached payloads (plus the shared ones). */
  invalidate(restaurantId: string): void {
    const keys = this.byTenant.get(restaurantId)
    if (keys) {
      for (const k of keys) this.store.delete(k)
      this.byTenant.delete(restaurantId)
    }
    this.clearShared()
    this.logger.debug(`invalidated tenant ${restaurantId}`)
  }

  /** Drop everything — used when a write's tenant cannot be determined. */
  invalidateAll(): void {
    this.store.clear()
    this.byTenant.clear()
    this.shared.clear()
    this.logger.debug('invalidated all')
  }

  private clearShared(): void {
    for (const k of this.shared) this.store.delete(k)
    this.shared.clear()
  }

  private drop(key: string): void {
    this.store.delete(key)
    this.shared.delete(key)
    for (const keys of this.byTenant.values()) keys.delete(key)
  }
}
