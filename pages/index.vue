<script setup lang="ts">
import { groups, restaurant, ui, type GroupKey, type MenuItem } from '~/data/menu'

const { t } = useLanguage()

const activeGroupId = ref<GroupKey>('food')
const search = ref('')
const activeId = ref(groups[0].categories[0].id)
const selected = ref<MenuItem | null>(null)

const activeGroup = computed(
  () => groups.find((g) => g.id === activeGroupId.value) ?? groups[0],
)

const searching = computed(() => search.value.trim().length > 0)

// Filter the active group's categories by the search query.
const filteredCategories = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return activeGroup.value.categories
  return activeGroup.value.categories
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

// Smooth-scroll to a category section.
const scrollToCategory = (id: string) => {
  activeId.value = id
  nextTick(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// Switch top-level group, reset state and scroll back up.
const selectGroup = (id: GroupKey) => {
  if (id === activeGroupId.value) return
  activeGroupId.value = id
  search.value = ''
  const first = activeGroup.value.categories[0]
  if (first) activeId.value = first.id
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setupObserver()
  })
}

// Scrollspy — highlight the category currently in view.
let observer: IntersectionObserver | null = null
const setupObserver = () => {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) activeId.value = visible[0].target.id
    },
    { rootMargin: '-160px 0px -55% 0px', threshold: [0.1, 0.25, 0.5] },
  )
  activeGroup.value.categories.forEach((cat) => {
    const el = document.getElementById(cat.id)
    if (el) observer?.observe(el)
  })
}

onMounted(() => setupObserver())
// Re-observe when search toggles sections in/out of the DOM.
watch(searching, () => nextTick(setupObserver))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="min-h-screen pb-24">
    <TheHeader />

    <!-- Sticky navigation: group tabs + search + category chips -->
    <div class="sticky top-0 z-30 border-b border-border bg-cream/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
        <GroupTabs :groups="groups" :active-group="activeGroupId" @select="selectGroup" />
        <SearchBar v-model="search" />
        <CategoryNav
          v-if="!searching"
          :categories="activeGroup.categories"
          :active-id="activeId"
          @select="scrollToCategory"
        />
      </div>
    </div>

    <main class="mx-auto max-w-6xl px-5 pb-16 pt-8">
      <!-- Category cards (hidden while searching) -->
      <section v-if="!searching" class="mb-12">
        <CategoryCardGrid :categories="activeGroup.categories" @select="scrollToCategory" />
      </section>

      <div v-if="hasResults" class="flex flex-col gap-14">
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

    <!-- Footer -->
    <footer class="border-t border-border bg-card/60">
      <div class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-8 text-center">
        <p class="font-display text-lg font-semibold uppercase tracking-[0.18em] text-brown">
          {{ restaurant.name }}
        </p>
        <div class="flex items-center gap-3" aria-hidden="true">
          <span class="h-px w-8 bg-caramel/50" />
          <span class="h-1.5 w-1.5 rotate-45 bg-caramel" />
          <span class="h-px w-8 bg-caramel/50" />
        </div>
        <p class="font-serif text-base italic text-brown-soft">{{ t(ui.footerNote) }}</p>
        <p class="font-serif text-sm text-brown/70">
          {{ t(ui.city) }} · {{ t(ui.hours) }}
        </p>
      </div>
    </footer>

    <ImageLightbox :item="selected" @close="selected = null" />
    <OrderSummary />
  </div>
</template>
