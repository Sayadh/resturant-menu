<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonHeader — a floating glass bar that appears once the guest scrolls past
// the hero. Deep burgundy, rounded: brand mark, an inline search field (typing
// filters the menu straight away — no separate panel) and the selection pill.
// ─────────────────────────────────────────────────────────────────────────
import { maisonSearch } from '~/themes/maison/config'

const brand = useBrand()
const initial = computed(() => (brand.name || '?').trim().charAt(0).toUpperCase())

defineProps<{ visible: boolean; count: number; search: string }>()
const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'open-order'): void
}>()

const { t } = useLanguage()
</script>

<template>
  <Transition name="ms-fade">
    <header v-show="visible" class="fixed inset-x-0 top-0 z-40 px-4 pt-3 sm:px-6">
      <div
        class="mx-auto flex max-w-5xl items-center gap-2 rounded-full border border-[#FFFBFC]/10 bg-[#3E1421]/95 py-1.5 pl-2 pr-2 shadow-[0_18px_44px_-24px_rgba(44,12,22,0.75)] backdrop-blur-xl sm:gap-2.5 sm:py-2 sm:pl-2.5 sm:pr-2.5"
      >
        <!-- Brand mark -->
        <a href="#top" class="shrink-0" :aria-label="brand.name">
          <span class="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#FFFBFC]/8 font-serif text-sm font-bold text-[#B99768] ring-1 ring-[#B99768]/40">
            <img v-if="brand.logo" :src="brand.logo" alt="" class="h-full w-full object-cover" />
            <template v-else>{{ initial }}</template>
          </span>
        </a>

        <!-- Inline search — the only search entry point -->
        <div class="relative min-w-0 flex-1">
          <input
            :value="search"
            type="search"
            :placeholder="t(maisonSearch.placeholder)"
            class="w-full rounded-full border border-[#FFFBFC]/12 bg-[#FFFBFC]/8 py-2 pl-4 pr-10 font-serif text-[#FFFBFC] placeholder:text-[#E2D2D7]/50 transition focus:border-[#B99768]/60 focus:bg-[#FFFBFC]/12 focus:outline-none"
            @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          />
          <svg
            viewBox="0 0 24 24"
            class="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#E2D2D7]/60"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
          </svg>
        </div>

        <!-- Selection -->
        <button
          type="button"
          class="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#A8865B] text-[#2C1B22] shadow-[0_10px_20px_-10px_rgba(44,12,22,0.8)] transition hover:bg-[#96754E]"
          aria-label="Selection"
          @click="emit('open-order')"
        >
          <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
            <path d="M6 7h12l-1 13H7L6 7z" stroke-linejoin="round" />
            <path d="M9 7a3 3 0 0 1 6 0" stroke-linecap="round" />
          </svg>
          <span
            v-if="count > 0"
            class="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#FFFBFC] px-1 font-sans text-[10px] font-bold leading-none text-[#8C304A] ring-2 ring-[#3E1421]"
          >{{ count }}</span>
        </button>
      </div>
    </header>
  </Transition>
</template>
