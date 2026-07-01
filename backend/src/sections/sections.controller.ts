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
import { SectionsService } from './sections.service'
import { CreateSectionDto } from './dto/create-section.dto'
import { UpdateSectionDto } from './dto/update-section.dto'
import { ReorderDto } from '../common/dto/reorder.dto'
import { RestaurantScopeGuard } from '../common/guards/restaurant-scope.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { RestaurantId } from '../common/decorators/restaurant-id.decorator'

@UseGuards(RestaurantScopeGuard)
@Controller('admin/sections')
export class SectionsController {
  constructor(private readonly sections: SectionsService) {}

  @Get()
  list(@RestaurantId() rid: string) {
    return this.sections.list(rid)
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  create(@RestaurantId() rid: string, @Body() dto: CreateSectionDto) {
    return this.sections.create(rid, dto)
  }

  @Patch('reorder')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  reorder(@RestaurantId() rid: string, @Body() dto: ReorderDto) {
    return this.sections.reorder(rid, dto.items)
  }

  @Get(':id')
  get(@RestaurantId() rid: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.sections.get(rid, id)
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  update(@RestaurantId() rid: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSectionDto) {
    return this.sections.update(rid, id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  remove(
    @RestaurantId() rid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('cascade') cascade?: string,
  ) {
    return this.sections.remove(rid, id, cascade === 'true')
  }
}
