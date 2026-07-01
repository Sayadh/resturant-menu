<script setup lang="ts">
const themes = [
  { name: 'Aria', desc: 'Ժամանակակից և պարզ', bg: 'from-indigo-50 to-violet-100', dot: 'bg-indigo-500' },
  { name: 'Maison', desc: 'Էլեգանտ և մուգ', bg: 'from-stone-800 to-neutral-900', dot: 'bg-amber-400', dark: true },
  { name: 'Atelier', desc: 'Ջերմ և բնական', bg: 'from-emerald-50 to-teal-100', dot: 'bg-emerald-500' },
  { name: 'Heritage', desc: 'Դասական և ավանդական', bg: 'from-amber-50 to-orange-100', dot: 'bg-orange-500' },
]
</script>

<template>
  <section id="themes" class="relative bg-white py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <LandingReveal class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Գեղեցիկ <span class="text-indigo-600">թեմաներ</span> ձեր բրենդին համապատասխան
        </h2>
        <p class="mt-4 text-slate-500">Ընտրեք պատրաստի պրեմիում թեմաներ՝ ձեր ռեստորանի ոճին համապատասխան։</p>
      </LandingReveal>

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <LandingReveal
          v-for="(t, i) in themes"
          :key="t.name"
          :delay="i * 80"
          class="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br p-4" :class="t.bg">
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full" :class="t.dot" />
              <span class="text-[11px] font-bold" :class="t.dark ? 'text-white' : 'text-slate-700'">{{ t.name }}</span>
            </div>
            <div class="mt-4 space-y-2">
              <div v-for="n in 2" :key="n" class="flex gap-2 rounded-xl p-1.5 transition-transform duration-500 group-hover:translate-x-1" :class="t.dark ? 'bg-white/10' : 'bg-white/70'">
                <div class="h-8 w-8 rounded-lg" :class="t.dark ? 'bg-white/20' : 'bg-slate-200'" />
                <div class="flex-1 space-y-1 py-1">
                  <div class="h-1.5 w-2/3 rounded-full" :class="t.dark ? 'bg-white/30' : 'bg-slate-300'" />
                  <div class="h-1.5 w-1/3 rounded-full" :class="t.dark ? 'bg-white/20' : 'bg-slate-200'" />
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-sm font-bold text-slate-900">{{ t.name }}</p>
              <p class="text-xs text-slate-400">{{ t.desc }}</p>
            </div>
            <span class="text-indigo-600 opacity-0 transition group-hover:opacity-100">→</span>
          </div>
        </LandingReveal>
      </div>
    </div>
  </section>
</template>
