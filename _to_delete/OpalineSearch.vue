<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineSearch — a hairline field, not a box. Two-way bound to the parent's
// query string; the filtering itself stays in the layout, over the same store
// data every other theme searches.
// ─────────────────────────────────────────────────────────────────────────
import { ui } from '~/data/menu'
import { opalineClose } from '~/themes/opaline/config'

const model = defineModel<string>({ required: true })

const { t } = useLanguage()
</script>

<template>
  <div class="mx-auto flex max-w-md items-center gap-3 border-b border-[#E2E5E8] pb-2.5 transition-colors focus-within:border-[#172033]">
    <svg
      viewBox="0 0 24 24"
      class="h-[18px] w-[18px] shrink-0 text-[#A1A6B0]"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>

    <input
      v-model="model"
      type="search"
      autocomplete="off"
      class="op-sans min-w-0 flex-1 bg-transparent text-[15px] text-[#172033] outline-none placeholder:text-[#A1A6B0]"
      :placeholder="t(ui.searchPlaceholder)"
      :aria-label="t(ui.searchPlaceholder)"
    />

    <button
      v-if="model"
      type="button"
      class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#747D90] transition hover:bg-[#F5F5F2] hover:text-[#172033] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
      :aria-label="t(opalineClose)"
      @click="model = ''"
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  </div>
</template>
