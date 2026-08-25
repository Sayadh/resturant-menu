<script setup lang="ts">
// Compact title card — italic wordmark, an ornamental hairline rule (rating
// sits in the middle when set, else a plain dot), then hours/address on one
// quiet line — the address gets a small pin mark so it reads as a location
// at a glance, not just a line of text.
import { atelierMeta } from '~/themes/atelier/config'

const { t } = useLanguage()
const brand = useBrand()
</script>

<template>
  <section class="relative z-[1] mx-auto max-w-2xl px-4 pb-6 pt-6 text-center sm:px-6 sm:pb-8 sm:pt-8">
    <h1 class="font-serif text-4xl italic tracking-tight text-[#172033] sm:text-5xl">
      {{ brand.name }}
    </h1>

    <div class="mx-auto mt-4 flex items-center justify-center gap-3">
      <span class="h-px w-9 bg-[#DCE2EA]" aria-hidden="true" />
      <span v-if="brand.rating" class="flex items-baseline gap-0.5 font-serif text-sm">
        <span class="sr-only">{{ t(atelierMeta.rating) }}</span>
        <span class="font-semibold text-[#C65D3A]">{{ brand.rating }}</span>
        <span class="text-[#667085]">/5</span>
      </span>
      <span v-else class="h-1 w-1 rounded-full bg-[#C65D3A]" aria-hidden="true" />
      <span class="h-px w-9 bg-[#DCE2EA]" aria-hidden="true" />
    </div>

    <dl
      v-if="brand.hours || brand.address"
      class="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1.5 font-serif text-sm text-[#667085]"
    >
      <div v-if="brand.hours">
        <dt class="sr-only">{{ t(atelierMeta.hours) }}</dt>
        <dd>{{ brand.hours }}</dd>
      </div>
      <span v-if="brand.hours && brand.address" class="text-[#DCE2EA]">·</span>

      <div v-if="brand.address" class="flex items-center gap-1">
        <dt class="sr-only">{{ t(atelierMeta.location) }}</dt>
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-[#C65D3A]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.25" />
        </svg>
        <dd>{{ brand.address }}</dd>
      </div>
    </dl>
  </section>
</template>
