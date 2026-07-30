<script setup lang="ts">
import { drinkGroups, type DrinkGroup } from '~/data/menu'

defineProps<{ activeGroup: DrinkGroup }>()
const emit = defineEmits<{ select: [id: DrinkGroup] }>()

const { t } = useLanguage()
</script>

<template>
  <div class="flex items-center gap-2" role="tablist" aria-label="Drink groups">
    <button
      v-for="grp in drinkGroups"
      :key="grp.id"
      type="button"
      role="tab"
      :aria-selected="activeGroup === grp.id"
      class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-200"
      :class="
        activeGroup === grp.id
          ? 'border-[#26382F] bg-[#26382F] text-white shadow-sm'
          : 'border-[#D5D1C6] bg-[#FCFBF7] text-[#706F68] hover:border-[#64734D]/60 hover:text-[#292A27]'
      "
      @click="emit('select', grp.id)"
    >
      <span class="text-base leading-none" aria-hidden="true">{{ grp.icon }}</span>
      <span>{{ t(grp.title) }}</span>
    </button>
  </div>
</template>
