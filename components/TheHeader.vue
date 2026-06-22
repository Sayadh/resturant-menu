<script setup lang="ts">
import { ui } from '~/data/menu'
const { t } = useLanguage()
</script>

<template>
  <header class="relative overflow-hidden">
    <!-- Decorative Armenian food elements (very subtle) -->
    <IconWheat class="pointer-events-none absolute -left-3 top-10 h-28 w-28 -rotate-[18deg] text-caramel opacity-[0.10]" />
    <IconWheat class="pointer-events-none absolute -right-3 top-14 h-28 w-28 rotate-[18deg] scale-x-[-1] text-caramel opacity-[0.10]" />
    <DecorSprig class="pointer-events-none absolute left-8 bottom-2 hidden h-20 w-20 -rotate-12 text-herb opacity-[0.10] sm:block" />
    <DecorSprig class="pointer-events-none absolute right-8 bottom-2 hidden h-20 w-20 rotate-12 scale-x-[-1] text-herb opacity-[0.10] sm:block" />

    <div class="mx-auto max-w-6xl px-5 pb-7 pt-4 sm:pb-9 sm:pt-6">
      <!-- Top bar: language switcher -->
      <div class="flex justify-end">
        <LanguageSwitcher />
      </div>

      <!-- Logo / brand -->
      <div class="mt-1 flex flex-col items-center text-center">
        <!-- Monogram crest -->
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-caramel bg-card font-display text-2xl font-bold text-brown shadow-gold sm:h-20 sm:w-20 sm:text-3xl"
          aria-hidden="true"
        >
          TL
        </div>

        <h1
          class="mt-4 font-display text-4xl font-bold uppercase leading-tight tracking-[0.2em] text-brown sm:text-5xl md:text-6xl"
        >
          TUN LAHMAJO
        </h1>

        <p class="mt-3 font-serif text-lg italic text-brown-soft sm:text-xl">
          {{ t(ui.tagline) }}
        </p>

        <!-- Rating -->
        <div class="mt-4 flex items-center gap-2">
          <div class="flex text-caramel" aria-hidden="true">
            <IconStar v-for="n in 5" :key="n" class="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </div>
          <span class="font-display text-base font-bold text-brown sm:text-lg">{{ ui.rating }}</span>
          <span class="font-serif text-sm text-brown-soft">· {{ t(ui.reviews) }}</span>
        </div>

        <!-- Caramel divider -->
        <div class="mt-5 flex items-center gap-3" aria-hidden="true">
          <span class="h-px w-10 bg-caramel/60" />
          <span class="h-1.5 w-1.5 rotate-45 bg-caramel" />
          <span class="h-px w-10 bg-caramel/60" />
        </div>

        <!-- Restaurant info -->
        <div
          class="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 font-serif text-[15px] text-brown/85"
        >
          <span class="inline-flex items-center gap-1.5">
            <IconPin class="h-4 w-4 text-caramel" />
            {{ t(ui.address) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <IconClock class="h-4 w-4 text-caramel" />
            {{ t(ui.hours) }}
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-herb/15 px-2.5 py-1 text-sm font-semibold text-herb"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-herb" aria-hidden="true" />
            {{ t(ui.openNow) }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
