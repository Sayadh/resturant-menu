// ─────────────────────────────────────────────────────────────────────────
// useMenuSearch — guest dish search, shared by the themes that offer it.
//
// The BACKEND does the matching (every language of every dish, ranked —
// a guest reading Armenian can type "cola"). This composable only:
//   • waits for two letters and a short pause in the typing,
//   • drops answers that arrive after a newer query was sent,
//   • turns the returned ids into the dishes the menu store already holds, so
//     a result is the very same card — price, badges, sold-out, "+" and all.
// If the request fails, the search still answers from the loaded menu.
//
// Client-only by nature (it reacts to typing), so it never runs during SSR.
// ─────────────────────────────────────────────────────────────────────────
import type { Ref } from 'vue'
import { menuService } from '~/services'
import type { Lang, MenuCategory, MenuItem } from '~/data/menu'

export interface MenuSearchHit {
  item: MenuItem
  category: MenuCategory
}

const API_LANG: Record<Lang, string> = { AM: 'hy', EN: 'en', RU: 'ru' }
/** Same floor as the backend — one letter matches half the menu. */
const MIN_LENGTH = 2
const DEBOUNCE_MS = 250

export function useMenuSearch(query: Ref<string>) {
  const store = useMenuStore()
  const { lang } = useLanguage()

  const term = computed(() => query.value.trim())
  /** The guest has typed enough to search. */
  const active = computed(() => term.value.length >= MIN_LENGTH)
  const hits = ref<MenuSearchHit[]>([])
  /** A request for the current term is in flight. */
  const pending = ref(false)
  /** `hits` hold a finished answer (false until the first one arrives). */
  const ready = ref(false)

  const fromIds = (ids: string[]): MenuSearchHit[] =>
    ids.map((id) => store.findItem(id)).filter((h): h is MenuSearchHit => !!h)

  /** Fallback when the API is unreachable: the loaded (current-language) menu. */
  const fromStore = (q: string): MenuSearchHit[] => {
    const needle = q.toLocaleLowerCase()
    const out: MenuSearchHit[] = []
    for (const category of store.categories) {
      for (const item of category.items) {
        const text = [...Object.values(item.name), ...Object.values(item.description ?? {})]
          .join(' ')
          .toLocaleLowerCase()
        if (text.includes(needle)) out.push({ item, category })
      }
    }
    return out
  }

  let seq = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const run = async (q: string, id: number) => {
    let result: MenuSearchHit[]
    try {
      const restaurantId = store.currentRestaurantId
      if (!restaurantId) throw new Error('no tenant')
      result = fromIds(await menuService.searchProducts(restaurantId, q, API_LANG[lang.value]))
    } catch {
      result = fromStore(q)
    }
    if (id !== seq) return // a newer query is already on its way
    hits.value = result
    pending.value = false
    ready.value = true
  }

  watch(term, (q) => {
    clearTimeout(timer)
    const id = ++seq
    if (q.length < MIN_LENGTH) {
      hits.value = []
      pending.value = false
      ready.value = false
      return
    }
    pending.value = true
    timer = setTimeout(() => run(q, id), DEBOUNCE_MS)
  })

  onScopeDispose(() => clearTimeout(timer))

  return { term, active, hits, pending, ready }
}
