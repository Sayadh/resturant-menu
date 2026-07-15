import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Request } from 'express'
import { createHash } from 'node:crypto'
import { AuthService, type IssueContext } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { Public } from '../common/decorators/public.decorator'

@Public()
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Brute-force protection: 10 login attempts per 15 minutes per IP.
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto.email, dto.password, this.ctx(req))
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, this.ctx(req))
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken)
  }

  private ctx(req: Request): IssueContext {
    return {
      userAgent: req.headers['user-agent'] ?? null,
      ipHash: req.ip ? createHash('sha256').update(req.ip).digest('hex') : null,
    }
  }
}
