<script setup lang="ts">
import type { MenuGroup, GroupKey } from '~/data/menu'

defineProps<{
  groups: MenuGroup[]
  activeGroup: GroupKey
}>()
const emit = defineEmits<{ select: [id: GroupKey] }>()

const { t } = useLanguage()
</script>

<template>
  <div class="no-scrollbar -mx-1 flex items-center gap-2.5 overflow-x-auto px-1">
    <button
      v-for="group in groups"
      :key="group.id"
      type="button"
      class="inline-flex shrink-0 items-center gap-2 rounded-pill border px-5 py-2.5 text-base font-semibold transition-all duration-200"
      :class="
        activeGroup === group.id
          ? 'border-caramel bg-caramel text-cream shadow-pill'
          : 'border-border bg-card text-brown hover:border-caramel/60 hover:bg-caramel/5'
      "
      :aria-pressed="activeGroup === group.id"
      @click="emit('select', group.id)"
    >
      <span class="text-lg leading-none" aria-hidden="true">{{ group.icon }}</span>
      <span>{{ t(group.title) }}</span>
    </button>
  </div>
</template>
