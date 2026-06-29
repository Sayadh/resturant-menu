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
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CategoryListQueryDto } from './dto/category-list.query.dto'
import { ReorderDto } from '../common/dto/reorder.dto'
import { RestaurantScopeGuard } from '../common/guards/restaurant-scope.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { RestaurantId } from '../common/decorators/restaurant-id.decorator'

@UseGuards(RestaurantScopeGuard)
@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@RestaurantId() rid: string, @Query() query: CategoryListQueryDto) {
    return this.categories.list(rid, query)
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  create(@RestaurantId() rid: string, @Body() dto: CreateCategoryDto) {
    return this.categories.create(rid, dto)
  }

  // Declared before ':id' so the static segment wins.
  @Patch('reorder')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  reorder(@RestaurantId() rid: string, @Body() dto: ReorderDto) {
    return this.categories.reorder(rid, dto.items)
  }

  @Get(':id')
  get(@RestaurantId() rid: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.categories.get(rid, id)
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  update(
    @RestaurantId() rid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categories.update(rid, id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  remove(
    @RestaurantId() rid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('cascade') cascade?: string,
  ) {
    return this.categories.remove(rid, id, cascade === 'true')
  }
}
