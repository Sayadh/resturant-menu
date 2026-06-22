<script setup lang="ts">
import { ui, type MenuItem } from '~/data/menu'
const props = defineProps<{ item: MenuItem }>()
const emit = defineEmits<{ open: [item: MenuItem] }>()
const { t } = useLanguage()

const formattedPrice = computed(() => props.item.price.toLocaleString('hy-AM'))

// Fall back to a themed placeholder if an (external) image fails to load.
const imgFailed = ref(false)
watch(() => props.item.image, () => (imgFailed.value = false))
</script>

<template>
  <article
    class="group flex flex-row overflow-hidden rounded-card bg-card shadow-card transition-all duration-300 ease-out hover:shadow-card-hover sm:flex-col sm:hover:-translate-y-1.5"
  >
    <!-- Image: square thumbnail on mobile, 4:3 banner on larger screens -->
    <button
      type="button"
      class="relative block h-28 w-28 shrink-0 overflow-hidden sm:h-auto sm:w-full sm:aspect-[4/3]"
      :aria-label="t(item.name)"
      @click="emit('open', item)"
    >
      <img
        v-if="!imgFailed"
        :src="item.image"
        :alt="t(item.name)"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        @error="imgFailed = true"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-caramel-light/40 to-caramel/30"
      >
        <span class="font-display text-3xl text-cream/90 drop-shadow-sm sm:text-5xl">TL</span>
      </div>
      <span
        v-if="item.badge"
        class="absolute left-2 top-2 sm:left-3 sm:top-3"
      >
        <MenuBadge :badge="item.badge" />
      </span>
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

      <div class="mt-auto flex items-end justify-between gap-2 pt-2">
        <p class="font-display text-lg font-bold tracking-wide text-brown sm:text-xl">
          {{ formattedPrice }}
          <span class="text-caramel-dark">{{ ui.currency.AM }}</span>
        </p>
      </div>
    </div>
  </article>
</template>
