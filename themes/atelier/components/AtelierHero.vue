<script setup lang="ts">
// Editorial hero — asymmetric magazine cover: oversized serif headline and
// editorial meta on the left, a tall framed signature photograph on the right.
import { ui } from '~/data/menu'
import { atelierBrand } from '~/themes/atelier/config'

const { t } = useLanguage()
</script>

<template>
  <section class="relative z-[1] mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
    <div class="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      <!-- Editorial copy -->
      <div>
        <p class="atl-eyebrow font-display text-[11px] text-[#A1502E]">
          {{ atelierBrand.established }}
        </p>

        <h1 class="mt-6 font-serif text-[clamp(2.75rem,9vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.01em] text-[#16130F]">
          {{ t(atelierBrand.kicker) }}
          <span class="mt-1 block italic text-[#A1502E]">{{ atelierBrand.name }}</span>
        </h1>

        <p class="mt-7 max-w-md font-serif text-lg leading-relaxed text-[#857B6C] sm:text-xl">
          {{ t(atelierBrand.tagline) }}
        </p>

        <!-- Editorial meta row -->
        <dl class="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <div class="flex flex-col">
            <dt class="atl-eyebrow font-display text-[9px] text-[#857B6C]">Rating</dt>
            <dd class="mt-1 flex items-baseline gap-1.5 font-serif text-[#16130F]">
              <span class="text-2xl font-semibold">{{ atelierBrand.rating }}</span>
              <span class="text-sm text-[#857B6C]">/ 5 · {{ t(atelierBrand.reviews) }}</span>
            </dd>
          </div>
          <span class="hidden h-9 w-px bg-[#D4C9B8] sm:block" aria-hidden="true" />
          <div class="flex flex-col">
            <dt class="atl-eyebrow font-display text-[9px] text-[#857B6C]">Hours</dt>
            <dd class="mt-1 flex items-center gap-2 font-serif text-[#16130F]">
              <span class="atl-pulse h-1.5 w-1.5 rounded-full bg-[#A1502E]" aria-hidden="true" />
              <span class="text-base">{{ atelierBrand.hours }}</span>
              <span class="text-sm text-[#857B6C]">· {{ t(ui.openNow) }}</span>
            </dd>
          </div>
          <span class="hidden h-9 w-px bg-[#D4C9B8] sm:block" aria-hidden="true" />
          <div class="flex flex-col">
            <dt class="atl-eyebrow font-display text-[9px] text-[#857B6C]">Location</dt>
            <dd class="mt-1 font-serif text-base text-[#16130F]">{{ t(atelierBrand.city) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Framed photograph -->
      <figure class="relative">
        <div class="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#16130F] shadow-[0_40px_80px_-40px_rgba(22,19,15,0.6)]">
          <img
            src="/images/atelier-hero.png"
            alt=""
            class="h-full w-full object-cover"
          />
          <!-- inner hairline frame -->
          <span class="pointer-events-none absolute inset-4 border border-[#F6F2EA]/25" aria-hidden="true" />
        </div>
        <!-- caption tag -->
        <figcaption class="absolute -bottom-4 left-5 bg-[#16130F] px-4 py-2.5 sm:left-8">
          <span class="atl-eyebrow font-display text-[9px] text-[#A1502E]">Signature</span>
          <span class="mt-0.5 block font-serif text-sm italic text-[#F6F2EA]">{{ t(atelierBrand.address) }}</span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
