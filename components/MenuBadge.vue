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
    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <template v-if="badge === 'hit'">
        <path d="M12 3c1 3-1 4-1 6a3 3 0 0 0 6 0c0 4-2 5-2 7a3 3 0 0 1-6 0c0-3 2-4 2-7 0-2 .5-2 1-6Z" />
      </template>
      <template v-else-if="badge === 'best'">
        <path d="M12 4l2.2 4.6 5 .7-3.6 3.5.9 5L12 15.9 7.5 17.8l.9-5L4.8 9.3l5-.7L12 4Z" />
      </template>
      <template v-else>
        <path d="M12 4v4m0 8v4m8-8h-4M8 12H4m12.2-5.2-2.8 2.8M9.6 14.4l-2.8 2.8m9.4 0-2.8-2.8M9.6 9.6 6.8 6.8" />
      </template>
    </svg>
    <span>{{ t(label.text) }}</span>
  </span>
</template>
