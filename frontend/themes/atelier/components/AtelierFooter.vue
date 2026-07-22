<script setup lang="ts">
// Editorial footer — closing colophon on the dark ink ground.
const { t } = useLanguage()
const brand = useBrand()
const mono = computed(() => {
  const i = brand.name.split(/\s+/).map((w) => w[0]).join('')
  return (i.length > 1 ? i : brand.name).slice(0, 2).toUpperCase()
})
</script>

<template>
  <footer class="relative z-[1] bg-[#16130F] text-[#F6F2EA]">
    <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div class="flex flex-col items-center text-center">
        <span
          class="flex h-12 w-12 items-center justify-center rounded-full border border-[#F6F2EA]/40 font-display text-sm tracking-[0.1em]"
          aria-hidden="true"
        >{{ mono }}</span>

        <h2 class="mt-6 font-display text-xl tracking-[0.4em]">{{ brand.name }}</h2>
        <p v-if="t(brand.tagline)" class="mt-4 font-serif text-lg italic text-[#F6F2EA]/60">{{ t(brand.tagline) }}</p>

        <div v-if="brand.address || brand.hours" class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-serif text-sm text-[#F6F2EA]/55">
          <span v-if="brand.address">{{ brand.address }}</span>
          <span v-if="brand.address && brand.hours" class="h-1 w-1 rounded-full bg-[#A1502E]" aria-hidden="true" />
          <span v-if="brand.hours">{{ brand.hours }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
