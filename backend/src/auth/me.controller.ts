import { Controller, Get, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthUser } from '../common/types/auth.types'

/** GET /api/v1/admin/me — current user + restaurant (auth required). */
@Controller('admin')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentUser() current: AuthUser | undefined) {
    if (!current) throw new UnauthorizedException()
    const user = await this.prisma.user.findUnique({
      where: { id: current.sub },
      include: { restaurant: { include: { settings: true } } },
    })
    if (!user || user.deletedAt) throw new UnauthorizedException()
    const { passwordHash, ...safe } = user
    void passwordHash
    return safe
  }
}
