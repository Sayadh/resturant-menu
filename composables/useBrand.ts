import type { LocalizedText } from '~/data/menu'
import type { Translation } from '~/models/types'

// Brand info for the active tenant, exposed in the {AM,EN,RU} shape the themes
// already render with `t()`. Themes use this instead of hardcoded config so the
// same theme renders any restaurant's branding.
const toLt = (tr: Translation): LocalizedText => ({ AM: tr.hy, EN: tr.en, RU: tr.ru })

export const useBrand = () => {
  const rs = useRestaurantStore()
  const r = computed(() => rs.restaurant)
  return {
    name: computed(() => r.value.name),
    tagline: computed<LocalizedText>(() => toLt(r.value.tagline)),
    address: computed<string>(() => r.value.address),
    rating: computed(() => r.value.rating),
    hours: computed(() => r.value.workingHours),
    logo: computed<string>(() => r.value.logo),
    cover: computed<string>(() => r.value.coverImage),
  }
}
