import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'
import { ROLES_KEY } from '../decorators/roles.decorator'
import type { AuthUser } from '../types/auth.types'

/** Global guard. No @Roles() → allowed. SUPER_ADMIN bypasses all role checks. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (!required || required.length === 0) return true

    const user: AuthUser | undefined = ctx.switchToHttp().getRequest().user
    if (!user) throw new ForbiddenException('Not authenticated')
    if (user.role === UserRole.SUPER_ADMIN) return true
    if (!required.includes(user.role)) throw new ForbiddenException('Insufficient role')
    return true
  }
}
