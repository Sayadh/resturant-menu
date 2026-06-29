import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/** Injects the resolved tenant id (`req.restaurantId`, set by RestaurantScopeGuard). */
export const RestaurantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null | undefined => {
    return ctx.switchToHttp().getRequest().restaurantId
  },
)
