<script setup lang="ts">
// "The Chef's Signatures" — a dark, full-bleed editorial band that breaks the
// bone flow for contrast. Showcases featured (badged) dishes as large plates.
import type { MenuItem } from '~/data/menu'
import { atelierSignatureKicker, atelierSignatureTitle } from '~/themes/atelier/config'
import { vReveal } from '~/themes/atelier/animations'

defineProps<{
  dishes: { item: MenuItem; icon: string }[]
}>()

const emit = defineEmits<{ open: [item: MenuItem] }>()

const { t } = useLanguage()
const order = useOrderStore()
const fmt = (n: number) => n.toLocaleString('hy-AM')
</script>

<template>
  <section class="relative z-[1] bg-[#16130F] text-[#F6F2EA]">
    <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div class="flex items-end justify-between gap-6 border-b border-[#F6F2EA]/15 pb-6">
        <div>
          <p class="atl-eyebrow font-display text-[11px] text-[#A1502E]">{{ t(atelierSignatureKicker) }}</p>
          <h2 class="mt-3 font-serif text-3xl italic sm:text-5xl">{{ t(atelierSignatureTitle) }}</h2>
        </div>
        <span class="atl-numeral hidden font-serif text-5xl text-[#F6F2EA]/15 sm:block">
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
            class="relative aspect-[16/10] overflow-hidden rounded-[2px] bg-[#0E0C09] sm:aspect-[3/4]"
            :aria-label="t(d.item.name)"
            @click="emit('open', d.item)"
          >
            <img
              v-if="d.item.image"
              :src="d.item.image"
              :alt="t(d.item.name)"
              loading="lazy"
              class="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            />
            <span
              v-else
              class="flex h-full w-full items-center justify-center text-5xl text-[#A1502E]"
              aria-hidden="true"
            >{{ d.icon }}</span>
            <span class="pointer-events-none absolute inset-3 border border-[#F6F2EA]/15" aria-hidden="true" />
            <span class="atl-numeral absolute left-4 top-3 font-serif text-2xl text-[#F6F2EA]/80">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
          </button>

          <div class="mt-5 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 class="font-serif text-2xl leading-snug">{{ t(d.item.name) }}</h3>
              <p class="mt-1.5 line-clamp-2 font-serif text-[15px] leading-relaxed text-[#F6F2EA]/55">
                {{ t(d.item.description) }}
              </p>
            </div>
            <span class="shrink-0 font-serif text-xl">{{ fmt(d.item.price) }}<span class="ml-0.5 text-[#A1502E]">֏</span></span>
          </div>

          <button
            type="button"
            class="mt-4 self-start border-b border-[#F6F2EA]/40 pb-0.5 font-display text-[10px] uppercase tracking-[0.22em] text-[#F6F2EA] transition-colors hover:border-[#A1502E] hover:text-[#A1502E]"
            @click="order.add(d.item.id)"
          >
            Add to table +
          </button>
        </article>
      </div>
    </div>
  </section>
</template>
