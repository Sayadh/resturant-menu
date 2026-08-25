<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineCategoryCard — the second level. Same museum-label construction as
// the section card (image window, hairline, name on paper) so the two levels
// read as one family, but deliberately tighter: a shallower image window, a
// smaller radius and a smaller type size, so a guest can feel they have gone
// one step deeper without being told.
//
// Purely presentational; the parent owns navigation.
// ─────────────────────────────────────────────────────────────────────────
const props = defineProps<{
  title: string
  description: string
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
    class="group flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-[#E2E5E8] bg-[#FFFFFF] text-left shadow-[0_1px_2px_rgba(23,32,51,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#CCD1D7] hover:shadow-[0_18px_36px_-24px_rgba(23,32,51,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D] active:translate-y-0"
    @click="emit('open')"
  >
    <!-- Image window — the photograph is never tinted, filtered or covered -->
    <span class="relative block aspect-[4/3] w-full overflow-hidden bg-[#F5F5F2]">
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
          class="grid h-12 w-12 place-items-center rounded-full bg-[#FFFFFF] text-xl shadow-[0_1px_2px_rgba(23,32,51,0.06)] sm:h-14 sm:w-14 sm:text-2xl"
        >
          <template v-if="icon">{{ icon }}</template>
          <span v-else class="op-serif text-[#D85F3D]">{{ initial }}</span>
        </span>
      </span>
    </span>

    <!-- Caption plate — ink on paper, so it reads over any image above it.
         The min-height holds one- and two-line names to the same measure, so
         every row of the grid sets to an identical height. -->
    <span class="flex min-h-[3.5rem] flex-1 items-center gap-2.5 border-t border-[#E2E5E8] px-3.5 py-3 sm:min-h-[4rem] sm:px-4 sm:py-3.5">
      <h4
        class="op-serif op-clamp-2 min-w-0 flex-1 text-balance text-[14px] leading-snug text-[#172033] transition-colors duration-300 group-hover:text-[#D85F3D] sm:text-[16px]"
      >
        {{ title }}
        <span v-if="description || count" class="sr-only">
          <template v-if="description"> — {{ description }}</template>
          <template v-if="count"> — {{ count }} {{ countLabel }}</template>
        </span>
      </h4>

      <span
        class="shrink-0 text-[#CCD1D7] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#D85F3D]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </span>
  </button>
</template>
