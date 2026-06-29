import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { AvailabilityDto } from './dto/availability.dto'
import { ProductListQueryDto } from './dto/product-list.query.dto'
import { ReorderDto } from '../common/dto/reorder.dto'
import { RestaurantScopeGuard } from '../common/guards/restaurant-scope.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { RestaurantId } from '../common/decorators/restaurant-id.decorator'

@UseGuards(RestaurantScopeGuard)
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@RestaurantId() rid: string, @Query() query: ProductListQueryDto) {
    return this.products.list(rid, query)
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  create(@RestaurantId() rid: string, @Body() dto: CreateProductDto) {
    return this.products.create(rid, dto)
  }

  // Static segment before ':id'.
  @Patch('reorder')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  reorder(@RestaurantId() rid: string, @Body() dto: ReorderDto) {
    return this.products.reorder(rid, dto.items)
  }

  @Get(':id')
  get(@RestaurantId() rid: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.products.get(rid, id)
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  update(
    @RestaurantId() rid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(rid, id, dto)
  }

  // Quick availability toggle — also allowed for employees.
  @Patch(':id/availability')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  setAvailability(
    @RestaurantId() rid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AvailabilityDto,
  ) {
    return this.products.setAvailability(rid, id, dto.isAvailable)
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  remove(@RestaurantId() rid: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.products.remove(rid, id)
  }
}
