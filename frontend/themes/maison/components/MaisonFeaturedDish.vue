<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonFeaturedDish — an almost full-width editorial "article" for a single
// dish. Used for Today's Recommendation and the Chef's Selection. Image on one
// side, generous serif typography on the other; the price is part of the
// composition. Alternates sides via `reversed`, and supports a dark tone for
// the chef's band. Reads the order store directly for add / qty.
// ─────────────────────────────────────────────────────────────────────────
import { type MenuItem, ui, badgeLabels } from '~/data/menu'
import { maisonOrder } from '~/themes/maison/config'
import { vReveal, vParallax } from '~/themes/maison/animations'

const props = withDefaults(
  defineProps<{
    item: MenuItem
    eyebrow?: string
    note?: string
    reversed?: boolean
    tone?: 'light' | 'dark'
    index?: number
  }>(),
  { reversed: false, tone: 'light', index: 0 },
)

const { t, lang } = useLanguage()
const order = useOrderStore()

const qty = computed(() => order.qtyOf(props.item.id))
const price = computed(() => props.item.price.toLocaleString('fr-FR'))
const initial = computed(() => t(props.item.name).trim().charAt(0))

const isDark = computed(() => props.tone === 'dark')
</script>

<template>
  <article
    class="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
    :class="reversed ? 'lg:[&>*:first-child]:order-2' : ''"
  >
    <!-- Image -->
    <div v-reveal class="relative">
      <div class="ms-img-reveal overflow-hidden rounded-[2rem]">
        <img
          v-if="item.image"
          v-parallax="22"
          :src="item.image"
          :alt="t(item.name)"
          class="aspect-[5/4] w-full scale-110 object-cover"
        />
        <div
          v-else
          class="flex aspect-[5/4] w-full items-center justify-center"
          :style="{
            background: isDark
              ? 'radial-gradient(circle at 50% 35%, #4A3829, #55402E)'
              : 'radial-gradient(circle at 50% 35%, #F0E7D5, #E7D6BB)',
          }"
          aria-hidden="true"
        >
          <span
            class="font-display text-7xl"
            :class="isDark ? 'text-[#E0B27C]/45' : 'text-[#C4693F]/40'"
          >{{ initial }}</span>
        </div>
      </div>
      <span
        class="pointer-events-none absolute inset-3 border"
        :class="isDark ? 'border-[#E0B27C]/25' : 'border-[#FCF8F0]/50'"
        aria-hidden="true"
      />
    </div>

    <!-- Copy -->
    <div class="max-w-lg" :class="reversed ? 'lg:pl-4' : 'lg:pr-4'">
      <div v-reveal="1" class="flex items-center gap-3">
        <p v-if="eyebrow" class="ms-eyebrow font-sans text-[11px]" :class="isDark ? 'text-[#E0B27C]' : 'text-[#C4693F]'">
          {{ eyebrow }}
        </p>
        <span
          v-if="item.badge"
          class="ms-eyebrow-sm rounded-full border px-2.5 py-0.5 font-sans text-[9px]"
          :class="isDark ? 'border-[#E0B27C]/40 text-[#E0B27C]' : 'border-[#C4693F]/40 text-[#C4693F]'"
        >
          {{ t(badgeLabels[item.badge].text) }}
        </span>
      </div>

      <h3
        v-reveal="1"
        class="mt-4 text-balance font-serif text-4xl leading-[1.05] sm:text-5xl"
        :class="isDark ? 'text-[#FCF8F0]' : 'text-[#4A3B2E]'"
      >
        {{ t(item.name) }}
      </h3>

      <p
        v-reveal="2"
        class="mt-5 font-serif text-lg leading-relaxed"
        :class="isDark ? 'text-[#FCF8F0]/70' : 'text-[#6E6152]'"
      >
        {{ t(item.description) }}
      </p>

      <p v-if="note" v-reveal="2" class="mt-4 font-sans text-[12px] italic" :class="isDark ? 'text-[#E0B27C]/80' : 'text-[#8A7C6B]'">
        {{ note }}
      </p>

      <!-- Price + action -->
      <div v-reveal="3" class="mt-8 flex items-center gap-6">
        <span class="font-serif text-3xl" :class="isDark ? 'text-[#E0B27C]' : 'text-[#C4693F]'">
          {{ price }}<span class="ml-1 text-xl">{{ ui.currency[lang] }}</span>
        </span>

        <!-- Stepper / Add -->
        <div class="flex items-center">
          <Transition name="ms-fade" mode="out-in">
            <div
              v-if="qty > 0"
              key="stepper"
              class="flex items-center gap-4 border px-4 py-2.5"
              :class="isDark ? 'border-[#E0B27C]/40' : 'border-[#55402E]/20'"
            >
              <button
                type="button"
                class="text-lg leading-none transition-opacity hover:opacity-60"
                :class="isDark ? 'text-[#FCF8F0]' : 'text-[#4A3B2E]'"
                aria-label="−"
                @click="order.dec(item.id)"
              >−</button>
              <span class="min-w-5 text-center font-serif text-lg" :class="isDark ? 'text-[#FCF8F0]' : 'text-[#4A3B2E]'">{{ qty }}</span>
              <button
                type="button"
                class="text-lg leading-none transition-opacity hover:opacity-60"
                :class="isDark ? 'text-[#FCF8F0]' : 'text-[#4A3B2E]'"
                aria-label="+"
                @click="order.add(item.id)"
              >+</button>
            </div>
            <button
              v-else
              key="add"
              type="button"
              class="group inline-flex items-center gap-3 px-7 py-3 font-sans text-[11px] tracking-[0.24em] transition-colors duration-400"
              :class="isDark
                ? 'border border-[#E0B27C] text-[#E0B27C] hover:bg-[#E0B27C] hover:text-[#4A3B2E]'
                : 'bg-[#55402E] text-[#FCF8F0] hover:bg-[#C4693F]'"
              @click="order.add(item.id)"
            >
              {{ t(maisonOrder.add).toUpperCase() }}
              <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke-linecap="round" />
              </svg>
            </button>
          </Transition>
        </div>
      </div>
    </div>
  </article>
</template>
