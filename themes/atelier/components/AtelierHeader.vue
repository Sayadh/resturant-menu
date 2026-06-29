<script setup lang="ts">
// Masthead — a slim editorial bar at the very top: monogram + wordmark on the
// left, language toggle on the right. Not sticky (the nav below handles that).
import AtelierLangSwitch from './AtelierLangSwitch.vue'
const brand = useBrand()
const mono = computed(() => {
  const i = brand.name.value.split(/\s+/).map((w) => w[0]).join('')
  return (i.length > 1 ? i : brand.name.value).slice(0, 2).toUpperCase()
})
</script>

<template>
  <header class="relative z-10 border-b border-[#D4C9B8]">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
      <!-- Monogram + wordmark -->
      <div class="flex items-center gap-3">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full border border-[#16130F] font-display text-[13px] font-semibold tracking-[0.08em] text-[#16130F]"
          aria-hidden="true"
        >
          {{ mono }}
        </span>
        <span class="font-display text-[15px] font-semibold tracking-[0.32em] text-[#16130F]">
          {{ brand.name }}
        </span>
      </div>

      <AtelierLangSwitch />
    </div>
  </header>
</template>
