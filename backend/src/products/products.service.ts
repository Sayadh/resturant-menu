import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { mapTranslations } from '../common/utils/translations'
import { parseSort } from '../common/utils/sort'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductListQueryDto } from './dto/product-list.query.dto'
import { ReorderItemDto } from '../common/dto/reorder.dto'

const INCLUDE = {
  translations: { include: { language: true } },
  images: { orderBy: { sortOrder: 'asc' } },
  badges: { include: { badge: true } },
} satisfies Prisma.ProductInclude

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(restaurantId: string, q: ProductListQueryDto) {
    const where: Prisma.ProductWhereInput = { restaurantId, deletedAt: null }
    if (q.categoryId) where.categoryId = q.categoryId
    if (typeof q.isAvailable === 'boolean') where.isAvailable = q.isAvailable
    if (q.section) where.category = { section: q.section }
    if (q.search) {
      where.translations = { some: { name: { contains: q.search, mode: Prisma.QueryMode.insensitive } } }
    }
    const orderBy = parseSort(q.sort, ['sortOrder', 'price', 'createdAt'], { sortOrder: 'asc' })

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: INCLUDE,
      }),
      this.prisma.product.count({ where }),
    ])
    return { data, meta: { page: q.page, pageSize: q.pageSize, total } }
  }

  async get(restaurantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, restaurantId, deletedAt: null },
      include: INCLUDE,
    })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  private async ensureOwn(restaurantId: string, id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, restaurantId, deletedAt: null } })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  private async ensureCategory(restaurantId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, restaurantId, deletedAt: null },
    })
    if (!category) throw new BadRequestException('Category not found in this restaurant')
  }

  private validatePrices(price: number, oldPrice?: number | null) {
    if (oldPrice != null && oldPrice <= price) {
      throw new BadRequestException('oldPrice must be greater than price')
    }
  }

  /** Resolve badge keys → ids (system badges + this restaurant's custom). */
  private async resolveBadgeIds(restaurantId: string, keys?: string[]): Promise<string[]> {
    if (!keys || keys.length === 0) return []
    const badges = await this.prisma.badge.findMany({
      where: { key: { in: keys }, OR: [{ restaurantId: null }, { restaurantId }] },
    })
    return badges.map((b) => b.id)
  }

  async create(restaurantId: string, dto: CreateProductDto) {
    await this.ensureCategory(restaurantId, dto.categoryId)
    this.validatePrices(dto.price, dto.oldPrice)
    const translations = await mapTranslations(this.prisma, dto.translations)
    const badgeIds = await this.resolveBadgeIds(restaurantId, dto.badges)

    return this.prisma.product.create({
      data: {
        restaurantId,
        categoryId: dto.categoryId,
        price: dto.price,
        oldPrice: dto.oldPrice ?? null,
        isAvailable: dto.isAvailable ?? true,
        isActive: dto.isActive ?? true,
        isPopular: dto.isPopular ?? false,
        isNew: dto.isNew ?? false,
        isRecommended: dto.isRecommended ?? false,
        sortOrder: dto.sortOrder ?? 0,
        translations: { create: translations },
        images: dto.images?.length
          ? { create: dto.images.map((im, i) => ({ url: im.url, storageKey: im.storageKey ?? null, isMain: im.isMain ?? i === 0, sortOrder: i })) }
          : undefined,
        badges: badgeIds.length ? { create: badgeIds.map((badgeId) => ({ badgeId })) } : undefined,
      },
      include: INCLUDE,
    })
  }

  async update(restaurantId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.ensureOwn(restaurantId, id)
    if (dto.categoryId) await this.ensureCategory(restaurantId, dto.categoryId)
    this.validatePrices(dto.price ?? existing.price, dto.oldPrice ?? existing.oldPrice)

    await this.prisma.product.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        price: dto.price,
        oldPrice: dto.oldPrice,
        isAvailable: dto.isAvailable,
        isActive: dto.isActive,
        isPopular: dto.isPopular,
        isNew: dto.isNew,
        isRecommended: dto.isRecommended,
        sortOrder: dto.sortOrder,
      },
    })

    if (dto.translations) {
      const translations = await mapTranslations(this.prisma, dto.translations)
      for (const t of translations) {
        await this.prisma.productTranslation.upsert({
          where: { productId_languageId: { productId: id, languageId: t.languageId } },
          update: { name: t.name, description: t.description },
          create: { productId: id, languageId: t.languageId, name: t.name, description: t.description },
        })
      }
    }

    if (dto.badges) {
      const badgeIds = await this.resolveBadgeIds(restaurantId, dto.badges)
      await this.prisma.$transaction([
        this.prisma.productBadge.deleteMany({ where: { productId: id } }),
        ...badgeIds.map((badgeId) => this.prisma.productBadge.create({ data: { productId: id, badgeId } })),
      ])
    }

    if (dto.images) {
      await this.prisma.$transaction([
        this.prisma.productImage.deleteMany({ where: { productId: id } }),
        ...dto.images.map((im, i) =>
          this.prisma.productImage.create({
            data: { productId: id, url: im.url, storageKey: im.storageKey ?? null, isMain: im.isMain ?? i === 0, sortOrder: i },
          }),
        ),
      ])
    }

    return this.get(restaurantId, id)
  }

  async setAvailability(restaurantId: string, id: string, isAvailable: boolean) {
    await this.ensureOwn(restaurantId, id)
    await this.prisma.product.update({ where: { id }, data: { isAvailable } })
    return this.get(restaurantId, id)
  }

  async remove(restaurantId: string, id: string) {
    await this.ensureOwn(restaurantId, id)
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } })
    return { ok: true }
  }

  async reorder(restaurantId: string, items: ReorderItemDto[]) {
    const ids = items.map((i) => i.id)
    const count = await this.prisma.product.count({ where: { id: { in: ids }, restaurantId, deletedAt: null } })
    if (count !== ids.length) throw new BadRequestException('Some products do not belong to this restaurant')
    await this.prisma.$transaction(
      items.map((i) => this.prisma.product.update({ where: { id: i.id }, data: { sortOrder: i.sortOrder } })),
    )
    return { ok: true }
  }
}
