<script setup lang="ts">
const { openModal } = useLeadModal()
const { L } = useLandingI18n()
const stats = computed(() => [
  { value: '20+', label: L.value.hero.stats.partners },
  { value: '1000+', label: L.value.hero.stats.products },
  { value: '99.9%', label: L.value.hero.stats.uptime },
  { value: '24/7', label: L.value.hero.stats.support },
])
</script>

<template>
  <section id="hero" class="relative overflow-hidden bg-[#0B1020] pt-32 pb-24 text-white sm:pt-40">
    <!-- animated background glow -->
    <div class="pointer-events-none absolute inset-0">
      <div class="glow glow-a" />
      <div class="glow glow-b" />
      <div class="absolute inset-0 opacity-[0.04]" style="background-image:radial-gradient(circle at 1px 1px, #fff 1px, transparent 0);background-size:36px 36px" />
    </div>

    <div class="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
      <!-- copy -->
      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-indigo-200 ring-1 ring-white/10">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {{ L.hero.badge }}
        </div>
        <h1 class="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          {{ L.hero.titleA }}
          <span class="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> {{ L.hero.titleB }}</span>
        </h1>
        <p class="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {{ L.hero.subtitle }}
        </p>

        <div class="mt-9 flex flex-wrap items-center gap-3.5">
          <button type="button" class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-semibold shadow-xl shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:shadow-indigo-500/50" @click="openModal()">
            <span class="relative z-10">{{ L.hero.start }}</span>
            <span class="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          </button>
          <a href="#demo" class="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            {{ L.hero.watchDemo }}
          </a>
        </div>

        <dl class="mt-12 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
          <div v-for="s in stats" :key="s.label">
            <dt class="text-2xl font-extrabold text-white">{{ s.value }}</dt>
            <dd class="mt-0.5 text-xs text-slate-400">{{ s.label }}</dd>
          </div>
        </dl>
      </div>

      <!-- mockup -->
      <LandingReveal :y="40" class="relative">
        <div class="relative rounded-[26px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 shadow-2xl backdrop-blur">
          <!-- fake dashboard -->
          <div class="overflow-hidden rounded-2xl bg-[#0E1428] ring-1 ring-white/10">
            <div class="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
              <span class="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span class="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span class="ml-3 text-[11px] font-medium text-slate-400">Dashboard</span>
            </div>
            <div class="grid grid-cols-3 gap-3 p-4">
              <div v-for="(m, i) in [{ n: '128', l: 'Products' }, { n: '24', l: 'Categories' }, { n: '1,248', l: 'Views' }]" :key="i" class="rounded-xl bg-white/5 p-3">
                <p class="text-lg font-bold text-white">{{ m.n }}</p>
                <p class="text-[10px] text-slate-400">{{ m.l }}</p>
              </div>
            </div>
            <div class="px-4 pb-5">
              <div class="rounded-xl bg-white/5 p-4">
                <p class="mb-3 text-[11px] font-medium text-slate-400">Views Overview</p>
                <svg viewBox="0 0 300 80" class="w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="ha" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stop-color="#818cf8" stop-opacity="0.5" />
                      <stop offset="1" stop-color="#818cf8" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 60 C40 30 60 55 100 40 C140 25 170 58 210 30 C250 10 280 40 300 20 L300 80 L0 80 Z" fill="url(#ha)" />
                  <path d="M0 60 C40 30 60 55 100 40 C140 25 170 58 210 30 C250 10 280 40 300 20" fill="none" stroke="#818cf8" stroke-width="2" />
                </svg>
              </div>
            </div>
          </div>

          <!-- floating QR card -->
          <div class="absolute -bottom-6 -left-6 hidden rotate-[-6deg] rounded-2xl bg-white p-3 shadow-2xl sm:block animate-float">
            <div class="grid h-20 w-20 place-items-center rounded-lg bg-[#0B1020]">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="#fff"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm0 4h3v4h-4v-2h1v-2zm-5 0h2v2h-2v-2zm0-4h2v2h-2v-2z" /></svg>
            </div>
            <p class="mt-1.5 text-center text-[10px] font-semibold text-slate-700">{{ L.demo.scanShort }}</p>
          </div>
        </div>
      </LandingReveal>
    </div>
  </section>
</template>

<style scoped>
.glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(90px);
  opacity: 0.5;
}
.glow-a {
  top: -10%;
  left: 10%;
  height: 420px;
  width: 420px;
  background: radial-gradient(circle, #6366f1, transparent 70%);
  animation: drift 14s ease-in-out infinite;
}
.glow-b {
  bottom: -20%;
  right: 5%;
  height: 480px;
  width: 480px;
  background: radial-gradient(circle, #a855f7, transparent 70%);
  animation: drift 18s ease-in-out infinite reverse;
}
@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}
.animate-float {
  animation: float 5s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: rotate(-6deg) translateY(0); }
  50% { transform: rotate(-6deg) translateY(-10px); }
}
@media (prefers-reduced-motion: reduce) {
  .glow, .animate-float { animation: none; }
}
</style>
