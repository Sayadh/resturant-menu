<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineOrderDrawer — a right-docked paper drawer (bottom sheet on phones)
// listing the guest's order. It honours the tenant's cart settings exactly
// like the other themes: the total can be hidden, and a service charge can be
// added as a percentage or shown as a plain note.
// ─────────────────────────────────────────────────────────────────────────
import { ui } from '~/data/menu'
import { opalineClose, opalineOrder, opalineQty } from '~/themes/opaline/config'

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
    <Transition name="op-fade">
      <div v-if="open" class="op-drawer-scrim" @click="emit('close')" />
    </Transition>

    <Transition name="op-drawer">
      <aside
        v-if="open"
        class="opaline-theme op-drawer-panel flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 border-b border-[#E2E5E8] px-6 py-5 sm:px-7 sm:py-6">
          <div class="min-w-0">
            <p class="op-label text-[10px] text-[#D85F3D]">{{ t(opalineOrder.subtitle) }}</p>
            <h2 class="op-serif mt-1.5 text-[24px] leading-tight text-[#172033] sm:text-[28px]">
              {{ t(opalineOrder.title) }}
            </h2>
          </div>
          <button
            type="button"
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#747D90] transition hover:bg-[#F5F5F2] hover:text-[#172033] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
            :aria-label="t(opalineClose)"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 sm:px-7">
          <!-- Empty -->
          <div v-if="!rows.length" class="flex flex-col items-center justify-center py-20 text-center">
            <span class="grid h-14 w-14 place-items-center rounded-full bg-[#F5F5F2]" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="h-6 w-6 text-[#A1A6B0]" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 7h14l-1 13H6L5 7z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
            </span>
            <p class="op-sans mt-5 max-w-[16rem] text-[14px] leading-relaxed text-[#747D90]">
              {{ t(opalineOrder.empty) }}
            </p>
          </div>

          <!-- Lines -->
          <ul v-else class="divide-y divide-[#E2E5E8]">
            <li v-for="r in rows" :key="r.id" class="flex items-center gap-3.5 py-4">
              <span v-if="r.image" class="h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-[#F5F5F2]">
                <img :src="r.image" :alt="r.name" class="h-full w-full object-cover" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="op-serif block truncate text-[17px] text-[#172033]">{{ r.name }}</span>
                <span class="op-sans op-figure block text-[12px] text-[#A1A6B0]">
                  {{ fmt(r.price) }} {{ ui.currency.AM }} · {{ r.qty }}
                </span>
              </span>
              <span class="flex shrink-0 items-center gap-1 rounded-full border border-[#E2E5E8] p-1">
                <button
                  type="button"
                  class="grid h-7 w-7 place-items-center rounded-full text-[15px] leading-none text-[#747D90] transition hover:bg-[#F5F5F2] hover:text-[#172033]"
                  :aria-label="t(opalineQty.less)"
                  @click="order.dec(r.id)"
                >−</button>
                <span class="op-figure w-5 text-center text-[13px] font-medium text-[#172033]">{{ r.qty }}</span>
                <button
                  type="button"
                  class="grid h-7 w-7 place-items-center rounded-full bg-[#172033] text-[15px] leading-none text-[#FFFFFF] transition hover:bg-[#222D43]"
                  :aria-label="t(opalineQty.more)"
                  @click="order.add(r.id)"
                >+</button>
              </span>
            </li>
          </ul>
        </div>

        <!-- Totals -->
        <div v-if="rows.length" class="op-safe-b border-t border-[#E2E5E8] px-6 py-5 sm:px-7 sm:py-6">
          <div v-if="brand.showCartTotal">
            <template v-if="serviceAmount > 0">
              <div class="op-sans flex items-center justify-between text-[13px] text-[#747D90]">
                <span>{{ t(ui.subtotal) }}</span>
                <span class="op-figure">{{ fmt(subtotal) }} {{ ui.currency.AM }}</span>
              </div>
              <div class="op-sans mt-1 flex items-center justify-between text-[13px] text-[#747D90]">
                <span>{{ t(ui.service) }} ({{ brand.serviceChargePercent }}%)</span>
                <span class="op-figure">+{{ fmt(serviceAmount) }} {{ ui.currency.AM }}</span>
              </div>
            </template>

            <div class="mt-2 flex items-baseline justify-between gap-3">
              <span class="op-label text-[10px] text-[#747D90]">{{ t(ui.total) }}</span>
              <span class="op-figure op-serif text-[26px] leading-none text-[#172033]">
                {{ fmt(total) }}<span class="op-sans ml-1 text-[14px] text-[#A1A6B0]">{{ ui.currency.AM }}</span>
              </span>
            </div>

            <p
              v-if="brand.serviceChargeEnabled && brand.serviceChargeMode === 'text'"
              class="op-sans mt-2 text-[12px] text-[#A1A6B0]"
            >{{ t(ui.serviceNote) }}</p>
          </div>

          <button
            type="button"
            class="op-label mt-4 w-full rounded-full border border-[#E2E5E8] py-3.5 text-[10px] text-[#172033] transition hover:border-[#CCD1D7] hover:bg-[#F5F5F2] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
            @click="order.clear()"
          >{{ t(ui.clearOrder) }}</button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* The scrim and the panel shell are stated here rather than as arbitrary
   Tailwind utilities. A dialog must never open invisibly: if the generated
   utility bundle is stale, `z-[66]` and `bg-[#FFFFFF]` resolve to nothing and
   the drawer renders transparent and behind the page, which reads to the
   guest as "the button does nothing". Scoped CSS ships with the component. */
.op-drawer-scrim {
  position: fixed;
  inset: 0;
  z-index: 65;
  background-color: rgba(23, 32, 51, 0.42);
  backdrop-filter: blur(2px);
}

.op-drawer-panel {
  position: fixed;
  z-index: 66;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 92vh;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  background-color: #ffffff;
  box-shadow: 0 -24px 60px -30px rgba(23, 32, 51, 0.45);
}

@media (min-width: 640px) {
  .op-drawer-panel {
    top: 0;
    left: auto;
    right: 0;
    bottom: 0;
    width: 26rem;
    max-height: none;
    border-radius: 0;
    border-left: 1px solid #e2e5e8;
    box-shadow: -24px 0 60px -30px rgba(23, 32, 51, 0.45);
  }
}
</style>
