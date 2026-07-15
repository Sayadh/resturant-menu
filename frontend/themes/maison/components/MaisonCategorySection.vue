<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonCategorySection — each category becomes its own cinematic landing
// band: a large background photograph (parallax), the category name, a short
// description and an "Explore" cue that reveals its dishes below.
// ─────────────────────────────────────────────────────────────────────────
import type { MenuCategory } from '~/data/menu'
import { maisonCategories } from '~/themes/maison/config'
import { vReveal, vParallax } from '~/themes/maison/animations'

const props = defineProps<{
  category: MenuCategory
  image: string
  mobileImage?: string
  index: number
}>()
const mobileSrc = computed(() => props.mobileImage || props.image)
defineEmits<{ (e: 'explore'): void }>()

const { t } = useLanguage()
const num = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<template>
  <div class="relative mx-auto h-[40svh] min-h-[260px] w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-32px_rgba(74,58,41,0.45)] sm:h-[62svh] sm:min-h-[400px] sm:w-[calc(100%-3rem)]">
    <!-- Background (desktop) -->
    <img
      v-if="image"
      v-parallax="50"
      :src="image"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 hidden h-[118%] w-full -translate-y-[6%] scale-105 object-cover sm:block"
    />
    <!-- Background (mobile) -->
    <img
      v-if="mobileSrc"
      v-parallax="50"
      :src="mobileSrc"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 h-[118%] w-full -translate-y-[6%] scale-105 object-cover sm:hidden"
    />
    <div
      v-if="!image && !mobileSrc"
      class="absolute inset-0"
      style="background: radial-gradient(circle at 50% 30%, #55402E, #55402E)"
      aria-hidden="true"
    />
    <div
      class="absolute inset-0"
      style="background: linear-gradient(180deg, rgba(74, 58, 41,0.55), rgba(74, 58, 41,0.4) 45%, rgba(74, 58, 41,0.78))"
      aria-hidden="true"
    />

    <!-- Content -->
    <div class="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-[#FCF8F0]">
      <span v-reveal class="ms-gold-text font-display text-4xl sm:text-6xl">{{ num }}</span>
      <h2 v-reveal="1" class="mt-3 text-balance font-serif text-3xl leading-tight sm:mt-4 sm:text-6xl">
        {{ t(category.title) }}
      </h2>
      <div v-reveal="2" class="mt-4 flex items-center gap-3 font-sans text-[11px] tracking-[0.24em] text-[#FCF8F0]/75 sm:mt-6">
        <span class="h-px w-8 bg-[#E0B27C]/60" aria-hidden="true" />
        {{ category.items.length }} {{ t(maisonCategories.dishesWord).toUpperCase() }}
        <span class="h-px w-8 bg-[#E0B27C]/60" aria-hidden="true" />
      </div>

      <button
        v-reveal="3"
        type="button"
        class="group mt-6 inline-flex items-center gap-3 border border-[#FCF8F0]/40 px-8 py-3 font-sans text-[11px] tracking-[0.26em] transition-colors duration-500 hover:border-[#E0B27C] hover:bg-[#E0B27C] hover:text-[#4A3B2E] sm:mt-9"
        @click="$emit('explore')"
      >
        {{ t(maisonCategories.explore).toUpperCase() }}
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-y-0.5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>
