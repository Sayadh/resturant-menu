import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { RequestContext } from '../context/request-context'
import type { AuthUser } from '../types/auth.types'

/**
 * Tenant scope guard. NOT global — apply with @UseGuards on Admin controllers.
 *
 * Rules:
 *  • The tenant id ALWAYS comes from the JWT (`user.restaurantId`), never from
 *    the request body, params, query, or headers.
 *  • Any attempt to pass a `restaurantId` that doesn't match the caller's own
 *    tenant is rejected with 403 (cross-restaurant access is forbidden).
 *  • SUPER_ADMIN may target a specific tenant via the `x-restaurant-id` header
 *    (super-admin tooling); they are not bound to a single restaurant.
 *
 * The resolved id is exposed as `req.restaurantId` (read via @RestaurantId()).
 */
@Injectable()
export class RestaurantScopeGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest()
    const user: AuthUser | undefined = req.user
    if (!user) throw new UnauthorizedException('Not authenticated')

    let scoped: string | null

    if (user.role === UserRole.SUPER_ADMIN) {
      // Super-admin: optional explicit target via dedicated header.
      const header = req.headers?.['x-restaurant-id']
      scoped = typeof header === 'string' && header ? header : null
    } else {
      if (!user.restaurantId) throw new ForbiddenException('No restaurant context')
      scoped = user.restaurantId

      // Defense-in-depth: a tenant user may never point at another restaurant.
      // restaurantId must originate from the JWT only.
      const supplied = this.suppliedRestaurantId(req)
      if (supplied !== undefined && supplied !== scoped) {
        throw new ForbiddenException('Cross-restaurant access is not allowed')
      }
    }

    req.restaurantId = scoped
    RequestContext.set({ restaurantId: scoped })
    return true
  }

  /** Any restaurantId the client tried to provide (body / params / query / header). */
  private suppliedRestaurantId(req: {
    body?: Record<string, unknown>
    params?: Record<string, unknown>
    query?: Record<string, unknown>
    headers?: Record<string, unknown>
  }): string | undefined {
    const sources = [req.body, req.params, req.query]
    for (const src of sources) {
      const v = src?.['restaurantId']
      if (typeof v === 'string' && v.length > 0) return v
    }
    const h = req.headers?.['x-restaurant-id']
    if (typeof h === 'string' && h.length > 0) return h
    return undefined
  }
}
