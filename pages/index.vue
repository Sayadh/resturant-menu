<script setup lang="ts">
import { menu, ui, type MenuItem } from '~/data/menu'

const { t } = useLanguage()

const search = ref('')
const activeId = ref(menu[0].id)
const selected = ref<MenuItem | null>(null)

// Filter categories by the search query (matches name + description).
const filteredCategories = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return menu
  return menu
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
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Scrollspy — highlight the category currently in view.
let observer: IntersectionObserver | null = null
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) activeId.value = visible[0].target.id
    },
    { rootMargin: '-140px 0px -55% 0px', threshold: [0.1, 0.25, 0.5] },
  )
  menu.forEach((cat) => {
    const el = document.getElementById(cat.id)
    if (el) observer?.observe(el)
  })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="min-h-screen">
    <TheHeader />

    <CategoryNav
      :categories="menu"
      :active-id="activeId"
      v-model:search="search"
      @select="scrollToCategory"
    />

    <main class="relative mx-auto max-w-6xl px-5 pb-16 pt-10">
      <!-- Subtle corner decorations -->
      <DecorSprig class="pointer-events-none absolute right-2 top-24 hidden h-28 w-28 rotate-12 text-herb opacity-[0.06] md:block" />
      <DecorSprig class="pointer-events-none absolute -left-2 bottom-24 hidden h-28 w-28 -rotate-12 scale-x-[-1] text-herb opacity-[0.06] md:block" />

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
    <footer class="border-t border-caramel/20 bg-card/60">
      <div class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-8 text-center">
        <p class="font-display text-lg font-semibold uppercase tracking-[0.18em] text-brown">
          TUN LAHMAJO
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
  </div>
</template>
