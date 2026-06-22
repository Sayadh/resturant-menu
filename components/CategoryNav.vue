<script setup lang="ts">
import { ui, type MenuCategory, type DrinkGroup } from '~/data/menu'

const props = defineProps<{
  categories: MenuCategory[]
  activeId: string
  activeLevel: string
  activeGroup: DrinkGroup
  search: string
}>()
const emit = defineEmits<{
  select: [id: string]
  'select-level': [id: string]
  'select-group': [id: DrinkGroup]
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
  <div data-nav class="sticky top-0 z-30 border-b border-caramel/20 bg-cream/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-2.5">
      <!-- Level 1: Food / Drinks -->
      <LevelTabs :active-level="activeLevel" @select="emit('select-level', $event)" />

      <!-- Level 2 (Drinks only): Non-Alcoholic / Alcoholic -->
      <GroupTabs
        v-if="activeLevel === 'drinks'"
        :active-group="activeGroup"
        @select="emit('select-group', $event)"
      />

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
          class="inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200"
          :class="
            activeId === cat.id
              ? 'border-caramel bg-caramel text-white shadow-gold'
              : 'border-caramel/30 bg-white/70 text-brown hover:border-caramel/60 hover:bg-white'
          "
          @click="emit('select', cat.id)"
        >
          <span class="text-base leading-none" aria-hidden="true">{{ cat.icon }}</span>
          {{ t(cat.title) }}
        </button>
      </nav>

      <!-- Search -->
      <div class="relative">
        <span
          class="pointer-events-none absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-caramel/15"
          aria-hidden="true"
        >
          <IconSearch class="h-[18px] w-[18px] text-caramel-dark" />
        </span>
        <input
          :value="search"
          type="search"
          inputmode="search"
          :placeholder="t(ui.searchPlaceholder)"
          class="w-full rounded-full border border-caramel/30 bg-white py-3 pl-12 pr-4 font-serif text-base text-brown placeholder:text-brown-soft/70 shadow-sm outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/25"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
