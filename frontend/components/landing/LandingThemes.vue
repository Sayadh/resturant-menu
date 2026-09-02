<script setup lang="ts">
// The theme gallery. Every card links to the live demo tenant rendered with
// that theme (`/demo?theme=<key>`), which the demo page already supports as a
// render-only override — so nothing here duplicates theme logic.
import type { ThemeId } from '~/models/types'

const { L } = useLandingI18n()

// Palettes echo each theme's real colours (see themes/*/…): a visitor should
// recognise the card in the demo it opens.
const THEME_CARDS: {
  key: ThemeId
  name: string
  bg: string
  dot: string
  dark?: boolean
}[] = [
  { key: 'aria', name: 'Aria', bg: 'from-[#FBF7F1] to-[#F0E3D0]', dot: 'bg-[#C69A5A]' },
  { key: 'atelier', name: 'Atelier', bg: 'from-[#FBF7F0] to-[#EEE0D2]', dot: 'bg-[#A1502E]' },
  { key: 'maison', name: 'Maison', bg: 'from-[#FFFBFC] to-[#F2DBE1]', dot: 'bg-[#8C304A]' },
  { key: 'heritage', name: 'Heritage', bg: 'from-[#FCFBF7] to-[#E6E3D4]', dot: 'bg-[#64734D]' },
  { key: 'noir', name: 'Noir', bg: 'from-[#1C1D20] to-[#0B0C0E]', dot: 'bg-[#B8B4AC]', dark: true },
  { key: 'opaline', name: 'Opaline', bg: 'from-[#FAFAF8] to-[#EFEBE7]', dot: 'bg-[#D85F3D]' },
]

const themes = computed(() =>
  THEME_CARDS.map((t) => ({ ...t, desc: L.value.themes.descs[t.key] })),
)
</script>

<template>
  <section id="themes" class="relative bg-white py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <LandingReveal class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {{ L.themes.titleA }} <span class="text-indigo-600">{{ L.themes.highlight }}</span> {{ L.themes.titleC }}
        </h2>
        <p class="mt-4 text-slate-500">{{ L.themes.subtitle }}</p>
      </LandingReveal>

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <LandingReveal
          v-for="(t, i) in themes"
          :key="t.key"
          :delay="i * 70"
          class="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
        >
          <!-- The whole card opens the live demo in that theme. -->
          <NuxtLink
            :to="`/demo?theme=${t.key}`"
            target="_blank"
            rel="noopener"
            class="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            :aria-label="`${t.name} — ${L.themes.preview}`"
          >
            <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br p-4" :class="t.bg">
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full" :class="t.dot" />
                <span class="text-[11px] font-bold" :class="t.dark ? 'text-white' : 'text-slate-700'">{{ t.name }}</span>
              </div>
              <div class="mt-4 space-y-2">
                <div
                  v-for="n in 2"
                  :key="n"
                  class="flex gap-2 rounded-xl p-1.5 transition-transform duration-500 group-hover:translate-x-1"
                  :class="t.dark ? 'bg-white/10' : 'bg-white/70'"
                >
                  <div class="h-8 w-8 rounded-lg" :class="t.dark ? 'bg-white/20' : 'bg-slate-200'" />
                  <div class="flex-1 space-y-1 py-1">
                    <div class="h-1.5 w-2/3 rounded-full" :class="t.dark ? 'bg-white/30' : 'bg-slate-300'" />
                    <div class="h-1.5 w-1/3 rounded-full" :class="t.dark ? 'bg-white/20' : 'bg-slate-200'" />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 px-5 py-4">
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900">{{ t.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ t.desc }}</p>
              </div>
              <!-- Always visible (hover does not exist on touch screens). -->
              <span class="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-indigo-600 opacity-70 transition group-hover:opacity-100">
                {{ L.themes.preview }}
                <span class="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </span>
            </div>
          </NuxtLink>
        </LandingReveal>
      </div>
    </div>
  </section>
</template>
