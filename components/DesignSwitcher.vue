<script setup lang="ts">
const { designs, activeDesign, setDesign } = useDesign()
const open = ref(false)

const choose = (id: string) => {
  setDesign(id)
  open.value = false
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
    <!-- Panel -->
    <Transition name="ds">
      <div
        v-if="open"
        class="w-64 overflow-hidden rounded-card border border-caramel/30 bg-card shadow-card-hover"
      >
        <div class="border-b border-caramel/20 px-4 py-3">
          <p class="font-display text-base font-bold text-brown">Ձևավորում</p>
          <p class="font-serif text-xs text-brown-soft">Ընտրիր կայքի դիզայնը</p>
        </div>
        <ul class="max-h-72 overflow-y-auto p-2">
          <li v-for="d in designs" :key="d.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition"
              :class="
                activeDesign === d.id
                  ? 'border-caramel bg-caramel/10'
                  : 'border-transparent hover:bg-cream'
              "
              @click="choose(d.id)"
            >
              <span
                class="h-8 w-8 shrink-0 rounded-full border border-black/10"
                :style="{ backgroundColor: d.accent }"
                aria-hidden="true"
              />
              <span class="min-w-0 flex-1">
                <span class="block truncate font-serif font-semibold text-brown">{{ d.name }}</span>
                <span class="block truncate font-serif text-xs text-brown-soft">{{ d.description }}</span>
              </span>
              <span v-if="activeDesign === d.id" class="shrink-0 text-caramel-dark">✓</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Toggle button -->
    <button
      type="button"
      class="flex h-14 w-14 items-center justify-center rounded-full bg-brown text-cream shadow-card-hover transition hover:bg-brown-light"
      :aria-expanded="open"
      aria-label="Ընտրել դիզայն"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="6.5" cy="11.5" r="2.5" />
        <circle cx="17" cy="14" r="2.5" />
        <path d="M12 22a10 10 0 1 1 9.5-7c-.5 1.5-2 2-3.5 2H15a2 2 0 0 0-1.5 3.3A1.5 1.5 0 0 1 12 22Z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.ds-enter-active,
.ds-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.ds-enter-from,
.ds-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}
</style>
