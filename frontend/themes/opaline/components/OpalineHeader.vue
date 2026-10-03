<script setup lang="ts">
import { imgUrl } from '~/utils/image'
// ─────────────────────────────────────────────────────────────────────────
// OpalineHeader — a thin porcelain bar: the house mark on the left, the
// language switch on the right, one hairline underneath. It stays pinned so
// the guest can always return to the top level or change language.
// ─────────────────────────────────────────────────────────────────────────
import OpalineLangSwitch from './OpalineLangSwitch.vue'
import { opalineSearch } from '~/themes/opaline/config'

const emit = defineEmits<{ home: []; search: [] }>()

const { t } = useLanguage()

const brand = useBrand()

// Monogram fallback when the tenant has not uploaded a logo.
const mono = computed(() => {
  const initials = brand.name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
  return (initials.length > 1 ? initials : brand.name).slice(0, 2).toUpperCase()
})
</script>

<template>
  <header
    data-op-header
    class="sticky top-0 z-40 border-b border-[#E2E5E8] bg-[#FAFAF8]/90 backdrop-blur-md"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
      <!-- The house mark alone. The name already sets the hero directly below,
           so repeating it in the bar only crowds the language switch on a
           phone — the mark carries the identity and the way home. -->
      <button
        type="button"
        class="group shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D85F3D]"
        :aria-label="brand.name || undefined"
        @click="emit('home')"
      >
        <span
          class="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-[#E2E5E8] bg-[#FFFFFF] transition-colors duration-300 group-hover:border-[#CCD1D7] sm:h-10 sm:w-10"
          aria-hidden="true"
        >
          <img v-if="brand.logo" :src="imgUrl(brand.logo, 256)" alt="" class="h-full w-full object-cover" />
          <span v-else class="op-serif text-[13px] tracking-[0.04em] text-[#172033]">{{ mono }}</span>
        </span>
      </button>

      <div class="flex items-center gap-1 sm:gap-2">
        <!-- Search: a hairline circle, same weight as the house mark -->
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-full border border-[#E2E5E8] bg-[#FFFFFF] text-[#172033] transition-colors duration-300 hover:border-[#CCD1D7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D] sm:h-10 sm:w-10"
          :aria-label="t(opalineSearch.open)"
          @click="emit('search')"
        >
          <svg viewBox="0 0 24 24" class="h-[17px] w-[17px]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
        </button>
        <OpalineLangSwitch />
      </div>
    </div>
  </header>
</template>
