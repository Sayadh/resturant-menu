import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import type { Request } from 'express'
import { PublicCacheService } from '../cache/public-cache.service'
import type { AuthUser } from '../types/auth.types'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Any successful write drops the affected tenant's public cache, so a guest
 * never reads a menu the owner has just changed.
 *
 * It hangs off the request rather than off each service method on purpose: a
 * new admin endpoint is then cached-correctly by default, and there is no list
 * of mutations to keep in sync.
 */
@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(private readonly cache: PublicCacheService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request & { restaurantId?: string; user?: AuthUser }>()
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next.handle()
    }

    return next.handle().pipe(
      tap(() => {
        // Tenant admin: the scope guard has already resolved the tenant.
        const scoped = req.restaurantId ?? req.user?.restaurantId
        if (scoped) return this.cache.invalidate(scoped)

        // Super-admin acts on /super-admin/restaurants/:id; creating or
        // deleting one also changes the cross-tenant list, so that clears all.
        if (req.path.includes('/super-admin')) {
          const id = (req.params as Record<string, string> | undefined)?.id
          return id && UUID.test(id) ? this.cache.invalidate(id) : this.cache.invalidateAll()
        }

        // Everything else with no tenant (login, refresh, a landing lead)
        // cannot change a published menu — leave the cache alone.
      }),
    )
  }
}
