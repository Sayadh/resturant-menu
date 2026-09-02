<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// NoirProductDetail — a smoked-graphite plate over a deep obsidian overlay.
// Photograph on one side, the dish and its price on the other.
// ─────────────────────────────────────────────────────────────────────────
import { ui, type MenuItem } from '~/data/menu'
import { visibleBadges } from '~/data/badges'
import { noirAdd } from '~/themes/noir/config'

const props = defineProps<{ item: MenuItem | null }>()

// The detail plate has room for more marks than a card.
const badges = computed(() => (props.item ? visibleBadges(props.item, 4) : []))
const emit = defineEmits<{ close: [] }>()

const { t } = useLanguage()
const order = useOrderStore()
const brand = useBrand() // ordering (cart) = paid plans only
const fmt = (n: number) => n.toLocaleString('hy-AM')

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="nr-fade">
      <div v-if="item" class="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
        <div class="absolute inset-0 bg-[rgba(4,5,7,0.78)] backdrop-blur-sm" @click="emit('close')" />

        <Transition name="nr-modal" appear>
          <div
            v-if="item"
            class="noir-theme relative grid max-h-[92vh] w-full max-w-3xl grid-rows-[auto_1fr] overflow-hidden rounded-t-[16px] border border-[#303339] bg-[#202329] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)] sm:grid-cols-2 sm:grid-rows-1 sm:rounded-[16px]"
          >
            <!-- Photograph (only when the dish has one) -->
            <div v-if="item.image" class="relative aspect-[4/3] sm:aspect-auto sm:h-full">
              <img :src="item.image" :alt="t(item.name)" class="h-full w-full object-cover" />
            </div>

            <!-- Copy -->
            <div class="flex flex-col overflow-y-auto p-7 sm:col-span-1 sm:p-9" :class="item.image ? '' : 'sm:col-span-2'">
              <div class="flex items-start justify-between gap-4">
                <div v-if="badges.length" class="flex flex-wrap items-center gap-2">
                  <span
                    v-for="b in badges"
                    :key="b.key"
                    class="nr-eyebrow-sm rounded-full border border-[#B8B4AC]/45 px-2.5 py-0.5 font-sans text-[9px] text-[#D0CBC1]"
                  >{{ t(b.text) }}</span>
                </div>
                <span v-else />
                <button
                  type="button"
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#A8A8A5] transition hover:bg-[#272A30] hover:text-[#F1EEE8] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
                  aria-label="Փակել"
                  @click="emit('close')"
                >
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <h2 class="mt-5 font-serif text-3xl leading-tight text-[#F1EEE8] sm:text-4xl">{{ t(item.name) }}</h2>
              <p class="mt-4 font-serif text-lg leading-relaxed text-[#A8A8A5]">{{ t(item.description) }}</p>

              <div class="mt-auto pt-8">
                <div class="flex items-end justify-between gap-4 border-t border-[#303339] pt-5">
                  <div>
                    <p class="nr-eyebrow-sm font-display text-[9px] text-[#777A7E]">{{ t(ui.total) }}</p>
                    <p class="nr-numeral mt-1.5 font-serif text-3xl text-[#D0CBC1]">
                      {{ fmt(item.price) }}<span class="ml-1 text-base text-[#777A7E]">{{ ui.currency.AM }}</span>
                    </p>
                  </div>

                  <ClientOnly>
                    <template v-if="brand.ordering">
                      <div v-if="order.qtyOf(item.id) > 0" class="flex items-center gap-3 rounded-full border border-[#303339] bg-[#121417] p-1.5">
                        <button
                          type="button"
                          class="grid h-8 w-8 place-items-center rounded-full text-lg leading-none text-[#A8A8A5] transition hover:bg-[#272A30] hover:text-[#F1EEE8]"
                          aria-label="Պակասեցնել"
                          @click="order.dec(item.id)"
                        >−</button>
                        <span class="nr-numeral w-5 text-center font-serif text-[#F1EEE8]">{{ order.qtyOf(item.id) }}</span>
                        <button
                          type="button"
                          class="grid h-8 w-8 place-items-center rounded-full bg-[#B8B4AC] text-lg leading-none text-[#0B0C0E] transition hover:bg-[#D0CBC1] active:bg-[#A7A39B]"
                          aria-label="Ավելացնել"
                          @click="order.add(item.id)"
                        >+</button>
                      </div>
                      <button
                        v-else-if="item.available !== false"
                        type="button"
                        class="nr-eyebrow-sm rounded-full bg-[#B8B4AC] px-6 py-3 font-sans text-[10px] text-[#0B0C0E] transition hover:bg-[#D0CBC1] active:bg-[#A7A39B] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
                        @click="order.add(item.id)"
                      >
                        {{ t(noirAdd) }}
                      </button>
                      <span
                        v-else
                        class="nr-eyebrow-sm rounded-full border border-[#A45B5B]/60 px-3 py-1 font-sans text-[9px] text-[#A45B5B]"
                      >{{ t(ui.soldOut) }}</span>
                    </template>
                  </ClientOnly>
                  <span
                    v-if="!brand.ordering && item.available === false"
                    class="nr-eyebrow-sm rounded-full border border-[#A45B5B]/60 px-3 py-1 font-sans text-[9px] text-[#A45B5B]"
                  >{{ t(ui.soldOut) }}</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
