<script setup lang="ts">
// Loading beat — porcelain placeholders shaped like the section grid, so the
// page never jumps when the real cards arrive.
withDefaults(defineProps<{ count?: number }>(), { count: 4 })
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
    <div
      v-for="n in count"
      :key="n"
      class="overflow-hidden rounded-[20px] border border-[#E2E5E8] bg-[#FFFFFF]"
      aria-hidden="true"
    >
      <div class="op-skeleton aspect-[16/10] w-full" />
      <div class="p-5 sm:p-6">
        <div class="op-skeleton h-5 w-2/3 rounded-full" />
        <div class="op-skeleton mt-3 h-3 w-1/3 rounded-full" />
      </div>
    </div>
  </div>
</template>
