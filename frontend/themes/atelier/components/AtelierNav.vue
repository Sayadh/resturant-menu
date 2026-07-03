<script setup lang="ts">
// Sticky navigation — editorial section tabs, an underlined search field, and
// a numbered "contents" rail of categories. Purely presentational: all state
// is owned by the layout and flows through props / emits.
import type { LocalizedText, MenuCategory } from '~/data/menu'
import { atelierSearchPlaceholder, atelierTabKicker } from '~/themes/atelier/config'

interface View {
  key: string
  title: LocalizedText
}

const props = defineProps<{
  views: View[]
  activeKey: string
  search: string
  categories: MenuCategory[]
  activeId: string
}>()

const emit = defineEmits<{
  'select-view': [key: string]
  'update:search': [value: string]
  'scroll-to-category': [id: string]
}>()

const { t } = useLanguage()

const pad = (n: number) => String(n + 1).padStart(2, '0')
</script>

<template>
  <div class="sticky top-0 z-30 border-y border-[#16130F] bg-[#EAE3D6]/95 backdrop-blur">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <!-- Tabs + search -->
      <div class="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-1.5">
          <span class="mr-2 hidden atl-eyebrow font-display text-[9px] text-[#857B6C] sm:inline">
            {{ t(atelierTabKicker) }}
          </span>
          <nav class="flex items-center gap-1" role="tablist">
            <button
              v-for="v in props.views"
              :key="v.key"
              type="button"
              role="tab"
              :aria-selected="props.activeKey === v.key"
              class="relative px-3 py-1.5 font-display text-[12px] tracking-[0.16em] uppercase transition-colors duration-300"
              :class="props.activeKey === v.key ? 'text-[#16130F]' : 'text-[#16130F]/40 hover:text-[#16130F]/70'"
              @click="emit('select-view', v.key)"
            >
              {{ t(v.title) }}
              <span
                v-if="props.activeKey === v.key"
                class="absolute -bottom-[2px] left-3 right-3 h-px bg-[#A1502E]"
                aria-hidden="true"
              />
            </button>
          </nav>
        </div>

        <!-- Search -->
        <div class="relative flex items-center border-b border-[#16130F]/30 focus-within:border-[#A1502E] sm:w-64">
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-[#857B6C]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            :value="props.search"
            type="search"
            :placeholder="t(atelierSearchPlaceholder)"
            class="w-full bg-transparent px-2.5 py-2 font-serif text-base text-[#16130F] placeholder:text-[#857B6C]/70 focus:outline-none"
            @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- Numbered category rail -->
      <nav class="atl-scroll -mx-1 flex items-stretch gap-6 overflow-x-auto border-t border-[#D4C9B8] px-1 py-2.5">
        <button
          v-for="(cat, i) in props.categories"
          :key="cat.id"
          type="button"
          :data-chip="cat.id"
          class="group flex shrink-0 items-baseline gap-2 whitespace-nowrap transition-colors duration-300"
          :class="props.activeId === cat.id ? 'text-[#16130F]' : 'text-[#16130F]/45 hover:text-[#16130F]/80'"
          @click="emit('scroll-to-category', cat.id)"
        >
          <span
            class="atl-numeral font-display text-[10px]"
            :class="props.activeId === cat.id ? 'text-[#A1502E]' : 'text-[#857B6C]/60'"
          >{{ pad(i) }}</span>
          <span class="font-serif text-[15px] italic">{{ t(cat.title) }}</span>
          <span class="font-display text-[10px] text-[#857B6C]/60">{{ cat.items.length }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>
