<script setup lang="ts">
import { imgUrl } from '~/utils/image'
import { ui } from '~/data/menu'

// `theme` only swaps colours. The default keeps the original palette so Aria
// renders exactly as before; Heritage opts in to the stone/olive system.
const props = withDefaults(defineProps<{ open: boolean; theme?: 'default' | 'heritage' }>(), {
  theme: 'default',
})
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

const subtotal = computed(() => rows.value.reduce((s, r) => s + r.sum, 0))
// Service charge (percent mode) → added to the grand total.
const serviceAmount = computed(() =>
  brand.serviceChargeEnabled && brand.serviceChargeMode === 'percent'
    ? Math.round((subtotal.value * brand.serviceChargePercent) / 100)
    : 0,
)
const total = computed(() => subtotal.value + serviceAmount.value)
const fmt = (n: number) => n.toLocaleString('hy-AM')

const PALETTES = {
  default: {
    overlay: 'bg-[#3E2723]/55',
    panel: 'bg-[#FFF9EF]',
    line: 'border-[#E4D6C2]',
    ink: 'text-[#3E2723]',
    muted: 'text-[#8A7868]',
    close: 'bg-[#F5EFE2] text-[#3E2723] hover:bg-[#E4D6C2]',
    thumb: 'from-[#C69A5A]/25 to-[#6F8B4A]/15',
    price: 'text-[#A87E42]',
    dec: 'border-[#E4D6C2] text-[#3E2723] hover:border-[#C69A5A]',
    inc: 'bg-[#C69A5A] hover:bg-[#A87E42]',
    currency: 'text-[#C69A5A]',
    clear: 'border-[#E4D6C2] text-[#3E2723] hover:bg-[#F5EFE2]',
  },
  heritage: {
    overlay: 'bg-[#26382F]/[0.58]',
    panel: 'bg-[#FCFBF7]',
    line: 'border-[#D5D1C6]',
    ink: 'text-[#292A27]',
    muted: 'text-[#706F68]',
    close: 'bg-[#F1F0EA] text-[#292A27] hover:bg-[#E2E6D8]',
    thumb: 'from-[#64734D]/25 to-[#A47B45]/18',
    price: 'text-[#49372C]',
    dec: 'border-[#D5D1C6] text-[#292A27] hover:border-[#64734D]',
    inc: 'bg-[#64734D] hover:bg-[#4F6B58]',
    currency: 'text-[#A47B45]',
    clear: 'border-[#D5D1C6] text-[#292A27] hover:bg-[#F1F0EA]',
  },
} as const
const c = computed(() => PALETTES[props.theme])
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
        <div class="absolute inset-0 backdrop-blur-sm" :class="c.overlay" @click="emit('close')" />

        <div
          class="sheet-panel relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-[26px] shadow-2xl sm:rounded-[26px]"
          :class="c.panel"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b px-5 py-4" :class="c.line">
            <div>
              <h3 class="font-display text-xl font-bold" :class="c.ink">{{ t(ui.order) }}</h3>
              <p class="font-serif text-xs" :class="c.muted">{{ order.count }} ապրանք</p>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full transition"
              :class="c.close"
              aria-label="Փակել"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <div v-if="!rows.length" class="py-12 text-center">
              <p class="text-4xl">🧾</p>
              <p class="mt-3 font-serif" :class="c.muted">{{ t(ui.orderEmpty) }}</p>
            </div>

            <ul v-else class="flex flex-col gap-3">
              <li v-for="r in rows" :key="r.id" class="flex items-center gap-3">
                <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br" :class="c.thumb">
                  <img loading="lazy" decoding="async" v-if="r.image" :src="imgUrl(r.image, 256)" :alt="r.name" class="h-full w-full object-cover" />
                  <span v-else class="text-2xl" aria-hidden="true">{{ r.icon }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-serif font-semibold" :class="c.ink">{{ r.name }}</p>
                  <p class="font-display text-sm font-bold" :class="c.price">{{ fmt(r.sum) }} ֏</p>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full border bg-white text-lg font-bold transition" :class="c.dec" @click="order.dec(r.id)">−</button>
                  <span class="w-5 text-center font-display font-bold" :class="c.ink">{{ r.qty }}</span>
                  <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-white transition" :class="c.inc" @click="order.add(r.id)">+</button>
                </div>
              </li>
            </ul>
          </div>

          <!-- Footer -->
          <div v-if="rows.length" class="border-t bg-white/60 px-5 py-4" :class="c.line">
            <div v-if="brand.showCartTotal" class="mb-3 space-y-1.5">
              <!-- subtotal + service breakdown (percent mode) -->
              <template v-if="serviceAmount > 0">
                <div class="flex items-center justify-between font-serif text-sm" :class="c.muted">
                  <span>{{ t(ui.subtotal) }}</span><span>{{ fmt(subtotal) }} ֏</span>
                </div>
                <div class="flex items-center justify-between font-serif text-sm" :class="c.muted">
                  <span>{{ t(ui.service) }} ({{ brand.serviceChargePercent }}%)</span><span>+{{ fmt(serviceAmount) }} ֏</span>
                </div>
              </template>
              <div class="flex items-end justify-between">
                <span class="font-serif" :class="c.muted">{{ t(ui.total) }}</span>
                <span class="font-display text-2xl font-bold" :class="c.ink">{{ fmt(total) }} <span :class="c.currency">֏</span></span>
              </div>
              <!-- text-only service note -->
              <p v-if="brand.serviceChargeEnabled && brand.serviceChargeMode === 'text'" class="font-serif text-xs italic" :class="c.muted">{{ t(ui.serviceNote) }}</p>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-full border px-4 py-2.5 font-serif text-sm font-semibold transition"
                :class="c.clear"
                @click="order.clear()"
              >
                {{ t(ui.clearOrder) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}
</style>
