import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'

const SECTION_DEFS: { icon: string; name: Record<string, string> }[] = [
  { icon: '🍽', name: { hy: 'Ուտեստներ', en: 'Food', ru: 'Блюда' } },
  { icon: '🥤', name: { hy: 'Ըմպելիքներ', en: 'Drinks', ru: 'Напитки' } },
  { icon: '🍷', name: { hy: 'Ալկոհոլ', en: 'Alcohol', ru: 'Алкоголь' } },
]

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
        _count: { select: { categories: true, products: true, sections: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      themeKey: r.theme?.key ?? null,
      planKey: r.plan?.key ?? 'free',
      isActive: r.isActive,
      sections: r._count.sections,
      categories: r._count.categories,
      products: r._count.products,
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
    const password = dto.ownerPassword || 'password123'
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
