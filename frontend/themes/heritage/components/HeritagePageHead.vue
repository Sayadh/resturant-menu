<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// HeritagePageHead — the head of a section or category screen: a back
// control, an optional trail (where the guest came from) and, when given,
// the title in Cinzel caps over the caramel diamond rule. Centred, like a
// printed menu page — not Opaline's left-aligned editorial head.
//
// Without `title` it renders compact (back + trail only): the category
// screen uses that, because its banner already carries the name.
// ─────────────────────────────────────────────────────────────────────────
import { heritageBack } from '~/themes/heritage/config'

defineProps<{
  /** Where the guest came from, e.g. the section name. */
  trail?: string
  title?: string
  description?: string
}>()

const emit = defineEmits<{ back: [] }>()

const { t } = useLanguage()
</script>

<template>
  <div class="pb-6 pt-5 sm:pb-8 sm:pt-7">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#A47B45]/50 bg-[#FCFBF7] py-1.5 pl-1.5 pr-4 font-serif text-[15px] font-semibold text-[#292A27] shadow-[0_4px_14px_-8px_rgba(38,56,47,0.35)] transition duration-300 hover:border-[#A47B45] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A47B45]"
        @click="emit('back')"
      >
        <span
          class="grid h-7 w-7 place-items-center rounded-full bg-[#26382F] text-[#FCFBF7] transition-transform duration-300 group-hover:-translate-x-0.5"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </span>
        {{ t(heritageBack) }}
      </button>

      <p v-if="trail && !title" class="min-w-0 truncate font-serif text-base italic text-[#706F68]">
        {{ trail }}
      </p>
    </div>

    <div v-if="title" class="mt-6 flex flex-col items-center text-center">
      <p v-if="trail" class="font-serif text-base italic text-[#706F68]">{{ trail }}</p>
      <h1
        class="font-display text-3xl font-bold uppercase leading-tight tracking-[0.14em] text-[#292A27] sm:text-4xl md:text-5xl"
        :class="{ 'mt-1': trail }"
      >
        {{ title }}
      </h1>
      <div class="mt-4 flex items-center gap-3" aria-hidden="true">
        <span class="h-px w-10 bg-[#A47B45]/60" />
        <span class="h-1.5 w-1.5 rotate-45 bg-[#A47B45]" />
        <span class="h-px w-10 bg-[#A47B45]/60" />
      </div>
      <p v-if="description" class="mt-4 max-w-xl font-serif text-base leading-relaxed text-[#706F68] sm:text-lg">
        {{ description }}
      </p>
    </div>
  </div>
</template>
