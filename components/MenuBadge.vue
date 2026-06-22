<script setup lang="ts">
import { badgeLabels, type BadgeKey } from '~/data/menu'
const props = defineProps<{ badge: BadgeKey }>()
const { t } = useLanguage()
const label = computed(() => badgeLabels[props.badge])
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border border-caramel/50 bg-brown/85 px-2 py-1 font-serif text-xs font-semibold leading-none text-caramel-light shadow-sm backdrop-blur-md sm:px-2.5 sm:text-sm"
  >
    <span aria-hidden="true">{{ label.icon }}</span>
    <span class="hidden sm:inline">{{ t(label.text) }}</span>
  </span>
</template>
