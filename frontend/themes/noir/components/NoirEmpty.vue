<script setup lang="ts">
// Empty state for "no search results" — a faint numeral, ivory headline and
// a hairline platinum rule. No illustration, no colour.
import { ui } from '~/data/menu'
const { t } = useLanguage()
</script>

<template>
  <div class="flex flex-col items-center py-28 text-center">
    <span class="nr-numeral font-serif text-7xl text-[#25282D]" aria-hidden="true">00</span>
    <p class="mt-6 max-w-sm font-serif text-xl italic leading-relaxed text-[#F1EEE8]">
      {{ t(ui.noResults) }}
    </p>
    <span class="nr-rule mt-6 w-16" aria-hidden="true" />
  </div>
</template>
