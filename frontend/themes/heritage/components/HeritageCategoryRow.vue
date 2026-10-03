<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// HeritageCategoryRow — one category on a section screen. A list row, not a
// card grid: caramel-ringed round picture, the name in Cinzel caps, the
// tenant's description when there is one, and the dish count — the way a
// printed menu lists its chapters.
// ─────────────────────────────────────────────────────────────────────────
import { imgUrl } from '~/utils/image'

const props = defineProps<{
  title: string
  description?: string
  image: string
  icon: string
  count: number
  countLabel: string
}>()

const emit = defineEmits<{ open: [] }>()

const failed = ref(false)
watch(() => props.image, () => (failed.value = false))
const hasPhoto = computed(() => !!props.image && !failed.value)
</script>

<template>
  <button
    type="button"
    class="group flex w-full items-center gap-4 rounded-card border border-[#D5D1C6] bg-[#FCFBF7] p-3 text-left shadow-[0_4px_18px_-6px_rgba(38,56,47,0.16)] ring-1 ring-[#26382F]/[0.03] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#64734D]/45 hover:shadow-[0_22px_44px_-14px_rgba(38,56,47,0.30)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A47B45] sm:gap-5 sm:p-4"
    @click="emit('open')"
  >
    <span
      class="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#A47B45]/70 bg-gradient-to-br from-[#64734D]/25 via-[#F1F0EA] to-[#A47B45]/18 shadow-[0_6px_18px_-8px_rgba(100,115,77,0.5)] sm:h-24 sm:w-24"
    >
      <img
        v-if="hasPhoto"
        :src="imgUrl(image, 256)"
        alt=""
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        @error="failed = true"
      />
      <span v-else class="grid h-full w-full place-items-center text-3xl sm:text-4xl" aria-hidden="true">{{ icon }}</span>
    </span>

    <span class="min-w-0 flex-1">
      <span class="block font-display text-lg font-bold uppercase leading-tight tracking-[0.1em] text-[#292A27] sm:text-xl">
        {{ title }}
      </span>
      <span v-if="description" class="mt-1 line-clamp-2 font-serif text-[15px] leading-snug text-[#706F68]">
        {{ description }}
      </span>
      <span class="mt-1.5 inline-flex items-center gap-2 font-serif text-sm font-semibold text-[#64734D]">
        <span class="h-1.5 w-1.5 rotate-45 bg-[#A47B45]" aria-hidden="true" />
        {{ count }} {{ countLabel }}
      </span>
    </span>

    <span
      class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#D5D1C6] text-[#64734D] transition-all duration-300 group-hover:translate-x-0.5 group-hover:border-[#64734D] group-hover:bg-[#64734D] group-hover:text-[#FCFBF7]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </span>
  </button>
</template>
