<script setup lang="ts">
// "Heritage" design — the original warm/traditional layout, fully self-contained
// (its own components + logic). Reads from the shared menu store so it stays in
// sync with the admin regardless of which design is active.
import { ui, type MenuItem, type DrinkGroup } from '~/data/menu'

const { t } = useLanguage()
const store = useMenuStore()
const brand = useBrand()

const activeLevel = ref<string>(store.levels[0]?.id ?? 'food')
const activeGroup = ref<DrinkGroup>('soft') // only used inside the Drinks level
const search = ref('')
const selected = ref<MenuItem | null>(null)

const levelCategories = computed(() => store.categoriesOf(activeLevel.value, activeGroup.value))
const activeId = ref(levelCategories.value[0]?.id ?? '')

const filteredCategories = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return levelCategories.value
  return levelCategories.value
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const haystack = [
          item.name.AM,
          item.name.EN,
          item.name.RU,
          item.description.AM,
          item.description.EN,
          item.description.RU,
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      }),
    }))
    .filter((cat) => cat.items.length > 0)
})

const hasResults = computed(() => filteredCategories.value.length > 0)

const selectLevel = (id: string) => {
  if (id === activeLevel.value) return
  activeLevel.value = id
  if (id === 'drinks') activeGroup.value = 'soft'
  search.value = ''
  activeId.value = levelCategories.value[0]?.id ?? ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const selectGroup = (id: DrinkGroup) => {
  if (id === activeGroup.value) return
  activeGroup.value = id
  search.value = ''
  activeId.value = levelCategories.value[0]?.id ?? ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToCategory = (id: string) => {
  activeId.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const navHeight = ref(160)
const updateNavHeight = () => {
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  if (nav) {
    navHeight.value = nav.offsetHeight
    document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`)
  }
}

let observer: IntersectionObserver | null = null
const setupObserver = async () => {
  await nextTick()
  updateNavHeight()
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) activeId.value = visible[0].target.id
    },
    { rootMargin: `-${navHeight.value + 8}px 0px -55% 0px`, threshold: [0.1, 0.25, 0.5] },
  )
  filteredCategories.value.forEach((cat) => {
    const el = document.getElementById(cat.id)
    if (el) observer?.observe(el)
  })
}

watch(
  () => store.levels,
  (lv) => {
    if (!lv.find((l) => l.id === activeLevel.value)) {
      activeLevel.value = lv[0]?.id ?? ''
      activeId.value = levelCategories.value[0]?.id ?? ''
    }
  },
  { deep: true },
)

onMounted(() => {
  setupObserver()
  window.addEventListener('resize', updateNavHeight)
})
watch(filteredCategories, setupObserver, { flush: 'post' })
onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', updateNavHeight)
})
</script>

<template>
  <div class="min-h-screen">
    <TheHeader />

    <CategoryNav
      :categories="levelCategories"
      :active-id="activeId"
      :active-level="activeLevel"
      :active-group="activeGroup"
      v-model:search="search"
      @select="scrollToCategory"
      @select-level="selectLevel"
      @select-group="selectGroup"
    />

    <main class="relative mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-5 sm:pt-10">
      <IconWheat class="pointer-events-none absolute right-1 top-20 hidden h-28 w-28 rotate-12 text-caramel opacity-[0.07] lg:block" />
      <DecorSprig class="pointer-events-none absolute -left-3 top-1/3 hidden h-28 w-28 -rotate-12 scale-x-[-1] text-herb opacity-[0.07] lg:block" />
      <IconWheat class="pointer-events-none absolute -left-2 bottom-24 hidden h-24 w-24 -rotate-[20deg] scale-x-[-1] text-caramel opacity-[0.06] lg:block" />
      <DecorSprig class="pointer-events-none absolute right-2 bottom-1/3 hidden h-24 w-24 rotate-12 text-herb opacity-[0.06] lg:block" />

      <div v-if="hasResults" class="flex flex-col gap-10 sm:gap-14">
        <MenuSection
          v-for="cat in filteredCategories"
          :key="cat.id"
          :category="cat"
          @open="selected = $event"
        />
      </div>

      <div v-else class="flex flex-col items-center py-20 text-center">
        <IconSearch class="h-10 w-10 text-caramel/50" />
        <p class="mt-4 font-serif text-lg text-brown-soft">{{ t(ui.noResults) }}</p>
      </div>
    </main>

    <footer class="relative overflow-hidden border-t border-caramel/25 bg-card/70">
      <IconWheat class="pointer-events-none absolute -left-2 bottom-0 h-24 w-24 -rotate-12 text-caramel opacity-10" />
      <IconWheat class="pointer-events-none absolute -right-2 bottom-0 h-24 w-24 rotate-12 scale-x-[-1] text-caramel opacity-10" />
      <div class="relative mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-9 text-center">
        <p class="font-display text-xl font-bold uppercase tracking-[0.2em] text-brown">{{ brand.name }}</p>
        <div class="flex items-center gap-3" aria-hidden="true">
          <span class="h-px w-8 bg-caramel/60" />
          <span class="h-1.5 w-1.5 rotate-45 bg-caramel" />
          <span class="h-px w-8 bg-caramel/60" />
        </div>
        <p class="font-serif text-base italic text-brown-soft">{{ t(ui.footerNote) }}</p>
        <p class="font-serif text-sm text-brown/70">{{ brand.address }} · {{ t(ui.hours) }}</p>
        <NuxtLink
          to="/admin"
          class="mt-1 font-serif text-xs uppercase tracking-widest text-brown/40 transition-colors hover:text-caramel"
        >
          Admin
        </NuxtLink>
      </div>
    </footer>

    <ImageLightbox :item="selected" @close="selected = null" />
  </div>
</template>
