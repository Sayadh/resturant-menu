<script setup lang="ts">
import type { MenuCategory, MenuItem } from '~/data/menu'
defineProps<{ category: MenuCategory }>()
const emit = defineEmits<{ open: [item: MenuItem] }>()
const { t } = useLanguage()
</script>

<template>
  <section :id="category.id" class="scroll-mt-40">
    <!-- Category heading -->
    <div class="flex flex-col items-center text-center">
      <div class="flex items-center gap-3 text-brown">
        <CategoryIcon :id="category.id" class="h-7 w-7 text-caramel-dark" />
        <h2 class="font-display text-2xl font-bold uppercase tracking-[0.12em] sm:text-3xl">
          {{ t(category.title) }}
        </h2>
      </div>
      <div class="mt-4 flex w-full max-w-xs items-center gap-3" aria-hidden="true">
        <span class="h-px flex-1 bg-caramel/40" />
        <span class="h-1.5 w-1.5 rotate-45 bg-caramel" />
        <span class="h-px flex-1 bg-caramel/40" />
      </div>
    </div>

    <!-- Cards grid -->
    <div class="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MenuCard
        v-for="item in category.items"
        :key="item.id"
        :item="item"
        @open="emit('open', $event)"
      />
    </div>
  </section>
</template>
