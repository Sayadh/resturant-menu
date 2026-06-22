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
    class="group flex flex-col overflow-hidden rounded-card bg-card shadow-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-card-hover"
  >
    <!-- Image (4:3) with zoomable lightbox trigger -->
    <button
      type="button"
      class="relative block aspect-[4/3] w-full overflow-hidden rounded-t-card"
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
        <span class="font-display text-5xl text-cream/90 drop-shadow-sm">TL</span>
      </div>
      <span
        v-if="item.badge"
        class="absolute left-3 top-3"
      >
        <MenuBadge :badge="item.badge" />
      </span>
    </button>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4">
      <h3 class="font-serif text-xl font-semibold leading-snug text-brown">
        {{ t(item.name) }}
      </h3>
      <p class="mt-1 font-serif text-[15px] leading-relaxed text-brown-soft">
        {{ t(item.description) }}
      </p>

      <div class="mt-3 flex items-end justify-between gap-2 pt-2">
        <p class="font-display text-xl font-bold tracking-wide text-brown">
          {{ formattedPrice }}
          <span class="text-caramel-dark">{{ ui.currency.AM }}</span>
        </p>
      </div>
    </div>
  </article>
</template>
