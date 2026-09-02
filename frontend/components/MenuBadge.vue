<script setup lang="ts">
import { badgeByKey } from '~/data/badges'
// `theme` only swaps colours. The default keeps the original palette so Aria
// (and every other caller) renders exactly as before; Heritage opts in.
const props = withDefaults(
  defineProps<{ badge: string; theme?: 'default' | 'heritage' }>(),
  { theme: 'default' },
)
const { t } = useLanguage()
// Unknown keys (a tenant's own badge, or one removed from the catalogue)
// simply render nothing rather than crashing the card.
const def = computed(() => badgeByKey(props.badge))
</script>

<template>
  <span
    v-if="def"
    class="inline-flex items-center gap-1 rounded-full border px-2 py-1 font-serif text-xs font-semibold leading-none shadow-sm backdrop-blur-md sm:px-2.5 sm:text-sm"
    :class="
      theme === 'heritage'
        ? 'border-[#A47B45]/55 bg-[#26382F]/88 text-[#E2E6D8]'
        : 'border-caramel/50 bg-brown/85 text-caramel-light'
    "
  >
    <span aria-hidden="true">{{ def.icon }}</span>
    <span class="hidden sm:inline">{{ t(def.text) }}</span>
  </span>
</template>
