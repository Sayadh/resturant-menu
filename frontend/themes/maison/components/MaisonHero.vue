<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonHero — Warm & Family welcome.
// An inviting, airy split hero on warm cream: brand name + tagline + meta and
// a terracotta call-to-action on the left, a soft rounded, framed cover photo
// on the right. Cozy, friendly, premium — never dark or cinematic.
// ─────────────────────────────────────────────────────────────────────────
import { maisonBrand, maisonHero } from '~/themes/maison/config'

defineEmits<{ (e: 'enter'): void }>()

const { t } = useLanguage()
const brand = useBrand()
const menu = useMenuStore()

// Hero photo: the restaurant's cover if set, otherwise the first real dish
// photo from the menu (so the hero always shows appetising, on-brand food).
const heroImage = computed(
  () => brand.cover || menu.categories.flatMap((c) => c.items).find((i) => i.image)?.image || '',
)
</script>

<template>
  <section class="relative overflow-hidden bg-[#F6F0E4] pt-24 pb-16 sm:pt-28 sm:pb-24">
    <!-- soft warm glows -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -left-20 top-6 h-72 w-72 rounded-full bg-[#E0B27C]/35 blur-3xl" />
      <div class="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#C4693F]/15 blur-3xl" />
    </div>

    <!-- top bar: established + language -->
    <div class="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
      <span class="ms-eyebrow-sm font-sans text-[10px] text-[#8A7C6B]">{{ maisonBrand.established }}</span>
      <MaisonLangSwitch tone="dark" />
    </div>

    <div class="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
      <!-- copy -->
      <div class="text-center lg:text-left">
        <p class="ms-eyebrow font-sans text-[11px] font-semibold text-[#8A9466]">{{ t(maisonHero.welcome) }}</p>

        <img
          v-if="brand.logo"
          :src="brand.logo"
          alt=""
          class="mx-auto mt-5 h-20 w-20 rounded-full object-cover shadow-[0_16px_30px_-14px_rgba(90,68,51,0.5)] ring-4 ring-white/70 sm:h-24 sm:w-24 lg:mx-0"
        />

        <h1 class="mt-5 font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-[#3E3125] sm:text-6xl lg:text-7xl">
          {{ brand.name }}
        </h1>

        <p class="mx-auto mt-5 max-w-md font-serif text-lg italic leading-relaxed text-[#6E6152] sm:text-xl lg:mx-0">
          {{ t(brand.tagline) }}
        </p>

        <!-- meta (each shown only when filled) -->
        <div v-if="brand.rating || brand.hours" class="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-sans text-[13px] text-[#6E6152] lg:justify-start">
          <span v-if="brand.rating" class="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-[#E0A458]" aria-hidden="true">
              <path d="M12 2l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 18.6 6.1 20.8l1.2-6.6L2.4 9.6l6.7-.9z" />
            </svg>
            {{ brand.rating }}
          </span>
          <span v-if="brand.rating && brand.hours" class="hidden h-3 w-px bg-[#D8CBB4] sm:block" aria-hidden="true" />
          <span v-if="brand.hours" class="flex items-center gap-1.5">
            {{ brand.hours }}
          </span>
        </div>

        <!-- CTAs -->
        <div class="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <button
            type="button"
            class="group inline-flex items-center gap-2.5 rounded-full bg-[#C4693F] px-7 py-3.5 font-sans text-sm font-semibold text-[#F6F0E4] shadow-[0_18px_34px_-16px_rgba(196,105,63,0.85)] transition hover:-translate-y-0.5 hover:bg-[#B0562F]"
            @click="$emit('enter')"
          >
            {{ t(maisonHero.enter) }}
            <svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M12 5v14M6 13l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <span v-if="brand.address" class="inline-flex items-center gap-2 rounded-full border border-[#E7DDCB] bg-[#FCF8F0] px-5 py-3.5 font-sans text-sm font-medium text-[#5A4433]">
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-[#C4693F]" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z" stroke-linejoin="round" /><circle cx="12" cy="10" r="2.4" />
            </svg>
            {{ brand.address }}
          </span>
        </div>
      </div>

      <!-- framed cover photo -->
      <div class="relative mx-auto w-full max-w-md lg:max-w-none">
        <div class="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-[0_44px_84px_-42px_rgba(90,68,51,0.55)] ring-1 ring-white/50">
          <img
            v-if="heroImage"
            :src="heroImage"
            alt=""
            class="ms-kenburns h-full w-full object-cover"
          />
          <div
            v-else
            class="h-full w-full"
            style="background: radial-gradient(120% 90% at 70% 20%, #E8B98A, transparent 60%), radial-gradient(100% 90% at 20% 80%, #C98A5A, transparent 55%), linear-gradient(135deg, #D9A876, #B87A48)"
            aria-hidden="true"
          />
          <!-- gentle warm vignette -->
          <div class="pointer-events-none absolute inset-0" style="background: linear-gradient(180deg, transparent 55%, rgba(74,58,41,0.28) 100%)" aria-hidden="true" />
        </div>
        <!-- floating glass caption -->
        <div class="absolute -bottom-4 left-5 flex items-center gap-2 rounded-2xl bg-[#FCF8F0]/90 px-4 py-2.5 font-sans text-[13px] font-semibold text-[#5A4433] shadow-[0_18px_34px_-18px_rgba(90,68,51,0.5)] backdrop-blur">
          <span class="text-base">🍞</span> {{ t(brand.tagline) }}
        </div>
      </div>
    </div>

    <!-- scroll cue -->
    <div class="relative z-10 mt-14 flex flex-col items-center gap-2 text-[#8A7C6B]">
      <span class="ms-eyebrow-sm font-sans text-[9px]">{{ t(maisonHero.scroll) }}</span>
      <span class="ms-bob inline-block h-7 w-px bg-[#C4693F]/50" aria-hidden="true" />
    </div>
  </section>
</template>
