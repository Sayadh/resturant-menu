<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonStorySection — the restaurant's story chapter. A tall editorial image
// with gentle parallax beside generous serif prose. Sets emotion before food.
// ─────────────────────────────────────────────────────────────────────────
import { maisonStory } from '~/themes/maison/config'
import { vReveal, vParallax } from '~/themes/maison/animations'

const { t } = useLanguage()
</script>

<template>
  <section class="relative bg-[#F4EEE2] py-20 sm:py-28">
    <div class="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
      <!-- Prose -->
      <div class="max-w-xl">
        <p v-reveal class="ms-eyebrow font-sans text-[11px] text-[#B08A4F]">
          {{ t(maisonStory.chapter) }}
        </p>
        <h2 v-reveal="1" class="mt-5 text-balance font-serif text-4xl leading-[1.1] text-[#241B14] sm:text-5xl">
          {{ t(maisonStory.title) }}
        </h2>
        <div v-reveal="2" class="my-7 h-px w-16 bg-[#B08A4F]/60" aria-hidden="true" />
        <p v-reveal="2" class="font-serif text-lg leading-relaxed text-[#5B5145] sm:text-xl">
          {{ t(maisonStory.body) }}
        </p>
        <p v-reveal="3" class="mt-8 font-sans text-[11px] tracking-[0.22em] text-[#8C8276]">
          {{ t(maisonStory.signature).toUpperCase() }}
          <span class="text-[#241B14]"> — Արամ Պետրոսյան</span>
        </p>
      </div>
    </div>
  </section>
</template>
