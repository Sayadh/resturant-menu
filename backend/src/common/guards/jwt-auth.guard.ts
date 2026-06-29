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
import type { AuthUser } from '../types/auth.types'

/**
 * Global guard. Allows @Public() routes; otherwise verifies the Bearer access
 * token and attaches the decoded user to the request + request context.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
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

    try {
      const payload = await this.jwt.verifyAsync<AuthUser>(header.slice(7))
      req.user = payload
      RequestContext.set({ user: payload })
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
