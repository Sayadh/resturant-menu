<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// Heritage — root layout
//
// Heritage keeps its look (stone & olive, caramel hairlines, Cinzel caps,
// wheat and sprig ornaments) but presents the menu as a guided journey
// instead of one long scroll:
//
//     Home (sections) → Section (categories) → Category (dishes)
//
// The level lives in the URL query of the EXISTING tenant route
// (`/<slug>?s=<sectionId>&c=<categoryId>`) — the same convention as Opaline —
// so browser back/forward, refresh and pasted deep links all work, and
// unknown ids fall back to the nearest valid level.
//
// What sets it apart from Opaline: the crest header and a search field on
// the home screen, sections as full-width engraved plates, categories as a
// chapter list, and a category screen that is Heritage's own banner + cards
// (the shared MenuSection). All DATA and LOGIC come from the shared stores.
//
// The previous single-scroll version (components/DesignHeritage.vue) is
// left untouched; pointing the registry back at it is a one-line rollback.
// ─────────────────────────────────────────────────────────────────────────
import type { LocationQueryRaw } from 'vue-router'
import { ui, type MenuCategory, type MenuItem, type MenuLevel } from '~/data/menu'
import {
  heritageCategoryCount,
  heritageEmpty,
  heritageOrder,
  heritageResults,
  heritageSectionsLabel,
} from '~/themes/heritage/config'

import HeritageTopBar from '../components/HeritageTopBar.vue'
import HeritageSectionTile from '../components/HeritageSectionTile.vue'
import HeritageCategoryRow from '../components/HeritageCategoryRow.vue'
import HeritagePageHead from '../components/HeritagePageHead.vue'

const route = useRoute()
const router = useRouter()

const { t } = useLanguage()
const store = useMenuStore()
const brand = useBrand() // ordering (basket) = paid plans only
const order = useOrderStore()

// ── level state, read straight from the URL ──────────────────────────────
const sectionId = computed(() => String(route.query.s || ''))
const categoryId = computed(() => String(route.query.c || ''))

/** Every category of a section, in data order (sortOrder) — drink groups included. */
const categoriesIn = (levelId: string): MenuCategory[] =>
  store.categories.filter((c) => c.level === levelId)

/** Sections come straight from the API (`store.levels`) — never hardcoded. */
const sections = computed<MenuLevel[]>(() => store.levels)

const activeSection = computed<MenuLevel | null>(
  () => sections.value.find((l) => l.id === sectionId.value) ?? null,
)
const sectionCategories = computed<MenuCategory[]>(() =>
  activeSection.value ? categoriesIn(activeSection.value.id) : [],
)
const activeCategory = computed<MenuCategory | null>(
  () => sectionCategories.value.find((c) => c.id === categoryId.value) ?? null,
)

const level = computed<'home' | 'section' | 'category'>(() =>
  activeCategory.value ? 'category' : activeSection.value ? 'section' : 'home',
)
const viewKey = computed(() => `${level.value}:${sectionId.value}:${categoryId.value}`)

// ── navigation (query-only; every other query param is preserved) ─────────
const navigate = (patch: Record<string, string | undefined>) => {
  const query: LocationQueryRaw = { ...route.query }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete query[key]
    else query[key] = value
  }
  router.push({ query })
}

const goHome = () => navigate({ s: undefined, c: undefined })
const openSection = (id: string) => navigate({ s: id, c: undefined })
const openCategory = (id: string) => navigate({ c: id })
const goBack = () => (level.value === 'category' ? navigate({ c: undefined }) : goHome())

// Each level starts at the top — including on browser back/forward.
watch(viewKey, () => {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'auto' })
})

// ── search (home screen) ─────────────────────────────────────────────────
// The field lives on the home screen. The backend matches every dish in every
// language (useMenuSearch); results are plain dish cards — no sections, no
// categories in between.
const search = ref('')
const { active: searching, hits, pending: searchPending, ready: searchReady } = useMenuSearch(search)

// Leaving home clears the search, so coming back shows the sections again.
watch(level, (l) => {
  if (l !== 'home') search.value = ''
})

// ── derived presentation helpers ─────────────────────────────────────────
/** First dish photo of a category, honouring "show image: off". */
const dishPhoto = (cat: MenuCategory): string =>
  cat.items.find((i) => i.showImage !== false && i.image)?.image ?? ''

/** A section's picture: its own upload, else a category banner, else a dish. */
const sectionImage = (lvl: MenuLevel): string => {
  if (lvl.image) return lvl.image
  const cats = categoriesIn(lvl.id)
  const banner = cats.find((c) => c.image)?.image
  if (banner) return banner
  for (const c of cats) {
    const photo = dishPhoto(c)
    if (photo) return photo
  }
  return ''
}

/** A category's round picture: the square icon upload suits it best. */
const categoryThumb = (cat: MenuCategory): string => cat.iconImage || cat.image || dishPhoto(cat)

const categoryDescription = (cat: MenuCategory): string =>
  cat.description ? t(cat.description).trim() : ''

/** Staggered entrance for list items (CSS only — nothing waits on JS). */
const rise = (i: number) => ({ animationDelay: `${Math.min(i, 8) * 60}ms` })

// ── product detail + order overlays ──────────────────────────────────────
const selected = ref<MenuItem | null>(null)
const orderOpen = ref(false)

onMounted(() => {
  // Defensive: clear any body scroll-lock a previous overlay/theme may have left.
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#F1F0EA]">
    <TheHeader v-if="level === 'home'" />
    <HeritageTopBar v-else @home="goHome" />

    <main class="relative mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-5">
      <IconWheat class="pointer-events-none absolute right-1 top-20 hidden h-28 w-28 rotate-12 text-[#A47B45] opacity-[0.07] lg:block" />
      <DecorSprig class="pointer-events-none absolute -left-3 top-1/3 hidden h-28 w-28 -rotate-12 scale-x-[-1] text-[#4F6B58] opacity-[0.07] lg:block" />
      <IconWheat class="pointer-events-none absolute -left-2 bottom-24 hidden h-24 w-24 -rotate-[20deg] scale-x-[-1] text-[#A47B45] opacity-[0.06] lg:block" />
      <DecorSprig class="pointer-events-none absolute right-2 bottom-1/3 hidden h-24 w-24 rotate-12 text-[#4F6B58] opacity-[0.06] lg:block" />

      <Transition name="hr-page" mode="out-in">
        <div :key="viewKey" class="relative">
          <!-- ─────────────── 1 · Home: the sections ─────────────── -->
          <template v-if="level === 'home'">
            <!-- Search -->
            <div class="relative mx-auto mt-2 max-w-2xl">
              <span
                class="pointer-events-none absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#64734D]/12"
                aria-hidden="true"
              >
                <IconSearch class="h-[18px] w-[18px] text-[#64734D]" />
              </span>
              <input
                v-model="search"
                type="search"
                inputmode="search"
                enterkeyhint="search"
                autocomplete="off"
                maxlength="64"
                :placeholder="t(ui.searchPlaceholder)"
                :aria-label="t(ui.searchPlaceholder)"
                class="w-full rounded-full border border-[#D5D1C6] bg-[#FCFBF7] py-3 pl-12 pr-4 font-serif text-base text-[#292A27] shadow-sm outline-none transition placeholder:text-[#95938D] focus:border-[#64734D] focus:ring-2 focus:ring-[#B49A70]/40"
              />
            </div>

            <!-- Search results replace the sections while a query is typed -->
            <template v-if="searching">
              <div class="mt-8 flex items-center justify-center gap-3 sm:mt-10" aria-hidden="true">
                <span class="h-px w-10 bg-[#A47B45]/60" />
                <span class="h-1.5 w-1.5 rotate-45 bg-[#A47B45]" />
                <span class="h-px w-10 bg-[#A47B45]/60" />
              </div>
              <p class="mt-3 text-center font-display text-sm font-bold uppercase tracking-[0.24em] text-[#706F68]">
                {{ t(heritageResults) }}<span v-if="searchReady && hits.length" class="text-[#A47B45]"> · {{ hits.length }}</span>
              </p>

              <!-- First answer on its way -->
              <div
                v-if="searchPending && !hits.length"
                class="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
                aria-hidden="true"
              >
                <div
                  v-for="n in 4"
                  :key="n"
                  class="h-28 animate-pulse rounded-card border border-[#D5D1C6] bg-[#FCFBF7] sm:h-80"
                />
              </div>
              <div
                v-else-if="hits.length"
                class="mt-6 grid grid-cols-1 gap-3 transition-opacity duration-200 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
                :class="{ 'opacity-60': searchPending }"
                :aria-busy="searchPending"
              >
                <MenuCard
                  v-for="h in hits"
                  :key="h.item.id"
                  :item="h.item"
                  :icon="h.category.icon"
                  @open="selected = $event"
                />
              </div>
              <div v-else-if="searchReady" class="flex flex-col items-center py-16 text-center">
                <IconSearch class="h-10 w-10 text-[#64734D]/50" />
                <p class="mt-4 font-serif text-lg text-[#706F68]">{{ t(ui.noResults) }}</p>
              </div>
            </template>

            <template v-else>
              <div class="mt-8 flex flex-col items-center sm:mt-10">
                <p class="font-display text-sm font-bold uppercase tracking-[0.24em] text-[#706F68]">
                  {{ t(heritageSectionsLabel) }}
                </p>
                <div class="mt-3 flex items-center gap-3" aria-hidden="true">
                  <span class="h-px w-10 bg-[#A47B45]/60" />
                  <span class="h-1.5 w-1.5 rotate-45 bg-[#A47B45]" />
                  <span class="h-px w-10 bg-[#A47B45]/60" />
                </div>
              </div>

              <div v-if="sections.length" class="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6">
                <HeritageSectionTile
                  v-for="(lvl, i) in sections"
                  :key="lvl.id"
                  class="hr-rise"
                  :style="rise(i)"
                  :index="i"
                  :title="t(lvl.title)"
                  :image="sectionImage(lvl)"
                  :icon="lvl.icon"
                  :count="categoriesIn(lvl.id).length"
                  :count-label="t(heritageCategoryCount)"
                  @open="openSection(lvl.id)"
                />
              </div>
              <p v-else class="py-16 text-center font-serif text-lg italic text-[#706F68]">
                {{ t(heritageEmpty.sections) }}
              </p>
            </template>
          </template>

          <!-- ────────────── 2 · Section: its categories ────────────── -->
          <template v-else-if="level === 'section' && activeSection">
            <HeritagePageHead :title="t(activeSection.title)" @back="goBack" />

            <div v-if="sectionCategories.length" class="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
              <HeritageCategoryRow
                v-for="(cat, i) in sectionCategories"
                :key="cat.id"
                class="hr-rise"
                :style="rise(i)"
                :title="t(cat.title)"
                :description="categoryDescription(cat)"
                :image="categoryThumb(cat)"
                :icon="cat.icon"
                :count="cat.items.length"
                :count-label="t(ui.dishCount)"
                @open="openCategory(cat.id)"
              />
            </div>
            <p v-else class="py-16 text-center font-serif text-lg italic text-[#706F68]">
              {{ t(heritageEmpty.categories) }}
            </p>
          </template>

          <!-- ────────────── 3 · Category: its dishes ────────────── -->
          <template v-else-if="level === 'category' && activeCategory && activeSection">
            <HeritagePageHead :trail="t(activeSection.title)" @back="goBack" />

            <!-- Heritage's own banner + cards, exactly as in the single-scroll version -->
            <MenuSection :category="activeCategory" @open="selected = $event" />

            <p
              v-if="!activeCategory.items.length"
              class="py-12 text-center font-serif text-lg italic text-[#706F68]"
            >
              {{ t(heritageEmpty.products) }}
            </p>
          </template>
        </div>
      </Transition>
    </main>

    <footer class="relative overflow-hidden border-t border-[#D5D1C6] bg-[#FCFBF7]/70">
      <IconWheat class="pointer-events-none absolute -left-2 bottom-0 h-24 w-24 -rotate-12 text-[#A47B45] opacity-10" />
      <IconWheat class="pointer-events-none absolute -right-2 bottom-0 h-24 w-24 rotate-12 scale-x-[-1] text-[#A47B45] opacity-10" />
      <div class="relative mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-9 text-center">
        <p class="font-display text-xl font-bold uppercase tracking-[0.2em] text-[#292A27]">{{ brand.name }}</p>
        <div class="flex items-center gap-3" aria-hidden="true">
          <span class="h-px w-8 bg-[#A47B45]/60" />
          <span class="h-1.5 w-1.5 rotate-45 bg-[#A47B45]" />
          <span class="h-px w-8 bg-[#A47B45]/60" />
        </div>
        <p v-if="t(brand.tagline)" class="font-serif text-base italic text-[#706F68]">{{ t(brand.tagline) }}</p>
        <p v-if="brand.address || brand.hours" class="font-serif text-sm text-[#292A27]/70">
          {{ [brand.address, brand.hours].filter(Boolean).join(' · ') }}
        </p>
      </div>
    </footer>

    <ImageLightbox :item="selected" theme="heritage" @close="selected = null" />

    <!-- Basket (paid plans only) — bottom-left; WiFi docks bottom-right -->
    <Transition name="hr-bag">
      <button
        v-if="brand.ordering && order.count > 0"
        type="button"
        class="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#26382F] text-[#FCFBF7] shadow-[0_16px_36px_-10px_rgba(38,56,47,0.7)] ring-1 ring-[#A47B45]/50 transition hover:bg-[#33473C] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A47B45]"
        :aria-label="`${t(heritageOrder.basket)} · ${order.count}`"
        @click="orderOpen = true"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 7h12l-1 13H7L6 7z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
        <span
          class="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#A47B45] px-1 text-xs font-bold text-white ring-2 ring-[#26382F]"
        >
          {{ order.count }}
        </span>
      </button>
    </Transition>
    <OrderSheet v-if="brand.ordering" theme="heritage" :open="orderOpen" @close="orderOpen = false" />

    <WifiButton theme="heritage" />
  </div>
</template>

<style scoped>
.hr-page-enter-active,
.hr-page-leave-active {
  transition:
    opacity 0.26s ease,
    transform 0.26s ease;
}
.hr-page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.hr-page-leave-to {
  opacity: 0;
}

.hr-rise {
  animation: hr-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
@keyframes hr-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.hr-bag-enter-active,
.hr-bag-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.hr-bag-enter-from,
.hr-bag-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

@media (prefers-reduced-motion: reduce) {
  .hr-page-enter-active,
  .hr-page-leave-active,
  .hr-bag-enter-active,
  .hr-bag-leave-active {
    transition: none;
  }
  .hr-rise {
    animation: none;
  }
}
</style>
