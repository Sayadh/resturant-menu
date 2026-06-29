import { Controller, Get, Param, Query } from '@nestjs/common'
import { PublicService } from './public.service'
import { Public } from '../common/decorators/public.decorator'

/** Unauthenticated public menu API consumed by the customer-facing frontend. */
@Public()
@Controller('public')
export class PublicController {
  constructor(private readonly svc: PublicService) {}

  @Get('resolve')
  resolve(@Query('host') host?: string, @Query('slug') slug?: string) {
    return this.svc.resolve(host, slug)
  }

  @Get('restaurants/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.svc.getRestaurantBySlug(slug)
  }

  @Get('restaurants/:id/menu')
  menu(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.svc.getMenu(id, lang)
  }

  @Get('restaurants/:id/hours')
  hours(@Param('id') id: string) {
    return this.svc.getHours(id)
  }
}
