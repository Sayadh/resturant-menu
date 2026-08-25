<script setup lang="ts">
// Empty state — one quiet mark on porcelain and one line of explanation.
// The message is passed in so the same plate serves every level of the
// journey (no sections / no categories / no dishes / no search results).
defineProps<{ message: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-20 text-center sm:py-28">
    <span class="grid h-14 w-14 place-items-center rounded-full bg-[#F5F5F2]" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        class="h-6 w-6 text-[#A1A6B0]"
        fill="none"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="8.4" />
        <path d="M8.6 13.6h6.8" />
      </svg>
    </span>
    <p class="op-sans mt-5 max-w-sm text-[14px] leading-relaxed text-[#747D90] sm:text-[15px]">
      {{ message }}
    </p>
  </div>
</template>
