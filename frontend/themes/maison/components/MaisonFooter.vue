<script setup lang="ts">
// MaisonFooter — a quiet closing chapter on dark espresso: wordmark, contact
// details and a single handcrafted closing line.
import { maisonBrand } from '~/themes/maison/config'
import { vReveal } from '~/themes/maison/animations'

const { t } = useLanguage()
const brand = useBrand()
</script>

<template>
  <footer class="bg-[#55402E] px-6 py-20 text-center text-[#FCF8F0]">
    <div v-reveal class="mx-auto flex max-w-2xl flex-col items-center">
      <span class="ms-eyebrow font-sans text-[10px] text-[#E0B27C]">{{ maisonBrand.established }}</span>
      <h2 class="mt-5 font-display text-3xl tracking-[0.18em] sm:text-4xl">{{ brand.name }}</h2>
      <div class="ms-rule my-8 w-40" aria-hidden="true" />

      <div v-if="brand.address || brand.hours" class="flex flex-col items-center gap-2 font-serif text-lg text-[#FCF8F0]/80">
        <p v-if="brand.address">{{ brand.address }}</p>
        <p v-if="brand.hours">{{ brand.hours }}</p>
      </div>

      <p v-if="t(brand.tagline)" class="mt-10 font-serif text-xl italic text-[#E0B27C]">{{ t(brand.tagline) }}</p>
    </div>
  </footer>
</template>
