<script setup lang="ts">
// Floating selection dock — a graphite disc with a hairline platinum edge,
// bottom-left. Appears only once a dish has been selected.
import { noirOrder } from '~/themes/noir/config'

const emit = defineEmits<{ open: [] }>()

const { t } = useLanguage()
const order = useOrderStore()
</script>

<template>
  <Transition name="nr-dock">
    <button
      v-if="order.count > 0"
      type="button"
      class="fixed bottom-5 left-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-[#303339] bg-[#191B1F] text-[#F1EEE8] shadow-[0_22px_46px_-18px_rgba(0,0,0,0.95)] transition hover:border-[#B8B4AC] hover:bg-[#272A30] active:scale-95 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
      :aria-label="`${t(noirOrder.view)} · ${order.count}`"
      @click="emit('open')"
    >
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 7h12l-1 13H7L6 7z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span
        class="nr-numeral absolute -right-1 -top-1 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-[#B8B4AC] px-1 font-sans text-[11px] font-semibold text-[#0B0C0E] ring-2 ring-[#0B0C0E]"
      >{{ order.count }}</span>
    </button>
  </Transition>
</template>
