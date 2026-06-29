import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { RestaurantService } from './restaurant.service'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'
import { RestaurantScopeGuard } from '../common/guards/restaurant-scope.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { RestaurantId } from '../common/decorators/restaurant-id.decorator'

/**
 * Admin restaurant management. Tenant id always comes from the JWT
 * (RestaurantScopeGuard), never from the request body or URL.
 */
@UseGuards(RestaurantScopeGuard)
@Controller('admin/restaurant')
export class RestaurantController {
  constructor(private readonly restaurant: RestaurantService) {}

  @Get()
  get(@RestaurantId() restaurantId: string) {
    return this.restaurant.getOwn(restaurantId)
  }

  @Patch()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  update(@RestaurantId() restaurantId: string, @Body() dto: UpdateRestaurantDto) {
    return this.restaurant.updateInfo(restaurantId, dto)
  }

  @Patch('settings')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  updateSettings(@RestaurantId() restaurantId: string, @Body() dto: UpdateSettingsDto) {
    return this.restaurant.updateSettings(restaurantId, dto)
  }

  @Patch('theme')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  updateTheme(@RestaurantId() restaurantId: string, @Body() dto: UpdateThemeDto) {
    return this.restaurant.updateTheme(restaurantId, dto.themeId)
  }
}
