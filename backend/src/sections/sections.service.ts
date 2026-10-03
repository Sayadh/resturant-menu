import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { mapTranslations } from '../common/utils/translations'
import { CreateSectionDto } from './dto/create-section.dto'
import { UpdateSectionDto } from './dto/update-section.dto'
import { ReorderItemDto } from '../common/dto/reorder.dto'
import { UploadsService } from '../uploads/uploads.service'
import { PlanLimitsService } from '../common/services/plan-limits.service'
import { isRestorable } from '../common/utils/restore-window'

const INCLUDE = {
  translations: { include: { language: true } },
} satisfies Prisma.SectionInclude

@Injectable()
export class SectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  list(restaurantId: string) {
    return this.prisma.section.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: INCLUDE,
    })
  }

  async get(restaurantId: string, id: string) {
    const section = await this.prisma.section.findFirst({
      where: { id, restaurantId, deletedAt: null },
      include: INCLUDE,
    })
    if (!section) throw new NotFoundException('Section not found')
    return section
  }

  private async ensureOwn(restaurantId: string, id: string) {
    const section = await this.prisma.section.findFirst({ where: { id, restaurantId, deletedAt: null } })
    if (!section) throw new NotFoundException('Section not found')
    return section
  }

  async create(restaurantId: string, dto: CreateSectionDto) {
    const translations = await mapTranslations(this.prisma, dto.translations)
    return this.prisma.section.create({
      data: {
        restaurantId,
        icon: dto.icon,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        translations: { create: translations.map((t) => ({ languageId: t.languageId, name: t.name })) },
      },
      include: INCLUDE,
    })
  }

  async update(restaurantId: string, id: string, dto: UpdateSectionDto) {
    const existing = await this.ensureOwn(restaurantId, id)
    await this.prisma.section.update({
      where: { id },
      data: { icon: dto.icon, imageUrl: dto.imageUrl, sortOrder: dto.sortOrder, isActive: dto.isActive },
    })
    // Best-effort: drop the previous image object if it was replaced/cleared.
    if (dto.imageUrl !== undefined && existing.imageUrl && existing.imageUrl !== dto.imageUrl) {
      await this.uploads.removeOwnByUrl(restaurantId, existing.imageUrl)
    }
    if (dto.translations) {
      const translations = await mapTranslations(this.prisma, dto.translations)
      for (const t of translations) {
        await this.prisma.sectionTranslation.upsert({
          where: { sectionId_languageId: { sectionId: id, languageId: t.languageId } },
          update: { name: t.name },
          create: { sectionId: id, languageId: t.languageId, name: t.name },
        })
      }
    }
    return this.get(restaurantId, id)
  }

  async remove(restaurantId: string, id: string, cascade = false) {
    await this.ensureOwn(restaurantId, id)
    const cats = await this.prisma.category.findMany({
      where: { sectionId: id, deletedAt: null },
      select: { id: true },
    })
    if (cats.length > 0 && !cascade) {
      throw new ConflictException('Section has categories. Pass cascade=true to delete them too.')
    }
    const now = new Date()
    const catIds = cats.map((c) => c.id)
    const ops: Prisma.PrismaPromise<unknown>[] = []
    if (cascade && catIds.length) {
      ops.push(this.prisma.product.updateMany({ where: { categoryId: { in: catIds }, deletedAt: null }, data: { deletedAt: now } }))
      ops.push(this.prisma.category.updateMany({ where: { id: { in: catIds } }, data: { deletedAt: now } }))
    }
    ops.push(this.prisma.section.update({ where: { id }, data: { deletedAt: now } }))
    await this.prisma.$transaction(ops)
    return { ok: true }
  }

  /**
   * Undo a delete: the section plus the categories and products that delete
   * took with it (same deletedAt). Idempotent; refused once the window has
   * passed (common/utils/restore-window).
   */
  async restore(restaurantId: string, id: string) {
    const section = await this.prisma.section.findFirst({
      where: { id, restaurantId },
      select: { deletedAt: true },
    })
    if (!section) throw new NotFoundException('Section not found')
    if (!section.deletedAt) return { ok: true } // already back (double click)
    if (!isRestorable(section.deletedAt)) throw new GoneException('The time to undo this delete has passed')
    const deletedAt = section.deletedAt
    const cats = await this.prisma.category.findMany({
      where: { sectionId: id, restaurantId, deletedAt },
      select: { id: true },
    })
    const catIds = cats.map((c) => c.id)
    const productsWhere = { categoryId: { in: catIds }, deletedAt }
    const products = catIds.length ? await this.prisma.product.count({ where: productsWhere }) : 0
    await this.planLimits.assertCanCreate(restaurantId, 'category', catIds.length)
    await this.planLimits.assertCanCreate(restaurantId, 'product', products)
    const ops: Prisma.PrismaPromise<unknown>[] = [
      this.prisma.section.update({ where: { id }, data: { deletedAt: null } }),
    ]
    if (catIds.length) {
      ops.push(this.prisma.category.updateMany({ where: { id: { in: catIds } }, data: { deletedAt: null } }))
      ops.push(this.prisma.product.updateMany({ where: productsWhere, data: { deletedAt: null } }))
    }
    await this.prisma.$transaction(ops)
    return { ok: true }
  }

  async reorder(restaurantId: string, items: ReorderItemDto[]) {
    const ids = items.map((i) => i.id)
    const count = await this.prisma.section.count({ where: { id: { in: ids }, restaurantId, deletedAt: null } })
    if (count !== ids.length) throw new BadRequestException('Some sections do not belong to this restaurant')
    await this.prisma.$transaction(
      items.map((i) => this.prisma.section.update({ where: { id: i.id }, data: { sortOrder: i.sortOrder } })),
    )
    return { ok: true }
  }
}
