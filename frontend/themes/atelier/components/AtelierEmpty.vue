<script setup lang="ts">
// Editorial empty state for "no search results".
import { ui } from '~/data/menu'
const { t } = useLanguage()
</script>

<template>
  <div class="flex flex-col items-center py-28 text-center">
    <span class="atl-numeral font-serif text-7xl text-[#172033]/12" aria-hidden="true">00</span>
    <p class="mt-6 max-w-sm font-serif text-xl italic leading-relaxed text-[#667085]">
      {{ t(ui.noResults) }}
    </p>
    <span class="mt-6 h-px w-16 bg-[#C65D3A]" aria-hidden="true" />
  </div>
</template>
