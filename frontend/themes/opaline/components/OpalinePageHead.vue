<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalinePageHead — the head of a section or category screen: the back
// action, an optional parent note (the section a category belongs to), the
// title in the editorial serif, and the description when the tenant wrote
// one. Not sticky on purpose — only the header pins, so nothing ever covers
// the content on small screens.
// ─────────────────────────────────────────────────────────────────────────
import { opalineBack } from '~/themes/opaline/config'

defineProps<{
  /** Small parent note above the title (e.g. the section name). */
  eyebrow?: string
  title: string
  description?: string
}>()

const emit = defineEmits<{ back: [] }>()

const { t } = useLanguage()
</script>

<template>
  <div class="pb-5 pt-4 sm:pb-7 sm:pt-6">
    <!-- Back reads as a real control: a hairline chip, not a floating glyph -->
    <button
      type="button"
      class="op-label group inline-flex items-center gap-1.5 rounded-full border border-[#E2E5E8] bg-[#FFFFFF] py-1.5 pl-2 pr-3 text-[9px] text-[#747D90] shadow-[0_1px_2px_rgba(23,32,51,0.04)] transition duration-300 hover:border-[#CCD1D7] hover:text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
      @click="emit('back')"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
      {{ t(opalineBack) }}
    </button>

    <p v-if="eyebrow" class="op-label mt-4 text-[9px] text-[#D85F3D]">{{ eyebrow }}</p>

    <h1
      class="op-serif text-balance text-[24px] leading-[1.14] text-[#172033] sm:text-[34px]"
      :class="eyebrow ? 'mt-1.5' : 'mt-3.5'"
    >
      {{ title }}
    </h1>

    <p
      v-if="description"
      class="op-sans mt-2.5 max-w-xl text-[13px] leading-relaxed text-[#747D90] sm:mt-3 sm:text-[14px]"
    >
      {{ description }}
    </p>
  </div>
</template>
