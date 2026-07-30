<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// NoirOrderDrawer — a right-docked smoked-graphite drawer (bottom sheet on
// mobile) listing the guest's selection. Honours the tenant's cart settings:
// the total can be hidden, and a service charge can be added as a percentage
// or shown as a plain note.
// ─────────────────────────────────────────────────────────────────────────
import { ui } from '~/data/menu'
import { noirOrder } from '~/themes/noir/config'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useLanguage()
const menu = useMenuStore()
const order = useOrderStore()
const brand = useBrand()

interface Row {
  id: string
  name: string
  price: number
  image: string
  qty: number
  sum: number
}

const rows = computed<Row[]>(() =>
  order.lines
    .map((l) => {
      const found = menu.findItem(l.id)
      if (!found) return null
      return {
        id: l.id,
        name: t(found.item.name),
        price: found.item.price,
        image: found.item.image,
        qty: l.qty,
        sum: found.item.price * l.qty,
      }
    })
    .filter((r): r is Row => r !== null),
)

const subtotal = computed(() => rows.value.reduce((s, r) => s + r.sum, 0))
const serviceAmount = computed(() =>
  brand.serviceChargeEnabled && brand.serviceChargeMode === 'percent'
    ? Math.round((subtotal.value * brand.serviceChargePercent) / 100)
    : 0,
)
const total = computed(() => subtotal.value + serviceAmount.value)
const fmt = (n: number) => n.toLocaleString('hy-AM')
</script>

<template>
  <Teleport to="body">
    <Transition name="nr-fade">
      <div v-if="open" class="fixed inset-0 z-[65]">
        <div class="absolute inset-0 bg-[rgba(4,5,7,0.78)] backdrop-blur-sm" @click="emit('close')" />
      </div>
    </Transition>

    <Transition name="nr-drawer">
      <aside
        v-if="open"
        class="noir-theme fixed inset-x-0 bottom-0 z-[66] flex max-h-[92vh] flex-col border-t border-[#303339] bg-[#202329] shadow-[0_-24px_60px_-30px_rgba(0,0,0,0.95)] sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[27rem] sm:border-l sm:border-t-0"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-[#303339] px-7 py-6">
          <div>
            <p class="nr-eyebrow font-display text-[10px] text-[#777A7E]">{{ t(noirOrder.subtitle) }}</p>
            <h2 class="mt-2 font-serif text-3xl italic text-[#F1EEE8]">{{ t(noirOrder.title) }}</h2>
          </div>
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full text-[#A8A8A5] transition hover:bg-[#272A30] hover:text-[#F1EEE8] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
            aria-label="Փակել"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-7">
          <!-- Empty -->
          <div v-if="!rows.length" class="flex flex-col items-center justify-center py-20 text-center">
            <svg viewBox="0 0 24 24" class="h-9 w-9 text-[#777A7E]" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 7h14l-1 13H6L5 7z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            <p class="mt-5 max-w-[16rem] font-serif text-lg leading-relaxed text-[#A8A8A5]">{{ t(noirOrder.empty) }}</p>
          </div>

          <!-- Lines -->
          <ul v-else class="divide-y divide-[#25282D]">
            <li v-for="r in rows" :key="r.id" class="flex items-center gap-4 py-5">
              <div v-if="r.image" class="h-14 w-14 shrink-0 overflow-hidden rounded-[8px]">
                <img :src="r.image" :alt="r.name" class="h-full w-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-serif text-lg text-[#F1EEE8]">{{ r.name }}</p>
                <p class="nr-numeral font-serif text-sm text-[#777A7E]">{{ fmt(r.price) }} {{ ui.currency.AM }} · {{ r.qty }}</p>
              </div>
              <div class="flex items-center gap-2.5">
                <button
                  type="button"
                  class="grid h-7 w-7 place-items-center rounded-full border border-[#303339] text-[#A8A8A5] transition hover:bg-[#272A30] hover:text-[#F1EEE8]"
                  aria-label="Պակասեցնել"
                  @click="order.dec(r.id)"
                >−</button>
                <span class="nr-numeral w-4 text-center font-serif text-[#F1EEE8]">{{ r.qty }}</span>
                <button
                  type="button"
                  class="grid h-7 w-7 place-items-center rounded-full bg-[#B8B4AC] text-[#0B0C0E] transition hover:bg-[#D0CBC1] active:bg-[#A7A39B]"
                  aria-label="Ավելացնել"
                  @click="order.add(r.id)"
                >+</button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Footer / totals -->
        <div v-if="rows.length" class="border-t border-[#303339] px-7 py-6">
          <div v-if="brand.showCartTotal">
            <template v-if="serviceAmount > 0">
              <div class="flex items-center justify-between font-serif text-sm text-[#A8A8A5]">
                <span>{{ t(ui.subtotal) }}</span>
                <span class="nr-numeral">{{ fmt(subtotal) }} {{ ui.currency.AM }}</span>
              </div>
              <div class="mt-1 flex items-center justify-between font-serif text-sm text-[#A8A8A5]">
                <span>{{ t(ui.service) }} ({{ brand.serviceChargePercent }}%)</span>
                <span class="nr-numeral">+{{ fmt(serviceAmount) }} {{ ui.currency.AM }}</span>
              </div>
            </template>
            <div class="mt-1.5 flex items-baseline justify-between">
              <span class="nr-eyebrow font-display text-[10px] text-[#777A7E]">{{ t(ui.total) }}</span>
              <span class="nr-numeral font-serif text-3xl text-[#D0CBC1]">
                {{ fmt(total) }}<span class="ml-1 text-base text-[#777A7E]">{{ ui.currency.AM }}</span>
              </span>
            </div>
            <p
              v-if="brand.serviceChargeEnabled && brand.serviceChargeMode === 'text'"
              class="mt-1.5 font-serif text-xs italic text-[#777A7E]"
            >{{ t(ui.serviceNote) }}</p>
          </div>

          <button
            type="button"
            class="nr-eyebrow-sm mt-5 w-full rounded-full border border-[#303339] py-3.5 font-sans text-[10px] text-[#F1EEE8] transition hover:border-[#B8B4AC] hover:bg-[#272A30] active:bg-[#30333A] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
            @click="order.clear()"
          >
            {{ t(ui.clearOrder) }}
          </button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
