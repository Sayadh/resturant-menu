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
    plan: { select: { key: true, name: true } },
    translations: { include: { language: true } },
  }

  async getOwn(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, deletedAt: null },
      include: this.include,
    })
    if (!restaurant) throw new NotFoundException('Restaurant not found')
    return restaurant
  }

  async updateInfo(restaurantId: string, dto: UpdateRestaurantDto) {
    const before = await this.getOwn(restaurantId) // ensures it exists & is live

    // tagline is trilingual → RestaurantTranslation. workingHours maps to the
    // scalar `workingHoursText` (the `workingHours` name is a relation).
    const { tagline, workingHours, ...scalars } = dto
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
