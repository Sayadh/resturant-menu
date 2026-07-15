import { Body, Controller, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Request } from 'express'
import { PublicService } from './public.service'
import { LeadService } from './lead.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { Public } from '../common/decorators/public.decorator'

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

  @Get('resolve')
  resolve(@Query('host') host?: string, @Query('slug') slug?: string) {
    return this.svc.resolve(host, slug)
  }

  @Get('restaurants')
  list() {
    return this.svc.listRestaurants()
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
