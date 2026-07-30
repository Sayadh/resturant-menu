<script setup lang="ts">
defineProps<{ activeLevel: string }>()
const emit = defineEmits<{ select: [id: string] }>()

const { t } = useLanguage()
const store = useMenuStore()
const { levels } = storeToRefs(store)
</script>

<template>
  <div class="flex items-center gap-2.5" role="tablist" aria-label="Menu sections">
    <button
      v-for="lvl in levels"
      :key="lvl.id"
      type="button"
      role="tab"
      :aria-selected="activeLevel === lvl.id"
      class="flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-all duration-200"
      :class="
        activeLevel === lvl.id
          ? 'border-[#64734D] bg-[#64734D] text-white shadow-[0_6px_18px_-6px_rgba(100,115,77,0.45)]'
          : 'border-[#D5D1C6] bg-[#FCFBF7] text-[#292A27] hover:border-[#64734D]/60 hover:bg-[#E2E6D8]'
      "
      @click="emit('select', lvl.id)"
    >
      <span v-if="lvl.image" class="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full" aria-hidden="true">
        <img :src="lvl.image" alt="" class="h-full w-full object-cover" />
      </span>
      <span v-else class="text-base leading-none" aria-hidden="true">{{ lvl.icon }}</span>
      <span>{{ t(lvl.title) }}</span>
    </button>
  </div>
</template>
