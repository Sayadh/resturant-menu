<script setup lang="ts">
// Masthead — a slim editorial bar at the very top: the monogram alone on the
// left, language toggle on the right. The wordmark deliberately lives only in
// the hero below (magazine mastheads never repeat the title twice on a spread),
// so the first screen reads as one strong statement instead of an echo.
// Not sticky (the nav below handles that).
import AtelierLangSwitch from './AtelierLangSwitch.vue'
const brand = useBrand()
const mono = computed(() => {
  const i = brand.name.split(/\s+/).map((w) => w[0]).join('')
  return (i.length > 1 ? i : brand.name).slice(0, 2).toUpperCase()
})
</script>

<template>
  <header class="relative z-10 border-b border-[#DCE2EA]">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
      <!-- Monogram (the wordmark is carried by the hero, never repeated here) -->
      <div class="flex items-center gap-3">
        <span
          class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#172033] font-display text-[13px] font-semibold tracking-[0.08em] text-[#172033]"
          :aria-label="brand.name"
        >
          <img v-if="brand.logo" :src="brand.logo" alt="" class="h-full w-full object-cover" />
          <template v-else>{{ mono }}</template>
        </span>
      </div>

      <AtelierLangSwitch />
    </div>
  </header>
</template>
