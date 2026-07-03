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
    class="group flex flex-row overflow-hidden rounded-card border border-brown/5 bg-card shadow-card ring-1 ring-black/[0.01] transition-all duration-300 ease-out hover:border-caramel/30 hover:shadow-card-hover sm:flex-col sm:hover:-translate-y-1.5"
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
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-caramel/25 via-cream to-herb/15 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      >
        <span class="text-4xl drop-shadow-sm sm:text-5xl" aria-hidden="true">{{ icon || '🍽' }}</span>
      </div>
      <span
        v-if="item.badge"
        class="absolute left-2 top-2 sm:left-3 sm:top-3"
      >
        <MenuBadge :badge="item.badge" />
      </span>
      <!-- Sold out overlay -->
      <div
        v-if="item.available === false"
        class="absolute inset-0 flex items-center justify-center bg-brown/45"
      >
        <span
          class="rounded-full border border-cream/40 bg-brown/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cream"
        >
          {{ t(ui.soldOut) }}
        </span>
      </div>
    </button>

    <!-- Content -->
    <div class="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
      <h3 class="font-serif text-base font-semibold leading-snug text-brown sm:text-xl">
        {{ t(item.name) }}
      </h3>
      <p
        class="mt-1 line-clamp-2 font-serif text-sm leading-relaxed text-brown-soft sm:text-[15px] sm:line-clamp-3"
      >
        {{ t(item.description) }}
      </p>

      <div class="mt-auto flex items-end justify-between gap-2 border-t border-brown/5 pt-2.5 sm:mt-3">
        <p class="font-display text-lg font-bold tracking-wide text-caramel-dark sm:text-xl">
          {{ formattedPrice }}<span class="ml-0.5 text-caramel">{{ ui.currency.AM }}</span>
        </p>
      </div>
    </div>
  </article>
</template>
