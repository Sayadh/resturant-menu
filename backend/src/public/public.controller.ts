import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Request } from 'express'
import { PublicService } from './public.service'
import { LeadService } from './lead.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { SearchMenuDto } from './dto/search-menu.dto'
import { Public } from '../common/decorators/public.decorator'
import { PublicCache } from '../common/decorators/public-cache.decorator'

/** Unauthenticated public menu API consumed by the customer-facing frontend. */
@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly svc: PublicService,
    private readonly leads: LeadService,
  ) {}

  // POST /api/v1/public/lead — landing "Get started" form → Telegram.
  // Public + unauthenticated → tight anti-spam limit (5/min/IP).
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('lead')
  @HttpCode(200)
  lead(@Body() dto: CreateLeadDto, @Req() req: Request) {
    return this.leads.submit(dto, { ua: req.headers['user-agent'] })
  }

  @PublicCache()
  @Get('resolve')
  resolve(@Query('host') host?: string, @Query('slug') slug?: string) {
    return this.svc.resolve(host, slug)
  }

  @PublicCache()
  @Get('restaurants')
  list() {
    return this.svc.listRestaurants()
  }

  @PublicCache()
  @Get('restaurants/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.svc.getRestaurantBySlug(slug)
  }

  @PublicCache()
  @Get('restaurants/:id/menu')
  menu(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.svc.getMenu(id, lang)
  }

  // GET /api/v1/public/restaurants/:id/search?q=cola&lang=hy
  // A live query per call (not cached — see PublicService.search), so it gets
  // its own limit. Generous enough for a full dining room behind one Wi-Fi IP
  // typing at once (the client debounces and waits for two letters).
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  @Get('restaurants/:id/search')
  search(@Param('id', new ParseUUIDPipe()) id: string, @Query() dto: SearchMenuDto) {
    return this.svc.search(id, dto.q, dto.lang)
  }

  @PublicCache()
  @Get('restaurants/:id/hours')
  hours(@Param('id') id: string) {
    return this.svc.getHours(id)
  }
}
