<script setup lang="ts">
import { restaurant, ui } from '~/data/menu'
const { t } = useLanguage()
const { lines, add, decrement, remove, clear, count, total } = useOrder()

const open = ref(false)
const waiterView = ref(false)

const formattedTotal = computed(() => total.value.toLocaleString('hy-AM'))
const fmt = (n: number) => n.toLocaleString('hy-AM')

const close = () => {
  open.value = false
  waiterView.value = false
}

watch(open, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : ''
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) close()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

// Auto-close panel when the order becomes empty.
watch(count, (c) => {
  if (c === 0) close()
})
</script>

<template>
  <!-- Floating button -->
  <Transition name="fab">
    <div
      v-if="count > 0 && !open"
      class="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <button
        type="button"
        class="mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-pill bg-brown px-5 py-3.5 text-cream shadow-panel transition active:scale-[0.98]"
        @click="open = true"
      >
        <span class="flex items-center gap-2.5">
          <span class="relative flex h-9 w-9 items-center justify-center rounded-full bg-caramel text-brown">
            <IconReceipt class="h-5 w-5" />
            <span
              class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#C0492F] px-1 text-xs font-bold text-cream"
            >
              {{ count }}
            </span>
          </span>
          <span class="font-semibold">{{ t(ui.myOrder) }}</span>
        </span>
        <span class="font-display text-lg font-bold tracking-wide">
          {{ formattedTotal }} <span class="text-caramel-light">{{ ui.currency.AM }}</span>
        </span>
      </button>
    </div>
  </Transition>

  <!-- Bottom-sheet panel -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div class="absolute inset-0 bg-brown/60 backdrop-blur-sm" @click="close" />

        <div
          class="sheet-panel relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-panel sm:rounded-card"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 class="font-display text-xl font-bold uppercase tracking-wide text-brown">
              {{ waiterView ? t(ui.showWaiter) : t(ui.myOrder) }}
            </h2>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-card text-brown shadow-sm transition hover:bg-border/40"
              aria-label="Close"
              @click="close"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <!-- Lines -->
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <ul class="flex flex-col gap-3">
              <li
                v-for="line in lines"
                :key="line.item.id"
                class="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5"
              >
                <img
                  :src="line.item.image"
                  :alt="t(line.item.name)"
                  class="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-serif text-base font-semibold text-brown">
                    {{ t(line.item.name) }}
                  </p>
                  <p class="font-display text-sm font-bold text-caramel-dark">
                    {{ fmt(line.item.price) }} {{ ui.currency.AM }}
                  </p>
                </div>

                <!-- Waiter view: read-only quantity -->
                <span
                  v-if="waiterView"
                  class="font-display text-lg font-bold text-brown"
                >
                  ×{{ line.qty }}
                </span>

                <!-- Editable stepper -->
                <div
                  v-else
                  class="flex items-center gap-1 rounded-pill bg-caramel/15 p-1"
                >
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-card text-brown shadow-sm transition active:scale-90"
                    :aria-label="line.qty === 1 ? 'remove' : '-'"
                    @click="line.qty === 1 ? remove(line.item.id) : decrement(line.item.id)"
                  >
                    <IconMinus class="h-4 w-4" />
                  </button>
                  <span class="min-w-[1.25rem] text-center font-display text-base font-bold text-brown">
                    {{ line.qty }}
                  </span>
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-caramel text-cream shadow-sm transition active:scale-90"
                    aria-label="+"
                    @click="add(line.item)"
                  >
                    <IconPlus class="h-4 w-4" />
                  </button>
                </div>
              </li>
            </ul>

            <p v-if="waiterView" class="mt-5 text-center font-serif text-sm italic text-brown-soft">
              {{ restaurant.name }} · {{ t(ui.city) }}
            </p>
          </div>

          <!-- Footer -->
          <div class="border-t border-border bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div class="flex items-center justify-between">
              <span class="font-serif text-lg text-brown-soft">{{ t(ui.total) }}</span>
              <span class="font-display text-2xl font-bold tracking-wide text-brown">
                {{ formattedTotal }} <span class="text-caramel-dark">{{ ui.currency.AM }}</span>
              </span>
            </div>

            <div v-if="!waiterView" class="mt-4 flex gap-3">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-pill border border-border bg-cream px-4 py-3 font-semibold text-brown transition hover:border-[#C0492F]/50 hover:text-[#C0492F]"
                @click="clear"
              >
                {{ t(ui.clearOrder) }}
              </button>
              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-pill bg-caramel px-5 py-3 font-semibold text-cream shadow-pill transition hover:bg-caramel-dark active:scale-[0.98]"
                @click="waiterView = true"
              >
                <IconReceipt class="h-5 w-5" />
                {{ t(ui.showWaiter) }}
              </button>
            </div>

            <button
              v-else
              type="button"
              class="mt-4 w-full rounded-pill border border-border bg-cream px-5 py-3 font-semibold text-brown transition hover:border-caramel"
              @click="waiterView = false"
            >
              {{ t(ui.order) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fab-enter-active,
.fab-leave-active {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
}
.fab-enter-from,
.fab-leave-to {
  transform: translateY(120%);
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}
</style>
