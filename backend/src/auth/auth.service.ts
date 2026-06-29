import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { createHash, randomBytes } from 'node:crypto'
import type { User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { durationToMs } from '../common/utils/duration'
import type { AuthUser } from '../common/types/auth.types'

export interface IssueContext {
  userAgent?: string | null
  ipHash?: string | null
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private sha256(raw: string): string {
    return createHash('sha256').update(raw).digest('hex')
  }

  private sanitize(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
    }
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true, deletedAt: null },
    })
    if (!user) throw new UnauthorizedException('Invalid email or password')
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new UnauthorizedException('Invalid email or password')
    return user
  }

  /** Sign a short-lived access token + create a long-lived opaque refresh token (hash stored). */
  private async issueTokens(user: User, ctx?: IssueContext) {
    const payload: AuthUser = { sub: user.id, role: user.role, restaurantId: user.restaurantId }
    const accessToken = await this.jwt.signAsync(payload) // uses global JwtModule secret + expiry

    const refreshToken = randomBytes(48).toString('hex')
    const ttl = durationToMs(this.config.get<string>('jwt.refreshExpiresIn') ?? '30d') || 30 * 86_400_000
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.sha256(refreshToken),
        userAgent: ctx?.userAgent ?? null,
        ipHash: ctx?.ipHash ?? null,
        expiresAt: new Date(Date.now() + ttl),
      },
    })
    return { accessToken, refreshToken }
  }

  async login(email: string, password: string, ctx?: IssueContext) {
    const user = await this.validateUser(email, password)
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    const tokens = await this.issueTokens(user, ctx)
    return { ...tokens, user: this.sanitize(user) }
  }

  /** Rotate: validate the presented refresh token, revoke it, issue a fresh pair. */
  async refresh(rawToken: string, ctx?: IssueContext) {
    const existing = await this.prisma.refreshToken.findFirst({
      where: { tokenHash: this.sha256(rawToken), revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    })
    if (!existing || !existing.user || existing.user.deletedAt || !existing.user.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    })
    return this.issueTokens(existing.user, ctx)
  }

  async logout(rawToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.sha256(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return { ok: true }
  }
}
