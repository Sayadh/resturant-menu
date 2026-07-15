<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// Maison — root experience layout
//
// Orchestrates the immersive, magazine-style journey and owns the page state.
// All menu DATA, language, search and order LOGIC come from the shared stores
// and composables — exactly like Aria and Atelier — only the presentation and
// the storytelling flow differ. Flow: Welcome → Story → Today's Recommendation
// → Chef's Selection → Categories → Products → Order.
// ─────────────────────────────────────────────────────────────────────────
import { type MenuItem, type MenuCategory, type LocalizedText } from '~/data/menu'
import {
  maisonAlcoholTitle,
  maisonStory,
  maisonChefSelection,
  maisonCategories,
} from '~/themes/maison/config'
import { vReveal } from '~/themes/maison/animations'
import '~/themes/maison/styles/maison.css'

import MaisonLoading from '../components/MaisonLoading.vue'
import MaisonHeader from '../components/MaisonHeader.vue'
import MaisonHero from '../components/MaisonHero.vue'
import MaisonStorySection from '../components/MaisonStorySection.vue'
import MaisonFeaturedDish from '../components/MaisonFeaturedDish.vue'
import MaisonCategorySection from '../components/MaisonCategorySection.vue'
import MaisonProductLayout from '../components/MaisonProductLayout.vue'
import MaisonSearch from '../components/MaisonSearch.vue'
import MaisonBasket from '../components/MaisonBasket.vue'
import MaisonOrderDrawer from '../components/MaisonOrderDrawer.vue'
import MaisonEmptyState from '../components/MaisonEmptyState.vue'
import MaisonFooter from '../components/MaisonFooter.vue'

const { t } = useLanguage()
const store = useMenuStore()
const order = useOrderStore()

// No local texture asset — empty lets MaisonCategorySection show its gradient.
const fallbackTexture = ''

// Three "chapters" derived from the data (no data change):
// Cuisine → level food · Drinks → drinks/soft · Cellar → drinks/alcohol.
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
      out.push({ key: 'drinks-alcohol', title: maisonAlcoholTitle, level: lv.id, group: 'alcohol' })
    } else {
      out.push({ key: lv.id, title: lv.title, level: lv.id })
    }
  }
  return out
})

const activeKey = ref(views.value[0]?.key ?? 'food')
const activeView = computed(() => views.value.find((v) => v.key === activeKey.value) ?? views.value[0])

const search = ref('')
const searchOpen = ref(false)
const orderOpen = ref(false)
const ready = ref(false)
const scrolled = ref(false)

const baseCategories = computed(() =>
  activeView.value ? store.categoriesOf(activeView.value.level, activeView.value.group) : [],
)

// Filtered categories (search across name + description, all languages).
const filteredCategories = computed<MenuCategory[]>(() => {
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

const isSearching = computed(() => search.value.trim().length > 0)
const hasResults = computed(() => filteredCategories.value.length > 0)

// Featured (badged, available) dishes for the active chapter.
const featured = computed(() => {
  const out: MenuItem[] = []
  for (const cat of baseCategories.value) {
    for (const item of cat.items) {
      if (item.badge && item.available !== false) out.push(item)
    }
  }
  // Fallback: first few dishes so the editorial sections never sit empty.
  if (out.length === 0) {
    for (const cat of baseCategories.value) {
      for (const item of cat.items) {
        if (item.available !== false) out.push(item)
        if (out.length >= 4) break
      }
      if (out.length >= 4) break
    }
  }
  return out
})

const todaysPick = computed(() => featured.value[0] ?? null)
const chefSelection = computed(() =>
  featured.value.filter((i) => i.id !== todaysPick.value?.id).slice(0, 3),
)

// Category's own uploaded banner takes priority; only fall back to a product
// photo (then a texture) if the category has no image of its own.
const categoryImage = (cat: MenuCategory) => {
  if (cat.image) return cat.image
  const withPhoto = cat.items.find((i) => i.image)
  return withPhoto?.image || fallbackTexture
}

// ── interactions ─────────────────────────────────────────────
const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const enterMenu = () => scrollToId('ms-story')
const exploreCategory = (cat: MenuCategory) => scrollToId(`ms-products-${cat.id}`)

const selectView = (key: string) => {
  if (key === activeKey.value) return
  activeKey.value = key
  search.value = ''
  nextTick(() => scrollToId('ms-collection'))
}

const openSearch = () => {
  searchOpen.value = true
}
watch(searchOpen, (open) => {
  // When closing the panel, keep any typed query so results remain visible.
  if (!open && isSearching.value) scrollToId('ms-collection')
})

// Show the slim header only after the hero is scrolled past.
const onScroll = () => {
  scrolled.value = window.scrollY > window.innerHeight * 0.7
}

let readyTimer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  // Defensive: clear any body scroll-lock a previous overlay/theme may have left.
  if (import.meta.client) document.body.style.overflow = ''
  // Render content immediately; lift the intro veil shortly after so it can
  // never trap scrolling/interaction if something delays mount.
  readyTimer = setTimeout(() => {
    ready.value = true
  }, 400)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
watch(
  () => store.levels,
  () => {
    if (!views.value.find((v) => v.key === activeKey.value)) activeKey.value = views.value[0]?.key ?? ''
  },
  { deep: true },
)
onBeforeUnmount(() => {
  if (readyTimer) clearTimeout(readyTimer)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div id="top" class="maison-theme relative flex min-h-screen flex-col overflow-x-clip font-sans">
    <!-- First-load veil -->
    <Transition name="ms-veil">
      <MaisonLoading v-if="!ready" />
    </Transition>

    <!-- Slim fixed header (after hero) -->
    <MaisonHeader
      :visible="scrolled && !searchOpen"
      :count="order.count"
      @search="openSearch"
      @open-order="orderOpen = true"
    />

    <!-- 1 · Welcome -->
    <MaisonHero @enter="enterMenu" />

    <!-- 2 · Story -->
    <div id="ms-story">
      <MaisonStorySection />
    </div>

    <!-- When searching, collapse the editorial chapters and show results. -->
    <template v-if="!isSearching">
      <!-- Chef's Selection (warm beige band) -->
      <section v-if="chefSelection.length" class="bg-[#EFE3D0] py-20 sm:py-28">
        <div class="mx-auto max-w-6xl px-5 sm:px-8">
          <header v-reveal class="mb-16 text-center">
            <p class="ms-eyebrow font-sans text-[11px] font-semibold text-[#C4693F]">{{ t(maisonChefSelection.kicker) }}</p>
            <h2 class="mt-5 text-balance font-serif text-4xl font-semibold text-[#3E3125] sm:text-5xl">
              {{ t(maisonChefSelection.title) }}
            </h2>
            <div class="ms-rule mx-auto mt-8 w-32" aria-hidden="true" />
          </header>

          <div class="flex flex-col gap-20 sm:gap-28">
            <MaisonFeaturedDish
              v-for="(dish, i) in chefSelection"
              :key="dish.id"
              :item="dish"
              tone="light"
              :reversed="i % 2 === 1"
              :index="i"
            />
          </div>
        </div>
      </section>
    </template>

    <!-- 5 · Categories + 6 · Products -->
    <section id="ms-collection" class="bg-[#F4EEE2] pt-20 sm:pt-28">
      <!-- Collection intro -->
      <div class="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <p v-reveal class="ms-eyebrow font-sans text-[11px] font-semibold text-[#C4693F]">{{ t(maisonCategories.kicker) }}</p>
        <h2 v-reveal="1" class="mt-5 text-balance font-serif text-4xl font-semibold text-[#3E3125] sm:text-5xl">
          {{ t(maisonCategories.title) }}
        </h2>
      </div>

      <!-- Sticky chapter selector — stays pinned so guests can always switch -->
      <div class="sticky top-[64px] z-30 mt-8 border-y border-[#E7DDCB]/70 bg-[#F6F0E4]/85 backdrop-blur-md sm:top-[72px]">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-7 gap-y-1.5 px-5 py-3.5 sm:gap-x-9 sm:px-8">
          <button
            v-for="view in views"
            :key="view.key"
            type="button"
            class="relative pb-1 font-serif text-lg transition-colors duration-300 sm:text-xl"
            :class="activeKey === view.key ? 'text-[#3E3125]' : 'text-[#B6AC9C] hover:text-[#6E6152]'"
            @click="selectView(view.key)"
          >
            {{ t(view.title) }}
            <span
              v-if="activeKey === view.key"
              class="absolute -bottom-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#C4693F]"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <!-- Search results -->
      <div v-if="isSearching" class="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8">
        <template v-if="hasResults">
          <div v-for="cat in filteredCategories" :key="cat.id" class="mb-20">
            <h3 class="mb-10 text-center font-serif text-3xl text-[#4A3B2E]">{{ t(cat.title) }}</h3>
            <MaisonProductLayout :category="cat" />
          </div>
        </template>
        <MaisonEmptyState v-else />
      </div>

      <!-- Browsing: each category is its own landing band + products -->
      <div v-else>
        <div v-for="(cat, i) in baseCategories" :key="cat.id">
          <MaisonCategorySection
            :category="cat"
            :image="categoryImage(cat)"
            :mobile-image="cat.mobileImage || categoryImage(cat)"
            :index="i"
            @explore="exploreCategory(cat)"
          />
          <div :id="`ms-products-${cat.id}`" class="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <MaisonProductLayout :category="cat" />
          </div>
        </div>
      </div>
    </section>

    <div class="mt-auto">
      <MaisonFooter />
    </div>

    <!-- Overlays -->
    <MaisonBasket @open="orderOpen = true" />
    <MaisonOrderDrawer :open="orderOpen" @close="orderOpen = false" />
    <MaisonSearch v-model="search" :open="searchOpen" @close="searchOpen = false" />
  </div>
</template>
