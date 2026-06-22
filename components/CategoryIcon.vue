<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- Breakfast: fried egg in pan -->
    <template v-if="id === 'breakfast'">
      <circle cx="11" cy="13" r="7" />
      <circle cx="11" cy="13" r="2.4" />
      <path d="M18 13h3.5" />
    </template>

    <!-- Salads: leaf -->
    <template v-else-if="id === 'salads'">
      <path d="M19 5C11 5 5 9 5 16c0 1.5.4 2.6.4 2.6S10 19 14 16s5-7 5-11Z" />
      <path d="M5.5 18.5C8 15 11 13 15 11" />
    </template>

    <!-- Mains: fork & knife -->
    <template v-else>
      <path d="M8 3v8m0 0v10M6 3v5a2 2 0 0 0 4 0V3" />
      <path d="M16 3c-1.5 0-2.5 2-2.5 5.5 0 2 1 2.8 2 3V21" />
    </template>
  </svg>
</template>
