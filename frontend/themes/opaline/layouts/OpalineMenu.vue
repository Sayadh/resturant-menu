<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// Opaline — root layout
//
// Opaline presents the menu as a guided journey instead of one long scroll:
//
//     Home (sections) → Section (categories) → Category (dishes)
//
// The level is held in the URL query of the EXISTING tenant route
// (`/<slug>?s=<sectionId>&c=<categoryId>`), so the restaurant slug, the domain
// resolver, the locale and the URL convention are all untouched, while browser
// back/forward, refresh and pasted deep links all work. Unknown ids simply
// fall back to the nearest valid level.
//
// All menu DATA, language, favourite, cart and order LOGIC come from the
// shared stores and composables — exactly like Aria, Atelier, Maison,
// Heritage and Noir. Only the presentation differs. (Opaline has no search
// field of its own — the journey is short enough that browsing covers it.)
// ─────────────────────────────────────────────────────────────────────────
import type { LocationQueryRaw } from 'vue-router'
import { ui, type MenuCategory, type MenuItem, type MenuLevel } from '~/data/menu'
import {
  opalineCategoriesLabel,
  opalineCategoryCount,
  opalineEmpty,
} from '~/themes/opaline/config'
import { vReveal } from '~/themes/opaline/animations'
import '~/themes/opaline/styles/opaline.css'

import OpalineHeader from '../components/OpalineHeader.vue'
import OpalineHero from '../components/OpalineHero.vue'
import OpalineSectionCard from '../components/OpalineSectionCard.vue'
import OpalineCategoryCard from '../components/OpalineCategoryCard.vue'
import OpalinePageHead from '../components/OpalinePageHead.vue'
import OpalineProductCard from '../components/OpalineProductCard.vue'
import OpalineProductDetail from '../components/OpalineProductDetail.vue'
import OpalineBasketBar from '../components/OpalineBasketBar.vue'
import OpalineOrderDrawer from '../components/OpalineOrderDrawer.vue'
import OpalineEmpty from '../components/OpalineEmpty.vue'
import OpalineFooter from '../components/OpalineFooter.vue'

const route = useRoute()
const router = useRouter()

const { t } = useLanguage()
const store = useMenuStore()
const brand = useBrand() // ordering (cart) = paid plans only

// ── level state, read straight from the URL ──────────────────────────────
const sectionId = computed(() => String(route.query.s || ''))
const categoryId = computed(() => String(route.query.c || ''))

/** A section's categories, exactly as they exist in the data — same as every other theme. */
const categoriesIn = (levelId: string): MenuCategory[] => store.categoriesOf(levelId)

/** Sections come straight from the API (`store.levels`) — never hardcoded, never hidden. */
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

// ── derived presentation helpers ─────────────────────────────────────────
/** A section's picture: its own upload, else a category banner, else a dish. */
const sectionImage = (lvl: MenuLevel): string => {
  if (lvl.image) return lvl.image
  const cats = categoriesIn(lvl.id)
  const banner = cats.find((c) => c.image)?.image
  if (banner) return banner
  for (const c of cats) {
    const withPhoto = c.items.find((i) => i.showImage !== false && i.image)
    if (withPhoto) return withPhoto.image
  }
  return ''
}

/** A category's picture: its own banner/icon upload, else one of its dishes. */
const categoryImage = (cat: MenuCategory): string =>
  cat.image || cat.iconImage || cat.items.find((i) => i.showImage !== false && i.image)?.image || ''

const categoryDescription = (cat: MenuCategory): string =>
  cat.description ? t(cat.description).trim() : ''

const sectionCategoryCount = (lvl: MenuLevel) => categoriesIn(lvl.id).length

// ── product detail + order overlays ──────────────────────────────────────
const selected = ref<MenuItem | null>(null)
const orderOpen = ref(false)

onMounted(() => {
  // Defensive: clear any body scroll-lock a previous overlay/theme may have left.
  if (import.meta.client) document.body.style.overflow = ''
})

// Opaline owns its typography. Loaded here (not globally) so the marketing
// pages and the other themes are unaffected.
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&family=Noto+Serif+Armenian:wght@400;500;600&family=Noto+Sans+Armenian:wght@400;500;600&display=swap',
    },
  ],
})
</script>

<template>
  <div class="opaline-theme flex min-h-screen flex-col">
    <OpalineHeader @home="goHome" />

    <main class="flex-1">
      <Transition name="op-page" mode="out-in">
        <div :key="viewKey">
          <!-- ─────────────── 1 · Home: the sections ─────────────── -->
          <template v-if="level === 'home'">
            <OpalineHero />

            <!-- The sections -->
            <section class="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-12">
              <template v-if="sections.length">
                <div class="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3">
                  <OpalineSectionCard
                    v-for="(lvl, i) in sections"
                    :key="lvl.id"
                    v-reveal="i"
                    :title="t(lvl.title)"
                    :image="sectionImage(lvl)"
                    :icon="lvl.icon"
                    :count="sectionCategoryCount(lvl)"
                    :count-label="t(opalineCategoryCount)"
                    @open="openSection(lvl.id)"
                  />
                </div>
              </template>

              <OpalineEmpty v-else :message="t(opalineEmpty.sections)" />
            </section>
          </template>

          <!-- ────────────── 2 · Section: its categories ────────────── -->
          <template v-else-if="level === 'section' && activeSection">
            <section class="mx-auto max-w-5xl px-5 pb-16 sm:px-8 sm:pb-24">
              <OpalinePageHead :title="t(activeSection.title)" @back="goBack" />

              <template v-if="sectionCategories.length">
                <p class="op-label border-t border-[#E2E5E8] pt-5 text-[9px] text-[#A1A6B0]">
                  {{ t(opalineCategoriesLabel) }}
                </p>

                <div class="mt-4 grid grid-cols-2 gap-3.5 sm:mt-5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                  <OpalineCategoryCard
                    v-for="(cat, i) in sectionCategories"
                    :key="cat.id"
                    v-reveal="i"
                    :title="t(cat.title)"
                    :description="categoryDescription(cat)"
                    :image="categoryImage(cat)"
                    :icon="cat.icon"
                    :count="cat.items.length"
                    :count-label="t(ui.dishCount)"
                    @open="openCategory(cat.id)"
                  />
                </div>
              </template>

              <OpalineEmpty v-else :message="t(opalineEmpty.categories)" />
            </section>
          </template>

          <!-- ────────────── 3 · Category: its dishes ────────────── -->
          <template v-else-if="level === 'category' && activeCategory && activeSection">
            <section class="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
              <OpalinePageHead
                :eyebrow="t(activeSection.title)"
                :title="t(activeCategory.title)"
                :description="categoryDescription(activeCategory)"
                @back="goBack"
              />

              <template v-if="activeCategory.items.length">
                <!-- A 6/12-column bed so the two builds of the card can share one
                     grid: a dish WITH a picture keeps a full-width slot (1 per row
                     on a phone, 2 at sm, 3 at lg), while a dish whose picture the
                     admin switched off takes half of it and pairs up two-across. -->
                <div class="grid grid-cols-6 gap-3 border-t border-[#E2E5E8] pt-6 sm:gap-5 sm:pt-8 lg:grid-cols-12">
                  <OpalineProductCard
                    v-for="(item, i) in activeCategory.items"
                    :key="item.id"
                    v-reveal="i"
                    :item="item"
                    :class="
                      item.showImage === false
                        ? 'col-span-3 sm:col-span-2 lg:col-span-3'
                        : 'col-span-6 sm:col-span-3 lg:col-span-4'
                    "
                    @open="selected = $event"
                  />
                </div>
              </template>

              <OpalineEmpty v-else :message="t(opalineEmpty.products)" />
            </section>
          </template>
        </div>
      </Transition>
    </main>

    <!-- The colophon closes a menu the guest has read through, on every
         screen including the home one. -->
    <OpalineFooter />

    <!-- Overlays -->
    <OpalineProductDetail :item="selected" @close="selected = null" />
    <OpalineBasketBar v-if="brand.ordering" @open="orderOpen = true" />
    <OpalineOrderDrawer v-if="brand.ordering" :open="orderOpen" @close="orderOpen = false" />
    <WifiButton theme="opaline" />
  </div>
</template>
