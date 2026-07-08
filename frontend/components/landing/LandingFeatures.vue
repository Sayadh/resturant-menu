<script setup lang="ts">
const { L } = useLandingI18n()
</script>

<template>
  <section id="features" class="relative bg-white py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <LandingReveal class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {{ L.features.title }} <span class="text-indigo-600">{{ L.features.highlight }}</span>
        </h2>
        <p class="mt-4 text-slate-500">{{ L.features.subtitle }}</p>
      </LandingReveal>

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <LandingReveal
          v-for="(f, i) in L.features.items"
          :key="f.title"
          :delay="i * 80"
          class="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/70"
        >
          <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition duration-500 group-hover:opacity-20" :class="f.color" />
          <div class="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-xl shadow-lg" :class="f.color">
            <span>{{ f.icon }}</span>
          </div>
          <h3 class="mt-5 text-lg font-bold text-slate-900">{{ f.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">{{ f.desc }}</p>
        </LandingReveal>
      </div>
    </div>
  </section>
</template>
