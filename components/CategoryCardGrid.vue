<script setup lang="ts">
import { ui, type MenuCategory } from '~/data/menu'

defineProps<{ categories: MenuCategory[] }>()
const emit = defineEmits<{ select: [id: string] }>()

const { t } = useLanguage()
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
    <button
      v-for="cat in categories"
      :key="cat.id"
      type="button"
      class="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-card text-left shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-caramel/40"
      @click="emit('select', cat.id)"
    >
      <img
        :src="cat.cover"
        :alt="t(cat.title)"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-brown/90 via-brown/35 to-transparent" />

      <!-- Icon badge -->
      <span
        class="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-brown shadow-sm"
        aria-hidden="true"
      >
        <CategoryIcon :id="cat.id" class="h-5 w-5" />
      </span>

      <div class="relative flex flex-col px-3.5 pb-3.5 pt-3">
        <h3 class="line-clamp-2 font-display text-sm font-bold uppercase leading-tight tracking-wide text-cream drop-shadow sm:text-base">
          {{ t(cat.title) }}
        </h3>
        <p class="mt-0.5 pb-0.5 font-serif text-xs leading-relaxed text-cream/80 sm:text-sm">
          {{ cat.items.length }} {{ t(ui.itemsCount) }}
        </p>
      </div>
    </button>
  </div>
</template>
