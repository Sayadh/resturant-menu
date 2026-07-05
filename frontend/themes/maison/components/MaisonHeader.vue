<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonHeader — a floating glass bar that appears once the guest scrolls past
// the hero. Warm & Family: rounded, translucent cream, soft shadow, a small
// brand mark, search + selection (basket) pill.
// ─────────────────────────────────────────────────────────────────────────
const brand = useBrand()
const initial = computed(() => (brand.name.value || '?').trim().charAt(0).toUpperCase())

defineProps<{ visible: boolean; count: number }>()
defineEmits<{ (e: 'search'): void; (e: 'open-order'): void }>()
</script>

<template>
  <Transition name="ms-fade">
    <header v-show="visible" class="fixed inset-x-0 top-0 z-40 px-4 pt-3 sm:px-6">
      <div
        class="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/60 bg-[#F6F0E4]/80 px-3 py-2 shadow-[0_18px_44px_-26px_rgba(90,68,51,0.55)] backdrop-blur-xl sm:px-4"
      >
        <!-- Brand mark -->
        <a href="#top" class="flex items-center gap-2.5">
          <span class="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#C4693F] to-[#A9522C] font-serif text-sm font-bold text-[#F6F0E4] shadow-sm">
            <img v-if="brand.logo.value" :src="brand.logo.value" alt="" class="h-full w-full object-cover" />
            <template v-else>{{ initial }}</template>
          </span>
          <span class="font-serif text-base font-semibold tracking-tight text-[#3E3125] sm:text-lg">{{ brand.name }}</span>
        </a>

        <!-- Actions -->
        <div class="flex items-center gap-2 sm:gap-2.5">
          <MaisonLangSwitch tone="dark" class="hidden sm:flex" />

          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full text-[#6E6152] transition hover:bg-[#EFE6D5] hover:text-[#4A3B2E]"
            aria-label="Search"
            @click="$emit('search')"
          >
            <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
            </svg>
          </button>

          <button
            type="button"
            class="relative flex items-center gap-2 rounded-full bg-[#C4693F] px-3.5 py-2 font-sans text-sm font-semibold text-[#F6F0E4] shadow-[0_12px_24px_-12px_rgba(196,105,63,0.8)] transition hover:-translate-y-0.5 hover:bg-[#B0562F]"
            aria-label="Selection"
            @click="$emit('open-order')"
          >
            <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7z" stroke-linejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" stroke-linecap="round" />
            </svg>
            <span v-if="count > 0" class="min-w-4 text-center text-[13px] font-bold leading-none">{{ count }}</span>
          </button>
        </div>
      </div>
    </header>
  </Transition>
</template>
