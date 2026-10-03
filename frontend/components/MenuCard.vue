<script setup lang="ts">
import { imgUrl } from '~/utils/image'
import { ui, type MenuItem } from '~/data/menu'
import { visibleBadges } from '~/data/badges'
import { heritageOrder } from '~/themes/heritage/config'
const props = defineProps<{ item: MenuItem; icon?: string }>()
const emit = defineEmits<{ open: [item: MenuItem] }>()
const { t } = useLanguage()
const brand = useBrand() // ordering = paid plans only
const order = useOrderStore()
const qty = computed(() => order.qtyOf(props.item.id))
// A sold-out dish can't be ordered; one already in the basket can still be reduced.
const canOrder = computed(() => brand.ordering && (props.item.available !== false || qty.value > 0))

const formattedPrice = computed(() => props.item.price.toLocaleString('hy-AM'))

// Show the photo only when one is set and loads; otherwise a branded tile.
const imgFailed = ref(false)
watch(() => props.item.image, () => (imgFailed.value = false))
// `showImage: false` is the admin saying this dish shows NO picture at all --
// so the media block is skipped entirely, placeholder included. When it is on
// but no file was uploaded, the theme's usual placeholder still appears.
const showMedia = computed(() => props.item.showImage !== false)
const hasPhoto = computed(() => showMedia.value && !!props.item.image && !imgFailed.value)
</script>

<template>
  <article
    class="group flex flex-row overflow-hidden rounded-card border border-[#D5D1C6] bg-[#FCFBF7] shadow-[0_4px_18px_-6px_rgba(38,56,47,0.16)] ring-1 ring-[#26382F]/[0.03] transition-all duration-300 ease-out hover:border-[#64734D]/45 hover:shadow-[0_22px_44px_-14px_rgba(38,56,47,0.30)] sm:flex-col sm:hover:-translate-y-1.5"
    :class="{ 'opacity-80': item.available === false }"
  >
    <!-- Image: square thumbnail on mobile, 4:3 banner on larger screens -->
    <button
      v-if="showMedia"
      type="button"
      class="relative block h-28 w-28 shrink-0 overflow-hidden sm:h-auto sm:w-full sm:aspect-[4/3]"
      :aria-label="t(item.name)"
      @click="emit('open', item)"
    >
      <img
        v-if="hasPhoto"
        :src="imgUrl(item.image, 600)"
        :alt="t(item.name)"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        :class="{ 'grayscale': item.available === false }"
        @error="imgFailed = true"
      />
      <!-- Branded category tile (always loads, always matches the category) -->
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#64734D]/25 via-[#F1F0EA] to-[#A47B45]/18 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      >
        <span class="text-4xl drop-shadow-sm sm:text-5xl" aria-hidden="true">{{ icon || '🍽' }}</span>
      </div>
      <span
        v-if="visibleBadges(item).length"
        class="absolute left-2 top-2 flex flex-wrap items-center gap-1 sm:left-3 sm:top-3"
      >
        <MenuBadge
          v-for="b in visibleBadges(item)"
          :key="b.key"
          :badge="b.key"
          theme="heritage"
        />
      </span>
      <!-- Sold out overlay -->
      <div
        v-if="item.available === false"
        class="absolute inset-0 flex items-center justify-center bg-[#26382F]/45"
      >
        <span
          class="rounded-full border border-[#FCFBF7]/40 bg-[#96483F] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#FCFBF7]"
        >
          {{ t(ui.soldOut) }}
        </span>
      </div>
    </button>

    <!-- Content -->
    <div class="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
      <h3 class="font-serif text-base font-semibold leading-snug text-[#292A27] sm:text-xl">
        <button type="button" class="w-full text-left" @click="emit('open', item)">
          {{ t(item.name) }}
        </button>
      </h3>
      <p
        class="mt-1 line-clamp-2 font-serif text-sm leading-relaxed text-[#706F68] sm:text-[15px] sm:line-clamp-3"
      >
        {{ t(item.description) }}
      </p>

      <div class="mt-auto flex items-center justify-between gap-2 border-t border-[#D5D1C6] pt-2.5 sm:mt-3">
        <p class="font-display text-lg font-bold tracking-wide text-[#49372C] sm:text-xl">
          {{ formattedPrice }}<span class="ml-0.5 text-[#A47B45]">{{ ui.currency.AM }}</span>
        </p>

        <!-- Order (paid plans only): "+" first, a − n + stepper once added -->
        <template v-if="canOrder">
          <div
            v-if="qty > 0"
            class="flex shrink-0 items-center gap-1 rounded-full border border-[#D5D1C6] bg-[#F1F0EA] p-0.5"
          >
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full text-lg font-bold leading-none text-[#292A27] transition hover:bg-[#E2E6D8] active:scale-90"
              :aria-label="t(heritageOrder.less)"
              @click="order.dec(item.id)"
            >
              −
            </button>
            <span class="min-w-[1.25rem] text-center font-display text-sm font-bold text-[#292A27]">{{ qty }}</span>
            <button
              v-if="item.available !== false"
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full bg-[#64734D] text-[#FCFBF7] transition hover:bg-[#4F6B58] active:scale-90"
              :aria-label="t(heritageOrder.more)"
              @click="order.add(item.id)"
            >
              <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
            </button>
          </div>
          <button
            v-else
            type="button"
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#64734D] text-[#FCFBF7] shadow-[0_6px_18px_-6px_rgba(100,115,77,0.6)] ring-1 ring-[#A47B45]/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4F6B58] active:translate-y-0 active:scale-90 sm:h-10 sm:w-10"
            :aria-label="t(heritageOrder.add)"
            @click="order.add(item.id)"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
          </button>
        </template>
      </div>
    </div>
  </article>
</template>
