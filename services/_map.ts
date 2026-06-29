// Mapping helpers between the backend-ready domain model (services/models) and
// the runtime menu store shape (AM/EN/RU, level/group). Keeping the mapping in
// one place means swapping the store for a real API only touches the services.
import type { LocalizedText } from '~/data/menu'
import type { Translation, SectionType, Badge } from '~/models/types'
import type { MenuCategory } from '~/data/menu'

export const RESTAURANT_ID = 'tun-lahmajo'

export const toTranslation = (lt: LocalizedText): Translation => ({
  hy: lt.AM,
  en: lt.EN,
  ru: lt.RU,
})

export const toLocalized = (tr: Translation): LocalizedText => ({
  AM: tr.hy,
  EN: tr.en,
  RU: tr.ru,
})

export const emptyTranslation = (): Translation => ({ hy: '', en: '', ru: '' })

/** A category's section is derived from its level + drink group. */
export const sectionOf = (cat: MenuCategory): SectionType =>
  cat.level === 'food' ? 'food' : cat.group === 'alcohol' ? 'alcohol' : 'drinks'

export const sectionToLevelGroup = (
  section: SectionType,
): { level: string; group?: 'soft' | 'alcohol' } => {
  if (section === 'food') return { level: 'food' }
  if (section === 'alcohol') return { level: 'drinks', group: 'alcohol' }
  return { level: 'drinks', group: 'soft' }
}

/** The themes render a single `badge`; pick the most relevant one. */
export const primaryBadge = (badges: Badge[]): 'hit' | 'best' | 'new' | undefined => {
  if (badges.includes('hit')) return 'hit'
  if (badges.includes('recommended')) return 'best'
  if (badges.includes('new')) return 'new'
  return undefined
}

export const badgeToBadges = (badge?: string): Badge[] => {
  if (badge === 'hit') return ['hit']
  if (badge === 'best') return ['recommended']
  if (badge === 'new') return ['new']
  return []
}
