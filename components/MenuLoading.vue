<script setup lang="ts">
// Elegant branded skeleton shown while a tenant's menu loads. Theme-agnostic
// (the real theme isn't known until data arrives), uses the warm house palette.
</script>

<template>
  <div class="min-h-screen bg-[#F5EFE2] text-[#3E2723]">
    <!-- Header skeleton -->
    <div class="mx-auto max-w-3xl px-6 pt-16 text-center">
      <div class="mx-auto h-24 w-24 animate-pulse rounded-full bg-[#E4D6C2]"></div>
      <div class="mx-auto mt-6 h-9 w-64 animate-pulse rounded-lg bg-[#E4D6C2]"></div>
      <div class="mx-auto mt-3 h-4 w-44 animate-pulse rounded bg-[#EADFCD]"></div>
      <div class="mt-6 flex items-center justify-center gap-3">
        <div class="h-8 w-28 animate-pulse rounded-full bg-[#EADFCD]"></div>
        <div class="h-8 w-24 animate-pulse rounded-full bg-[#EADFCD]"></div>
      </div>
    </div>

    <!-- Tabs skeleton -->
    <div class="mx-auto mt-10 flex max-w-3xl gap-3 px-6">
      <div class="h-11 flex-1 animate-pulse rounded-2xl bg-[#E4D6C2]"></div>
      <div class="h-11 flex-1 animate-pulse rounded-2xl bg-[#EADFCD]"></div>
      <div class="h-11 flex-1 animate-pulse rounded-2xl bg-[#EADFCD]"></div>
    </div>

    <!-- Cards skeleton -->
    <div class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 px-6 pb-16 sm:grid-cols-2">
      <div
        v-for="n in 6"
        :key="n"
        class="flex gap-4 rounded-[22px] border border-[#E4D6C2] bg-[#FFF9EF] p-4"
        :style="{ animationDelay: `${n * 90}ms` }"
      >
        <div class="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-[#E4D6C2]"></div>
        <div class="flex-1 space-y-2 py-1">
          <div class="h-4 w-3/4 animate-pulse rounded bg-[#E4D6C2]"></div>
          <div class="h-3 w-full animate-pulse rounded bg-[#EADFCD]"></div>
          <div class="h-3 w-2/3 animate-pulse rounded bg-[#EADFCD]"></div>
          <div class="mt-3 h-5 w-16 animate-pulse rounded bg-[#E4D6C2]"></div>
        </div>
      </div>
    </div>

    <!-- Centered hint -->
    <div class="pointer-events-none fixed inset-x-0 bottom-10 flex justify-center">
      <div class="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#8A7868] shadow-sm backdrop-blur">
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-[#E4D6C2] border-t-[#C69A5A]"></span>
        Բեռնվում է…
      </div>
    </div>
  </div>
</template>
