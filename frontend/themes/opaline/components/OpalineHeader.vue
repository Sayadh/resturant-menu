<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineHeader — a thin porcelain bar: the house mark on the left, the
// language switch on the right, one hairline underneath. It stays pinned so
// the guest can always return to the top level or change language.
// ─────────────────────────────────────────────────────────────────────────
import OpalineLangSwitch from './OpalineLangSwitch.vue'

const emit = defineEmits<{ home: [] }>()

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
          <img v-if="brand.logo" :src="brand.logo" alt="" class="h-full w-full object-cover" />
          <span v-else class="op-serif text-[13px] tracking-[0.04em] text-[#172033]">{{ mono }}</span>
        </span>
      </button>

      <OpalineLangSwitch />
    </div>
  </header>
</template>
