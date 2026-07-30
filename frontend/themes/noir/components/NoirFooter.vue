<script setup lang="ts">
// Closing colophon on obsidian — monogram, house name, tagline and the
// practical details, each rendered only when the tenant has filled it in.
const { t } = useLanguage()
const brand = useBrand()
const mono = computed(() => {
  const i = brand.name.split(/\s+/).map((w) => w[0]).join('')
  return (i.length > 1 ? i : brand.name).slice(0, 2).toUpperCase()
})
</script>

<template>
  <footer class="border-t border-[#25282D] bg-[#0B0C0E]">
    <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div class="flex flex-col items-center text-center">
        <span
          class="grid h-12 w-12 place-items-center rounded-full border border-[#303339] font-display text-sm tracking-[0.1em] text-[#B8B4AC]"
          aria-hidden="true"
        >{{ mono }}</span>

        <h2 class="mt-6 font-display text-xl uppercase tracking-[0.36em] text-[#F1EEE8]">{{ brand.name }}</h2>

        <p v-if="t(brand.tagline)" class="mt-4 font-serif text-lg italic text-[#A8A8A5]">{{ t(brand.tagline) }}</p>

        <div
          v-if="brand.address || brand.hours"
          class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-serif text-sm text-[#777A7E]"
        >
          <span v-if="brand.address">{{ brand.address }}</span>
          <span v-if="brand.address && brand.hours" class="h-1 w-1 rounded-full bg-[#9A8060]" aria-hidden="true" />
          <span v-if="brand.hours">{{ brand.hours }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
