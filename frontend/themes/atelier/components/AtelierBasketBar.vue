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
      class="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#16130F] text-[#F6F2EA] shadow-[0_24px_50px_-18px_rgba(22,19,15,0.75)] transition hover:bg-[#211c16] active:scale-95"
      :aria-label="`${t(atelierBill.view)} · ${order.count}`"
      @click="emit('open')"
    >
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span class="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#A1502E] px-1 font-display text-[11px] font-semibold text-[#F6F2EA] ring-2 ring-[#16130F]">{{ order.count }}</span>
    </button>
  </Transition>
</template>
