<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineProductCard — the third level, in two builds.
//
// FULL (the dish shows a picture): a porcelain card led by a large untinted
// photograph, the name in serif, two lines of description, then price and the
// actions on one baseline. One card per row on a phone.
//
// COMPACT (the admin switched the picture off): the card has no media to lead
// with, so stretching it to the full width would only publish empty space.
// Instead it becomes a narrow tile that pairs up two-across on a phone, led by
// a short coral rule so it still reads as Opaline rather than a plain box, with
// tighter type and a round add control that fits the narrower measure.
//
// All behaviour comes from the shared stores (useOrderStore for the cart,
// useBrand for the tenant's plan/cart settings). Nothing here duplicates
// business logic.
// ─────────────────────────────────────────────────────────────────────────
import { ui, type MenuItem } from '~/data/menu'
import { visibleBadges } from '~/data/badges'
import { opalineAdd, opalineQty } from '~/themes/opaline/config'

const props = defineProps<{ item: MenuItem }>()

// The dish can carry many badges; a card has room for the two highest-priority
// ones (catalogue order in ~/data/badges decides which).
const badges = computed(() => visibleBadges(props.item))
const emit = defineEmits<{ open: [item: MenuItem] }>()

const { t } = useLanguage()
const order = useOrderStore()
const brand = useBrand() // ordering (cart) = paid plans only

const fmt = (n: number) => n.toLocaleString('hy-AM')
const soldOut = computed(() => props.item.available === false)
const description = computed(() => t(props.item.description).trim())
// `showImage: false` is the admin saying this dish shows NO picture at all --
// so the media block is skipped entirely, placeholder included. When it is on
// but no file was uploaded, the theme's usual placeholder still appears.
const showMedia = computed(() => props.item.showImage !== false)
/** No picture to lead with -> the narrow two-across build. */
const compact = computed(() => !showMedia.value)
</script>

<template>
  <article
    class="group flex flex-col overflow-hidden rounded-[18px] border border-[#E2E5E8] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(23,32,51,0.04)] transition duration-300 hover:border-[#CCD1D7] hover:shadow-[0_18px_40px_-26px_rgba(23,32,51,0.26)]"
    :class="compact ? 'self-start' : 'h-full'"
  >
    <!-- Photograph -->
    <div v-if="showMedia" class="relative">
      <button
        type="button"
        class="block aspect-[4/3] w-full overflow-hidden bg-[#F5F5F2] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-[#D85F3D]"
        :aria-label="t(item.name)"
        @click="emit('open', item)"
      >
        <img
          v-if="item.image"
          :src="item.image"
          :alt="t(item.name)"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          :class="{ 'opacity-60': soldOut }"
        />
        <span v-else class="grid h-full w-full place-items-center bg-[#FBEDE8]" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="h-8 w-8 text-[#D85F3D]/55" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 5v6a3 3 0 0 0 3 3v6M7 5v6M10 5v6M17 5c-1.4 1.6-2 3.6-2 6h4V5z" />
          </svg>
        </span>
      </button>

      <!-- Badges -->
      <div
        v-if="badges.length && !soldOut"
        class="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-1.5"
      >
        <span
          v-for="b in badges"
          :key="b.key"
          class="op-label rounded-full bg-[#FFFFFF]/94 px-2.5 py-1 text-[9px] text-[#D85F3D] shadow-[0_2px_8px_rgba(23,32,51,0.10)]"
        >{{ t(b.text) }}</span>
      </div>

      <!-- Unavailable -->
      <span
        v-if="soldOut"
        class="op-label pointer-events-none absolute left-3 top-3 rounded-full bg-[#FFFFFF]/94 px-2.5 py-1 text-[9px] text-[#A04F4F] shadow-[0_2px_8px_rgba(23,32,51,0.10)]"
      >{{ t(ui.soldOut) }}</span>
    </div>

    <!-- Copy -->
    <div class="flex flex-1 flex-col" :class="compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'">
      <!-- Compact tiles open with a short coral rule instead of a photograph,
           so the row still has a mark of the theme to read by. -->
      <span v-if="compact" class="mb-2.5 block h-px w-6 bg-[#D85F3D]" aria-hidden="true" />

      <!-- badge / sold-out kept visible on image-less cards -->
      <div v-if="compact && (badges.length || soldOut)" class="mb-2 flex flex-wrap items-center gap-1.5">
        <template v-if="!soldOut">
          <span
            v-for="b in badges"
            :key="b.key"
            class="op-label rounded-full bg-[#FBEDE8] px-2 py-0.5 text-[8px] text-[#D85F3D]"
          >{{ t(b.text) }}</span>
        </template>
        <span
          v-if="soldOut"
          class="op-label rounded-full border border-[#E2E5E8] px-2 py-0.5 text-[8px] text-[#A04F4F]"
        >{{ t(ui.soldOut) }}</span>
      </div>

      <div :class="compact ? 'mb-3' : 'mb-4 sm:mb-5'">
        <button
          type="button"
          class="op-serif block text-balance text-left leading-snug text-[#172033] transition-colors hover:text-[#D85F3D] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
          :class="compact ? 'op-clamp-2 text-[15px] sm:text-[16px]' : 'text-[19px] sm:text-[21px]'"
          @click="emit('open', item)"
        >
          {{ t(item.name) }}
        </button>

        <p
          v-if="description"
          class="op-sans op-clamp-2 leading-relaxed text-[#747D90]"
          :class="compact ? 'mt-1.5 text-[12px]' : 'mt-2 text-[13px]'"
        >
          {{ description }}
        </p>
      </div>

      <!-- Price + actions — pinned to the bottom so cards in a row line up -->
      <div
        class="mt-auto flex items-center justify-between border-t border-[#E2E5E8]"
        :class="compact ? 'gap-2 pt-3' : 'gap-3 pt-4'"
      >
        <p
          class="op-figure op-serif shrink-0 text-[#172033]"
          :class="compact ? 'text-[15px]' : 'text-[19px] sm:text-[21px]'"
        >
          {{ fmt(item.price)
          }}<span class="op-sans ml-1 text-[#A1A6B0]" :class="compact ? 'text-[11px]' : 'text-[13px]'">{{ ui.currency.AM }}</span>
        </p>

        <ClientOnly>
          <template v-if="brand.ordering">
            <div
              v-if="order.qtyOf(item.id) > 0"
              class="flex items-center rounded-full border border-[#E2E5E8]"
              :class="compact ? 'gap-0.5 p-0.5' : 'gap-1 p-1'"
            >
              <button
                type="button"
                class="grid place-items-center rounded-full leading-none text-[#747D90] transition hover:bg-[#F5F5F2] hover:text-[#172033] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-[#D85F3D]"
                :class="compact ? 'h-6 w-6 text-[13px]' : 'h-7 w-7 text-[15px]'"
                :aria-label="t(opalineQty.less)"
                @click="order.dec(item.id)"
              >−</button>
              <span
                class="op-figure text-center font-medium text-[#172033]"
                :class="compact ? 'w-4 text-[12px]' : 'w-5 text-[13px]'"
              >{{ order.qtyOf(item.id) }}</span>
              <button
                type="button"
                class="grid place-items-center rounded-full bg-[#172033] leading-none text-[#FFFFFF] transition hover:bg-[#222D43] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-[#D85F3D]"
                :class="compact ? 'h-6 w-6 text-[13px]' : 'h-7 w-7 text-[15px]'"
                :aria-label="t(opalineQty.more)"
                @click="order.add(item.id)"
              >+</button>
            </div>

            <!-- Narrow tiles cannot carry the word; the round mark says it -->
            <button
              v-else-if="!soldOut && compact"
              type="button"
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#172033] text-[17px] leading-none text-[#FFFFFF] transition hover:bg-[#222D43] active:scale-95 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
              :aria-label="t(opalineAdd)"
              @click="order.add(item.id)"
            >+</button>

            <button
              v-else-if="!soldOut"
              type="button"
              class="op-label shrink-0 rounded-full bg-[#172033] px-4 py-2.5 text-[9px] text-[#FFFFFF] transition hover:bg-[#222D43] active:scale-95 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
              @click="order.add(item.id)"
            >{{ t(opalineAdd) }}</button>

            <span
              v-else-if="!compact"
              class="op-label shrink-0 rounded-full border border-[#E2E5E8] px-3 py-2 text-[9px] text-[#A04F4F]"
            >{{ t(ui.soldOut) }}</span>
          </template>

          <span
            v-else-if="soldOut && !compact"
            class="op-label shrink-0 rounded-full border border-[#E2E5E8] px-3 py-2 text-[9px] text-[#A04F4F]"
          >{{ t(ui.soldOut) }}</span>
        </ClientOnly>
      </div>
    </div>
  </article>
</template>
