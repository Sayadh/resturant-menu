<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// NoirHero — the arrival. A calm obsidian plate: monogram (or the uploaded
// logo), the house name in wide display caps, the tagline, and a restrained
// meta line. If a real cover photo exists it sits behind a deep scrim so the
// food keeps its natural colour; with no photo the plate stays pure black.
// ─────────────────────────────────────────────────────────────────────────
// Explicit import: Nuxt only auto-imports from ~/components, not from
// themes/**, so theme-local components must be imported by hand.
import NoirLangSwitch from './NoirLangSwitch.vue'

const { t } = useLanguage()
const brand = useBrand()
const menu = useMenuStore()

const mono = computed(() => {
  const i = brand.name.split(/\s+/).map((w) => w[0]).join('')
  return (i.length > 1 ? i : brand.name).slice(0, 2).toUpperCase()
})

// Real photography only — the restaurant's cover, else the first dish photo.
const heroImage = computed(
  () =>
    brand.cover ||
    menu.categories.flatMap((c) => c.items).find((i) => i.showImage !== false && i.image)?.image ||
    '',
)
</script>

<template>
  <section class="relative overflow-hidden bg-[#0B0C0E]">
    <!-- cover photograph (only when one actually exists) -->
    <template v-if="heroImage">
      <img :src="heroImage" alt="" class="absolute inset-0 h-full w-full object-cover opacity-[0.28]" />
      <!-- deep scrim: keeps text legible without tinting the food -->
      <div
        class="absolute inset-0"
        style="background: linear-gradient(180deg, rgba(11,12,14,0.72) 0%, rgba(11,12,14,0.86) 55%, #0B0C0E 100%)"
        aria-hidden="true"
      />
    </template>

    <div class="relative mx-auto max-w-5xl px-5 pb-16 pt-8 text-center sm:px-8 sm:pb-20 sm:pt-10">
      <!-- top row: language -->
      <div class="flex justify-end">
        <NoirLangSwitch />
      </div>

      <!-- monogram -->
      <div
        class="mx-auto mt-6 grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-[#303339] bg-[#121417] font-display text-xl font-semibold tracking-[0.08em] text-[#B8B4AC] sm:h-20 sm:w-20 sm:text-2xl"
        :aria-label="brand.name"
      >
        <img v-if="brand.logo" :src="brand.logo" alt="" class="h-full w-full object-cover" />
        <template v-else>{{ mono }}</template>
      </div>

      <h1
        class="mt-7 font-display text-[clamp(2rem,7vw,3.75rem)] font-medium uppercase leading-[1.05] tracking-[0.18em] text-[#F1EEE8]"
      >
        {{ brand.name }}
      </h1>

      <p v-if="t(brand.tagline)" class="mx-auto mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-[#A8A8A5] sm:text-xl">
        {{ t(brand.tagline) }}
      </p>

      <!-- hairline platinum rule -->
      <div class="nr-rule mx-auto mt-8 w-28" aria-hidden="true" />

      <!-- meta (each item shown only when filled) -->
      <div
        v-if="brand.rating || brand.hours || brand.address"
        class="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-[13px] text-[#A8A8A5]"
      >
        <span v-if="brand.rating" class="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" class="h-4 w-4 fill-[#9A8060]" aria-hidden="true">
            <path d="M12 2l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 18.6 6.1 20.8l1.2-6.6L2.4 9.6l6.7-.9z" />
          </svg>
          {{ brand.rating }}
        </span>
        <span v-if="brand.rating && brand.hours" class="h-3 w-px bg-[#303339]" aria-hidden="true" />
        <span v-if="brand.hours">{{ brand.hours }}</span>
        <span v-if="(brand.rating || brand.hours) && brand.address" class="h-3 w-px bg-[#303339]" aria-hidden="true" />
        <span v-if="brand.address">{{ brand.address }}</span>
      </div>
    </div>
  </section>
</template>
