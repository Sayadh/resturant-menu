<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonOrderDrawer — an elegant right-docked drawer summarising the guest's
// selection. Large serif typography, hairline dividers, a clear total and a
// single calm call-to-action: "Show to waiter". No online payment.
// ─────────────────────────────────────────────────────────────────────────
import { ui } from '~/data/menu'
import { maisonOrder } from '~/themes/maison/config'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { t, lang } = useLanguage()
const order = useOrderStore()
const store = useMenuStore()

interface Row {
  id: string
  name: string
  price: number
  qty: number
  image: string
  initial: string
}

const rows = computed<Row[]>(() =>
  order.lines
    .map((line) => {
      const found = store.findItem(line.id)
      if (!found) return null
      return {
        id: line.id,
        name: t(found.item.name),
        price: found.item.price,
        qty: line.qty,
        image: found.item.image,
        initial: t(found.item.name).trim().charAt(0),
      }
    })
    .filter((r): r is Row => r !== null),
)

const total = computed(() => rows.value.reduce((s, r) => s + r.price * r.qty, 0))
const fmt = (n: number) => n.toLocaleString('fr-FR')

// Lock body scroll while open.
watch(
  () => props.open,
  (open) => {
    if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
  },
)
onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <!-- Backdrop -->
      <Transition name="ms-fade">
        <div
          v-if="open"
          class="fixed inset-0 z-50 bg-[#55402E]/45 backdrop-blur-sm"
          @click="emit('close')"
        />
      </Transition>

      <!-- Drawer -->
      <Transition name="ms-drawer">
        <aside
          v-if="open"
          class="maison-theme fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-[#F4EEE2] sm:inset-y-0"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <header class="flex items-start justify-between border-b border-[#E7DDCB] px-7 py-6">
            <div>
              <p class="ms-eyebrow font-sans text-[10px] text-[#C4693F]">{{ t(maisonOrder.subtitle) }}</p>
              <h2 class="mt-2 font-serif text-3xl text-[#4A3B2E]">{{ t(maisonOrder.title) }}</h2>
            </div>
            <button
              type="button"
              class="mt-1 text-[#8A7C6B] transition-colors hover:text-[#4A3B2E]"
              aria-label="Close"
              @click="emit('close')"
            >
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
              </svg>
            </button>
          </header>

          <!-- Empty -->
          <div v-if="rows.length === 0" class="flex flex-1 flex-col items-center justify-center px-10 text-center">
            <svg viewBox="0 0 24 24" class="h-12 w-12 text-[#E7DDCB]" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7z" stroke-linejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" stroke-linecap="round" />
            </svg>
            <p class="mt-6 font-serif text-lg leading-relaxed text-[#8A7C6B]">{{ t(maisonOrder.empty) }}</p>
          </div>

          <!-- Lines -->
          <template v-else>
            <div class="ms-scroll flex-1 overflow-y-auto px-7">
              <div class="divide-y divide-[#E7DDCB]">
                <div v-for="row in rows" :key="row.id" class="flex items-center gap-4 py-5">
                  <!-- thumb -->
                  <div class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    <img
                      v-if="row.image"
                      :src="row.image"
                      :alt="row.name"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center"
                      style="background: radial-gradient(circle at 50% 35%, #F0E7D5, #E7D6BB)"
                      aria-hidden="true"
                    >
                      <span class="font-display text-2xl text-[#C4693F]/50">{{ row.initial }}</span>
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-serif text-lg text-[#4A3B2E]">{{ row.name }}</h3>
                    <p class="mt-0.5 font-serif text-sm text-[#C4693F]">{{ fmt(row.price) }} {{ ui.currency[lang] }}</p>
                  </div>

                  <!-- stepper -->
                  <div class="flex items-center gap-3 border border-[#55402E]/15 px-3 py-1.5">
                    <button type="button" class="text-base leading-none text-[#4A3B2E] hover:opacity-60" aria-label="−" @click="order.dec(row.id)">−</button>
                    <span class="min-w-4 text-center font-serif text-sm text-[#4A3B2E]">{{ row.qty }}</span>
                    <button type="button" class="text-base leading-none text-[#4A3B2E] hover:opacity-60" aria-label="+" @click="order.add(row.id)">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <footer class="border-t border-[#E7DDCB] px-7 py-6">
              <div class="flex items-end justify-between">
                <span class="ms-eyebrow-sm font-sans text-[11px] text-[#8A7C6B]">{{ t(ui.total) }}</span>
                <span class="font-serif text-3xl text-[#4A3B2E]">{{ fmt(total) }}<span class="ml-1 text-xl text-[#C4693F]">{{ ui.currency[lang] }}</span></span>
              </div>

              <button
                type="button"
                class="mt-5 w-full border border-[#55402E]/25 py-3.5 font-sans text-[11px] tracking-[0.18em] text-[#4A3B2E] transition-colors hover:border-[#C4693F] hover:text-[#C4693F]"
                @click="order.clear()"
              >
                {{ t(ui.clearOrder).toUpperCase() }}
              </button>
            </footer>
          </template>
        </aside>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
