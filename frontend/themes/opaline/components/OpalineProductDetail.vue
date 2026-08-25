<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineProductDetail — the dish, opened as a paper plate over a soft ink
// overlay (a bottom sheet on phones). Same modal behaviour the other themes
// use; only the look is Opaline's.
// ─────────────────────────────────────────────────────────────────────────
import { ui, badgeLabels, type MenuItem } from '~/data/menu'
import { opalineAdd, opalineClose, opalineQty } from '~/themes/opaline/config'

const props = defineProps<{ item: MenuItem | null }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useLanguage()
const order = useOrderStore()
const brand = useBrand() // ordering (cart) = paid plans only

const fmt = (n: number) => n.toLocaleString('hy-AM')
const soldOut = computed(() => props.item?.available === false)
const description = computed(() => (props.item ? t(props.item.description).trim() : ''))

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="op-fade">
      <div v-if="item" class="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
        <div class="absolute inset-0 bg-[rgba(23,32,51,0.42)] backdrop-blur-[2px]" @click="emit('close')" />

        <Transition name="op-modal" appear>
          <div
            v-if="item"
            class="opaline-theme relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[22px] bg-[#FFFFFF] shadow-[0_40px_90px_-40px_rgba(23,32,51,0.45)] sm:max-h-[86vh] sm:flex-row sm:rounded-[22px]"
            role="dialog"
            aria-modal="true"
          >
            <!-- Photograph (only when the dish has one) -->
            <div v-if="item.showImage !== false && item.image" class="relative shrink-0 bg-[#F5F5F2] sm:w-[46%]">
              <img
                :src="item.image"
                :alt="t(item.name)"
                class="h-52 w-full object-cover sm:h-full"
                :class="{ 'opacity-70': soldOut }"
              />
            </div>

            <!-- Copy -->
            <div class="flex min-w-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8">
              <div class="flex items-start justify-between gap-4">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    v-if="item.badge && !soldOut"
                    class="op-label rounded-full bg-[#FBEDE8] px-2.5 py-1 text-[9px] text-[#D85F3D]"
                  >{{ t(badgeLabels[item.badge].text) }}</span>
                  <span
                    v-if="soldOut"
                    class="op-label rounded-full border border-[#E2E5E8] px-2.5 py-1 text-[9px] text-[#A04F4F]"
                  >{{ t(ui.soldOut) }}</span>
                </div>

                <div class="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center rounded-full text-[#747D90] transition hover:bg-[#F5F5F2] hover:text-[#172033] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
                    :aria-label="t(opalineClose)"
                    @click="emit('close')"
                  >
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              <h2 class="op-serif mt-4 text-balance text-[28px] leading-tight text-[#172033] sm:text-[34px]">
                {{ t(item.name) }}
              </h2>

              <p v-if="description" class="op-sans mt-4 text-[15px] leading-relaxed text-[#747D90]">
                {{ description }}
              </p>

              <div class="mt-auto pt-8">
                <div class="flex items-end justify-between gap-4 border-t border-[#E2E5E8] pt-5">
                  <p class="op-figure op-serif text-[26px] leading-none text-[#172033] sm:text-[30px]">
                    {{ fmt(item.price) }}<span class="op-sans ml-1 text-[14px] text-[#A1A6B0]">{{ ui.currency.AM }}</span>
                  </p>

                  <ClientOnly>
                    <template v-if="brand.ordering">
                      <div
                        v-if="order.qtyOf(item.id) > 0"
                        class="flex items-center gap-1.5 rounded-full border border-[#E2E5E8] p-1.5"
                      >
                        <button
                          type="button"
                          class="grid h-8 w-8 place-items-center rounded-full text-lg leading-none text-[#747D90] transition hover:bg-[#F5F5F2] hover:text-[#172033]"
                          :aria-label="t(opalineQty.less)"
                          @click="order.dec(item.id)"
                        >−</button>
                        <span class="op-figure w-5 text-center text-sm font-medium text-[#172033]">{{ order.qtyOf(item.id) }}</span>
                        <button
                          type="button"
                          class="grid h-8 w-8 place-items-center rounded-full bg-[#172033] text-lg leading-none text-[#FFFFFF] transition hover:bg-[#222D43]"
                          :aria-label="t(opalineQty.more)"
                          @click="order.add(item.id)"
                        >+</button>
                      </div>

                      <button
                        v-else-if="!soldOut"
                        type="button"
                        class="op-label rounded-full bg-[#D85F3D] px-6 py-3.5 text-[10px] text-[#FFFFFF] transition hover:bg-[#BF4F31] active:scale-95 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
                        @click="order.add(item.id)"
                      >{{ t(opalineAdd) }}</button>
                    </template>
                  </ClientOnly>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
