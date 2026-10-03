<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// AdminUndoToast — "«X» deleted · Undo" bar shown after a delete. The parent
// owns the timer (it decides when the delete becomes final); this only
// renders the countdown. Re-key it per delete so the countdown restarts.
// Utilities, not .btn-*: those live in admin.vue's SCOPED style.
// ─────────────────────────────────────────────────────────────────────────
const props = defineProps<{
  /** Name of what was deleted (long names truncate; the verb stays visible). */
  label: string
  /** Total time the undo is offered, ms. */
  duration: number
  busy?: boolean
}>()
const emit = defineEmits<{ undo: []; close: [] }>()
const { t } = useAdminI18n()

const startedAt = Date.now()
const left = ref(Math.ceil(props.duration / 1000))
let tick: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  tick = setInterval(() => {
    left.value = Math.max(0, Math.ceil((props.duration - (Date.now() - startedAt)) / 1000))
  }, 250)
})
onBeforeUnmount(() => clearInterval(tick))
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="fixed bottom-5 left-1/2 z-[110] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl"
  >
    <div class="flex items-center gap-3 py-3 pl-4 pr-2">
      <span
        class="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-white/25 text-xs font-bold tabular-nums"
        aria-hidden="true"
      >{{ left }}</span>
      <p class="flex min-w-0 flex-1 items-baseline gap-1 text-sm">
        <span class="truncate font-semibold">«{{ label }}»</span>
        <span class="shrink-0 text-white/70">{{ t('deletedWord') }}</span>
      </p>
      <button
        type="button"
        class="shrink-0 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
        :disabled="busy"
        @click="emit('undo')"
      >{{ busy ? t('restoring') : `↶ ${t('undo')}` }}</button>
      <button
        type="button"
        class="shrink-0 rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
        :aria-label="t('close')"
        :disabled="busy"
        @click="emit('close')"
      >✕</button>
    </div>
    <!-- Time left: drains over `duration` (pure CSS, restarts on re-key). -->
    <div class="h-1 bg-white/10">
      <div class="undo-bar h-full bg-amber-400" :style="{ animationDuration: `${duration}ms` }" />
    </div>
  </div>
</template>

<style scoped>
.undo-bar {
  transform-origin: left;
  animation-name: undo-drain;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes undo-drain {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .undo-bar { animation: none; }
}
</style>
