<script setup lang="ts">
import { levels, type MenuLevelId } from '~/data/menu'

defineProps<{ activeLevel: MenuLevelId }>()
const emit = defineEmits<{ select: [id: MenuLevelId] }>()

const { t } = useLanguage()
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-full border border-caramel/25 bg-card p-1"
    role="tablist"
    aria-label="Menu sections"
  >
    <button
      v-for="lvl in levels"
      :key="lvl.id"
      type="button"
      role="tab"
      :aria-selected="activeLevel === lvl.id"
      class="flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-200"
      :class="
        activeLevel === lvl.id
          ? 'bg-caramel text-cream shadow-sm'
          : 'text-brown hover:bg-cream'
      "
      @click="emit('select', lvl.id)"
    >
      <span class="text-base leading-none" aria-hidden="true">{{ lvl.icon }}</span>
      <span>{{ t(lvl.title) }}</span>
    </button>
  </div>
</template>
