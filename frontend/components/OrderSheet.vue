<script setup lang="ts">
import { ui } from '~/data/menu'

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

const total = computed(() => rows.value.reduce((s, r) => s + r.sum, 0))
const fmt = (n: number) => n.toLocaleString('hy-AM')
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
        <div class="absolute inset-0 bg-[#3E2723]/55 backdrop-blur-sm" @click="emit('close')" />

        <div
          class="sheet-panel relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-[26px] bg-[#FFF9EF] shadow-2xl sm:rounded-[26px]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-[#E4D6C2] px-5 py-4">
            <div>
              <h3 class="font-display text-xl font-bold text-[#3E2723]">{{ t(ui.order) }}</h3>
              <p class="font-serif text-xs text-[#8A7868]">{{ order.count }} ապրանք</p>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5EFE2] text-[#3E2723] transition hover:bg-[#E4D6C2]"
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
              <p class="mt-3 font-serif text-[#8A7868]">{{ t(ui.orderEmpty) }}</p>
            </div>

            <ul v-else class="flex flex-col gap-3">
              <li v-for="r in rows" :key="r.id" class="flex items-center gap-3">
                <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#C69A5A]/25 to-[#6F8B4A]/15">
                  <img v-if="r.image" :src="r.image" :alt="r.name" class="h-full w-full object-cover" />
                  <span v-else class="text-2xl" aria-hidden="true">{{ r.icon }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-serif font-semibold text-[#3E2723]">{{ r.name }}</p>
                  <p class="font-display text-sm font-bold text-[#A87E42]">{{ fmt(r.sum) }} ֏</p>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4D6C2] bg-white text-lg font-bold text-[#3E2723] transition hover:border-[#C69A5A]" @click="order.dec(r.id)">−</button>
                  <span class="w-5 text-center font-display font-bold text-[#3E2723]">{{ r.qty }}</span>
                  <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full bg-[#C69A5A] text-lg font-bold text-white transition hover:bg-[#A87E42]" @click="order.add(r.id)">+</button>
                </div>
              </li>
            </ul>
          </div>

          <!-- Footer -->
          <div v-if="rows.length" class="border-t border-[#E4D6C2] bg-white/60 px-5 py-4">
            <div class="mb-3 flex items-end justify-between">
              <span class="font-serif text-[#8A7868]">{{ t(ui.total) }}</span>
              <span class="font-display text-2xl font-bold text-[#3E2723]">{{ fmt(total) }} <span class="text-[#C69A5A]">֏</span></span>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-full border border-[#E4D6C2] px-4 py-2.5 font-serif text-sm font-semibold text-[#3E2723] transition hover:bg-[#F5EFE2]"
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
