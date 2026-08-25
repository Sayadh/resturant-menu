<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineHero — compact title card. A serif italic wordmark, an ornamental
// hairline rule (the rating sits in the middle when set, else a plain coral
// dot), then the address on one quiet line with a small pin mark.
//
// Every line is rendered ONLY when the tenant has actually filled it in from
// the admin panel — no placeholder copy is ever invented here.
// ─────────────────────────────────────────────────────────────────────────
const brand = useBrand()
</script>

<template>
  <section class="mx-auto max-w-2xl px-5 pb-8 pt-8 text-center sm:px-8 sm:pb-10 sm:pt-10">
    <h1
      v-if="brand.name"
      class="op-serif text-[2.25rem] italic leading-tight tracking-tight text-[#172033] sm:text-[2.75rem]"
    >
      {{ brand.name }}
    </h1>

    <div class="mx-auto mt-4 flex items-center justify-center gap-3 sm:mt-5">
      <span class="h-px w-9 bg-[#E2E5E8]" aria-hidden="true" />
      <span
        v-if="brand.rating"
        class="op-figure flex items-baseline gap-0.5 text-sm"
        :aria-label="`${brand.rating} / 5`"
      >
        <span class="font-semibold text-[#D85F3D]">{{ brand.rating }}</span>
        <span class="op-sans text-[#A1A6B0]">/5</span>
      </span>
      <span v-else class="h-1 w-1 rounded-full bg-[#D85F3D]" aria-hidden="true" />
      <span class="h-px w-9 bg-[#E2E5E8]" aria-hidden="true" />
    </div>

    <div
      v-if="brand.address"
      class="op-sans mt-4 flex items-center justify-center gap-1.5 text-[13px] leading-relaxed text-[#747D90] sm:mt-5"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-3.5 w-3.5 shrink-0 text-[#D85F3D]"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.25" />
      </svg>
      <span>{{ brand.address }}</span>
    </div>
  </section>
</template>
