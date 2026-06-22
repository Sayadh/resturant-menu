<script setup lang="ts">
import { ui, type MenuItem } from '~/data/menu'
const props = defineProps<{ item: MenuItem | null }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useLanguage()

const formattedPrice = computed(() =>
  props.item ? props.item.price.toLocaleString('hy-AM') : '',
)

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

          <img
            :src="item.image"
            :alt="t(item.name)"
            class="aspect-[4/3] w-full object-cover"
          />

          <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-serif text-2xl font-semibold text-brown">{{ t(item.name) }}</h3>
              <MenuBadge v-if="item.badge" :badge="item.badge" />
            </div>
            <p class="mt-2 font-serif text-base leading-relaxed text-brown-soft">
              {{ t(item.description) }}
            </p>
            <p class="mt-4 font-display text-2xl font-bold tracking-wide text-brown">
              {{ formattedPrice }}
              <span class="text-caramel-dark">{{ ui.currency.AM }}</span>
            </p>
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
