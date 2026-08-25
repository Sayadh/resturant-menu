<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineSectionCard — a top-level section on the home screen.
//
// The name is NOT set over the photograph. Opaline is a porcelain-light
// theme and the picture is tenant-supplied: it may arrive as a dark plated
// dish or as a pale cream illustration, and no scrim serves both without
// either drowning the artwork or losing the text. So the card reads as a
// museum label — a square image window, a hairline, then the name on the
// card's own paper. Always legible, always aligned, in any language.
//
// Purely presentational; the parent owns navigation.
// ─────────────────────────────────────────────────────────────────────────
const props = defineProps<{
  title: string
  image: string
  icon: string
  count: number
  countLabel: string
}>()

const emit = defineEmits<{ open: [] }>()

/** Fallback mark when the tenant hasn't uploaded a picture yet. */
const initial = computed(() => props.title.trim().charAt(0).toUpperCase())
</script>

<template>
  <button
    type="button"
    class="group flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-[#E2E5E8] bg-[#FFFFFF] text-left shadow-[0_1px_2px_rgba(23,32,51,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#CCD1D7] hover:shadow-[0_20px_40px_-24px_rgba(23,32,51,0.30)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D] active:translate-y-0"
    @click="emit('open')"
  >
    <!-- Image window — the photograph is never tinted, filtered or covered -->
    <span class="relative block aspect-square w-full overflow-hidden bg-[#F5F5F2]">
      <img
        v-if="image"
        :src="image"
        alt=""
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      <span
        v-else
        class="grid h-full w-full place-items-center bg-gradient-to-br from-[#FBEDE8] via-[#FAFAF8] to-[#F5F5F2]"
        aria-hidden="true"
      >
        <span
          class="grid h-14 w-14 place-items-center rounded-full bg-[#FFFFFF] text-2xl shadow-[0_1px_2px_rgba(23,32,51,0.06)] sm:h-16 sm:w-16 sm:text-[26px]"
        >
          <template v-if="icon">{{ icon }}</template>
          <span v-else class="op-serif text-[#D85F3D]">{{ initial }}</span>
        </span>
      </span>
    </span>

    <!-- Caption plate — ink on paper, so it reads over any image above it.
         The min-height holds one- and two-line names to the same measure, so
         every row of the grid sets to an identical height. -->
    <span class="flex min-h-[4rem] flex-1 items-center gap-3 border-t border-[#E2E5E8] px-4 py-3.5 sm:min-h-[4.75rem] sm:px-5 sm:py-4">
      <h3
        class="op-serif op-clamp-2 min-w-0 flex-1 text-balance text-[15px] leading-snug text-[#172033] transition-colors duration-300 group-hover:text-[#D85F3D] sm:text-[18px]"
      >
        {{ title }}
        <span v-if="count" class="sr-only"> — {{ count }} {{ countLabel }}</span>
      </h3>

      <span
        class="shrink-0 text-[#CCD1D7] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#D85F3D]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </span>
  </button>
</template>
