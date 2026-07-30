<script setup lang="ts">
// "The Chef's Signatures" — a dark, full-bleed editorial band that breaks the
// bone flow for contrast. Showcases featured (badged) dishes as large plates.
import type { MenuItem } from '~/data/menu'
import { atelierSignatureKicker, atelierSignatureTitle } from '~/themes/atelier/config'
import { vReveal } from '~/themes/atelier/animations'

defineProps<{
  dishes: { item: MenuItem }[]
}>()

const emit = defineEmits<{ open: [item: MenuItem] }>()

const { t } = useLanguage()
const order = useOrderStore()
const brand = useBrand() // ordering (cart) = paid plans only
const fmt = (n: number) => n.toLocaleString('hy-AM')
</script>

<template>
  <section class="relative z-[1] bg-[#111827] text-[#F8FAFC]">
    <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div class="flex items-end justify-between gap-6 border-b border-[#F8FAFC]/15 pb-6">
        <div>
          <p class="atl-eyebrow font-display text-[11px] text-[#C65D3A]">{{ t(atelierSignatureKicker) }}</p>
          <h2 class="mt-3 font-serif text-3xl italic sm:text-5xl">{{ t(atelierSignatureTitle) }}</h2>
        </div>
        <span class="atl-numeral hidden font-serif text-5xl text-[#F8FAFC]/15 sm:block">
          {{ String(dishes.length).padStart(2, '0') }}
        </span>
      </div>

      <div class="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(d, i) in dishes"
          :key="d.item.id"
          v-reveal="i"
          class="group flex flex-col"
        >
          <button
            type="button"
            class="relative aspect-[16/10] overflow-hidden rounded-[2px] bg-[#0B0F1A] sm:aspect-[3/4]"
            :aria-label="t(d.item.name)"
            @click="emit('open', d.item)"
          >
            <img
              :src="d.item.image"
              :alt="t(d.item.name)"
              loading="lazy"
              class="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            />
            <span class="pointer-events-none absolute inset-3 border border-[#F8FAFC]/15" aria-hidden="true" />
            <span class="atl-numeral absolute left-4 top-3 font-serif text-2xl text-[#F8FAFC]/80">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
          </button>

          <div class="mt-5 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 class="font-serif text-2xl leading-snug">{{ t(d.item.name) }}</h3>
              <p class="mt-1.5 line-clamp-2 font-serif text-[15px] leading-relaxed text-[#F8FAFC]/55">
                {{ t(d.item.description) }}
              </p>
            </div>
            <span class="shrink-0 font-serif text-xl">{{ fmt(d.item.price) }}<span class="ml-0.5 text-[#C65D3A]">֏</span></span>
          </div>

          <button
            v-if="brand.ordering"
            type="button"
            class="mt-4 self-start border-b border-[#F8FAFC]/40 pb-0.5 font-display text-[10px] uppercase tracking-[0.22em] text-[#F8FAFC] transition-colors hover:border-[#C65D3A] hover:text-[#C65D3A]"
            @click="order.add(d.item.id)"
          >
            Add to table +
          </button>
        </article>
      </div>
    </div>
  </section>
</template>
