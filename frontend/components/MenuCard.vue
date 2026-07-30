<script setup lang="ts">
import { ui, type MenuItem } from '~/data/menu'
const props = defineProps<{ item: MenuItem; icon?: string }>()
const emit = defineEmits<{ open: [item: MenuItem] }>()
const { t } = useLanguage()

const formattedPrice = computed(() => props.item.price.toLocaleString('hy-AM'))

// Show the photo only when one is set and loads; otherwise a branded tile.
const imgFailed = ref(false)
watch(() => props.item.image, () => (imgFailed.value = false))
const hasPhoto = computed(() => !!props.item.image && !imgFailed.value)
</script>

<template>
  <article
    class="group flex flex-row overflow-hidden rounded-card border border-[#D5D1C6] bg-[#FCFBF7] shadow-[0_4px_18px_-6px_rgba(38,56,47,0.16)] ring-1 ring-[#26382F]/[0.03] transition-all duration-300 ease-out hover:border-[#64734D]/45 hover:shadow-[0_22px_44px_-14px_rgba(38,56,47,0.30)] sm:flex-col sm:hover:-translate-y-1.5"
    :class="{ 'opacity-80': item.available === false }"
  >
    <!-- Image: square thumbnail on mobile, 4:3 banner on larger screens -->
    <button
      type="button"
      class="relative block h-28 w-28 shrink-0 overflow-hidden sm:h-auto sm:w-full sm:aspect-[4/3]"
      :aria-label="t(item.name)"
      @click="emit('open', item)"
    >
      <img
        v-if="hasPhoto"
        :src="item.image"
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
        v-if="item.badge"
        class="absolute left-2 top-2 sm:left-3 sm:top-3"
      >
        <MenuBadge :badge="item.badge" theme="heritage" />
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

      <div class="mt-auto flex items-end justify-between gap-2 border-t border-[#D5D1C6] pt-2.5 sm:mt-3">
        <p class="font-display text-lg font-bold tracking-wide text-[#49372C] sm:text-xl">
          {{ formattedPrice }}<span class="ml-0.5 text-[#A47B45]">{{ ui.currency.AM }}</span>
        </p>
      </div>
    </div>
  </article>
</template>
