import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export type LimitedResource = 'product' | 'category'

/**
 * Enforces subscription plan limits (source of truth — never trust the client).
 * Starter caps products/categories; Professional & Business are unlimited
 * (limit = null). When a cap is reached we throw a machine-readable error the
 * frontend turns into an "upgrade your plan" dialog.
 */
@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanCreate(restaurantId: string, resource: LimitedResource): Promise<void> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { plan: { select: { maxProducts: true, maxCategories: true } } },
    })
    const limit = resource === 'product'
      ? restaurant?.plan?.maxProducts
      : restaurant?.plan?.maxCategories
    if (limit == null) return // no plan or unlimited

    const count = resource === 'product'
      ? await this.prisma.product.count({ where: { restaurantId, deletedAt: null } })
      : await this.prisma.category.count({ where: { restaurantId, deletedAt: null } })

    if (count >= limit) {
      throw new ForbiddenException({
        message: 'PLAN_LIMIT_REACHED',
        errors: [{ code: 'PLAN_LIMIT_REACHED', field: resource, message: String(limit) }],
      })
    }
  }
}
