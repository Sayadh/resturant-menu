<script setup lang="ts">
const { L } = useLandingI18n()
</script>

<template>
  <section class="relative bg-slate-50 py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <LandingReveal class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {{ L.how.titleA }} <span class="text-indigo-600">{{ L.how.highlight }}</span>
        </h2>
        <p class="mt-4 text-slate-500">{{ L.how.subtitle }}</p>
      </LandingReveal>

      <div class="relative mt-16">
        <div class="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent lg:block" />
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <LandingReveal v-for="(s, i) in L.how.steps" :key="s.title" :delay="i * 90" class="relative text-center">
            <div class="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-md ring-1 ring-slate-100">
              <span>{{ s.icon }}</span>
              <span class="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">{{ i + 1 }}</span>
            </div>
            <h3 class="mt-5 text-sm font-bold text-slate-900">{{ s.title }}</h3>
            <p class="mx-auto mt-1.5 max-w-[180px] text-xs leading-relaxed text-slate-500">{{ s.desc }}</p>
          </LandingReveal>
        </div>
      </div>
    </div>
  </section>
</template>
