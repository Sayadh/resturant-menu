<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// NoirNav — the sticky navigation plate: section tabs (Food / Drinks /
// Cellar), an inline search field and a numbered rail of categories. Purely
// presentational; all state is owned by the layout and flows through props.
// ─────────────────────────────────────────────────────────────────────────
import type { LocalizedText, MenuCategory } from '~/data/menu'
import { noirNavKicker, noirSearchPlaceholder } from '~/themes/noir/config'

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

// Lift the plate with a hairline + shadow once it is pinned to the top.
const navEl = ref<HTMLElement | null>(null)
const stuck = ref(false)
const onScroll = () => {
  if (navEl.value) stuck.value = navEl.value.getBoundingClientRect().top <= 0
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div
    ref="navEl"
    class="sticky top-0 z-30 border-y bg-[#0B0C0E]/95 backdrop-blur transition-shadow duration-300"
    :class="stuck ? 'border-[#303339] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]' : 'border-[#25282D] shadow-none'"
  >
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <!-- Section tabs + search -->
      <div class="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-1.5">
          <span class="nr-eyebrow mr-2 hidden font-display text-[9px] text-[#777A7E] sm:inline">
            {{ t(noirNavKicker) }}
          </span>
          <nav class="flex items-center gap-1" role="tablist">
            <button
              v-for="v in props.views"
              :key="v.key"
              type="button"
              role="tab"
              :aria-selected="props.activeKey === v.key"
              class="relative px-3 py-1.5 font-display text-[12px] uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
              :class="props.activeKey === v.key ? 'text-[#F1EEE8]' : 'text-[#777A7E] hover:text-[#A8A8A5]'"
              @click="emit('select-view', v.key)"
            >
              {{ t(v.title) }}
              <span
                v-if="props.activeKey === v.key"
                class="absolute -bottom-[2px] left-3 right-3 h-px bg-[#B8B4AC]"
                aria-hidden="true"
              />
            </button>
          </nav>
        </div>

        <!-- Search -->
        <div class="relative sm:w-64">
          <input
            :value="props.search"
            type="search"
            :placeholder="t(noirSearchPlaceholder)"
            class="w-full rounded-full border border-[#303339] bg-[#121417] py-2 pl-4 pr-10 font-serif text-[#F1EEE8] placeholder:text-[#777A7E] transition focus:border-[#B8B4AC] focus:outline-none"
            @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          />
          <svg
            viewBox="0 0 24 24"
            class="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A8A8A5]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      <!-- Numbered category rail -->
      <nav class="nr-scroll -mx-1 flex items-stretch gap-6 overflow-x-auto border-t border-[#25282D] px-1 py-2.5">
        <button
          v-for="(cat, i) in props.categories"
          :key="cat.id"
          type="button"
          :data-chip="cat.id"
          class="group flex shrink-0 items-baseline gap-2 whitespace-nowrap transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
          :class="props.activeId === cat.id ? 'text-[#F1EEE8]' : 'text-[#777A7E] hover:text-[#A8A8A5]'"
          @click="emit('scroll-to-category', cat.id)"
        >
          <span
            class="nr-numeral font-display text-[10px]"
            :class="props.activeId === cat.id ? 'text-[#D0CBC1]' : 'text-[#777A7E]/70'"
          >{{ pad(i) }}</span>
          <span class="font-serif text-[15px] italic">{{ t(cat.title) }}</span>
          <span class="font-display text-[10px] text-[#777A7E]/70">{{ cat.items.length }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>
