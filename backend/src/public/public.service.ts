import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Restaurant } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PublicCacheService } from '../common/cache/public-cache.service'

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly cache: PublicCacheService,
  ) {}

  /**
   * Serve `key` from the public cache, else load it and remember it under the
   * tenant it belongs to. Every admin write drops that tenant's entries
   * (CacheInvalidationInterceptor), so this never serves an edited menu stale.
   */
  private async cached<T>(key: string, tenantOf: (value: T) => string | null, load: () => Promise<T>): Promise<T> {
    const hit = this.cache.get<T>(key)
    if (hit !== undefined) return hit
    const value = await load()
    this.cache.set(key, value, tenantOf(value))
    return value
  }

  /** code → id for the three platform languages (they never change at runtime). */
  private langIds: { at: number; byCode: Map<string, string> } | null = null
  private async languageIds(): Promise<Map<string, string>> {
    if (this.langIds && Date.now() - this.langIds.at < 3_600_000) return this.langIds.byCode
    const rows = await this.prisma.language.findMany({ select: { id: true, code: true } })
    this.langIds = { at: Date.now(), byCode: new Map(rows.map((l) => [l.code, l.id])) }
    return this.langIds.byCode
  }

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
    return this.cached(
      `resolve:${host ?? ''}|${slug ?? ''}`,
      (v) => v.id,
      () => this.loadResolve(host, slug),
    )
  }

  private async loadResolve(host?: string, slug?: string) {
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

  /** All active restaurants (for the platform landing). */
  async listRestaurants() {
    // Spans every tenant, so it is stored as a shared entry and dropped on any
    // invalidation rather than being tied to one restaurant.
    return this.cached('restaurants', () => null, () => this.loadRestaurants())
  }

  private async loadRestaurants() {
    const rows = await this.prisma.restaurant.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: 'asc' },
      include: { theme: true, translations: { include: { language: true } } },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      logoUrl: r.logoUrl,
      theme: r.theme ? { id: r.theme.id, key: r.theme.key } : null,
      translations: r.translations.map((t) => ({ tagline: t.tagline, language: { code: t.language.code } })),
    }))
  }

  /** Public profile + settings + active languages. */
  async getRestaurantBySlug(slug: string) {
    return this.cached(
      `rest:${slug.toLowerCase()}`,
      (v) => v.restaurant.id,
      () => this.loadRestaurantBySlug(slug),
    )
  }

  private async loadRestaurantBySlug(slug: string) {
    // `select` everywhere, not `include`: Prisma resolves each relation with its
    // own query, so asking for whole rows (and every language) costs extra round
    // trips to a database that is not in this datacentre.
    const r = await this.prisma.restaurant.findFirst({
      where: { slug: slug.toLowerCase(), isActive: true, deletedAt: null },
      select: {
        id: true,
        slug: true,
        name: true,
        themeId: true,
        logoUrl: true,
        coverImageUrl: true,
        address: true,
        workingHoursText: true,
        rating: true,
        wifiName: true,
        wifiPassword: true,
        languageDisplay: true,
        currency: true,
        showCartTotal: true,
        serviceChargeEnabled: true,
        serviceChargeMode: true,
        serviceChargePercent: true,
        settings: true,
        theme: { select: { id: true, key: true } },
        plan: { select: { key: true } },
        translations: { select: { tagline: true, language: { select: { code: true } } } },
        languages: {
          orderBy: { sortOrder: 'asc' },
          select: {
            isDefault: true,
            language: { select: { code: true, name: true, nativeName: true } },
          },
        },
      },
    })
    if (!r) throw new NotFoundException('Restaurant not found')

    // Ordering (cart) is a paid feature — Professional & Business only.
    const ordering = r.plan?.key === 'pro' || r.plan?.key === 'business'

    return {
      restaurant: {
        id: r.id,
        slug: r.slug,
        name: r.name,
        themeId: r.themeId,
        logoUrl: r.logoUrl,
        coverImageUrl: r.coverImageUrl,
        address: r.address,
        workingHoursText: r.workingHoursText,
        rating: r.rating,
        wifiName: r.wifiName,
        wifiPassword: r.wifiPassword,
        languageDisplay: r.languageDisplay,
        currency: r.currency,
        ordering,
        showCartTotal: r.showCartTotal,
        serviceChargeEnabled: r.serviceChargeEnabled,
        serviceChargeMode: r.serviceChargeMode,
        serviceChargePercent: r.serviceChargePercent,
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

  /** Normalized menu: categories + products localized to `lang` (with fallback). */
  async getMenu(restaurantId: string, langParam?: string) {
    return this.cached(
      `menu:${restaurantId}:${langParam ?? ''}`,
      (v) => v.restaurant.id,
      () => this.loadMenu(restaurantId, langParam),
    )
  }

  private async loadMenu(restaurantId: string, langParam?: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, isActive: true, deletedAt: null },
      select: {
        id: true,
        slug: true,
        name: true,
        themeId: true,
        logoUrl: true,
        coverImageUrl: true,
        currency: true,
        defaultLanguage: { select: { code: true } },
      },
    })
    if (!restaurant) throw new NotFoundException('Restaurant not found')

    const fallback = restaurant.defaultLanguage?.code ?? 'hy'
    const lang = langParam || fallback

    // Only the two languages that can reach the screen are read — a third of the
    // translation rows, and no extra query to resolve `language.code` per row.
    const byCode = await this.languageIds()
    const langId = byCode.get(lang)
    const fallbackId = byCode.get(fallback)
    const langIds = [...new Set([langId, fallbackId].filter(Boolean))] as string[]
    const trWhere = langIds.length ? { where: { languageId: { in: langIds } } } : {}

    const pick = <T extends { languageId: string }>(rows: T[]): T | undefined =>
      (langId ? rows.find((t) => t.languageId === langId) : undefined) ??
      (fallbackId ? rows.find((t) => t.languageId === fallbackId) : undefined) ??
      rows[0]

    const [sections, cats, prods, badgeRows] = await Promise.all([
      this.prisma.section.findMany({
        where: { restaurantId, isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          icon: true,
          imageUrl: true,
          sortOrder: true,
          translations: { ...trWhere, select: { languageId: true, name: true } },
        },
      }),
      this.prisma.category.findMany({
        where: { restaurantId, isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          sectionId: true,
          parentId: true,
          icon: true,
          iconUrl: true,
          imageUrl: true,
          imageHiResUrl: true,
          imageFocalX: true,
          imageFocalY: true,
          mobileImageUrl: true,
          bannerTextColor: true,
          sortOrder: true,
          translations: { ...trWhere, select: { languageId: true, name: true, description: true } },
        },
      }),
      this.prisma.product.findMany({
        where: { restaurantId, isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          categoryId: true,
          price: true,
          oldPrice: true,
          isAvailable: true,
          isPopular: true,
          isNew: true,
          isRecommended: true,
          sortOrder: true,
          showImage: true,
          translations: { ...trWhere, select: { languageId: true, name: true, description: true } },
          images: { select: { url: true, hiResUrl: true, focalX: true, focalY: true, isMain: true } },
          // Just the id — the key comes from the badge catalogue fetched
          // alongside, which saves a second hop per product.
          badges: { select: { badgeId: true } },
        },
      }),
      this.prisma.badge.findMany({
        where: { OR: [{ restaurantId: null }, { restaurantId }] },
        select: { id: true, key: true },
      }),
    ])

    const sectionByCat = new Map(cats.map((c) => [c.id, c.sectionId]))
    const badgeKey = new Map(badgeRows.map((b) => [b.id, b.key]))

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
      sections: sections.map((s) => ({
        id: s.id,
        icon: s.icon,
        image: s.imageUrl,
        sortOrder: s.sortOrder,
        name: pick(s.translations)?.name ?? '',
      })),
      categories: cats.map((c) => {
        const t = pick(c.translations)
        return {
          id: c.id,
          sectionId: c.sectionId,
          parentId: c.parentId,
          icon: c.icon,
          iconImage: c.iconUrl,
          image: c.imageUrl,
          imageHiRes: c.imageHiResUrl,
          // NULL reads as 50 so pre-crop rows stay centred.
          imageFocalX: c.imageFocalX ?? 50,
          imageFocalY: c.imageFocalY ?? 50,
          mobileImage: c.mobileImageUrl,
          bannerTextColor: c.bannerTextColor,
          sortOrder: c.sortOrder,
          name: t?.name ?? '',
          description: t?.description ?? '',
        }
      }),
      products: prods.map((p) => {
        const t = pick(p.translations)
        const main = p.images.find((i) => i.isMain) ?? p.images[0]
        return {
          id: p.id,
          categoryId: p.categoryId,
          sectionId: sectionByCat.get(p.categoryId) ?? null,
          price: p.price,
          oldPrice: p.oldPrice,
          isAvailable: p.isAvailable,
          isPopular: p.isPopular,
          isNew: p.isNew,
          isRecommended: p.isRecommended,
          sortOrder: p.sortOrder,
          name: t?.name ?? '',
          description: t?.description ?? '',
          // The admin can turn the picture off per dish. When off the public
          // menu gets no image at all -- not even the placeholder.
          showImage: p.showImage,
          image: p.showImage ? (main?.url ?? null) : null,
          imageHiRes: p.showImage ? (main?.hiResUrl ?? null) : null,
          imageFocalX: main?.focalX ?? 50,
          imageFocalY: main?.focalY ?? 50,
          images: p.showImage ? p.images.map((i) => i.url) : [],
          badges: p.badges
            .map((pb) => badgeKey.get(pb.badgeId))
            .filter((k): k is string => Boolean(k)),
        }
      }),
    }
  }

  /** Weekly hours + a computed "open now" in the restaurant's timezone. */
  async getHours(restaurantId: string) {
    // The rows are cached; `openNow` depends on the clock, so it is always
    // recomputed rather than frozen into the cached value.
    const { hours, timezone } = await this.cached(
      `hours:${restaurantId}`,
      () => restaurantId,
      () => this.loadHours(restaurantId),
    )
    return { hours, openNow: this.computeOpenNow(hours, timezone) }
  }

  private async loadHours(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, deletedAt: null },
      select: { timezone: true },
    })
    if (!restaurant) throw new NotFoundException('Restaurant not found')

    const hours = await this.prisma.restaurantWorkingHour.findMany({
      where: { restaurantId },
      orderBy: [{ dayOfWeek: 'asc' }, { sortOrder: 'asc' }],
    })

    return { hours, timezone: restaurant.timezone }
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
