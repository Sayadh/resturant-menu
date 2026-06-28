<script setup lang="ts">
import { ui, type MenuItem } from '~/data/menu'
const props = defineProps<{ item: MenuItem | null }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useLanguage()
const { add, decrement, qtyOf } = useOrder()
const { isFavorite, toggle } = useFavorites()

const formattedPrice = computed(() =>
  props.item ? props.item.price.toLocaleString('hy-AM') : '',
)
const qty = computed(() => (props.item ? qtyOf(props.item.id) : 0))
const fav = computed(() => (props.item ? isFavorite(props.item.id) : false))

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.item,
  (val) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = val ? 'hidden' : ''
    if (val) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lb">
      <div
        v-if="item"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-brown/70 backdrop-blur-sm" @click="emit('close')" />

        <div class="lb-panel relative w-full max-w-lg overflow-hidden rounded-card bg-card shadow-card-hover">
          <button
            type="button"
            class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-brown shadow-sm transition hover:bg-cream"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>

          <div class="relative">
            <img
              :src="item.image"
              :alt="t(item.name)"
              class="aspect-[4/3] w-full object-cover"
            />
            <span v-if="item.badge" class="absolute left-4 top-4">
              <MenuBadge :badge="item.badge" />
            </span>
          </div>

          <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-serif text-2xl font-semibold text-brown">{{ t(item.name) }}</h3>
              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-sm transition active:scale-90"
                :class="fav ? 'text-[#C0492F]' : 'text-brown/60 hover:text-[#C0492F]'"
                :aria-pressed="fav"
                :aria-label="t(ui.favorites)"
                @click="toggle(item.id)"
              >
                <IconHeart class="h-5 w-5" :filled="fav" />
              </button>
            </div>
            <p class="mt-2 font-serif text-base leading-relaxed text-brown-soft">
              {{ t(item.description) }}
            </p>

            <div class="mt-5 flex items-center justify-between gap-3">
              <p class="font-display text-2xl font-bold tracking-wide text-brown">
                {{ formattedPrice }}
                <span class="text-caramel-dark">{{ ui.currency.AM }}</span>
              </p>

              <div
                v-if="qty > 0"
                class="flex items-center gap-1.5 rounded-pill bg-caramel/15 p-1.5"
              >
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-card text-brown shadow-sm transition active:scale-90"
                  aria-label="-"
                  @click="decrement(item.id)"
                >
                  <IconMinus class="h-4 w-4" />
                </button>
                <span class="min-w-[1.5rem] text-center font-display text-lg font-bold text-brown">
                  {{ qty }}
                </span>
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-caramel text-cream shadow-sm transition active:scale-90"
                  :aria-label="t(ui.add)"
                  @click="add(item)"
                >
                  <IconPlus class="h-4 w-4" />
                </button>
              </div>

              <button
                v-else
                type="button"
                class="inline-flex items-center gap-2 rounded-pill bg-caramel px-5 py-2.5 font-semibold text-cream shadow-pill transition hover:bg-caramel-dark active:scale-95"
                @click="add(item)"
              >
                <IconPlus class="h-5 w-5" />
                {{ t(ui.add) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.3s ease;
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}
.lb-enter-active .lb-panel,
.lb-leave-active .lb-panel {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
}
.lb-enter-from .lb-panel,
.lb-leave-to .lb-panel {
  transform: scale(0.9);
  opacity: 0;
}
</style>
