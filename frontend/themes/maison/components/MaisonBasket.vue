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
      <div v-if="order.count > 0" class="fixed inset-x-0 bottom-0 z-30 flex justify-center px-5 pb-6">
        <button
          type="button"
          class="group flex w-full max-w-md items-center justify-between gap-4 rounded-full bg-[#241B14] py-3 pl-3 pr-6 text-[#FBF8F1] shadow-[0_18px_40px_-12px_rgba(36,27,20,0.6)] transition-colors duration-300 hover:bg-[#2F241A]"
          @click="$emit('open')"
        >
          <span class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#B08A4F] font-sans text-sm font-medium text-[#241B14]">
              {{ order.count }}
            </span>
            <span class="ms-eyebrow-sm font-sans text-[10px] text-[#FBF8F1]/70">{{ t(maisonOrder.view) }}</span>
          </span>

          <span class="flex items-center gap-3">
            <span class="font-serif text-lg">{{ totalLabel }}<span class="ml-0.5 text-sm text-[#C9AC7C]">{{ ui.currency[lang] }}</span></span>
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-[#C9AC7C] transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </Transition>
  </ClientOnly>
</template>
