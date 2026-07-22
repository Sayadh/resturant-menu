<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonProductLayout — Warm & Family premium menu grid.
// Every dish is an elevated, rounded card on warm cream: soft shadow, a large
// rounded photo, friendly serif name, terracotta price and a rounded olive add
// control. Gentle hover lift. Clean, readable, cozy. Data comes from the shared
// order store; the presentation is entirely this theme's.
// ─────────────────────────────────────────────────────────────────────────
import { type MenuCategory, type MenuItem, ui, badgeLabels } from '~/data/menu'
import { vReveal } from '~/themes/maison/animations'

const props = defineProps<{ category: MenuCategory }>()

const { t, lang } = useLanguage()
const order = useOrderStore()
const brand = useBrand() // ordering (cart) = paid plans only

const fmt = (n: number) => n.toLocaleString('fr-FR')
const initial = (item: MenuItem) => t(item.name).trim().charAt(0)
const soldOut = (item: MenuItem) => item.available === false
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="(item, i) in category.items"
      :key="item.id"
      v-reveal="Math.min(i, 5)"
      class="group flex flex-col overflow-hidden rounded-[1.75rem] border border-[#EFE6D5] bg-[#FCF8F0] shadow-[0_24px_44px_-30px_rgba(90,68,51,0.42)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_36px_64px_-30px_rgba(90,68,51,0.55)]"
    >
      <!-- photo -->
      <div class="relative overflow-hidden">
        <img
          v-if="item.image"
          :src="item.image"
          :alt="t(item.name)"
          class="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          :class="soldOut(item) ? 'opacity-60 grayscale' : ''"
        />
        <div
          v-else
          class="flex aspect-[4/3] w-full items-center justify-center"
          style="background: radial-gradient(circle at 50% 35%, #F0E7D5, #E7D6BB)"
          aria-hidden="true"
        >
          <span class="font-serif text-6xl text-[#C4693F]/40">{{ initial(item) }}</span>
        </div>

        <span
          v-if="item.badge"
          class="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#C4693F] px-2.5 py-1 font-sans text-[10px] font-bold tracking-wide text-[#F6F0E4] shadow-sm"
        >
          {{ t(badgeLabels[item.badge].text) }}
        </span>

        <div v-if="soldOut(item)" class="absolute inset-0 flex items-center justify-center bg-[#4A3B2E]/45">
          <span class="rounded-full bg-[#FCF8F0]/90 px-4 py-1.5 font-sans text-[11px] font-bold tracking-wide text-[#4A3B2E]">{{ t(ui.soldOut) }}</span>
        </div>
      </div>

      <!-- body -->
      <div class="flex flex-1 flex-col p-5">
        <h4 class="font-serif text-xl font-semibold leading-snug text-[#3E3125]">{{ t(item.name) }}</h4>
        <p class="mt-2 line-clamp-2 font-sans text-[13px] leading-relaxed text-[#8A7C6B]">{{ t(item.description) }}</p>

        <div class="mt-auto flex items-center justify-between gap-3 pt-5">
          <span class="font-serif text-xl font-bold text-[#C4693F]">
            {{ fmt(item.price) }}<span class="ml-1 text-sm font-semibold text-[#C4693F]/70">{{ ui.currency[lang] }}</span>
          </span>

          <ClientOnly>
            <template v-if="brand.ordering">
              <div v-if="order.qtyOf(item.id) > 0" class="flex items-center gap-1 rounded-full bg-[#F0E7D5] p-1">
                <button type="button" class="grid h-8 w-8 place-items-center rounded-full text-lg font-bold text-[#5A4433] transition hover:bg-white" aria-label="−" @click="order.dec(item.id)">−</button>
                <span class="min-w-5 text-center font-serif text-sm font-bold text-[#4A3B2E]">{{ order.qtyOf(item.id) }}</span>
                <button type="button" class="grid h-8 w-8 place-items-center rounded-full bg-[#8A9466] text-lg font-bold text-[#F6F0E4] transition hover:bg-[#78855A]" aria-label="+" @click="order.add(item.id)">+</button>
              </div>
              <button
                v-else-if="!soldOut(item)"
                type="button"
                class="grid h-11 w-11 place-items-center rounded-full bg-[#8A9466] text-2xl font-bold text-[#F6F0E4] shadow-[0_12px_22px_-10px_rgba(138,148,102,0.9)] transition hover:-translate-y-0.5 hover:bg-[#78855A] active:scale-95"
                aria-label="Add"
                @click="order.add(item.id)"
              >
                +
              </button>
            </template>
          </ClientOnly>
        </div>
      </div>
    </article>
  </div>
</template>
