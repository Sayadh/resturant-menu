<script setup lang="ts">
import { badgeLabels, type BadgeKey } from '~/data/menu'
const props = defineProps<{ badge: BadgeKey }>()
const { t } = useLanguage()
const label = computed(() => badgeLabels[props.badge])
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full bg-caramel/95 px-2 py-1 font-serif text-xs font-semibold leading-none text-brown shadow-sm backdrop-blur-sm sm:px-2.5 sm:text-sm"
  >
    <span aria-hidden="true">{{ label.icon }}</span>
    <span class="hidden sm:inline">{{ t(label.text) }}</span>
  </span>
</template>
