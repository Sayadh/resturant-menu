<script setup lang="ts">
import { badgeLabels, type BadgeKey } from '~/data/menu'
// `theme` only swaps colours. The default keeps the original palette so Aria
// (and every other caller) renders exactly as before; Heritage opts in.
const props = withDefaults(
  defineProps<{ badge: BadgeKey; theme?: 'default' | 'heritage' }>(),
  { theme: 'default' },
)
const { t } = useLanguage()
const label = computed(() => badgeLabels[props.badge])
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border px-2 py-1 font-serif text-xs font-semibold leading-none shadow-sm backdrop-blur-md sm:px-2.5 sm:text-sm"
    :class="
      theme === 'heritage'
        ? 'border-[#A47B45]/55 bg-[#26382F]/88 text-[#E2E6D8]'
        : 'border-caramel/50 bg-brown/85 text-caramel-light'
    "
  >
    <span aria-hidden="true">{{ label.icon }}</span>
    <span class="hidden sm:inline">{{ t(label.text) }}</span>
  </span>
</template>
