<script setup lang="ts">
// MaisonEmptyState — shown when a search returns nothing. Quiet and gracious.
import { ui } from '~/data/menu'
const { t } = useLanguage()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-28 text-center">
    <svg viewBox="0 0 24 24" class="h-12 w-12 text-[#E7DDCB]" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
    </svg>
    <p class="mt-6 max-w-sm text-balance font-serif text-2xl leading-relaxed text-[#4A3B2E]">
      {{ t(ui.noResults) }}
    </p>
  </div>
</template>
