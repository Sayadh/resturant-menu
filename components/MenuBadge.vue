<script setup lang="ts">
import { badgeLabels, type BadgeKey } from '~/data/menu'
const props = defineProps<{ badge: BadgeKey }>()
const { t } = useLanguage()
const label = computed(() => badgeLabels[props.badge])

const styles: Record<BadgeKey, string> = {
  hit: 'bg-[#C0492F] text-cream',
  best: 'bg-caramel text-brown',
  new: 'bg-herb text-cream',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 font-serif text-sm font-semibold leading-none shadow-sm"
    :class="styles[badge]"
  >
    <span aria-hidden="true">{{ label.icon }}</span>
    <span>{{ t(label.text) }}</span>
  </span>
</template>
