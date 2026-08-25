<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// Noir — root layout
//
// Owns the page state and orchestrates the dark fine-dining experience. All
// menu DATA, language, search and order LOGIC come from the shared stores and
// composables — exactly like Aria, Atelier, Maison and Heritage — only the
// presentation differs. Flow: Arrival → Navigation → Courses → Selection.
// ─────────────────────────────────────────────────────────────────────────
import { ui, type MenuItem, type MenuCategory, type LocalizedText } from '~/data/menu'
import { noirAlcoholTitle } from '~/themes/noir/config'
import { vReveal } from '~/themes/noir/animations'
import '~/themes/noir/styles/noir.css'

import NoirHero from '../components/NoirHero.vue'
import NoirNav from '../components/NoirNav.vue'
import NoirProductCard from '../components/NoirProductCard.vue'
import NoirProductDetail from '../components/NoirProductDetail.vue'
import NoirOrderDrawer from '../components/NoirOrderDrawer.vue'
import NoirBasketBar from '../components/NoirBasketBar.vue'
import NoirEmpty from '../components/NoirEmpty.vue'
import NoirFooter from '../components/NoirFooter.vue'

const { t } = useLanguage()
const store = useMenuStore()
const brand = useBrand() // ordering (cart) = paid plans only

// Section tabs derived from the data (no data change):
// each level is a tab; Drinks splits into soft + cellar.
interface View {
  key: string
  title: LocalizedText
  level: string
  group?: 'soft' | 'alcohol'
}
const views = computed<View[]>(() => {
  const out: View[] = []
  for (const lv of store.levels) {
    if (lv.id === 'drinks') {
      out.push({ key: 'drinks-soft', title: lv.title, level: lv.id, group: 'soft' })
      out.push({ key: 'drinks-alcohol', title: noirAlcoholTitle, level: lv.id, group: 'alcohol' })
    } else {
      out.push({ key: lv.id, title: lv.title, level: lv.id })
    }
  }
  return out
})

const activeKey = ref(views.value[0]?.key ?? 'food')
const activeView = computed(() => views.value.find((v) => v.key === activeKey.value) ?? views.value[0])

const search = ref('')
const selected = ref<MenuItem | null>(null)
const orderOpen = ref(false)

const baseCategories = computed(() =>
  activeView.value ? store.categoriesOf(activeView.value.level, activeView.value.group) : [],
)

// Search across name + description in every language.
const categories = computed<MenuCategory[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return baseCategories.value
  return baseCategories.value
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        [item.name.AM, item.name.EN, item.name.RU, item.description.AM, item.description.EN, item.description.RU]
          .join(' ')
          .toLowerCase()
          .includes(q),
      ),
    }))
    .filter((cat) => cat.items.length > 0)
})

const hasResults = computed(() => categories.value.length > 0)
const activeId = ref('')
const pad = (n: number) => String(n + 1).padStart(2, '0')

// Scroll a section so its header clears the sticky nav.
const scrollToId = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const navH = document.querySelector<HTMLElement>('[data-nav]')?.offsetHeight ?? 0
  const top = window.scrollY + el.getBoundingClientRect().top - navH - 12
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

const scrollToCategory = (id: string) => {
  activeId.value = id
  scrollToId(id)
}

const selectView = (key: string) => {
  if (key === activeKey.value) return
  activeKey.value = key
  search.value = ''
  const firstId = baseCategories.value[0]?.id ?? ''
  activeId.value = firstId
  nextTick(() => {
    if (firstId) scrollToId(firstId)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// Keep the sticky nav height in a CSS var for section scroll-margin.
const updateNavHeight = () => {
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  if (nav) document.documentElement.style.setProperty('--nr-nav-h', `${nav.offsetHeight + 16}px`)
}

let observer: IntersectionObserver | null = null
const setupObserver = async () => {
  await nextTick()
  updateNavHeight()
  observer?.disconnect()
  const navH = document.querySelector<HTMLElement>('[data-nav]')?.offsetHeight ?? 140
  observer = new IntersectionObserver(
    (entries) => {
      const vis = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (vis[0]) activeId.value = vis[0].target.id
    },
    { rootMargin: `-${navH + 8}px 0px -55% 0px`, threshold: [0.1, 0.25, 0.5] },
  )
  categories.value.forEach((cat) => {
    const el = document.getElementById(cat.id)
    if (el) observer?.observe(el)
  })
}

// Centre the active chip in the rail — scroll ONLY the rail, never the window.
watch(activeId, async (id) => {
  if (!id) return
  await nextTick()
  const chip = document.querySelector<HTMLElement>(`[data-chip="${id}"]`)
  const rail = chip?.closest<HTMLElement>('.nr-scroll')
  if (!chip || !rail) return
  const c = chip.getBoundingClientRect()
  const r = rail.getBoundingClientRect()
  rail.scrollTo({ left: rail.scrollLeft + (c.left - r.left) - r.width / 2 + c.width / 2, behavior: 'smooth' })
})

onMounted(() => {
  activeId.value = baseCategories.value[0]?.id ?? ''
  // Defensive: clear any body scroll-lock a previous overlay/theme may have left.
  if (import.meta.client) document.body.style.overflow = ''
  setupObserver()
  window.addEventListener('resize', updateNavHeight)
})
watch(categories, setupObserver, { flush: 'post' })
watch(
  () => store.levels,
  () => {
    if (!views.value.find((v) => v.key === activeKey.value)) activeKey.value = views.value[0]?.key ?? ''
  },
  { deep: true },
)
onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', updateNavHeight)
})
</script>

<template>
  <div class="noir-theme relative flex min-h-screen flex-col overflow-x-clip font-serif">
    <div class="flex-1 pb-28">
      <!-- 1 · Arrival -->
      <NoirHero />

      <!-- 2 · Navigation -->
      <NoirNav
        data-nav
        :views="views"
        :active-key="activeKey"
        :search="search"
        :categories="baseCategories"
        :active-id="activeId"
        @select-view="selectView"
        @update:search="search = $event"
        @scroll-to-category="scrollToCategory"
      />

      <!-- 3 · Courses -->
      <main class="mx-auto max-w-6xl px-5 sm:px-8">
        <template v-if="hasResults">
          <section
            v-for="(cat, i) in categories"
            :id="cat.id"
            :key="cat.id"
            class="py-12 sm:py-16"
            style="scroll-margin-top: var(--nr-nav-h, 9rem)"
          >
            <!-- Section header -->
            <header v-reveal class="flex items-baseline gap-5 border-b border-[#25282D] pb-5">
              <span class="nr-numeral font-serif text-4xl text-[#25282D] sm:text-5xl" aria-hidden="true">
                {{ pad(i) }}
              </span>
              <div class="min-w-0">
                <h2 class="font-serif text-3xl italic leading-tight text-[#F1EEE8] sm:text-4xl">
                  {{ t(cat.title) }}
                </h2>
              </div>
              <span class="nr-numeral ml-auto shrink-0 font-display text-[11px] tracking-[0.16em] text-[#777A7E]">
                {{ String(cat.items.length).padStart(2, '0') }} {{ t(ui.dishCount) }}
              </span>
            </header>

            <!-- Dishes -->
            <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <NoirProductCard
                v-for="(item, j) in cat.items"
                :key="item.id"
                v-reveal="j"
                :item="item"
                @open="selected = $event"
              />
            </div>
          </section>
        </template>

        <NoirEmpty v-else />
      </main>
    </div>

    <NoirFooter />

    <!-- Overlays -->
    <NoirBasketBar v-if="brand.ordering" @open="orderOpen = true" />
    <NoirOrderDrawer v-if="brand.ordering" :open="orderOpen" @close="orderOpen = false" />
    <NoirProductDetail :item="selected" @close="selected = null" />
    <WifiButton theme="noir" />
  </div>
</template>
