<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// HeritageTopBar — the compact bar on section and category screens. The full
// crest header (TheHeader) belongs to the home screen only; deeper in, the
// guest keeps the brand, a way home and the language switcher, nothing more.
// ─────────────────────────────────────────────────────────────────────────
import { imgUrl } from '~/utils/image'

const emit = defineEmits<{ home: [] }>()

const brand = useBrand()
const mono = computed(() => {
  const i = brand.name.split(/\s+/).map((w) => w[0]).join('')
  return (i.length > 1 ? i : brand.name).slice(0, 2).toUpperCase()
})
</script>

<template>
  <div class="sticky top-0 z-30 border-b border-[#D5D1C6] bg-[#F1F0EA]/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
      <button
        type="button"
        class="flex min-w-0 items-center gap-2.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A47B45]"
        @click="emit('home')"
      >
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#A47B45] bg-[#FCFBF7] font-display text-sm font-bold text-[#292A27]"
          aria-hidden="true"
        >
          <img v-if="brand.logo" :src="imgUrl(brand.logo, 256)" alt="" class="h-full w-full object-cover" />
          <template v-else>{{ mono }}</template>
        </span>
        <span class="truncate font-display text-base font-bold uppercase tracking-[0.18em] text-[#292A27]">
          {{ brand.name }}
        </span>
      </button>

      <LanguageSwitcher theme="heritage" />
    </div>
  </div>
</template>
