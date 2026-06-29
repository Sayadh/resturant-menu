import { BadRequestException } from '@nestjs/common'
import type { PrismaService } from '../../prisma/prisma.service'

export interface TranslationInput {
  languageCode: string
  name: string
  description?: string
}

export interface MappedTranslation {
  languageId: string
  name: string
  description: string | null
}

/** Resolve language codes → ids; throws on an unknown code. */
export async function mapTranslations(
  prisma: PrismaService,
  translations: TranslationInput[],
): Promise<MappedTranslation[]> {
  const codes = [...new Set(translations.map((t) => t.languageCode))]
  const langs = await prisma.language.findMany({ where: { code: { in: codes } } })
  const byCode = new Map(langs.map((l) => [l.code, l.id]))
  return translations.map((t) => {
    const languageId = byCode.get(t.languageCode)
    if (!languageId) throw new BadRequestException(`Unknown language code: ${t.languageCode}`)
    return { languageId, name: t.name, description: t.description ?? null }
  })
}
