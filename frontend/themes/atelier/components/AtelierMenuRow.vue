<script setup lang="ts">
// Editorial menu row — a printed-menu line rather than a card. Name and price
// joined by a dotted leader, a small plated thumbnail, and a quiet add control.
import { ui, badgeLabels, type MenuItem } from '~/data/menu'
import { atelierAdd } from '~/themes/atelier/config'

const props = defineProps<{
  item: MenuItem
  categoryIcon: string
}>()

const emit = defineEmits<{ open: [item: MenuItem] }>()

const { t } = useLanguage()
const order = useOrderStore()

const fmt = (n: number) => n.toLocaleString('hy-AM')
const soldOut = computed(() => props.item.available === false)
</script>

<template>
  <article
    class="group relative flex items-start gap-4 py-5 sm:gap-6"
    :class="{ 'opacity-55': soldOut }"
  >
    <!-- Plated thumbnail -->
    <button
      type="button"
      class="relative h-20 w-20 shrink-0 overflow-hidden rounded-[2px] bg-[#16130F] sm:h-24 sm:w-24"
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
        class="flex h-full w-full items-center justify-center bg-[#F6F2EA] text-2xl text-[#A1502E]"
        aria-hidden="true"
      >{{ categoryIcon }}</span>
      <span class="pointer-events-none absolute inset-1.5 border border-[#F6F2EA]/20" aria-hidden="true" />
    </button>

    <!-- Editorial copy -->
    <div class="min-w-0 flex-1">
      <div class="flex items-end">
        <button
          type="button"
          class="text-left font-serif text-xl font-medium leading-snug text-[#16130F] transition-colors group-hover:text-[#A1502E] sm:text-2xl"
          @click="emit('open', item)"
        >
          {{ t(item.name) }}
        </button>
        <span class="atl-leader" aria-hidden="true" />
        <span class="shrink-0 font-serif text-lg text-[#16130F] sm:text-xl">
          {{ fmt(item.price) }}<span class="ml-0.5 text-[#A1502E]">֏</span>
        </span>
      </div>

      <p class="mt-1.5 max-w-prose font-serif text-[15px] leading-relaxed text-[#857B6C]">
        {{ t(item.description) }}
      </p>

      <!-- meta row: badge + favorite + add -->
      <div class="mt-3 flex items-center gap-4">
        <span
          v-if="item.badge"
          class="atl-eyebrow font-display text-[9px] text-[#A1502E]"
        >
          {{ t(badgeLabels[item.badge].text) }}
        </span>

        <span v-if="soldOut" class="atl-eyebrow font-display text-[9px] text-[#857B6C]">
          {{ t(ui.soldOut) }}
        </span>

        <!-- Add / stepper -->
        <div v-if="order.qtyOf(item.id) > 0" class="ml-auto flex items-center gap-3">
          <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full border border-[#16130F]/30 font-display text-base text-[#16130F] transition hover:border-[#A1502E] hover:text-[#A1502E]" aria-label="Պակասեցնել" @click="order.dec(item.id)">−</button>
          <span class="w-4 text-center font-serif text-base font-semibold text-[#16130F]">{{ order.qtyOf(item.id) }}</span>
          <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full bg-[#16130F] font-display text-base text-[#F6F2EA] transition hover:bg-[#A1502E]" aria-label="Ավելացնել" @click="order.add(item.id)">+</button>
        </div>
        <button
          v-else-if="!soldOut"
          type="button"
          class="flex items-center gap-2 border-b border-[#16130F] pb-0.5 font-display text-[10px] uppercase tracking-[0.22em] text-[#16130F] transition-colors hover:border-[#A1502E] hover:text-[#A1502E]"
          @click="order.add(item.id)"
        >
          {{ t(atelierAdd) }}
          <span class="text-sm leading-none">+</span>
        </button>
      </div>
    </div>
  </article>
</template>
