import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Restaurant } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

interface TranslationRow {
  language: { code: string }
  name: string
  description: string | null
}

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private normalizeHost(host: string): string {
    return host.toLowerCase().split(':')[0].replace(/^www\./, '')
  }

  private summary(r: Restaurant) {
    return { id: r.id, slug: r.slug, name: r.name, themeId: r.themeId }
  }

  private findBySlug(slug: string) {
    return this.prisma.restaurant.findFirst({
      where: { slug: slug.toLowerCase(), isActive: true, deletedAt: null },
    })
  }

  /** host (custom domain → subdomain) or slug → restaurant summary. */
  async resolve(host?: string, slug?: string) {
    if (host) {
      const h = this.normalizeHost(host)

      const domain = await this.prisma.domain.findFirst({
        where: { domain: h, isVerified: true, deletedAt: null, restaurant: { isActive: true, deletedAt: null } },
        include: { restaurant: true },
      })
      if (domain) return this.summary(domain.restaurant)

      const base = this.config.get<string>('publicBaseDomain')
      if (base && h.endsWith(`.${base}`)) {
        const sub = h.slice(0, h.length - base.length - 1).split('.').pop()
        if (sub) {
          const r = await this.findBySlug(sub)
          if (r) return this.summary(r)
        }
      }
    }

    if (slug) {
      const r = await this.findBySlug(slug)
      if (r) return this.summary(r)
    }

    throw new NotFoundException('Restaurant not found')
  }

  /** Public profile + settings + active languages. */
  async getRestaurantBySlug(slug: string) {
    const r = await this.prisma.restaurant.findFirst({
      where: { slug: slug.toLowerCase(), isActive: true, deletedAt: null },
      include: {
        settings: true,
        theme: true,
        translations: { include: { language: true } },
        languages: { include: { language: true }, orderBy: { sortOrder: 'asc' } },
      },
    })
    if (!r) throw new NotFoundException('Restaurant not found')

    return {
      restaurant: {
        id: r.id,
        slug: r.slug,
        name: r.name,
        themeId: r.themeId,
        logoUrl: r.logoUrl,
        coverImageUrl: r.coverImageUrl,
        address: r.address,
        phone: r.phone,
        workingHoursText: r.workingHoursText,
        rating: r.rating,
        currency: r.currency,
      },
      theme: r.theme ? { id: r.theme.id, key: r.theme.key } : null,
      settings: r.settings,
      translations: r.translations.map((t) => ({ tagline: t.tagline, language: { code: t.language.code } })),
      languages: r.languages.map((rl) => ({
        code: rl.language.code,
        name: rl.language.name,
        nativeName: rl.language.nativeName,
        isDefault: rl.isDefault,
      })),
    }
  }

  private pick(rows: TranslationRow[], lang: string, fallback?: string): TranslationRow | undefined {
    return (
      rows.find((t) => t.language.code === lang) ??
      (fallback ? rows.find((t) => t.language.code === fallback) : undefined) ??
      rows[0]
    )
  }

  /** Normalized menu: categories + products localized to `lang` (with fallback). */
  async getMenu(restaurantId: string, langParam?: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, isActive: true, deletedAt: null },
      include: { defaultLanguage: true },
    })
    if (!restaurant) throw new NotFoundException('Restaurant not found')

    const fallback = restaurant.defaultLanguage?.code ?? 'hy'
    const lang = langParam || fallback

    const [cats, prods] = await Promise.all([
      this.prisma.category.findMany({
        where: { restaurantId, isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        include: { translations: { include: { language: true } } },
      }),
      this.prisma.product.findMany({
        where: { restaurantId, isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        include: {
          translations: { include: { language: true } },
          images: true,
          badges: { include: { badge: true } },
        },
      }),
    ])

    const sectionByCat = new Map(cats.map((c) => [c.id, c.section]))

    return {
      restaurant: {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        themeId: restaurant.themeId,
        logoUrl: restaurant.logoUrl,
        coverImageUrl: restaurant.coverImageUrl,
        currency: restaurant.currency,
      },
      language: lang,
      categories: cats.map((c) => {
        const t = this.pick(c.translations, lang, fallback)
        return {
          id: c.id,
          section: c.section,
          parentId: c.parentId,
          icon: c.icon,
          image: c.imageUrl,
          sortOrder: c.sortOrder,
          name: t?.name ?? '',
          description: t?.description ?? '',
        }
      }),
      products: prods.map((p) => {
        const t = this.pick(p.translations, lang, fallback)
        const main = p.images.find((i) => i.isMain) ?? p.images[0]
        return {
          id: p.id,
          categoryId: p.categoryId,
          section: sectionByCat.get(p.categoryId) ?? null,
          price: p.price,
          oldPrice: p.oldPrice,
          isAvailable: p.isAvailable,
          isPopular: p.isPopular,
          isNew: p.isNew,
          isRecommended: p.isRecommended,
          sortOrder: p.sortOrder,
          name: t?.name ?? '',
          description: t?.description ?? '',
          image: main?.url ?? null,
          images: p.images.map((i) => i.url),
          badges: p.badges.map((pb) => pb.badge.key),
        }
      }),
    }
  }

  /** Weekly hours + a computed "open now" in the restaurant's timezone. */
  async getHours(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, deletedAt: null },
      select: { timezone: true },
    })
    if (!restaurant) throw new NotFoundException('Restaurant not found')

    const hours = await this.prisma.restaurantWorkingHour.findMany({
      where: { restaurantId },
      orderBy: [{ dayOfWeek: 'asc' }, { sortOrder: 'asc' }],
    })

    return { hours, openNow: this.computeOpenNow(hours, restaurant.timezone) }
  }

  private computeOpenNow(
    hours: { dayOfWeek: string; openTime: string | null; closeTime: string | null; isClosed: boolean }[],
    timezone: string,
  ): boolean {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone || 'UTC',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date())

      const wd = parts.find((p) => p.type === 'weekday')?.value ?? ''
      let hh = parts.find((p) => p.type === 'hour')?.value ?? '00'
      if (hh === '24') hh = '00'
      const mm = parts.find((p) => p.type === 'minute')?.value ?? '00'
      const now = `${hh}:${mm}`

      const map: Record<string, string> = {
        Mon: 'MON', Tue: 'TUE', Wed: 'WED', Thu: 'THU', Fri: 'FRI', Sat: 'SAT', Sun: 'SUN',
      }
      const today = map[wd]
      return hours.some(
        (h) => h.dayOfWeek === today && !h.isClosed && h.openTime && h.closeTime && h.openTime <= now && now < h.closeTime,
      )
    } catch {
      return false
    }
  }
}
