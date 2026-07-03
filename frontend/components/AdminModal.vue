<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 class="text-base font-bold text-slate-900">{{ title }}</h3>
          <button class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close" @click="emit('close')">✕</button>
        </div>
        <div class="flex-1 overflow-y-auto p-5">
          <slot />
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
