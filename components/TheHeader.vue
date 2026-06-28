<script setup lang="ts">
import { restaurant, ui } from '~/data/menu'
const { t } = useLanguage()

const fullStars = Math.floor(restaurant.rating)
</script>

<template>
  <header class="relative overflow-hidden">
    <!-- Cover image with warm gradient overlay -->
    <div class="absolute inset-0">
      <img
        :src="restaurant.cover"
        alt=""
        aria-hidden="true"
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-brown/75 via-brown/60 to-brown/85" />
    </div>

    <div class="relative z-10 mx-auto flex max-w-6xl flex-col px-5 pb-9 pt-4">
      <!-- Top bar: language switcher -->
      <div class="flex justify-end">
        <LanguageSwitcher />
      </div>

      <!-- Brand -->
      <div class="mt-4 flex flex-col items-center text-center sm:mt-6">
        <h1
          class="font-display text-4xl font-bold uppercase leading-tight tracking-[0.18em] text-cream drop-shadow sm:text-5xl md:text-6xl"
        >
          {{ restaurant.name }}
        </h1>

        <p class="mt-3 font-serif text-lg italic text-cream/90 sm:text-xl">
          {{ t(restaurant.tagline) }}
        </p>

        <!-- Gold divider -->
        <div class="mt-5 flex items-center gap-3" aria-hidden="true">
          <span class="h-px w-12 bg-caramel" />
          <span class="h-1.5 w-1.5 rotate-45 bg-caramel" />
          <span class="h-px w-12 bg-caramel" />
        </div>

        <!-- Info chips -->
        <div class="mt-5 flex flex-wrap items-center justify-center gap-2.5 font-serif text-sm">
          <span
            class="inline-flex items-center gap-1.5 rounded-pill border border-cream/20 bg-cream/10 px-3.5 py-1.5 text-cream backdrop-blur"
          >
            <span class="flex items-center gap-0.5 text-caramel-light">
              <IconStar
                v-for="n in 5"
                :key="n"
                class="h-3.5 w-3.5"
                :filled="n <= fullStars"
              />
            </span>
            <span class="font-semibold">{{ restaurant.rating }}</span>
          </span>

          <span
            class="inline-flex items-center gap-1.5 rounded-pill border border-cream/20 bg-cream/10 px-3.5 py-1.5 text-cream backdrop-blur"
          >
            <IconPin class="h-4 w-4 text-caramel-light" />
            {{ t(ui.city) }}
          </span>

          <span
            class="inline-flex items-center gap-1.5 rounded-pill border border-cream/20 bg-cream/10 px-3.5 py-1.5 text-cream backdrop-blur"
          >
            <IconClock class="h-4 w-4 text-caramel-light" />
            {{ t(ui.hours) }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
