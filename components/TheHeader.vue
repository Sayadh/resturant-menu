<script setup lang="ts">
import { ui } from '~/data/menu'
const { t } = useLanguage()
</script>

<template>
  <header class="relative overflow-hidden">
    <!-- Subtle corner decorations (very low opacity) -->
    <DecorSprig class="pointer-events-none absolute -left-4 top-6 h-24 w-24 rotate-[-15deg] text-herb opacity-[0.07]" />
    <DecorSprig class="pointer-events-none absolute -right-4 top-10 h-24 w-24 scale-x-[-1] rotate-[15deg] text-herb opacity-[0.07]" />

    <div class="mx-auto max-w-6xl px-5 pb-8 pt-5">
      <!-- Top bar: language switcher -->
      <div class="flex justify-end">
        <LanguageSwitcher />
      </div>

      <!-- Logo / brand -->
      <div class="flex flex-col items-center text-center">
        <h1
          class="font-display text-3xl font-bold uppercase leading-tight tracking-[0.18em] text-brown sm:text-4xl md:text-5xl"
        >
          TUN LAHMAJO
        </h1>

        <p class="mt-3 font-serif text-lg italic text-brown-soft sm:text-xl">
          {{ t(ui.tagline) }}
        </p>

        <!-- Caramel divider -->
        <div class="mt-5 flex items-center gap-3" aria-hidden="true">
          <span class="h-px w-10 bg-caramel/50" />
          <span class="h-1.5 w-1.5 rotate-45 bg-caramel" />
          <span class="h-px w-10 bg-caramel/50" />
        </div>

        <!-- Restaurant info -->
        <div
          class="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-serif text-base text-brown/80"
        >
          <span class="inline-flex items-center gap-2">
            <IconPin class="h-4 w-4 text-caramel" />
            {{ t(ui.city) }}
          </span>
          <span class="inline-flex items-center gap-2">
            <IconClock class="h-4 w-4 text-caramel" />
            {{ t(ui.hours) }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
