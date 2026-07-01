import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { mapTranslations } from '../common/utils/translations'
import { parseSort } from '../common/utils/sort'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CategoryListQueryDto } from './dto/category-list.query.dto'
import { ReorderItemDto } from '../common/dto/reorder.dto'

const INCLUDE = { translations: { include: { language: true } } } satisfies Prisma.CategoryInclude

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(restaurantId: string, q: CategoryListQueryDto) {
    const where: Prisma.CategoryWhereInput = { restaurantId, deletedAt: null }
    if (q.sectionId) where.sectionId = q.sectionId
    if (typeof q.isActive === 'boolean') where.isActive = q.isActive
    if (q.search) {
      where.translations = { some: { name: { contains: q.search, mode: Prisma.QueryMode.insensitive } } }
    }
    const orderBy = parseSort(q.sort, ['sortOrder', 'createdAt'], { sortOrder: 'asc' })

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: INCLUDE,
      }),
      this.prisma.category.count({ where }),
    ])
    return { data, meta: { page: q.page, pageSize: q.pageSize, total } }
  }

  async get(restaurantId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, restaurantId, deletedAt: null },
      include: INCLUDE,
    })
    if (!cat) throw new NotFoundException('Category not found')
    return cat
  }

  private async ensureOwn(restaurantId: string, id: string) {
    const cat = await this.prisma.category.findFirst({ where: { id, restaurantId, deletedAt: null } })
    if (!cat) throw new NotFoundException('Category not found')
    return cat
  }

  /** Ensure a section belongs to this restaurant. */
  private async ensureSection(restaurantId: string, sectionId: string) {
    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, restaurantId, deletedAt: null },
    })
    if (!section) throw new BadRequestException('Section not found in this restaurant')
  }

  private async validateParent(restaurantId: string, parentId: string | undefined, sectionId: string | null) {
    if (!parentId) return
    const parent = await this.prisma.category.findFirst({
      where: { id: parentId, restaurantId, deletedAt: null },
    })
    if (!parent) throw new BadRequestException('Parent category not found')
    if (parent.sectionId !== sectionId) {
      throw new BadRequestException('Child category must have the same section as its parent')
    }
  }

  async create(restaurantId: string, dto: CreateCategoryDto) {
    await this.ensureSection(restaurantId, dto.sectionId)
    await this.validateParent(restaurantId, dto.parentId, dto.sectionId)
    const translations = await mapTranslations(this.prisma, dto.translations)
    return this.prisma.category.create({
      data: {
        restaurantId,
        sectionId: dto.sectionId,
        parentId: dto.parentId,
        icon: dto.icon,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        translations: { create: translations },
      },
      include: INCLUDE,
    })
  }

  async update(restaurantId: string, id: string, dto: UpdateCategoryDto) {
    const cat = await this.ensureOwn(restaurantId, id)
    if (dto.sectionId) await this.ensureSection(restaurantId, dto.sectionId)
    if (dto.parentId !== undefined) {
      await this.validateParent(restaurantId, dto.parentId, dto.sectionId ?? cat.sectionId)
    }
    await this.prisma.category.update({
      where: { id },
      data: {
        sectionId: dto.sectionId,
        parentId: dto.parentId,
        icon: dto.icon,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    })
    if (dto.translations) {
      const translations = await mapTranslations(this.prisma, dto.translations)
      for (const t of translations) {
        await this.prisma.categoryTranslation.upsert({
          where: { categoryId_languageId: { categoryId: id, languageId: t.languageId } },
          update: { name: t.name, description: t.description },
          create: { categoryId: id, languageId: t.languageId, name: t.name, description: t.description },
        })
      }
    }
    return this.get(restaurantId, id)
  }

  async remove(restaurantId: string, id: string, cascade = false) {
    await this.ensureOwn(restaurantId, id)
    const activeProducts = await this.prisma.product.count({ where: { categoryId: id, deletedAt: null } })
    if (activeProducts > 0 && !cascade) {
      throw new ConflictException('Category has products. Pass cascade=true to soft-delete them too.')
    }
    const now = new Date()
    const ops: Prisma.PrismaPromise<unknown>[] = []
    if (cascade) {
      ops.push(
        this.prisma.product.updateMany({ where: { categoryId: id, deletedAt: null }, data: { deletedAt: now } }),
      )
    }
    ops.push(this.prisma.category.update({ where: { id }, data: { deletedAt: now } }))
    await this.prisma.$transaction(ops)
    return { ok: true }
  }

  async reorder(restaurantId: string, items: ReorderItemDto[]) {
    const ids = items.map((i) => i.id)
    const count = await this.prisma.category.count({ where: { id: { in: ids }, restaurantId, deletedAt: null } })
    if (count !== ids.length) throw new BadRequestException('Some categories do not belong to this restaurant')
    await this.prisma.$transaction(
      items.map((i) => this.prisma.category.update({ where: { id: i.id }, data: { sortOrder: i.sortOrder } })),
    )
    return { ok: true }
  }
}
