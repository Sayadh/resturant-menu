<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonHero — full-screen cinematic welcome.
// Large cover photography, soft gradient overlay, logo, tagline, rating,
// location and hours. Sets the emotional tone before any food is shown.
// ─────────────────────────────────────────────────────────────────────────
import { ui } from '~/data/menu'
import { maisonBrand, maisonHero } from '~/themes/maison/config'

defineEmits<{ (e: 'enter'): void }>()

const { t } = useLanguage()
const brand = useBrand()
</script>

<template>
  <section class="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
    <!-- Warm base (always present, so there's never a broken hero) -->
    <div class="absolute inset-0" style="background: radial-gradient(circle at 50% 30%, #3B2C20, #241B14)" aria-hidden="true" />
    <!-- Cover photography (only if the restaurant has one) with a slow drift -->
    <div
      v-if="brand.cover"
      class="ms-kenburns absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${brand.cover})` }"
      aria-hidden="true"
    />
    <!-- Soft gradient overlays for legibility -->
    <div
      class="absolute inset-0"
      style="background: linear-gradient(180deg, rgba(36,27,20,0.55) 0%, rgba(36,27,20,0.2) 35%, rgba(36,27,20,0.35) 65%, rgba(36,27,20,0.82) 100%)"
      aria-hidden="true"
    />

    <!-- Top bar: established + language -->
    <div class="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 sm:px-10">
      <span class="ms-eyebrow-sm font-sans text-[10px] text-[#FBF8F1]/70">
        {{ maisonBrand.established }}
      </span>
      <MaisonLangSwitch tone="light" />
    </div>

    <!-- Centerpiece -->
    <div class="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-[#FBF8F1]">
      <p class="ms-eyebrow mb-6 font-sans text-[11px] text-[#C9AC7C]">
        {{ t(maisonHero.welcome) }}
      </p>

      <!-- Wordmark -->
      <h1 class="font-display text-5xl font-light leading-[0.95] tracking-wide sm:text-7xl lg:text-8xl">
        {{ brand.name }}
      </h1>

      <!-- Gold rule + kicker -->
      <div class="mt-7 flex items-center gap-4">
        <span class="h-px w-10 bg-[#C9AC7C]/60" aria-hidden="true" />
        <span class="font-serif text-lg italic text-[#FBF8F1]/85 sm:text-xl">{{ t(maisonBrand.kicker) }}</span>
        <span class="h-px w-10 bg-[#C9AC7C]/60" aria-hidden="true" />
      </div>

      <p class="mt-6 max-w-md text-balance font-serif text-lg leading-relaxed text-[#FBF8F1]/75 sm:text-xl">
        {{ t(brand.tagline) }}
      </p>

      <!-- Meta row: rating · location · hours -->
      <div class="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-sans text-[12px] tracking-[0.12em] text-[#FBF8F1]/80">
        <span class="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 fill-[#C9AC7C]" aria-hidden="true">
            <path d="M12 2l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 18.6 6.1 20.8l1.2-6.6L2.4 9.6l6.7-.9z" />
          </svg>
          {{ brand.rating }} · {{ t(maisonBrand.reviews) }}
        </span>
        <span class="hidden h-3 w-px bg-[#FBF8F1]/30 sm:block" aria-hidden="true" />
        <span>{{ brand.address }}</span>
        <span class="hidden h-3 w-px bg-[#FBF8F1]/30 sm:block" aria-hidden="true" />
        <span class="flex items-center gap-1.5">
          <span class="ms-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#A7BE7C]" aria-hidden="true" />
          {{ t(ui.openNow) }} · {{ brand.hours }}
        </span>
      </div>

      <!-- Enter -->
      <button
        type="button"
        class="group mt-11 inline-flex items-center gap-3 border border-[#FBF8F1]/40 px-8 py-3.5 font-sans text-[11px] tracking-[0.28em] text-[#FBF8F1] transition-colors duration-500 hover:border-[#C9AC7C] hover:bg-[#C9AC7C] hover:text-[#241B14]"
        @click="$emit('enter')"
      >
        {{ t(maisonHero.enter).toUpperCase() }}
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-y-0.5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- Scroll cue -->
    <div class="absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-2 text-[#FBF8F1]/70">
      <span class="ms-eyebrow-sm font-sans text-[9px]">{{ t(maisonHero.scroll) }}</span>
      <span class="ms-bob inline-block h-7 w-px bg-[#FBF8F1]/50" aria-hidden="true" />
    </div>
  </section>
</template>
