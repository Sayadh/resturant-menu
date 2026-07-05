<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonBasket — a minimal floating "selection" pill. Appears only when the
// guest has chosen something; shows the count and running total and opens the
// selection drawer. Quiet, luxurious, never shouty.
// ─────────────────────────────────────────────────────────────────────────
import { ui } from '~/data/menu'
import { maisonOrder } from '~/themes/maison/config'

defineEmits<{ (e: 'open'): void }>()

const { t, lang } = useLanguage()
const order = useOrderStore()
const store = useMenuStore()

const total = computed(() =>
  order.lines.reduce((sum, line) => {
    const found = store.findItem(line.id)
    return sum + (found ? found.item.price * line.qty : 0)
  }, 0),
)
const totalLabel = computed(() => total.value.toLocaleString('fr-FR'))
</script>

<template>
  <ClientOnly>
    <Transition name="ms-dock">
      <div v-if="order.count > 0" class="fixed bottom-6 left-5 z-30">
        <button
          type="button"
          class="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#55402E] text-[#FCF8F0] shadow-[0_18px_40px_-12px_rgba(74,58,41,0.6)] transition-colors duration-300 hover:bg-[#5C4A35] active:scale-95"
          :aria-label="`${t(maisonOrder.view)} · ${order.count}`"
          @click="$emit('open')"
        >
          <svg viewBox="0 0 24 24" class="h-6 w-6 text-[#E0B27C]" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span class="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C4693F] px-1 font-sans text-xs font-semibold text-[#4A3B2E] ring-2 ring-[#55402E]">{{ order.count }}</span>
        </button>
      </div>
    </Transition>
  </ClientOnly>
</template>
