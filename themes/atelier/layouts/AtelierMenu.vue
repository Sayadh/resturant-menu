<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// Atelier — root layout
//
// Orchestrates the whole editorial experience and owns the page state. All
// menu DATA, language, search and order LOGIC come from the shared stores and
// composables, exactly like the other themes — only the presentation differs.
// ─────────────────────────────────────────────────────────────────────────
import { type MenuItem, type MenuCategory, type LocalizedText } from '~/data/menu'
import { atelierAlcoholTitle, atelierIndexTitle } from '~/themes/atelier/config'
import { vReveal } from '~/themes/atelier/animations'
import '~/themes/atelier/styles/atelier.css'

import AtelierHeader from '../components/AtelierHeader.vue'
import AtelierHero from '../components/AtelierHero.vue'
import AtelierNav from '../components/AtelierNav.vue'
import AtelierSignature from '../components/AtelierSignature.vue'
import AtelierMenuRow from '../components/AtelierMenuRow.vue'
import AtelierProductDetail from '../components/AtelierProductDetail.vue'
import AtelierBill from '../components/AtelierBill.vue'
import AtelierBasketBar from '../components/AtelierBasketBar.vue'
import AtelierEmpty from '../components/AtelierEmpty.vue'
import AtelierSkeleton from '../components/AtelierSkeleton.vue'
import AtelierFooter from '../components/AtelierFooter.vue'

const { t } = useLanguage()
const store = useMenuStore()
const order = useOrderStore()

// Three top tabs derived from the data (no data change):
// Food → level food · Drinks → drinks/soft · Cellar → drinks/alcohol.
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
      out.push({ key: 'drinks-alcohol', title: atelierAlcoholTitle, level: lv.id, group: 'alcohol' })
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
const billOpen = ref(false)
const ready = ref(true)

const baseCategories = computed(() =>
  activeView.value ? store.categoriesOf(activeView.value.level, activeView.value.group) : [],
)

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
const isSearching = computed(() => search.value.trim().length > 0)

// Chef's signatures: badged dishes from the active view, with their icon.
const featured = computed(() => {
  const out: { item: MenuItem; icon: string }[] = []
  for (const cat of baseCategories.value) {
    for (const item of cat.items) {
      if (item.badge && item.available !== false) out.push({ item, icon: cat.icon })
    }
  }
  return out.slice(0, 3)
})

const activeId = ref('')
const iconForSelected = computed(() =>
  selected.value ? (store.findItem(selected.value.id)?.category.icon ?? '🍽') : '🍽',
)
const pad = (n: number) => String(n + 1).padStart(2, '0')

// Scroll a section so its header sits just below the sticky nav (uses the live
// nav height, so it stays correct as the nav grows/shrinks).
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
  // Wait for the new sections to render, then bring the first one's header
  // right below the sticky nav.
  nextTick(() => {
    if (firstId) scrollToId(firstId)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// Sticky nav height → scroll offset (CSS var consumed by section scroll-margin)
const updateNavHeight = () => {
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  if (nav) document.documentElement.style.setProperty('--atl-nav-h', `${nav.offsetHeight + 16}px`)
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

// Keep the active chip centered in the rail — scrolling ONLY the horizontal
// rail (never the window), so it can't fight the user's vertical scroll.
watch(activeId, async (id) => {
  if (!id) return
  await nextTick()
  const chip = document.querySelector<HTMLElement>(`[data-chip="${id}"]`)
  const rail = chip?.closest<HTMLElement>('.atl-scroll')
  if (!chip || !rail) return
  const c = chip.getBoundingClientRect()
  const r = rail.getBoundingClientRect()
  rail.scrollTo({ left: rail.scrollLeft + (c.left - r.left) - r.width / 2 + c.width / 2, behavior: 'smooth' })
})

onMounted(() => {
  activeId.value = baseCategories.value[0]?.id ?? ''
  if (import.meta.client) document.body.style.overflow = ''
  setupObserver()
  window.addEventListener('resize', updateNavHeight)
})
watch(categories, () => ready.value && setupObserver(), { flush: 'post' })
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
  <div class="atelier-theme atl-grain relative min-h-screen overflow-x-hidden pb-28 font-serif">
    <!-- everything sits above the fixed grain layer -->
    <AtelierHeader />
    <AtelierHero />

    <!-- Loading beat -->
    <AtelierSkeleton v-if="!ready" />

    <template v-else>
      <!-- Chef's signatures (hidden while searching) -->
      <AtelierSignature
        v-if="featured.length && !isSearching"
        :dishes="featured"
        @open="selected = $event"
      />

      <!-- Sticky navigation -->
      <AtelierNav
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

      <!-- Menu sections -->
      <main class="relative z-[1] mx-auto max-w-6xl px-5 sm:px-8">
        <template v-if="hasResults">
          <section
            v-for="(cat, i) in categories"
            :id="cat.id"
            :key="cat.id"
            class="py-12 sm:py-16"
            style="scroll-margin-top: var(--atl-nav-h, 9rem)"
          >
            <!-- Editorial section header -->
            <header v-reveal class="flex items-baseline gap-5 border-b border-[#16130F] pb-5">
              <span class="atl-numeral font-serif text-4xl text-[#16130F]/15 sm:text-5xl" aria-hidden="true">
                {{ pad(i) }}
              </span>
              <div class="min-w-0">
                <p class="atl-eyebrow font-display text-[10px] text-[#A1502E]">{{ t(atelierIndexTitle) }}</p>
                <h2 class="mt-1.5 font-serif text-3xl italic leading-tight text-[#16130F] sm:text-4xl">
                  {{ t(cat.title) }}
                </h2>
              </div>
              <span class="ml-auto shrink-0 font-display text-[11px] tracking-[0.16em] text-[#857B6C]">
                {{ String(cat.items.length).padStart(2, '0') }}
              </span>
            </header>

            <!-- Printed-menu rows -->
            <div class="divide-y divide-[#D4C9B8]">
              <div v-for="(item, j) in cat.items" :key="item.id" v-reveal="j">
                <AtelierMenuRow
                  :item="item"
                  :category-icon="cat.icon"
                  @open="selected = $event"
                />
              </div>
            </div>
          </section>
        </template>

        <AtelierEmpty v-else />
      </main>
    </template>

    <AtelierFooter />

    <!-- Overlays -->
    <AtelierBasketBar @open="billOpen = true" />
    <AtelierBill :open="billOpen" @close="billOpen = false" />
    <AtelierProductDetail
      :item="selected"
      :category-icon="iconForSelected"
      @close="selected = null"
    />
  </div>
</template>
