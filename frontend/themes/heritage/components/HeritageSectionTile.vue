<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// HeritageSectionTile — one section on the home screen. Built from the same
// parts as Heritage's category banner (olive gradient, wheat watermark,
// caramel-ringed icon, Cinzel caps) and framed by an inset caramel line, so
// a section reads as an engraved plate. Numbered in Roman numerals.
//
// Whole tile is one button, so only phrasing elements live inside it.
// ─────────────────────────────────────────────────────────────────────────
import { imgUrl } from '~/utils/image'

const props = defineProps<{
  title: string
  image: string
  icon: string
  count: number
  countLabel: string
  index: number
}>()

const emit = defineEmits<{ open: [] }>()

const failed = ref(false)
watch(() => props.image, () => (failed.value = false))
const hasPhoto = computed(() => !!props.image && !failed.value)

const ROMAN: [number, string][] = [
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]
const numeral = computed(() => {
  let n = props.index + 1
  let out = ''
  for (const [value, glyph] of ROMAN) {
    while (n >= value) {
      out += glyph
      n -= value
    }
  }
  return out
})
</script>

<template>
  <button
    type="button"
    class="group relative block h-44 w-full overflow-hidden rounded-card text-left shadow-[0_4px_18px_-6px_rgba(38,56,47,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-14px_rgba(38,56,47,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A47B45] sm:h-56"
    @click="emit('open')"
  >
    <!-- base -->
    <span class="absolute inset-0 bg-gradient-to-br from-[#33473C] to-[#26382F]" aria-hidden="true" />

    <!-- photo, or the section's emoji as a watermark -->
    <img
      v-if="hasPhoto"
      :src="imgUrl(image, 1200)"
      alt=""
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      @error="failed = true"
    />
    <span
      v-else
      class="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-25 sm:text-8xl"
      aria-hidden="true"
    >
      {{ icon }}
    </span>

    <!-- contrast + ornament -->
    <span class="absolute inset-0 bg-gradient-to-t from-[#26382F]/95 via-[#26382F]/55 to-[#26382F]/10" aria-hidden="true" />
    <span class="pointer-events-none absolute inset-2.5 rounded-[14px] border border-[#A47B45]/45 sm:inset-3" aria-hidden="true" />
    <IconWheat class="pointer-events-none absolute -right-1 top-1 h-24 w-24 rotate-[14deg] text-[#A47B45] opacity-25" />

    <span
      class="absolute left-6 top-5 font-display text-sm font-bold tracking-[0.3em] text-[#F5E6C8] [text-shadow:0_1px_3px_rgba(20,30,25,0.8)] sm:left-7 sm:top-6"
      aria-hidden="true"
    >
      {{ numeral }}
    </span>

    <!-- content -->
    <span class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 sm:p-7">
      <span class="flex min-w-0 items-center gap-3">
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#A47B45]/60 bg-[#26382F]/40 text-xl shadow-sm backdrop-blur-sm sm:h-12 sm:w-12 sm:text-2xl"
          aria-hidden="true"
        >
          {{ icon }}
        </span>
        <span class="min-w-0">
          <span class="line-clamp-2 break-words font-display text-xl font-bold uppercase leading-tight tracking-[0.1em] text-[#FCFBF7] drop-shadow sm:text-2xl lg:text-3xl">
            {{ title }}
          </span>
          <span class="mt-0.5 block font-serif text-sm text-[#FCFBF7]/80">
            {{ count }} {{ countLabel }}
          </span>
        </span>
      </span>

      <span
        class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#A47B45]/70 bg-[#A47B45]/20 text-[#FCFBF7] backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-[#A47B45]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </span>
  </button>
</template>
