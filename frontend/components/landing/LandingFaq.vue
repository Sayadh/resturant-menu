<script setup lang="ts">
const { L } = useLandingI18n()
const faqs = computed(() => L.value.faq.items)
const open = ref<number | null>(0)
const toggle = (i: number) => (open.value = open.value === i ? null : i)
</script>

<template>
  <section id="faq" class="relative bg-white py-24">
    <div class="mx-auto max-w-3xl px-5 sm:px-8">
      <LandingReveal class="text-center">
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {{ L.faq.titleA }} <span class="text-indigo-600">{{ L.faq.highlight }}</span>
        </h2>
        <p class="mt-4 text-slate-500">{{ L.faq.subtitle }}</p>
      </LandingReveal>

      <div class="mt-12 space-y-3">
        <LandingReveal
          v-for="(f, i) in faqs"
          :key="f.q"
          :delay="i * 50"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition"
          :class="open === i ? 'shadow-md ring-1 ring-indigo-100' : ''"
        >
          <button class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" @click="toggle(i)">
            <span class="text-sm font-semibold text-slate-900 sm:text-base">{{ f.q }}</span>
            <span
              class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-300"
              :class="open === i ? 'rotate-45 bg-indigo-600 text-white' : ''"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
            </span>
          </button>
          <div class="acc" :class="open === i ? 'acc-open' : ''">
            <div class="overflow-hidden">
              <p class="px-5 pb-5 text-sm leading-relaxed text-slate-500">{{ f.a }}</p>
            </div>
          </div>
        </LandingReveal>
      </div>
    </div>
  </section>
</template>

<style scoped>
.acc {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.acc-open {
  grid-template-rows: 1fr;
}
</style>
