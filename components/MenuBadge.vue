<script setup lang="ts">
import { badgeLabels, type BadgeKey } from '~/data/menu'
const props = defineProps<{ badge: BadgeKey }>()
const { t } = useLanguage()
const label = computed(() => badgeLabels[props.badge])
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full bg-caramel px-2.5 py-1 font-serif text-sm font-semibold leading-none text-brown shadow-sm"
  >
    <span aria-hidden="true">{{ label.icon }}</span>
    <span>{{ t(label.text) }}</span>
  </span>
</template>
