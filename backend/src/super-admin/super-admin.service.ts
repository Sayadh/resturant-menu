import { BadRequestException, Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { generateInitialPassword } from '../common/utils/password'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { addMonths, formatDay, parseDay } from './billing'

const SECTION_DEFS: { icon: string; name: Record<string, string> }[] = [
  { icon: '🍽', name: { hy: 'Ուտեստներ', en: 'Food', ru: 'Блюда' } },
  { icon: '🥤', name: { hy: 'Ըմպելիքներ', en: 'Drinks', ru: 'Напитки' } },
  { icon: '🍷', name: { hy: 'Ալկոհոլ', en: 'Alcohol', ru: 'Алкоголь' } },
]

const PAYMENT_SELECT = { id: true, paidAt: true, months: true, paidUntil: true, createdAt: true } as const

/** DATE columns come back as UTC-midnight Dates — send them as plain days. */
const toPayment = (p: { id: string; paidAt: Date; months: number; paidUntil: Date; createdAt: Date }) => ({
  id: p.id,
  paidAt: formatDay(p.paidAt),
  months: p.months,
  paidUntil: formatDay(p.paidUntil),
  createdAt: p.createdAt,
})

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  /** All restaurants on the platform, with a quick content count. */
  async listRestaurants() {
    const rows = await this.prisma.restaurant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        theme: true,
        plan: { select: { key: true } },
        users: { where: { role: UserRole.OWNER }, select: { email: true }, orderBy: { createdAt: 'asc' }, take: 1 },
        _count: { select: { categories: true, products: true, sections: true } },
        // The period that runs longest is the one the table shows.
        payments: { orderBy: { paidUntil: 'desc' }, take: 1, select: PAYMENT_SELECT },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      themeKey: r.theme?.key ?? null,
      planKey: r.plan?.key ?? 'free',
      isActive: r.isActive,
      address: r.address ?? null,
      phone: r.phone ?? null,
      ownerEmail: r.users[0]?.email ?? null,
      sections: r._count.sections,
      categories: r._count.categories,
      products: r._count.products,
      payment: r.payments[0] ? toPayment(r.payments[0]) : null,
      createdAt: r.createdAt,
    }))
  }

  /** Create a new tenant: restaurant + languages + default sections + owner user. */
  async createRestaurant(dto: CreateRestaurantDto) {
    const slug = dto.slug.toLowerCase().trim()
    const exists = await this.prisma.restaurant.findFirst({ where: { slug } })
    if (exists) throw new ConflictException('A restaurant with this slug already exists')

    const langs = await this.prisma.language.findMany()
    const defaultLang = dto.defaultLang || 'hy'
    const defaultLanguage = langs.find((l) => l.code === defaultLang) ?? langs[0]
    const theme = await this.prisma.theme.findFirst({ where: { key: dto.themeKey || 'aria' } })

    const restaurant = await this.prisma.restaurant.create({
      data: {
        slug,
        name: dto.name,
        currency: 'AMD',
        timezone: 'Asia/Yerevan',
        themeId: theme?.id ?? null,
        defaultLanguageId: defaultLanguage?.id ?? null,
        settings: { create: {} },
        languages: {
          create: langs.map((l, i) => ({ languageId: l.id, sortOrder: i, isDefault: l.code === defaultLang })),
        },
        sections: {
          create: SECTION_DEFS.map((def, i) => ({
            icon: def.icon,
            sortOrder: i,
            translations: { create: langs.map((l) => ({ languageId: l.id, name: def.name[l.code] ?? def.name.en })) },
          })),
        },
      },
    })

    const email = dto.ownerEmail?.toLowerCase().trim() || `owner@${slug}.test`
    // No shared constant here: a fixed fallback plus the predictable
    // `owner@<slug>.test` address and the public restaurant list would make
    // every auto-provisioned tenant takeover-able. The generated value is
    // returned once (below) for the super-admin to hand over.
    const password = dto.ownerPassword || generateInitialPassword()
    await this.prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: UserRole.OWNER,
        restaurantId: restaurant.id,
      },
    })

    return {
      restaurant: { id: restaurant.id, slug: restaurant.slug, name: restaurant.name },
      owner: { email, password },
    }
  }

  /** Update platform-level fields of any restaurant (name/theme/lang/active). */
  async updateRestaurant(id: string, dto: UpdateRestaurantDto) {
    const existing = await this.prisma.restaurant.findFirst({ where: { id, deletedAt: null } })
    if (!existing) throw new NotFoundException('Restaurant not found')

    const data: Record<string, unknown> = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.isActive !== undefined) data.isActive = dto.isActive
    if (dto.address !== undefined) data.address = dto.address.trim() || null
    if (dto.phone !== undefined) data.phone = dto.phone.trim() || null
    if (dto.themeKey !== undefined) {
      const theme = await this.prisma.theme.findFirst({ where: { key: dto.themeKey } })
      data.themeId = theme?.id ?? null
    }
    if (dto.defaultLang !== undefined) {
      const lang = await this.prisma.language.findFirst({ where: { code: dto.defaultLang } })
      if (lang) data.defaultLanguageId = lang.id
    }
    if (dto.planKey !== undefined) {
      const plan = await this.prisma.plan.findUnique({ where: { key: dto.planKey } })
      if (!plan) throw new NotFoundException('Plan not found (run the seed to create plans)')
      data.planId = plan.id
    }

    await this.prisma.restaurant.update({ where: { id }, data })

    // Owner login: change email and/or reset password (super-admin only).
    if (dto.ownerEmail !== undefined || dto.ownerPassword !== undefined) {
      await this.upsertOwnerCredentials(id, dto.ownerEmail, dto.ownerPassword)
    }
    return { ok: true }
  }

  /** Set the OWNER user's login email / password for a restaurant. */
  private async upsertOwnerCredentials(restaurantId: string, email?: string, password?: string) {
    const owner = await this.prisma.user.findFirst({
      where: { restaurantId, role: UserRole.OWNER },
      orderBy: { createdAt: 'asc' },
    })

    const newEmail = email?.toLowerCase().trim()
    if (newEmail) {
      const clash = await this.prisma.user.findFirst({
        where: { email: newEmail, id: owner ? { not: owner.id } : undefined },
      })
      if (clash) throw new ConflictException('This email is already in use')
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined

    if (owner) {
      const patch: Record<string, unknown> = {}
      if (newEmail) patch.email = newEmail
      if (passwordHash) patch.passwordHash = passwordHash
      if (!Object.keys(patch).length) return

      // A credential change must evict every existing session (HIGH-3):
      //  • passwordChangedAt invalidates already-issued ACCESS tokens
      //  • revoking the refresh tokens stops them being rotated forever
      // Both run with the credential write in ONE transaction so we can never
      // end up with a new password but still-valid old sessions (or vice versa).
      const changedAt = new Date()
      patch.passwordChangedAt = changedAt
      await this.prisma.$transaction([
        this.prisma.user.update({ where: { id: owner.id }, data: patch }),
        this.prisma.refreshToken.updateMany({
          where: { userId: owner.id, revokedAt: null },
          data: { revokedAt: changedAt },
        }),
      ])
      return
    }

    // No owner yet → create one (requires both email and password).
    if (newEmail && passwordHash) {
      await this.prisma.user.create({
        data: { email: newEmail, passwordHash, role: UserRole.OWNER, restaurantId },
      })
    }
  }

  // ── subscription payments ────────────────────────────────────────────

  private async ensureRestaurant(id: string) {
    const r = await this.prisma.restaurant.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
    if (!r) throw new NotFoundException('Restaurant not found')
  }

  /** Every payment of a restaurant, newest period first. */
  async listPayments(restaurantId: string) {
    await this.ensureRestaurant(restaurantId)
    const rows = await this.prisma.restaurantPayment.findMany({
      where: { restaurantId },
      orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
      select: PAYMENT_SELECT,
    })
    return rows.map(toPayment)
  }

  /** Record "paid for N months starting on that day" (past, today or future). */
  async addPayment(restaurantId: string, dto: CreatePaymentDto, createdById?: string) {
    const paidAt = parseDay(dto.paidAt)
    if (!paidAt) throw new BadRequestException('paidAt is not a real calendar day')
    const year = paidAt.getUTCFullYear()
    if (year < 2020 || year > 2100) throw new BadRequestException('paidAt is out of range')

    await this.ensureRestaurant(restaurantId)
    const row = await this.prisma.restaurantPayment.create({
      data: {
        restaurantId,
        paidAt,
        months: dto.months,
        paidUntil: addMonths(paidAt, dto.months),
        createdById: createdById ?? null,
      },
      select: PAYMENT_SELECT,
    })
    return toPayment(row)
  }

  /** Remove a payment recorded by mistake (scoped to its restaurant). */
  async deletePayment(restaurantId: string, paymentId: string) {
    const { count } = await this.prisma.restaurantPayment.deleteMany({ where: { id: paymentId, restaurantId } })
    if (!count) throw new NotFoundException('Payment not found')
    return { ok: true }
  }

  /** Permanently delete a restaurant and all its content (cascade). */
  async deleteRestaurant(id: string) {
    const existing = await this.prisma.restaurant.findFirst({ where: { id } })
    if (!existing) throw new NotFoundException('Restaurant not found')
    await this.prisma.restaurant.delete({ where: { id } })
    return { ok: true }
  }
}
