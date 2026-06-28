<script setup lang="ts">
// Editorial loading state — shimmering placeholder rows mirroring the menu's
// printed-list rhythm. Shown briefly while the menu "sets the table".
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8" aria-hidden="true">
    <div class="atl-skeleton h-3 w-28 rounded-[2px]" />
    <div class="atl-skeleton mt-5 h-10 w-64 rounded-[2px]" />

    <div class="mt-12 flex flex-col">
      <div v-for="n in 5" :key="n" class="flex items-start gap-5 border-b border-[#D4C9B8] py-6">
        <div class="atl-skeleton h-20 w-20 rounded-[2px] sm:h-24 sm:w-24" />
        <div class="flex-1">
          <div class="atl-skeleton h-5 w-1/2 rounded-[2px]" />
          <div class="atl-skeleton mt-3 h-3.5 w-4/5 rounded-[2px]" />
          <div class="atl-skeleton mt-2 h-3.5 w-1/3 rounded-[2px]" />
        </div>
        <div class="atl-skeleton h-3.5 w-16 rounded-[2px]" />
      </div>
    </div>
  </div>
</template>
