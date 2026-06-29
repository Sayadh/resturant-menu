<script setup lang="ts">
// Platform landing — lists the restaurants on this QR-menu platform. Each links
// to its own tenant route (/<slug>). Real product would also live behind the
// marketing site; the per-restaurant menus are the tenant routes.
import { restaurantService } from '~/services'

const { data: restaurants } = await useAsyncData('landing-restaurants', () =>
  restaurantService.getRestaurants(),
)

useHead({ title: 'QR Menu Platform' })
</script>

<template>
  <div class="min-h-screen bg-[#F5EFE2] px-6 py-16 text-[#3E2723]">
    <div class="mx-auto max-w-3xl text-center">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#C69A5A]">QR Menu Platform</p>
      <h1 class="mt-4 font-serif text-4xl font-bold sm:text-5xl">Ընտրիր ռեստորանը</h1>
      <p class="mt-3 font-serif text-[#8A7868]">Յուրաքանչյուր ռեստորան ունի իր URL-ը, մենյուն և դիզայնը։</p>

      <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="r in restaurants"
          :key="r.id"
          :to="`/${r.slug}`"
          class="group overflow-hidden rounded-[22px] border border-[#E4D6C2] bg-[#FFF9EF] p-6 text-left transition hover:-translate-y-1 hover:border-[#C69A5A] hover:shadow-[0_18px_40px_-18px_rgba(62,39,35,0.35)]"
        >
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-2xl font-bold">{{ r.name }}</h2>
            <span class="rounded-full bg-[#C69A5A]/15 px-2.5 py-1 text-xs font-semibold capitalize text-[#A87E42]">{{ r.themeId }}</span>
          </div>
          <p class="mt-2 font-serif text-sm italic text-[#8A7868]">{{ r.tagline.hy }}</p>
          <p class="mt-4 text-sm font-semibold text-[#3E2723]/70 group-hover:text-[#C69A5A]">/{{ r.slug }} ↗</p>
        </NuxtLink>
      </div>

      <NuxtLink to="/admin" class="mt-10 inline-block font-serif text-xs uppercase tracking-widest text-[#3E2723]/40 hover:text-[#C69A5A]">
        Admin panel
      </NuxtLink>
    </div>
  </div>
</template>
