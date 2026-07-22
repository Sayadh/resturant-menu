<script setup lang="ts">
// "Aria" design — a premium, modern, warm Armenian-restaurant QR menu.
// Visually distinct from Heritage, but reads from the same shared stores so
// data, language switching and Food/Drinks/Alcohol logic stay intact.
import { ui, type MenuItem, type MenuCategory, type LocalizedText } from '~/data/menu'
import {
  ariaSearchPlaceholder,
  ariaBasketLabel,
  ariaItemsWord,
} from '~/themes/aria/config'

const { t } = useLanguage()
const store = useMenuStore()
const order = useOrderStore()
const brand = useBrand()
const mono = computed(() => {
  const i = brand.name.split(/\s+/).map((w) => w[0]).join('')
  return (i.length > 1 ? i : brand.name).slice(0, 2).toUpperCase()
})

// Top tabs are the restaurant's dynamic sections (one tab per section).
interface View {
  key: string
  icon: string
  image?: string
  title: LocalizedText
  level: string
  group?: 'soft' | 'alcohol'
}
const views = computed<View[]>(() =>
  store.levels.map((lv) => ({ key: lv.id, icon: lv.icon || '🍽️', image: lv.image, title: lv.title, level: lv.id })),
)

const activeKey = ref(views.value[0]?.key ?? '')
const activeView = computed(() => views.value.find((v) => v.key === activeKey.value) ?? views.value[0])

const search = ref('')
const selected = ref<MenuItem | null>(null)
const orderOpen = ref(false)

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
const activeId = ref('')
const fmt = (n: number) => n.toLocaleString('hy-AM')
// Desktop banner: the category's own image wins; fall back to a product photo.
const bannerOf = (cat: MenuCategory) => cat.image || cat.items.find((i) => i.image)?.image || ''
// Mobile banner: dedicated mobile image, else the desktop banner.
const mobileBannerOf = (cat: MenuCategory) => cat.mobileImage || bannerOf(cat)
// The category's own small icon image (falls back to the emoji in templates).
const iconOf = (cat: MenuCategory) => cat.iconImage || ''

// Running total for the floating basket bar.
const orderTotal = computed(() =>
  order.lines.reduce((sum, l) => {
    const found = store.findItem(l.id)
    return sum + (found ? found.item.price * l.qty : 0)
  }, 0),
)

const selectView = (key: string) => {
  if (key === activeKey.value) return
  activeKey.value = key
  search.value = ''
  activeId.value = baseCategories.value[0]?.id ?? ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToCategory = (id: string) => {
  activeId.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// sticky nav height → scroll offset
const updateNavHeight = () => {
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  if (nav) document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`)
}

let observer: IntersectionObserver | null = null
const setupObserver = async () => {
  await nextTick()
  updateNavHeight()
  observer?.disconnect()
  const navH = document.querySelector<HTMLElement>('[data-nav]')?.offsetHeight ?? 160
  observer = new IntersectionObserver(
    (entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (vis[0]) activeId.value = vis[0].target.id
    },
    { rootMargin: `-${navH + 8}px 0px -55% 0px`, threshold: [0.1, 0.25, 0.5] },
  )
  categories.value.forEach((cat) => {
    const el = document.getElementById(cat.id)
    if (el) observer?.observe(el)
  })
}

// Keep the active category chip centered in the rail — scroll ONLY the
// horizontal rail, never the window (scrollIntoView would yank the page up).
watch(activeId, async (id) => {
  if (!id) return
  await nextTick()
  const chip = document.querySelector<HTMLElement>(`[data-chip="${id}"]`)
  const rail = chip?.closest<HTMLElement>('nav')
  if (!chip || !rail) return
  const c = chip.getBoundingClientRect()
  const r = rail.getBoundingClientRect()
  rail.scrollTo({ left: rail.scrollLeft + (c.left - r.left) - r.width / 2 + c.width / 2, behavior: 'smooth' })
})

onMounted(() => {
  activeId.value = baseCategories.value[0]?.id ?? ''
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
  <div class="aria flex min-h-screen flex-col bg-[#F5EFE2] text-[#3E2723]">
    <!-- ───────── HERO HEADER ───────── -->
    <header class="relative overflow-hidden">
      <!-- warm wash + faint motif -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#FFF9EF] via-[#FBF3E5] to-[#F5EFE2]" />
      <div class="aria-motif pointer-events-none absolute inset-0 opacity-[0.5]" />
      <IconWheat class="pointer-events-none absolute -left-5 top-10 h-32 w-32 -rotate-[18deg] text-[#C69A5A] opacity-[0.09]" />
      <IconWheat class="pointer-events-none absolute -right-5 top-14 h-32 w-32 rotate-[18deg] scale-x-[-1] text-[#C69A5A] opacity-[0.09]" />

      <!-- utility row: language switcher -->
      <div class="relative mx-auto flex max-w-5xl items-center justify-end px-5 pt-4">
        <LanguageSwitcher />
      </div>

      <!-- framed brand block -->
      <div class="relative mx-auto max-w-3xl px-5 pb-8 pt-2 text-center">
        <div class="relative rounded-[26px] border border-[#C69A5A]/30 bg-[#FFF9EF]/55 px-6 pb-7 pt-8 shadow-[0_18px_50px_-26px_rgba(62,39,35,0.45)] backdrop-blur-sm sm:px-10">
          <!-- corner ticks -->
          <span class="pointer-events-none absolute left-3 top-3 h-4 w-4 rounded-tl-md border-l border-t border-[#C69A5A]/60" />
          <span class="pointer-events-none absolute right-3 top-3 h-4 w-4 rounded-tr-md border-r border-t border-[#C69A5A]/60" />
          <span class="pointer-events-none absolute bottom-3 left-3 h-4 w-4 rounded-bl-md border-b border-l border-[#C69A5A]/60" />
          <span class="pointer-events-none absolute bottom-3 right-3 h-4 w-4 rounded-br-md border-b border-r border-[#C69A5A]/60" />

          <!-- monogram -->
          <div class="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-[#DBBA82] via-[#C69A5A] to-[#A87E42] p-[2px] shadow-[0_10px_24px_-8px_rgba(198,154,90,0.7)]">
            <div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#FFF9EF] font-display text-2xl font-bold tracking-wide text-[#3E2723]">
              <img v-if="brand.logo" :src="brand.logo" alt="" class="h-full w-full rounded-full object-cover" />
              <template v-else>{{ mono }}</template>
            </div>
          </div>

          <h1 class="mt-4 font-display text-[28px] font-bold uppercase leading-tight tracking-[0.22em] text-[#3E2723] sm:text-5xl">
            {{ brand.name }}
          </h1>
          <p class="mt-1.5 font-serif text-base italic text-[#7A6654] sm:text-xl">{{ t(brand.tagline) }}</p>

          <!-- ornate gold divider -->
          <div class="mx-auto mt-4 flex w-52 items-center gap-2.5" aria-hidden="true">
            <span class="h-px flex-1 bg-gradient-to-r from-transparent to-[#C69A5A]/70" />
            <DecorSprig class="h-4 w-4 -scale-x-100 text-[#C69A5A]" />
            <span class="h-1.5 w-1.5 rotate-45 border border-[#C69A5A] bg-[#C69A5A]/40" />
            <DecorSprig class="h-4 w-4 text-[#C69A5A]" />
            <span class="h-px flex-1 bg-gradient-to-l from-transparent to-[#C69A5A]/70" />
          </div>

          <!-- rating (only if set) -->
          <div v-if="brand.rating" class="mt-3.5 flex items-center justify-center gap-2">
            <span class="flex text-[#C69A5A]" aria-hidden="true">
              <IconStar v-for="n in 5" :key="n" class="h-[17px] w-[17px]" />
            </span>
            <span class="font-display text-base font-bold text-[#3E2723]">{{ brand.rating }}</span>
          </div>

          <!-- info chips (each shown only when filled) -->
          <div v-if="brand.address || brand.hours" class="mt-4 flex flex-wrap items-center justify-center gap-2 font-serif text-sm">
            <span v-if="brand.address" class="inline-flex items-center gap-1.5 rounded-full border border-[#E4D6C2] bg-[#FFF9EF] px-3 py-1.5 text-[#3E2723]/85 shadow-sm">
              <IconPin class="h-4 w-4 text-[#C69A5A]" /> {{ brand.address }}
            </span>
            <span v-if="brand.hours" class="inline-flex items-center gap-1.5 rounded-full border border-[#E4D6C2] bg-[#FFF9EF] px-3 py-1.5 text-[#3E2723]/85 shadow-sm">
              <IconClock class="h-4 w-4 text-[#C69A5A]" /> {{ brand.hours }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- ───────── STICKY: TABS + SEARCH + CATEGORY RAIL ───────── -->
    <div data-nav class="sticky top-0 z-30 border-b border-[#E4D6C2] bg-[#F5EFE2]/92 backdrop-blur-md">
      <div class="mx-auto max-w-5xl px-3 py-2 sm:px-4 sm:py-3">
        <!-- Tabs — single row: centered when they fit, horizontal scroll when
             there are many sections (never wrap, never break the layout). -->
        <div class="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div class="mx-auto flex w-max gap-1.5 sm:gap-2" role="tablist">
          <button
            v-for="v in views"
            :key="v.key"
            type="button"
            role="tab"
            :aria-selected="activeKey === v.key"
            class="group relative flex shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl border px-3 py-2 text-xs font-bold tracking-wide transition-all duration-300 sm:px-4 sm:py-2.5 sm:text-sm"
            :class="
              activeKey === v.key
                ? 'border-[#C69A5A] bg-gradient-to-br from-[#DBBA82] via-[#C69A5A] to-[#A87E42] text-white shadow-[0_10px_22px_-8px_rgba(198,154,90,0.75)]'
                : 'border-[#E4D6C2] bg-[#FFF9EF] text-[#3E2723] hover:border-[#C69A5A]/60 hover:bg-[#FBF3E5]'
            "
            @click="selectView(v.key)"
          >
            <span class="flex items-center gap-1.5">
              <span v-if="v.image" class="grid h-4 w-4 shrink-0 place-items-center overflow-hidden rounded-full sm:h-5 sm:w-5" aria-hidden="true">
                <img :src="v.image" alt="" class="h-full w-full object-cover" />
              </span>
              <span v-else class="text-sm sm:text-base" aria-hidden="true">{{ v.icon }}</span>
              <span>{{ t(v.title) }}</span>
            </span>
            <!-- active bottom indicator -->
            <span
              v-if="activeKey === v.key"
              class="mt-0.5 h-1 w-6 rounded-full bg-white/85"
              aria-hidden="true"
            />
          </button>
          </div>
        </div>

        <!-- Search -->
        <div class="relative mt-2 transition sm:mt-3">
          <span class="pointer-events-none absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#C69A5A]/15 sm:h-9 sm:w-9">
            <IconSearch class="h-4 w-4 text-[#A87E42] sm:h-[18px] sm:w-[18px]" />
          </span>
          <input
            v-model="search"
            type="search"
            :placeholder="t(ariaSearchPlaceholder)"
            class="w-full rounded-full border border-[#E4D6C2] bg-[#FFF9EF] py-2.5 pl-12 pr-11 font-serif text-base text-[#3E2723] shadow-sm outline-none transition duration-200 focus:border-[#C69A5A] focus:shadow-[0_6px_18px_-8px_rgba(198,154,90,0.6)] focus:ring-2 focus:ring-[#C69A5A]/25 sm:py-3 sm:pl-13 sm:pr-12"
          />
          <span class="pointer-events-none absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#A87E42]/70 sm:h-9 sm:w-9">
            <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </span>
        </div>

        <!-- Category image rail -->
        <nav class="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-3 sm:gap-2.5">
          <button
            v-for="cat in baseCategories"
            :key="cat.id"
            type="button"
            :data-chip="cat.id"
            class="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-2xl border py-1 pl-1 pr-3 text-[13px] font-semibold transition-all duration-300 sm:gap-2.5 sm:py-1.5 sm:pl-1.5 sm:pr-3.5 sm:text-sm"
            :class="
              activeId === cat.id
                ? 'border-[#C69A5A] bg-[#FFF9EF] text-[#3E2723] shadow-[0_8px_18px_-8px_rgba(198,154,90,0.65)] ring-1 ring-[#C69A5A]/50'
                : 'border-[#E4D6C2] bg-[#FFF9EF]/70 text-[#3E2723]/75 hover:border-[#C69A5A]/50 hover:text-[#3E2723]'
            "
            @click="scrollToCategory(cat.id)"
          >
            <span class="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#C69A5A]/25 to-[#6F8B4A]/15 sm:h-9 sm:w-9 sm:rounded-xl">
              <img v-if="iconOf(cat) || bannerOf(cat)" :src="iconOf(cat) || bannerOf(cat)" :alt="t(cat.title)" loading="lazy" class="h-full w-full object-cover" />
              <span v-else class="text-sm sm:text-base" aria-hidden="true">{{ cat.icon }}</span>
            </span>
            <span class="flex flex-col items-start leading-tight">
              <span>{{ t(cat.title) }}</span>
              <span class="text-[10px] font-normal text-[#7A6654] sm:text-[11px]">{{ cat.items.length }} {{ t(ui.dishCount) }}</span>
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- ───────── SECTIONS ───────── -->
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28">
      <div v-if="hasResults" class="flex flex-col gap-12">
        <section v-for="cat in categories" :id="cat.id" :key="cat.id" class="scroll-mt-2">
          <!-- Premium category banner -->
          <div class="group relative mb-5 h-36 overflow-hidden rounded-[22px] shadow-[0_14px_34px_-16px_rgba(62,39,35,0.55)] ring-1 ring-[#C69A5A]/25 sm:h-44">
            <div class="absolute inset-0 bg-gradient-to-br from-[#5A4038] to-[#3E2723]" />
            <!-- desktop banner -->
            <img
              v-if="bannerOf(cat)"
              :src="bannerOf(cat)"
              :alt="t(cat.title)"
              loading="lazy"
              class="absolute inset-0 hidden h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:block"
            />
            <!-- mobile banner -->
            <img
              v-if="mobileBannerOf(cat)"
              :src="mobileBannerOf(cat)"
              :alt="t(cat.title)"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:hidden"
            />
            <div v-if="!bannerOf(cat) && !mobileBannerOf(cat)" class="aria-motif absolute inset-0 opacity-30" />
            <!-- scrim adapts to the chosen title colour so the text always reads -->
            <div class="absolute inset-0 bg-gradient-to-t" :class="cat.bannerTextColor === 'dark' ? 'from-[#FFF9EF]/95 via-[#FFF9EF]/55 to-transparent' : 'from-[#2C1A16]/92 via-[#3E2723]/45 to-transparent'" />
            <!-- thin inner gold frame -->
            <span class="pointer-events-none absolute inset-3 rounded-2xl border border-[#DBBA82]/30" aria-hidden="true" />
            <div class="absolute inset-0 flex flex-col justify-end p-5">
              <div class="flex items-center gap-3">
                <span class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#DBBA82]/60 bg-[#3E2723]/40 text-2xl backdrop-blur-sm" aria-hidden="true">
                  <img v-if="iconOf(cat)" :src="iconOf(cat)" alt="" class="h-full w-full object-cover" />
                  <template v-else>{{ cat.icon }}</template>
                </span>
                <div>
                  <h2 class="font-display text-2xl font-bold uppercase tracking-[0.12em] drop-shadow sm:text-3xl" :class="cat.bannerTextColor === 'dark' ? 'text-[#3E2723]' : 'text-[#FFF9EF]'">{{ t(cat.title) }}</h2>
                  <p class="font-serif text-sm" :class="cat.bannerTextColor === 'dark' ? 'text-[#3E2723]/85' : 'text-[#FFF9EF]/85'">{{ cat.items.length }} {{ t(ui.dishCount) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Product grid -->
          <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            <article
              v-for="item in cat.items"
              :key="item.id"
              class="group flex flex-col overflow-hidden rounded-[22px] border border-[#E4D6C2] bg-[#FFF9EF] shadow-[0_6px_20px_-10px_rgba(62,39,35,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C69A5A]/50 hover:shadow-[0_22px_40px_-16px_rgba(62,39,35,0.4)]"
              :class="{ 'opacity-80': item.available === false }"
            >
              <!-- Image -->
              <div class="relative aspect-[4/3] w-full overflow-hidden">
                <button type="button" class="block h-full w-full" :aria-label="t(item.name)" @click="selected = item">
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="t(item.name)"
                    loading="lazy"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    :class="{ grayscale: item.available === false }"
                  />
                  <!-- elegant placeholder -->
                  <div v-else class="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FBF3E5] to-[#F0E6D2]">
                    <span class="aria-motif absolute inset-0 opacity-50" aria-hidden="true" />
                    <span class="absolute inset-2 rounded-2xl border border-[#C69A5A]/35" aria-hidden="true" />
                    <span class="relative flex flex-col items-center gap-1 px-2 text-center">
                      <span class="text-3xl" aria-hidden="true">{{ cat.icon }}</span>
                      <span class="font-serif text-[11px] font-semibold leading-tight text-[#A87E42]">{{ t(item.name) }}</span>
                    </span>
                  </div>
                </button>

                <!-- Badge -->
                <span v-if="item.badge" class="absolute left-2 top-2"><MenuBadge :badge="item.badge" /></span>

                <!-- Sold out -->
                <div v-if="item.available === false" class="absolute inset-0 flex items-center justify-center bg-[#3E2723]/45">
                  <span class="rounded-full border border-[#FFF9EF]/40 bg-[#3E2723]/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#FFF9EF]">{{ t(ui.soldOut) }}</span>
                </div>
              </div>

              <!-- Body -->
              <div class="flex flex-1 flex-col p-3 sm:p-4">
                <h3 class="font-serif text-base font-semibold leading-snug text-[#3E2723] sm:text-lg">{{ t(item.name) }}</h3>
                <p class="mt-1 line-clamp-2 font-serif text-xs leading-relaxed text-[#7A6654] sm:text-sm">{{ t(item.description) }}</p>

                <div class="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-2 pt-3">
                  <p class="font-display text-base font-bold text-[#A87E42] sm:text-xl">
                    {{ fmt(item.price) }}<span class="ml-0.5 text-[#C69A5A]">֏</span>
                  </p>

                  <!-- Add / stepper (ordering = paid plans only) -->
                  <template v-if="brand.ordering">
                    <div v-if="order.qtyOf(item.id) > 0" class="flex items-center gap-1 rounded-full border border-[#E4D6C2] bg-[#FFF9EF] p-1 shadow-[0_4px_12px_-6px_rgba(62,39,35,0.3)]">
                      <button type="button" class="grid h-7 w-7 place-items-center rounded-full text-lg font-bold leading-none text-[#3E2723] transition hover:bg-[#F0E6D2] sm:h-8 sm:w-8" aria-label="Պակասեցնել" @click="order.dec(item.id)">−</button>
                      <span class="min-w-[1.25rem] text-center font-display text-sm font-bold text-[#3E2723] sm:text-base">{{ order.qtyOf(item.id) }}</span>
                      <button type="button" class="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#DBBA82] via-[#C69A5A] to-[#A87E42] text-white shadow-[0_4px_10px_-3px_rgba(198,154,90,0.7)] transition hover:brightness-105 active:scale-90 sm:h-8 sm:w-8" aria-label="Ավելացնել" @click="order.add(item.id)">
                        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
                      </button>
                    </div>
                    <button
                      v-else-if="item.available !== false"
                      type="button"
                      class="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#DBBA82] via-[#C69A5A] to-[#A87E42] text-white shadow-[0_8px_18px_-6px_rgba(198,154,90,0.8)] ring-1 ring-white/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(198,154,90,0.95)] active:translate-y-0 active:scale-90 sm:h-10 sm:w-10"
                      aria-label="Ավելացնել պատվերին"
                      @click="order.add(item.id)"
                    >
                      <svg viewBox="0 0 24 24" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
                    </button>
                  </template>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="flex flex-col items-center py-20 text-center">
        <IconSearch class="h-10 w-10 text-[#C69A5A]/50" />
        <p class="mt-4 font-serif text-lg text-[#7A6654]">{{ t(ui.noResults) }}</p>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-12 border-t border-[#E4D6C2] bg-[#FFF9EF]/70">
      <div class="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 py-8 text-center">
        <p class="font-display text-lg font-bold uppercase tracking-[0.2em] text-[#3E2723]">{{ brand.name }}</p>
        <p v-if="t(brand.tagline)" class="font-serif text-sm italic text-[#7A6654]">{{ t(brand.tagline) }}</p>
      </div>
    </footer>

    <!-- Floating order button (compact, corner) — paid plans only -->
    <Transition name="bar">
      <button
        v-if="brand.ordering && order.count > 0"
        type="button"
        class="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3E2723] to-[#5A4038] text-2xl text-[#FFF9EF] shadow-[0_16px_36px_-10px_rgba(62,39,35,0.7)] ring-1 ring-[#C69A5A]/30 transition hover:brightness-110 active:scale-95"
        :aria-label="`${t(ariaBasketLabel)} · ${order.count}`"
        @click="orderOpen = true"
      >
        🛍
        <span class="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#6F8B4A] px-1 text-xs font-bold text-white ring-2 ring-[#3E2723]">{{ order.count }}</span>
      </button>
    </Transition>

    <OrderSheet v-if="brand.ordering" :open="orderOpen" @close="orderOpen = false" />
    <ImageLightbox :item="selected" @close="selected = null" />
  </div>
</template>

<style scoped>
/* Clip horizontal overflow (decorative wheat icons) WITHOUT creating a scroll
   container — `overflow-x: hidden` would break `position: sticky` on the nav. */
.aria {
  overflow-x: clip;
}

/* Subtle Armenian-inspired diamond lattice used for placeholders & washes. */
.aria-motif {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%23C69A5A' stroke-width='1' stroke-opacity='0.4'%3E%3Cpath d='M20 2 38 20 20 38 2 20Z'/%3E%3Cpath d='M20 12 28 20 20 28 12 20Z'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 40px 40px;
}

.pl-13 {
  padding-left: 3.25rem;
}

/* Floating bar entrance */
.bar-enter-active,
.bar-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.bar-enter-from,
.bar-leave-to {
  opacity: 0;
  transform: translate(-50%, 120%);
}
</style>
