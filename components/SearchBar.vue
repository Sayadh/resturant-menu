<script setup lang="ts">
import { ui } from '~/data/menu'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { t } = useLanguage()
const focused = ref(false)
</script>

<template>
  <div class="relative">
    <IconSearch
      class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-200"
      :class="focused ? 'text-caramel-dark' : 'text-brown-soft/70'"
    />
    <input
      :value="modelValue"
      type="search"
      inputmode="search"
      :placeholder="t(ui.searchPlaceholder)"
      class="w-full rounded-pill border bg-card py-3 pl-12 pr-4 font-serif text-base text-brown shadow-sm outline-none transition-all duration-200 placeholder:text-brown-soft/60"
      :class="
        focused
          ? 'border-caramel ring-4 ring-caramel/20'
          : 'border-border hover:border-caramel/50'
      "
      @focus="focused = true"
      @blur="focused = false"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
