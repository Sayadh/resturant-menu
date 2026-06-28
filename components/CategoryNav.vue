<script setup lang="ts">
import type { MenuCategory } from '~/data/menu'

const props = defineProps<{
  categories: MenuCategory[]
  activeId: string
}>()
const emit = defineEmits<{ select: [id: string] }>()

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
  <nav
    ref="navRef"
    class="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1"
    aria-label="Menu categories"
  >
    <button
      v-for="cat in categories"
      :key="cat.id"
      :data-cat="cat.id"
      type="button"
      class="inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200"
      :class="
        activeId === cat.id
          ? 'border-caramel bg-caramel/15 text-brown'
          : 'border-border bg-card text-brown/70 hover:border-caramel/50 hover:text-brown'
      "
      @click="emit('select', cat.id)"
    >
      <CategoryIcon :id="cat.id" class="h-4 w-4 text-caramel-dark" />
      {{ t(cat.title) }}
    </button>
  </nav>
</template>
