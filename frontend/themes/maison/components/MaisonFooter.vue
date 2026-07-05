<script setup lang="ts">
// MaisonFooter — a quiet closing chapter on dark espresso: wordmark, contact
// details and a single handcrafted closing line.
import { ui } from '~/data/menu'
import { maisonBrand, maisonFooterNote } from '~/themes/maison/config'
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

      <div class="flex flex-col items-center gap-2 font-serif text-lg text-[#FCF8F0]/80">
        <p>{{ brand.address }}</p>
        <p>{{ t(ui.openNow) }} · {{ brand.hours }}</p>
      </div>

      <p class="mt-10 font-serif text-xl italic text-[#E0B27C]">{{ t(maisonFooterNote) }}</p>
    </div>
  </footer>
</template>
