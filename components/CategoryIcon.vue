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

    <!-- Lemonades: glass with straw -->
    <template v-else-if="id === 'lemonades'">
      <path d="M7 7h10l-1 13H8L7 7Z" />
      <path d="M6.5 7h11" />
      <path d="M14 3.5 12.5 7" />
    </template>

    <!-- Hot drinks: coffee cup -->
    <template v-else-if="id === 'hot-drinks'">
      <path d="M4 9h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" />
      <path d="M17 10h2.2a2.2 2.2 0 0 1 0 4.4H17" />
      <path d="M8 3c-.6 1 .6 1.6 0 2.6M12 3c-.6 1 .6 1.6 0 2.6" />
    </template>

    <!-- Wine: wine glass -->
    <template v-else-if="id === 'wine'">
      <path d="M7 3h10c0 5-2 7.5-5 7.5S7 8 7 3Z" />
      <path d="M12 10.5V19M8.5 19h7" />
    </template>

    <!-- Beer: beer mug -->
    <template v-else-if="id === 'beer'">
      <path d="M5 7h10v13H5Z" />
      <path d="M15 9h2.5A1.5 1.5 0 0 1 19 10.5v4A1.5 1.5 0 0 1 17.5 16H15" />
      <path d="M5 7c0-2 2-3 5-3s5 1 5 3" />
    </template>

    <!-- Mains / fallback: fork & knife -->
    <template v-else>
      <path d="M8 3v8m0 0v10M6 3v5a2 2 0 0 0 4 0V3" />
      <path d="M16 3c-1.5 0-2.5 2-2.5 5.5 0 2 1 2.8 2 3V21" />
    </template>
  </svg>
</template>
