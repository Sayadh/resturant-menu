import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { UploadsService } from '../uploads/uploads.service'

@Injectable()
export class RestaurantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  private readonly include = {
    settings: true,
    theme: true,
    plan: { select: { key: true, name: true, maxProducts: true, maxCategories: true } },
    translations: { include: { language: true } },
    languages: { include: { language: true }, orderBy: { sortOrder: 'asc' as const } },
    defaultLanguage: true,
  }

  async getOwn(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, deletedAt: null },
      include: this.include,
    })
    if (!restaurant) throw new NotFoundException('Restaurant not found')
    // Unassigned restaurants fall back to the Starter (free) plan so the admin
    // shows the right plan + limits and enforcement stays consistent.
    if (!restaurant.plan) {
      const free = await this.prisma.plan.findUnique({ where: { key: 'free' } })
      if (free) (restaurant as { plan: unknown }).plan = free
    }
    return restaurant
  }

  async updateInfo(restaurantId: string, dto: UpdateRestaurantDto) {
    const before = await this.getOwn(restaurantId) // ensures it exists & is live

    // tagline is trilingual → RestaurantTranslation. workingHours maps to the
    // scalar `workingHoursText` (the `workingHours` name is a relation).
    const { tagline, workingHours, activeLanguages, defaultLanguage, ...scalars } = dto
    void activeLanguages
    void defaultLanguage
    const data = {
      ...scalars,
      ...(workingHours !== undefined ? { workingHoursText: workingHours } : {}),
    }

    if (tagline) {
      const codes = Object.keys(tagline) as (keyof typeof tagline)[]
      const languages = await this.prisma.language.findMany({ where: { code: { in: codes as string[] } } })
      for (const lang of languages) {
        const value = tagline[lang.code as keyof typeof tagline]
        if (value === undefined) continue
        await this.prisma.restaurantTranslation.upsert({
          where: { restaurantId_languageId: { restaurantId, languageId: lang.id } },
          update: { tagline: value },
          create: { restaurantId, languageId: lang.id, tagline: value },
        })
      }
    }

    // Enabled languages + default → single source of truth is RestaurantLanguage.
    if (dto.activeLanguages || dto.defaultLanguage) {
      await this.syncLanguages(restaurantId, dto.activeLanguages, dto.defaultLanguage)
    }

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data,
      include: this.include,
    })

    // Best-effort: if logo/cover was replaced or cleared, drop the old objects.
    const b = before as unknown as { logoUrl?: string | null; coverImageUrl?: string | null }
    if (dto.logoUrl !== undefined && b.logoUrl && b.logoUrl !== dto.logoUrl) {
      await this.uploads.removeByUrl(b.logoUrl)
    }
    if (dto.coverImageUrl !== undefined && b.coverImageUrl && b.coverImageUrl !== dto.coverImageUrl) {
      await this.uploads.removeByUrl(b.coverImageUrl)
    }

    return updated
  }

  /**
   * Reconcile the tenant's enabled languages (RestaurantLanguage) and the
   * default-language FK. Removing a language deletes its join row — its
   * per-language content stays in the DB but is no longer exposed publicly.
   * The default is forced into the active set, and one language always remains.
   */
  private async syncLanguages(restaurantId: string, active?: string[], preferredDefault?: string) {
    // Only the default changed → keep the current active set.
    let codes = active?.length ? [...new Set(active)] : undefined
    if (!codes) {
      const current = await this.prisma.restaurantLanguage.findMany({
        where: { restaurantId },
        include: { language: true },
      })
      codes = current.map((rl) => rl.language.code)
    }
    if (!codes.length) throw new BadRequestException('At least one language is required')

    const langs = await this.prisma.language.findMany({ where: { code: { in: codes } } })
    if (langs.length !== codes.length) throw new BadRequestException('Unknown language code')
    const byCode = new Map(langs.map((l) => [l.code, l]))

    // Default must belong to the active set (fallback to the first active one).
    const defaultCode = preferredDefault && codes.includes(preferredDefault) ? preferredDefault : codes[0]
    const defaultLang = byCode.get(defaultCode)!

    await this.prisma.$transaction(async (tx) => {
      await tx.restaurantLanguage.deleteMany({
        where: { restaurantId, language: { code: { notIn: codes! } } },
      })
      for (let i = 0; i < codes!.length; i++) {
        const lang = byCode.get(codes![i])!
        const isDefault = lang.id === defaultLang.id
        await tx.restaurantLanguage.upsert({
          where: { restaurantId_languageId: { restaurantId, languageId: lang.id } },
          update: { sortOrder: i, isDefault },
          create: { restaurantId, languageId: lang.id, sortOrder: i, isDefault },
        })
      }
      await tx.restaurant.update({
        where: { id: restaurantId },
        data: { defaultLanguageId: defaultLang.id },
      })
    })
  }

  async updateSettings(restaurantId: string, dto: UpdateSettingsDto) {
    await this.getOwn(restaurantId)
    return this.prisma.restaurantSettings.upsert({
      where: { restaurantId },
      update: { ...dto },
      create: { restaurantId, ...dto },
    })
  }

  async updateTheme(restaurantId: string, themeKey: string) {
    await this.getOwn(restaurantId)
    const theme = await this.prisma.theme.findFirst({ where: { key: themeKey, isActive: true } })
    if (!theme) throw new BadRequestException('Theme not found or inactive')
    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { themeId: theme.id },
      include: this.include,
    })
  }
}
