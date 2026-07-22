<script setup lang="ts">
// Editorial dish detail — a calm, magazine-style modal. Large plate on the
// left, the dish "story" and add control on the right.
import { ui, badgeLabels, type MenuItem } from '~/data/menu'
import { atelierAddToTable } from '~/themes/atelier/config'

const props = defineProps<{ item: MenuItem | null; categoryIcon: string }>()
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
    <Transition name="atl-fade">
      <div v-if="item" class="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
        <div class="absolute inset-0 bg-[#16130F]/70 backdrop-blur-sm" @click="emit('close')" />

        <Transition name="atl-modal" appear>
          <div
            v-if="item"
            class="atelier-theme relative grid max-h-[92vh] w-full max-w-3xl grid-rows-[auto_1fr] overflow-hidden rounded-t-[3px] bg-[#F6F2EA] shadow-2xl sm:grid-cols-2 sm:grid-rows-1 sm:rounded-[3px]"
          >
            <!-- Image -->
            <div class="relative aspect-[4/3] bg-[#16130F] sm:aspect-auto sm:h-full">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="t(item.name)"
                class="h-full w-full object-cover"
              />
              <span v-else class="flex h-full w-full items-center justify-center text-6xl text-[#A1502E]" aria-hidden="true">{{ categoryIcon }}</span>
              <span class="pointer-events-none absolute inset-4 border border-[#F6F2EA]/20" aria-hidden="true" />
            </div>

            <!-- Story -->
            <div class="flex flex-col overflow-y-auto p-7 sm:p-9">
              <div class="flex items-start justify-between gap-4">
                <p v-if="item.badge" class="atl-eyebrow font-display text-[10px] text-[#A1502E]">
                  {{ t(badgeLabels[item.badge].text) }}
                </p>
                <span v-else />
                <button
                  type="button"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#16130F]/20 text-[#16130F] transition hover:border-[#A1502E] hover:text-[#A1502E]"
                  aria-label="Փակել"
                  @click="emit('close')"
                >✕</button>
              </div>

              <h2 class="mt-4 font-serif text-3xl leading-tight text-[#16130F] sm:text-4xl">{{ t(item.name) }}</h2>
              <p class="mt-4 font-serif text-lg leading-relaxed text-[#857B6C]">{{ t(item.description) }}</p>

              <div class="mt-auto pt-8">
                <div class="flex items-end justify-between border-t border-[#D4C9B8] pt-5">
                  <div>
                    <p class="atl-eyebrow font-display text-[9px] text-[#857B6C]">Price</p>
                    <p class="mt-1 font-serif text-3xl text-[#16130F]">{{ fmt(item.price) }}<span class="ml-0.5 text-[#A1502E]">֏</span></p>
                  </div>

                  <template v-if="brand.ordering">
                    <div v-if="order.qtyOf(item.id) > 0" class="flex items-center gap-4">
                      <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-[#16130F]/30 font-display text-lg text-[#16130F] transition hover:border-[#A1502E]" aria-label="Պակասեցնել" @click="order.dec(item.id)">−</button>
                      <span class="w-5 text-center font-serif text-lg font-semibold">{{ order.qtyOf(item.id) }}</span>
                      <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-[#16130F] font-display text-lg text-[#F6F2EA] transition hover:bg-[#A1502E]" aria-label="Ավելացնել" @click="order.add(item.id)">+</button>
                    </div>
                    <button
                      v-else-if="item.available !== false"
                      type="button"
                      class="bg-[#16130F] px-6 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-[#F6F2EA] transition hover:bg-[#A1502E]"
                      @click="order.add(item.id)"
                    >
                      {{ t(atelierAddToTable) }}
                    </button>
                    <span v-else class="atl-eyebrow font-display text-[10px] text-[#857B6C]">{{ t(ui.soldOut) }}</span>
                  </template>
                  <span v-else-if="item.available === false" class="atl-eyebrow font-display text-[10px] text-[#857B6C]">{{ t(ui.soldOut) }}</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
