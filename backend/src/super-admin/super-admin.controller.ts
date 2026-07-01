import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { SuperAdminService } from './super-admin.service'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { SuperAdmin } from '../common/decorators/roles.decorator'

// Platform-level administration. SUPER_ADMIN only (JWT required; not tenant-scoped).
@SuperAdmin()
@Controller('super-admin/restaurants')
export class SuperAdminController {
  constructor(private readonly svc: SuperAdminService) {}

  @Get()
  list() {
    return this.svc.listRestaurants()
  }

  @Post()
  create(@Body() dto: CreateRestaurantDto) {
    return this.svc.createRestaurant(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRestaurantDto) {
    return this.svc.updateRestaurant(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.deleteRestaurant(id)
  }
}
