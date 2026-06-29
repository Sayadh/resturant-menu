import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthUser } from '../types/auth.types'

/** Injects the authenticated user (`req.user`) into a handler param. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    return ctx.switchToHttp().getRequest().user
  },
)
