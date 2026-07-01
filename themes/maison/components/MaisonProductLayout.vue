<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonProductLayout — a category's dishes presented like a magazine spread.
// Badged "feature" dishes span the full width with a large image; the rest
// use an elegant compact two-column layout. Each entry carries its own
// add / quantity control wired to the shared order store.
// ─────────────────────────────────────────────────────────────────────────
import { type MenuCategory, type MenuItem, ui, badgeLabels } from '~/data/menu'
import { vReveal } from '~/themes/maison/animations'

const props = defineProps<{ category: MenuCategory }>()

const { t, lang } = useLanguage()
const order = useOrderStore()

const fmt = (n: number) => n.toLocaleString('fr-FR')
const initial = (item: MenuItem) => t(item.name).trim().charAt(0)
const isFeature = (item: MenuItem) => !!item.badge
const soldOut = (item: MenuItem) => item.available === false
</script>

<template>
  <div class="grid gap-x-10 gap-y-12 sm:grid-cols-2">
    <article
      v-for="(item, i) in category.items"
      :key="item.id"
      v-reveal="Math.min(i, 4)"
      :class="isFeature(item) ? 'sm:col-span-2' : ''"
    >
      <!-- ── Feature dish (full width) ─────────────────────────────── -->
      <div
        v-if="isFeature(item)"
        class="grid items-center gap-7 sm:grid-cols-2 sm:gap-12"
      >
        <div class="relative">
          <div class="overflow-hidden">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="t(item.name)"
              class="aspect-[5/4] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
              :class="soldOut(item) ? 'opacity-60 grayscale' : ''"
            />
            <div
              v-else
              class="flex aspect-[5/4] w-full items-center justify-center"
              style="background: radial-gradient(circle at 50% 35%, #EFE6D4, #E2D4BC)"
              aria-hidden="true"
            >
              <span class="font-display text-7xl text-[#B08A4F]/40">{{ initial(item) }}</span>
            </div>
          </div>
          <span class="pointer-events-none absolute inset-2.5 border border-[#FBF8F1]/50" aria-hidden="true" />
        </div>

        <div>
          <span class="ms-eyebrow-sm rounded-full border border-[#B08A4F]/40 px-3 py-0.5 font-sans text-[9px] text-[#B08A4F]">
            {{ t(badgeLabels[item.badge!].text) }}
          </span>
          <h4 class="mt-4 font-serif text-3xl leading-tight text-[#241B14] sm:text-4xl">{{ t(item.name) }}</h4>
          <p class="mt-3 font-serif text-lg leading-relaxed text-[#5B5145]">{{ t(item.description) }}</p>
          <div class="mt-6 flex items-center justify-between gap-4">
            <span class="font-serif text-2xl text-[#B08A4F]">{{ fmt(item.price) }}<span class="ml-1 text-lg">{{ ui.currency[lang] }}</span></span>
            <ClientOnly>
              <span v-if="soldOut(item)" class="font-sans text-[11px] tracking-[0.2em] text-[#8C8276]">{{ t(ui.soldOut).toUpperCase() }}</span>
              <div v-else class="flex items-center">
                <div v-if="order.qtyOf(item.id) > 0" class="flex items-center gap-3 border border-[#241B14]/20 px-3 py-2">
                  <button type="button" class="text-lg leading-none text-[#241B14] hover:opacity-60" aria-label="−" @click="order.dec(item.id)">−</button>
                  <span class="min-w-5 text-center font-serif text-[#241B14]">{{ order.qtyOf(item.id) }}</span>
                  <button type="button" class="text-lg leading-none text-[#241B14] hover:opacity-60" aria-label="+" @click="order.add(item.id)">+</button>
                </div>
                <button
                  v-else
                  type="button"
                  class="inline-flex items-center gap-2 bg-[#241B14] px-6 py-2.5 font-sans text-[10px] tracking-[0.22em] text-[#FBF8F1] transition-colors hover:bg-[#B08A4F]"
                  @click="order.add(item.id)"
                >
                  {{ ({ AM: 'ԱՎԵԼԱՑՆԵԼ', EN: 'ADD', RU: 'ДОБАВИТЬ' })[lang] }}
                </button>
              </div>
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- ── Compact dish ──────────────────────────────────────────── -->
      <div v-else class="group flex flex-col">
        <div class="relative overflow-hidden">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="t(item.name)"
            class="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            :class="soldOut(item) ? 'opacity-60 grayscale' : ''"
          />
          <div
            v-else
            class="flex aspect-[4/3] w-full items-center justify-center"
            style="background: radial-gradient(circle at 50% 35%, #EFE6D4, #E2D4BC)"
            aria-hidden="true"
          >
            <span class="font-display text-5xl text-[#B08A4F]/40">{{ initial(item) }}</span>
          </div>
        </div>

        <div class="mt-4 flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h4 class="font-serif text-xl leading-snug text-[#241B14]">{{ t(item.name) }}</h4>
            <p class="mt-1.5 line-clamp-2 font-sans text-[13px] leading-relaxed text-[#8C8276]">{{ t(item.description) }}</p>
          </div>
          <span class="shrink-0 font-serif text-lg text-[#B08A4F]">{{ fmt(item.price) }}<span class="ml-0.5 text-sm">{{ ui.currency[lang] }}</span></span>
        </div>

        <div class="mt-4">
          <ClientOnly>
            <span v-if="soldOut(item)" class="font-sans text-[10px] tracking-[0.2em] text-[#8C8276]">{{ t(ui.soldOut).toUpperCase() }}</span>
            <div v-else class="flex items-center">
              <div v-if="order.qtyOf(item.id) > 0" class="flex items-center gap-3 border border-[#241B14]/15 px-3 py-1.5">
                <button type="button" class="text-base leading-none text-[#241B14] hover:opacity-60" aria-label="−" @click="order.dec(item.id)">−</button>
                <span class="min-w-4 text-center font-serif text-sm text-[#241B14]">{{ order.qtyOf(item.id) }}</span>
                <button type="button" class="text-base leading-none text-[#241B14] hover:opacity-60" aria-label="+" @click="order.add(item.id)">+</button>
              </div>
              <button
                v-else
                type="button"
                class="inline-flex items-center gap-2 border border-[#241B14]/20 px-4 py-1.5 font-sans text-[10px] tracking-[0.2em] text-[#241B14] transition-colors hover:border-[#B08A4F] hover:bg-[#241B14] hover:text-[#FBF8F1]"
                @click="order.add(item.id)"
              >
                {{ ({ AM: 'ԱՎԵԼԱՑՆԵԼ', EN: 'ADD', RU: 'ДОБАВИТЬ' })[lang] }}
                <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
              </button>
            </div>
          </ClientOnly>
        </div>
      </div>
    </article>
  </div>
</template>
