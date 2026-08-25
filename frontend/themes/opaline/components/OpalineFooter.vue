<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineFooter — the closing colophon. Every line is rendered ONLY when the
// tenant has filled it in from the admin panel; nothing is ever invented.
// ─────────────────────────────────────────────────────────────────────────
const { t } = useLanguage()
const brand = useBrand()

const tagline = computed(() => t(brand.tagline).trim())
const hasContact = computed(() => !!brand.address || !!brand.hours)
</script>

<template>
  <footer class="mt-auto border-t border-[#E2E5E8] bg-[#F5F5F2]">
    <div class="mx-auto flex max-w-6xl flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-16">
      <span
        v-if="brand.logo"
        class="mb-5 grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-[#E2E5E8] bg-[#FFFFFF]"
        aria-hidden="true"
      >
        <img :src="brand.logo" alt="" class="h-full w-full object-cover" />
      </span>

      <p v-if="brand.name" class="op-serif text-[22px] leading-tight text-[#172033] sm:text-[26px]">
        {{ brand.name }}
      </p>

      <p v-if="tagline" class="op-sans mt-3 max-w-md text-[13px] leading-relaxed text-[#747D90]">
        {{ tagline }}
      </p>

      <template v-if="hasContact">
        <div class="op-rule-soft mt-7 w-16" aria-hidden="true" />
        <div class="op-sans mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[13px] text-[#747D90]">
          <span v-if="brand.address">{{ brand.address }}</span>
          <span v-if="brand.address && brand.hours" class="h-1 w-1 rounded-full bg-[#CCD1D7]" aria-hidden="true" />
          <span v-if="brand.hours" class="op-figure">{{ brand.hours }}</span>
        </div>
      </template>
    </div>
  </footer>
</template>
