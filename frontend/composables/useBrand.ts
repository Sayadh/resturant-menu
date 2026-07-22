import type { LocalizedText } from '~/data/menu'
import type { Translation } from '~/models/types'

// Brand info for the active tenant, exposed in the {AM,EN,RU} shape the themes
// already render with `t()`. Themes use this instead of hardcoded config so the
// same theme renders any restaurant's branding.
const toLt = (tr: Translation): LocalizedText => ({ AM: tr.hy, EN: tr.en, RU: tr.ru })

// Returns a REACTIVE object (not a bag of refs) so `brand.x` auto-unwraps in
// every context — {{ }}, :attr AND v-if. (Nested refs are NOT unwrapped in
// directives/attributes, which silently broke `v-if="brand.ordering"`.)
export const useBrand = () => {
  const rs = useRestaurantStore()
  const r = computed(() => rs.restaurant)
  return reactive({
    name: computed(() => r.value.name),
    tagline: computed<LocalizedText>(() => toLt(r.value.tagline)),
    address: computed<string>(() => r.value.address),
    rating: computed(() => r.value.rating),
    hours: computed(() => r.value.workingHours),
    logo: computed<string>(() => r.value.logo),
    cover: computed<string>(() => r.value.coverImage),
    // Ordering/cart is a paid feature (Professional & Business only).
    ordering: computed<boolean>(() => r.value.ordering ?? false),
  })
}
