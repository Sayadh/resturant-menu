<script setup lang="ts">
// "Your Table" — a right-docked editorial bill drawer (bottom sheet on mobile).
// Reads the shared order/menu stores; styled as a printed restaurant check.
import { ui } from '~/data/menu'
import { atelierBill } from '~/themes/atelier/config'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useLanguage()
const menu = useMenuStore()
const order = useOrderStore()

interface Row {
  id: string
  name: string
  price: number
  image: string
  icon: string
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
        icon: found.category.icon,
        qty: l.qty,
        sum: found.item.price * l.qty,
      }
    })
    .filter((r): r is Row => r !== null),
)

const brand = useBrand()
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
    <Transition name="atl-fade">
      <div v-if="open" class="fixed inset-0 z-[65]">
        <div class="absolute inset-0 bg-[#111827]/65 backdrop-blur-sm" @click="emit('close')" />
      </div>
    </Transition>

    <Transition name="atl-drawer">
      <aside
        v-if="open"
        class="atelier-theme fixed inset-x-0 bottom-0 z-[66] flex max-h-[92vh] flex-col bg-[#FFFFFF] shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[27rem]"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-[#172033] px-7 py-6">
          <div>
            <p class="atl-eyebrow font-display text-[10px] text-[#C65D3A]">{{ t(atelierBill.subtitle) }}</p>
            <h2 class="mt-2 font-serif text-3xl italic text-[#172033]">{{ t(atelierBill.title) }}</h2>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-[#172033]/20 text-[#172033] transition hover:border-[#C65D3A] hover:text-[#C65D3A]"
            aria-label="Փակել"
            @click="emit('close')"
          >✕</button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-7">
          <!-- Empty state -->
          <div v-if="!rows.length" class="flex flex-col items-center justify-center py-20 text-center">
            <svg viewBox="0 0 24 24" class="h-9 w-9 text-[#C65D3A]" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 7h14l-1 13H6L5 7z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            <p class="mt-5 max-w-[16rem] font-serif text-lg leading-relaxed text-[#667085]">{{ t(atelierBill.empty) }}</p>
          </div>

          <!-- Line items as a printed check -->
          <ul v-else class="divide-y divide-[#DCE2EA]">
            <li v-for="r in rows" :key="r.id" class="flex items-center gap-4 py-5">
              <div class="relative h-14 w-14 shrink-0 overflow-hidden rounded-[2px] bg-[#111827]">
                <img v-if="r.image" :src="r.image" :alt="r.name" class="h-full w-full object-cover" />
                <span v-else class="flex h-full w-full items-center justify-center text-xl text-[#C65D3A]" aria-hidden="true">{{ r.icon }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-serif text-lg text-[#172033]">{{ r.name }}</p>
                <p class="font-serif text-sm text-[#667085]">{{ fmt(r.price) }} ֏ · {{ r.qty }}</p>
              </div>
              <div class="flex items-center gap-2.5">
                <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full border border-[#172033]/30 font-display text-[#172033] transition hover:border-[#C65D3A]" aria-label="Պակասեցնել" @click="order.dec(r.id)">−</button>
                <span class="w-4 text-center font-serif font-semibold text-[#172033]">{{ r.qty }}</span>
                <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] font-display text-[#F8FAFC] transition hover:bg-[#C65D3A]" aria-label="Ավելացնել" @click="order.add(r.id)">+</button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Footer / total -->
        <div v-if="rows.length" class="border-t border-[#172033] px-7 py-6">
          <div v-if="brand.showCartTotal">
            <template v-if="serviceAmount > 0">
              <div class="flex items-center justify-between font-serif text-sm text-[#667085]">
                <span>{{ t(ui.subtotal) }}</span><span>{{ fmt(subtotal) }} ֏</span>
              </div>
              <div class="mt-1 flex items-center justify-between font-serif text-sm text-[#667085]">
                <span>{{ t(ui.service) }} ({{ brand.serviceChargePercent }}%)</span><span>+{{ fmt(serviceAmount) }} ֏</span>
              </div>
            </template>
            <div class="mt-1 flex items-baseline justify-between">
              <span class="atl-eyebrow font-display text-[11px] text-[#667085]">{{ t(ui.total) }}</span>
              <span class="font-serif text-3xl text-[#172033]">{{ fmt(total) }}<span class="ml-0.5 text-[#C65D3A]">֏</span></span>
            </div>
            <p v-if="brand.serviceChargeEnabled && brand.serviceChargeMode === 'text'" class="mt-1 font-serif text-xs italic text-[#667085]">{{ t(ui.serviceNote) }}</p>
          </div>
          <div class="mt-5 flex gap-3">
            <button
              type="button"
              class="flex-1 border border-[#172033]/30 py-3.5 font-display text-[11px] uppercase tracking-[0.18em] text-[#172033] transition hover:border-[#C65D3A] hover:text-[#C65D3A]"
              @click="order.clear()"
            >
              {{ t(ui.clearOrder) }}
            </button>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
