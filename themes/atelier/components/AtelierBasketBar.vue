<script setup lang="ts">
// Floating "table" dock — a slim ink pill, bottom-centered, that opens the
// bill. Quietly confident; only appears once a dish has been selected.
import { atelierBill } from '~/themes/atelier/config'

const emit = defineEmits<{ open: [] }>()

const { t } = useLanguage()
const menu = useMenuStore()
const order = useOrderStore()

const total = computed(() =>
  order.lines.reduce((sum, l) => {
    const found = menu.findItem(l.id)
    return sum + (found ? found.item.price * l.qty : 0)
  }, 0),
)
const fmt = (n: number) => n.toLocaleString('hy-AM')
</script>

<template>
  <Transition name="atl-dock">
    <button
      v-if="order.count > 0"
      type="button"
      class="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 items-center gap-4 bg-[#16130F] px-5 py-3.5 text-[#F6F2EA] shadow-[0_24px_50px_-18px_rgba(22,19,15,0.75)] transition hover:bg-[#211c16]"
      @click="emit('open')"
    >
      <span class="flex items-center gap-2.5">
        <span class="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#A1502E] px-1.5 font-display text-[11px] font-semibold text-[#F6F2EA]">{{ order.count }}</span>
        <span class="atl-eyebrow font-display text-[10px] text-[#F6F2EA]/70">{{ t(atelierBill.view) }}</span>
      </span>
      <span class="ml-auto flex items-center gap-3">
        <span class="font-serif text-lg">{{ fmt(total) }}<span class="ml-0.5 text-[#A1502E]">֏</span></span>
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  </Transition>
</template>
