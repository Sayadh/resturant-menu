<script setup lang="ts">
// Editorial footer — closing colophon on the dark ink ground.
import { atelierBrand, atelierFooterNote } from '~/themes/atelier/config'
const { t } = useLanguage()
</script>

<template>
  <footer class="relative z-[1] bg-[#16130F] text-[#F6F2EA]">
    <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div class="flex flex-col items-center text-center">
        <span
          class="flex h-12 w-12 items-center justify-center rounded-full border border-[#F6F2EA]/40 font-display text-sm tracking-[0.1em]"
          aria-hidden="true"
        >{{ atelierBrand.monogram }}</span>

        <h2 class="mt-6 font-display text-xl tracking-[0.4em]">{{ atelierBrand.name }}</h2>
        <p class="mt-4 font-serif text-lg italic text-[#F6F2EA]/60">{{ t(atelierFooterNote) }}</p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-serif text-sm text-[#F6F2EA]/55">
          <span>{{ t(atelierBrand.address) }}</span>
          <span class="h-1 w-1 rounded-full bg-[#A1502E]" aria-hidden="true" />
          <span>{{ t(atelierBrand.city) }}</span>
          <span class="h-1 w-1 rounded-full bg-[#A1502E]" aria-hidden="true" />
          <span>{{ atelierBrand.hours }}</span>
        </div>

        <NuxtLink
          to="/admin"
          class="mt-10 atl-eyebrow font-display text-[9px] text-[#F6F2EA]/35 transition hover:text-[#A1502E]"
        >
          Admin
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
