<script setup lang="ts">
import { restaurantService } from '~/services'

defineProps<{ slug: string }>()

// Suggest existing restaurants so a mistyped slug is recoverable.
const { data: list } = await useAsyncData('all-restaurants', () =>
  restaurantService.getRestaurants(),
)
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-[#F5EFE2] px-6 text-center text-[#3E2723]">
    <div class="text-6xl">🍽️</div>
    <h1 class="mt-6 font-serif text-3xl font-bold sm:text-4xl">Մենյունը չի գտնվել</h1>
    <p class="mt-3 max-w-md font-serif text-[#8A7868]">
      «<span class="font-semibold text-[#A87E42]">{{ slug }}</span>» հասցեով թվային մենյու գոյություն չունի կամ այն այլևս հասանելի չէ։
    </p>

    <div v-if="list?.length" class="mt-8 w-full max-w-sm">
      <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8A7868]">Հասանելի մենյուներ</p>
      <div class="flex flex-col gap-2">
        <NuxtLink
          v-for="r in list"
          :key="r.id"
          :to="`/${r.slug}`"
          class="flex items-center justify-between rounded-2xl border border-[#E4D6C2] bg-[#FFF9EF] px-5 py-3 text-left font-serif transition hover:border-[#C69A5A]"
        >
          <span class="font-semibold">{{ r.name }}</span>
          <span class="text-sm text-[#8A7868]">/{{ r.slug }} ↗</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
