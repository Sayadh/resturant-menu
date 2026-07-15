import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { UserRole } from '@prisma/client'
import { AiService } from './ai.service'
import { TranslateDto, DescribeDto } from './dto/ai.dto'
import { RestaurantScopeGuard } from '../common/guards/restaurant-scope.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { RestaurantId } from '../common/decorators/restaurant-id.decorator'

// Per-minute burst limit (20/min); the monthly quota is enforced in AiService.
@Throttle({ default: { limit: 20, ttl: 60_000 } })
@UseGuards(RestaurantScopeGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('translate')
  translate(@RestaurantId() rid: string, @Body() dto: TranslateDto) {
    return this.ai
      .translate(rid, dto.text, dto.source, dto.targets)
      .then((translations) => ({ translations }))
  }

  @Post('describe')
  describe(@RestaurantId() rid: string, @Body() dto: DescribeDto) {
    return this.ai.describe(rid, dto.name, dto.langs).then((descriptions) => ({ descriptions }))
  }
}
