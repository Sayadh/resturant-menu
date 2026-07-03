<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonHeader — a whisper-quiet fixed bar that only appears once the guest
// has scrolled past the cinematic hero. Holds the wordmark, language, a
// search reveal trigger and the selection (basket) count.
// ─────────────────────────────────────────────────────────────────────────
const brand = useBrand()

defineProps<{ visible: boolean; count: number }>()
defineEmits<{ (e: 'search'): void; (e: 'open-order'): void }>()
</script>

<template>
  <Transition name="ms-fade">
    <header
      v-show="visible"
      class="fixed inset-x-0 top-0 z-40 border-b border-[#DFD5C4]/70 bg-[#F4EEE2]/85 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <!-- Wordmark -->
        <a href="#top" class="font-display text-base tracking-[0.22em] text-[#241B14] sm:text-lg">
          {{ brand.name }}
        </a>

        <!-- Actions -->
        <div class="flex items-center gap-4 sm:gap-6">
          <MaisonLangSwitch tone="dark" class="hidden sm:flex" />

          <span class="hidden h-4 w-px bg-[#DFD5C4] sm:block" aria-hidden="true" />

          <button
            type="button"
            class="text-[#5B5145] transition-colors hover:text-[#241B14]"
            aria-label="Search"
            @click="$emit('search')"
          >
            <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
            </svg>
          </button>

          <button
            type="button"
            class="relative text-[#5B5145] transition-colors hover:text-[#241B14]"
            aria-label="Selection"
            @click="$emit('open-order')"
          >
            <svg viewBox="0 0 24 24" class="h-[19px] w-[19px]" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7z" stroke-linejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" stroke-linecap="round" />
            </svg>
            <span
              v-if="count > 0"
              class="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B08A4F] px-1 font-sans text-[10px] font-medium text-[#FBF8F1]"
            >
              {{ count }}
            </span>
          </button>
        </div>
      </div>
    </header>
  </Transition>
</template>
