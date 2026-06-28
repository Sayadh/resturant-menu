<script setup lang="ts">
// "Aria" design — a premium, modern, warm Armenian-restaurant layout.
// Visually distinct from Heritage, but reads from the same shared stores so
// data, language switching and Food/Drinks/Alcohol logic stay intact.
import { ui, type MenuItem, type MenuCategory, type LocalizedText } from '~/data/menu'

const { t } = useLanguage()
const store = useMenuStore()
const order = useOrderStore()

// Three top tabs derived from the data structure (no data change):
// Food → level food · Drinks → level drinks/soft · Alcohol → level drinks/alcohol.
interface View {
  key: string
  icon: string
  title: LocalizedText
  level: string
  group?: 'soft' | 'alcohol'
}
const ALCOHOL_TITLE: LocalizedText = { AM: 'Ալկոհոլ', EN: 'Alcohol', RU: 'Алкоголь' }
const views = computed<View[]>(() => {
  const out: View[] = []
  for (const lv of store.levels) {
    if (lv.id === 'drinks') {
      out.push({ key: 'drinks-soft', icon: '🥤', title: lv.title, level: lv.id, group: 'soft' })
      out.push({ key: 'drinks-alcohol', icon: '🍷', title: ALCOHOL_TITLE, level: lv.id, group: 'alcohol' })
    } else {
      out.push({ key: lv.id, icon: lv.icon, title: lv.title, level: lv.id })
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
const bannerOf = (cat: MenuCategory) => cat.items.find((i) => i.image)?.image ?? ''

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
  <div class="min-h-screen bg-[#F5EFE2] pb-24">
    <!-- ───────── HERO HEADER ───────── -->
    <header class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#FFF9EF] to-[#F5EFE2]" />
      <IconWheat class="pointer-events-none absolute -left-4 top-8 h-28 w-28 -rotate-[18deg] text-[#C69A5A] opacity-10" />
      <IconWheat class="pointer-events-none absolute -right-4 top-12 h-28 w-28 rotate-[18deg] scale-x-[-1] text-[#C69A5A] opacity-10" />

      <div class="relative mx-auto max-w-5xl px-5 pb-7 pt-4 text-center sm:pb-9">
        <div class="flex justify-center">
          <LanguageSwitcher />
        </div>

        <div class="mx-auto mt-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#C69A5A] bg-[#FFF9EF] font-display text-2xl font-bold text-[#3E2723] shadow-[0_6px_18px_-6px_rgba(198,154,90,0.5)] sm:h-20 sm:w-20 sm:text-3xl">
          TL
        </div>

        <h1 class="mt-4 font-display text-4xl font-bold uppercase leading-tight tracking-[0.2em] text-[#3E2723] sm:text-5xl">
          TUN LAHMAJO
        </h1>
        <p class="mt-2 font-serif text-lg italic text-[#8A7868] sm:text-xl">Ավանդական հայկական համեր</p>

        <!-- thin gold line -->
        <div class="mx-auto mt-4 flex w-40 items-center gap-2" aria-hidden="true">
          <span class="h-px flex-1 bg-[#C69A5A]/60" />
          <span class="h-1.5 w-1.5 rotate-45 bg-[#C69A5A]" />
          <span class="h-px flex-1 bg-[#C69A5A]/60" />
        </div>

        <!-- rating -->
        <div class="mt-4 flex items-center justify-center gap-2">
          <span class="flex text-[#C69A5A]" aria-hidden="true">
            <IconStar v-for="n in 5" :key="n" class="h-[18px] w-[18px]" />
          </span>
          <span class="font-display text-lg font-bold text-[#3E2723]">4.8</span>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 font-serif text-[15px] text-[#3E2723]/85">
          <span class="inline-flex items-center gap-1.5"><IconPin class="h-4 w-4 text-[#C69A5A]" /> Երևան</span>
          <span class="inline-flex items-center gap-1.5"><IconClock class="h-4 w-4 text-[#C69A5A]" /> 09:00–23:00</span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[#6F8B4A]/15 px-2.5 py-0.5 text-sm font-semibold text-[#6F8B4A]">
            <span class="h-1.5 w-1.5 rounded-full bg-[#6F8B4A]" /> {{ t(ui.openNow) }}
          </span>
        </div>
      </div>
    </header>

    <!-- ───────── STICKY: TABS + SEARCH + CATEGORY RAIL ───────── -->
    <div data-nav class="sticky top-0 z-30 border-b border-[#E4D6C2] bg-[#F5EFE2]/95 backdrop-blur">
      <div class="mx-auto max-w-5xl px-4 py-3">
        <!-- Tabs -->
        <div class="flex gap-2" role="tablist">
          <button
            v-for="v in views"
            :key="v.key"
            type="button"
            class="flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200"
            :class="
              activeKey === v.key
                ? 'border-[#C69A5A] bg-[#C69A5A] text-white shadow-[0_8px_18px_-8px_rgba(198,154,90,0.7)]'
                : 'border-[#E4D6C2] bg-[#FFF9EF] text-[#3E2723] hover:border-[#C69A5A]/60'
            "
            @click="selectView(v.key)"
          >
            <span aria-hidden="true">{{ v.icon }}</span>
            <span class="hidden xs:inline sm:inline">{{ t(v.title) }}</span>
          </button>
        </div>

        <!-- Search -->
        <div class="relative mt-3">
          <span class="pointer-events-none absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#C69A5A]/15">
            <IconSearch class="h-[18px] w-[18px] text-[#A87E42]" />
          </span>
          <input
            v-model="search"
            type="search"
            placeholder="Որոնել ուտեստ կամ խմիչք..."
            class="w-full rounded-full border border-[#E4D6C2] bg-[#FFF9EF] py-3 pl-12 pr-4 font-serif text-base text-[#3E2723] shadow-sm outline-none transition focus:border-[#C69A5A] focus:ring-2 focus:ring-[#C69A5A]/25"
          />
        </div>

        <!-- Category thumbnail rail -->
        <nav class="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            v-for="cat in baseCategories"
            :key="cat.id"
            type="button"
            class="inline-flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition"
            :class="
              activeId === cat.id
                ? 'border-[#C69A5A] bg-[#C69A5A]/15 text-[#3E2723]'
                : 'border-[#E4D6C2] bg-[#FFF9EF] text-[#3E2723]/80 hover:border-[#C69A5A]/60'
            "
            @click="scrollToCategory(cat.id)"
          >
            <span class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#C69A5A]/25 to-[#6F8B4A]/15 text-sm">
              <img v-if="bannerOf(cat)" :src="bannerOf(cat)" :alt="t(cat.title)" class="h-full w-full object-cover" />
              <span v-else aria-hidden="true">{{ cat.icon }}</span>
            </span>
            {{ t(cat.title) }}
          </button>
        </nav>
      </div>
    </div>

    <!-- ───────── SECTIONS ───────── -->
    <main class="mx-auto max-w-5xl px-4 pt-6">
      <div v-if="hasResults" class="flex flex-col gap-10">
        <section v-for="cat in categories" :key="cat.id" :id="cat.id">
          <!-- Big category card -->
          <div class="group relative mb-5 h-32 overflow-hidden rounded-[22px] shadow-[0_10px_28px_-12px_rgba(62,39,35,0.4)] sm:h-40">
            <div class="absolute inset-0 bg-gradient-to-br from-[#5A4038] to-[#3E2723]" />
            <img
              v-if="bannerOf(cat)"
              :src="bannerOf(cat)"
              :alt="t(cat.title)"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#3E2723]/92 via-[#3E2723]/45 to-transparent" />
            <div class="absolute inset-0 flex flex-col justify-end p-5">
              <div class="flex items-center gap-3">
                <span class="flex h-12 w-12 items-center justify-center rounded-full border border-[#C69A5A]/60 bg-[#3E2723]/40 text-2xl backdrop-blur-sm" aria-hidden="true">{{ cat.icon }}</span>
                <div>
                  <h2 class="font-display text-2xl font-bold uppercase tracking-[0.12em] text-[#FFF9EF] drop-shadow sm:text-3xl">{{ t(cat.title) }}</h2>
                  <p class="font-serif text-sm text-[#FFF9EF]/80">{{ cat.items.length }} {{ t(ui.dishCount) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Product grid -->
          <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            <article
              v-for="item in cat.items"
              :key="item.id"
              class="group flex flex-col overflow-hidden rounded-[22px] border border-[#E4D6C2] bg-[#FFF9EF] shadow-[0_6px_20px_-10px_rgba(62,39,35,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-14px_rgba(62,39,35,0.35)]"
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
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    :class="{ grayscale: item.available === false }"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C69A5A]/25 to-[#6F8B4A]/15">
                    <span class="text-4xl" aria-hidden="true">{{ cat.icon }}</span>
                  </div>
                </button>

                <!-- Badge -->
                <span v-if="item.badge" class="absolute left-2 top-2"><MenuBadge :badge="item.badge" /></span>

                <!-- Favorite -->
                <button
                  type="button"
                  class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF9EF]/90 shadow-sm backdrop-blur transition hover:scale-110"
                  :aria-label="order.isFav(item.id) ? 'Հեռացնել ֆավորիտներից' : 'Ավելացնել ֆավորիտներ'"
                  @click="order.toggleFav(item.id)"
                >
                  <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" :fill="order.isFav(item.id) ? '#C0392B' : 'none'" :stroke="order.isFav(item.id) ? '#C0392B' : '#8A7868'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.8 8.6c0 4.5-7.4 9.2-8.8 10-1.4-.8-8.8-5.5-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />
                  </svg>
                </button>

                <!-- Sold out -->
                <div v-if="item.available === false" class="absolute inset-0 flex items-center justify-center bg-[#3E2723]/45">
                  <span class="rounded-full border border-[#FFF9EF]/40 bg-[#3E2723]/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#FFF9EF]">{{ t(ui.soldOut) }}</span>
                </div>
              </div>

              <!-- Body -->
              <div class="flex flex-1 flex-col p-3 sm:p-4">
                <h3 class="font-serif text-base font-semibold leading-snug text-[#3E2723] sm:text-lg">{{ t(item.name) }}</h3>
                <p class="mt-1 line-clamp-2 font-serif text-xs leading-relaxed text-[#8A7868] sm:text-sm">{{ t(item.description) }}</p>

                <div class="mt-auto flex items-center justify-between gap-2 pt-3">
                  <p class="font-display text-lg font-bold text-[#A87E42] sm:text-xl">
                    {{ fmt(item.price) }}<span class="ml-0.5 text-[#C69A5A]">֏</span>
                  </p>

                  <!-- Add / stepper -->
                  <div v-if="order.qtyOf(item.id) > 0" class="flex items-center gap-1.5">
                    <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4D6C2] bg-white text-lg font-bold text-[#3E2723] transition hover:border-[#C69A5A]" @click="order.dec(item.id)">−</button>
                    <span class="w-4 text-center font-display font-bold text-[#3E2723]">{{ order.qtyOf(item.id) }}</span>
                    <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full bg-[#C69A5A] text-lg font-bold text-white transition hover:bg-[#A87E42]" @click="order.add(item.id)">+</button>
                  </div>
                  <button
                    v-else-if="item.available !== false"
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-[#3E2723] text-xl font-bold text-[#FFF9EF] shadow-sm transition hover:bg-[#5A4038] active:scale-95"
                    aria-label="Ավելացնել պատվերին"
                    @click="order.add(item.id)"
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="flex flex-col items-center py-20 text-center">
        <IconSearch class="h-10 w-10 text-[#C69A5A]/50" />
        <p class="mt-4 font-serif text-lg text-[#8A7868]">{{ t(ui.noResults) }}</p>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-10 border-t border-[#E4D6C2] bg-[#FFF9EF]/70">
      <div class="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 py-8 text-center">
        <p class="font-display text-lg font-bold uppercase tracking-[0.2em] text-[#3E2723]">TUN LAHMAJO</p>
        <p class="font-serif text-sm italic text-[#8A7868]">{{ t(ui.footerNote) }}</p>
        <NuxtLink to="/admin" class="mt-1 font-serif text-xs uppercase tracking-widest text-[#3E2723]/40 transition hover:text-[#C69A5A]">Admin</NuxtLink>
      </div>
    </footer>

    <!-- Floating order button -->
    <button
      v-if="order.count > 0"
      type="button"
      class="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#3E2723] px-5 py-3 font-serif text-sm font-bold text-[#FFF9EF] shadow-[0_12px_28px_-8px_rgba(62,39,35,0.6)] transition hover:bg-[#5A4038]"
      @click="orderOpen = true"
    >
      🧺 {{ t(ui.viewOrder) }}
      <span class="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C69A5A] px-1.5 text-xs text-white">{{ order.count }}</span>
    </button>

    <OrderSheet :open="orderOpen" @close="orderOpen = false" />
    <ImageLightbox :item="selected" @close="selected = null" />
  </div>
</template>
