import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'
import { SuperAdminService } from './super-admin.service'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { SuperAdmin } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthUser } from '../common/types/auth.types'
import { CreatePaymentDto } from './dto/create-payment.dto'

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

  // ── subscription payments ────────────────────────────────────────────
  @Get(':id/payments')
  payments(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.listPayments(id)
  }

  @Post(':id/payments')
  addPayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: AuthUser | undefined,
  ) {
    return this.svc.addPayment(id, dto, user?.sub)
  }

  @Delete(':id/payments/:paymentId')
  removePayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('paymentId', new ParseUUIDPipe()) paymentId: string,
  ) {
    return this.svc.deletePayment(id, paymentId)
  }
}
