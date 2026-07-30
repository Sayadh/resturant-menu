import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { RequestContext } from '../context/request-context'
import { PrismaService } from '../../prisma/prisma.service'
import { isTokenStale } from '../../auth/token-freshness'
import type { AuthUser } from '../types/auth.types'

/**
 * Global guard. Allows @Public() routes; otherwise verifies the Bearer access
 * token and attaches the decoded user to the request + request context.
 *
 * Beyond signature/expiry it also enforces token FRESHNESS (HIGH-3): an access
 * token minted before the user's last credential change is rejected, so a
 * password reset takes effect immediately instead of after the 15-minute TTL.
 * This costs one primary-key lookup per authenticated request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (isPublic) return true

    const req = ctx.switchToHttp().getRequest()
    const header: string | undefined = req.headers?.authorization
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token')
    }

    let payload: AuthUser
    try {
      payload = await this.jwt.verifyAsync<AuthUser>(header.slice(7))
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    // One lookup covers two checks: token freshness (HIGH-3) and the tenant's
    // status (MED-5), which RestaurantScopeGuard enforces right after us.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        passwordChangedAt: true,
        restaurant: { select: { isActive: true, deletedAt: true } },
      },
    })
    // A token for a user that no longer exists is not usable either.
    if (!user) throw new UnauthorizedException('Invalid or expired token')
    if (isTokenStale(payload.iat, user.passwordChangedAt)) {
      throw new UnauthorizedException('Session expired, please sign in again')
    }

    // Stashed, not enforced here: /admin/me must stay reachable so a suspended
    // owner can sign in and be shown why the rest of the admin is closed.
    req.tenantStatus = user.restaurant ?? null
    req.user = payload
    RequestContext.set({ user: payload })
    return true
  }
}
