<script setup lang="ts">
// Editorial menu row — a printed-menu line rather than a card. Name and price
// joined by a dotted leader, a large plated thumbnail, a two-line teaser (full
// description lives in the click-triggered detail view), and a quiet add control.
import { ui, type MenuItem } from '~/data/menu'
import { visibleBadges } from '~/data/badges'
import { atelierAdd } from '~/themes/atelier/config'

const props = defineProps<{
  item: MenuItem
  categoryIcon: string
}>()

const emit = defineEmits<{ open: [item: MenuItem] }>()

const { t } = useLanguage()
const order = useOrderStore()
const brand = useBrand() // ordering (cart) = paid plans only

const fmt = (n: number) => n.toLocaleString('hy-AM')
const soldOut = computed(() => props.item.available === false)
// `showImage: false` is the admin saying this dish shows NO picture at all --
// so the media block is skipped entirely, placeholder included. When it is on
// but no file was uploaded, the theme's usual placeholder still appears.
const showMedia = computed(() => props.item.showImage !== false)
</script>

<template>
  <article
    class="group relative flex items-start gap-4 py-5 sm:gap-6"
    :class="{ 'opacity-55': soldOut }"
  >
    <!-- Plated thumbnail -->
    <button
      v-if="showMedia"
      type="button"
      class="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-[#F1F0EC] shadow-sm ring-1 ring-[#172033]/[0.06] sm:h-40 sm:w-40 md:h-44 md:w-44"
      :aria-label="t(item.name)"
      @click="emit('open', item)"
    >
      <img
        v-if="item.image"
        :src="item.image"
        :alt="t(item.name)"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        :class="{ grayscale: soldOut }"
      />
      <span
        v-else
        class="flex h-full w-full items-center justify-center bg-[#FFFFFF] text-3xl text-[#C65D3A]"
        aria-hidden="true"
      >{{ categoryIcon }}</span>
    </button>

    <!-- Editorial copy -->
    <div class="min-w-0 flex-1">
      <div class="flex items-end">
        <button
          type="button"
          class="text-left font-serif text-lg font-medium leading-snug text-[#172033] transition-colors group-hover:text-[#C65D3A] sm:text-xl"
          @click="emit('open', item)"
        >
          {{ t(item.name) }}
        </button>
        <span class="atl-leader" aria-hidden="true" />
        <span class="shrink-0 font-serif text-base text-[#172033] sm:text-lg">
          {{ fmt(item.price) }}<span class="ml-0.5 text-[#C65D3A]">֏</span>
        </span>
      </div>

      <p
        v-if="t(item.description)"
        class="line-clamp-2 mt-1.5 max-w-prose font-serif text-[13px] leading-relaxed text-[#667085]"
      >
        {{ t(item.description) }}
      </p>

      <!-- meta row: badge + favorite + add -->
      <div class="mt-3 flex items-center gap-4">
        <span
          v-for="b in visibleBadges(item)"
          :key="b.key"
          class="atl-eyebrow font-display text-[9px] text-[#C65D3A]"
        >
          {{ t(b.text) }}
        </span>

        <span v-if="soldOut" class="atl-eyebrow font-display text-[9px] text-[#667085]">
          {{ t(ui.soldOut) }}
        </span>

        <!-- Add / stepper (ordering = paid plans only) -->
        <template v-if="brand.ordering">
          <div v-if="order.qtyOf(item.id) > 0" class="ml-auto flex items-center gap-3">
            <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full border border-[#172033]/30 font-display text-base text-[#172033] transition hover:border-[#C65D3A] hover:text-[#C65D3A]" aria-label="Պակասեցնել" @click="order.dec(item.id)">−</button>
            <span class="w-4 text-center font-serif text-base font-semibold text-[#172033]">{{ order.qtyOf(item.id) }}</span>
            <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] font-display text-base text-[#F8FAFC] transition hover:bg-[#C65D3A]" aria-label="Ավելացնել" @click="order.add(item.id)">+</button>
          </div>
          <button
            v-else-if="!soldOut"
            type="button"
            class="flex items-center gap-2 border-b border-[#172033] pb-0.5 font-display text-[10px] uppercase tracking-[0.22em] text-[#172033] transition-colors hover:border-[#C65D3A] hover:text-[#C65D3A]"
            @click="order.add(item.id)"
          >
            {{ t(atelierAdd) }}
            <span class="text-sm leading-none">+</span>
          </button>
        </template>
      </div>
    </div>
  </article>
</template>
