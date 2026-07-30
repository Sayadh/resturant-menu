<script setup lang="ts">
// Editorial hero — asymmetric magazine cover: oversized serif headline and
// editorial meta on the left, a tall framed signature photograph on the right.
import { atelierBrand, atelierMeta } from '~/themes/atelier/config'

const { t } = useLanguage()
const brand = useBrand()
const menu = useMenuStore()

// Real photo only: the restaurant's cover if set, otherwise the first dish
// photo on the menu. No stock/placeholder image — if neither exists, the
// framed photograph column is hidden entirely and the copy runs full width.
const heroImage = computed(
  () => brand.cover || menu.categories.flatMap((c) => c.items).find((i) => i.image)?.image || '',
)
</script>

<template>
  <section class="relative z-[1] mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
    <div class="grid items-center gap-10" :class="heroImage ? 'lg:grid-cols-[1.05fr_0.95fr] lg:gap-14' : ''">
      <!-- Editorial copy -->
      <div>
        <p class="atl-eyebrow font-display text-[11px] text-[#C65D3A]">
          {{ atelierBrand.established }}
        </p>

        <h1 class="mt-6 font-serif text-[clamp(2.75rem,9vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.01em] text-[#172033]">
          {{ t(atelierBrand.kicker) }}
          <span class="mt-1 block italic text-[#C65D3A]">{{ brand.name }}</span>
        </h1>

        <p class="mt-7 max-w-md font-serif text-lg leading-relaxed text-[#667085] sm:text-xl">
          {{ t(brand.tagline) }}
        </p>

        <!-- Editorial meta row (each item shown only when filled) -->
        <dl v-if="brand.rating || brand.hours || brand.address" class="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <div v-if="brand.rating" class="flex flex-col">
            <dt class="atl-eyebrow font-display text-[9px] text-[#667085]">{{ t(atelierMeta.rating) }}</dt>
            <dd class="mt-1 flex items-baseline gap-1.5 font-serif text-[#172033]">
              <span class="text-2xl font-semibold">{{ brand.rating }}</span>
              <span class="text-sm text-[#667085]">/ 5</span>
            </dd>
          </div>
          <div v-if="brand.hours" class="flex flex-col">
            <dt class="atl-eyebrow font-display text-[9px] text-[#667085]">{{ t(atelierMeta.hours) }}</dt>
            <dd class="mt-1 flex items-center gap-2 font-serif text-[#172033]">
              <span class="text-base">{{ brand.hours }}</span>
            </dd>
          </div>
          <div v-if="brand.address" class="flex flex-col">
            <dt class="atl-eyebrow font-display text-[9px] text-[#667085]">{{ t(atelierMeta.location) }}</dt>
            <dd class="mt-1 font-serif text-base text-[#172033]">{{ brand.address }}</dd>
          </div>
        </dl>
      </div>

      <!-- Framed photograph (rendered only when a real photo exists) -->
      <figure v-if="heroImage" class="relative">
        <div class="relative aspect-[16/11] overflow-hidden rounded-[2px] bg-[#111827] shadow-[0_40px_80px_-40px_rgba(17,24,39,0.6)] sm:aspect-[4/5]">
          <img
            :src="heroImage"
            alt=""
            class="h-full w-full object-cover"
          />
          <!-- inner hairline frame -->
          <span class="pointer-events-none absolute inset-4 border border-[#F8FAFC]/25" aria-hidden="true" />
        </div>
        <!-- No caption tag: the address already sits in the meta row on the
             left and the tagline directly under the headline — a caption here
             could only echo one of them, so the frame speaks for itself. -->
      </figure>
    </div>
  </section>
</template>
