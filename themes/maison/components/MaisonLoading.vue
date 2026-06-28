<script setup lang="ts">
// MaisonLoading — a brief, elegant "setting the table" veil shown on first
// load. A centred monogram fades over warm ivory before the experience opens.
import { maisonBrand } from '~/themes/maison/config'
</script>

<template>
  <div class="maison-theme fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#F4EEE2]">
    <span class="ms-pulse font-display text-5xl tracking-[0.3em] text-[#241B14]">{{ maisonBrand.monogram }}</span>
    <div class="ms-skeleton mt-8 h-px w-40" aria-hidden="true" />
    <span class="ms-eyebrow mt-6 font-sans text-[10px] text-[#8C8276]">{{ maisonBrand.name }}</span>
  </div>
</template>
