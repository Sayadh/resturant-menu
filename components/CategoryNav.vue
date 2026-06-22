<script setup lang="ts">
import { ui, type MenuCategory } from '~/data/menu'

const props = defineProps<{
  categories: MenuCategory[]
  activeId: string
  search: string
}>()
const emit = defineEmits<{
  select: [id: string]
  'update:search': [value: string]
}>()

const { t } = useLanguage()

// Keep the active chip visible inside the horizontally scrolling nav.
const navRef = ref<HTMLElement | null>(null)
watch(
  () => props.activeId,
  (id) => {
    const el = navRef.value?.querySelector<HTMLElement>(`[data-cat="${id}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  },
)
</script>

<template>
  <div class="sticky top-0 z-30 border-b border-caramel/20 bg-cream/95 backdrop-blur">
    <div class="mx-auto max-w-6xl px-4 py-3">
      <!-- Category chips -->
      <nav
        ref="navRef"
        class="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Menu categories"
      >
        <button
          v-for="cat in categories"
          :key="cat.id"
          :data-cat="cat.id"
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200"
          :class="
            activeId === cat.id
              ? 'border-caramel bg-caramel text-cream shadow-sm'
              : 'border-caramel/30 bg-card text-brown hover:border-caramel/60'
          "
          @click="emit('select', cat.id)"
        >
          <CategoryIcon :id="cat.id" class="h-4 w-4" />
          {{ t(cat.title) }}
        </button>
      </nav>

      <!-- Search -->
      <div class="relative mt-3">
        <IconSearch class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-caramel-dark" />
        <input
          :value="search"
          type="search"
          inputmode="search"
          :placeholder="t(ui.searchPlaceholder)"
          class="w-full rounded-full border border-caramel/30 bg-card py-3 pl-11 pr-4 font-serif text-base text-brown placeholder:text-brown-soft/70 shadow-sm outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/30"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
