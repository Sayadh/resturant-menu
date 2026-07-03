<script setup lang="ts">
const { openModal } = useLeadModal()
</script>

<template>
  <section class="relative overflow-hidden bg-[#0B1020] py-24 text-white">
    <div class="pointer-events-none absolute inset-0">
      <div class="cta-glow cta-a" />
      <div class="cta-glow cta-b" />
      <div class="absolute inset-0 opacity-[0.04]" style="background-image:radial-gradient(circle at 1px 1px,#fff 1px,transparent 0);background-size:36px 36px" />
    </div>

    <LandingReveal class="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
      <span class="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-indigo-200 ring-1 ring-white/10">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        Առաջին 30 ռեստորանի համար հատուկ գին
      </span>
      <h2 class="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Սկսեք այսօր, բարձրացրեք
        <span class="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent"> ցանկացած պահի</span>
      </h2>
      <p class="mx-auto mt-5 max-w-xl text-slate-300">
        Ստեղծեք ձեր ռեստորանի թվային մենյուն րոպեների ընթացքում։ Առանց պարտավորությունների՝ ցանկացած պահ կարող եք փոխել կամ ընդլայնել ձեր պլանը։
      </p>

      <div class="mt-9 flex flex-wrap items-center justify-center gap-4">
        <button type="button" class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-4 text-sm font-bold shadow-xl shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:shadow-indigo-500/50" @click="openModal()">
          <span class="relative z-10">Սկսել հիմա</span>
          <span class="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
        </button>
        <a href="#demo" class="rounded-2xl bg-white/5 px-7 py-4 text-sm font-bold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/10">
          Ամրագրել դեմո
        </a>
      </div>
    </LandingReveal>
  </section>
</template>

<style scoped>
.cta-glow { position: absolute; border-radius: 9999px; filter: blur(100px); opacity: 0.4; }
.cta-a { top: -20%; left: 15%; height: 380px; width: 380px; background: #6366f1; animation: ctadrift 15s ease-in-out infinite; }
.cta-b { bottom: -25%; right: 10%; height: 420px; width: 420px; background: #d946ef; animation: ctadrift 19s ease-in-out infinite reverse; }
@keyframes ctadrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-25px); } }
@media (prefers-reduced-motion: reduce) { .cta-glow { animation: none; } }
</style>
