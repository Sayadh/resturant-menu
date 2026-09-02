<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// NoirProductCard — a graphite plate on obsidian. Photography keeps its own
// colour (no filters); depth comes from the layered blacks and a hairline
// border. Dishes with no photo simply render without the image block.
// ─────────────────────────────────────────────────────────────────────────
import { ui, type MenuItem } from '~/data/menu'
import { visibleBadges } from '~/data/badges'
import { noirAdd } from '~/themes/noir/config'

const props = defineProps<{ item: MenuItem }>()

// Up to two badges per card — catalogue order decides which two.
const badges = computed(() => visibleBadges(props.item))
const emit = defineEmits<{ open: [item: MenuItem] }>()

const { t } = useLanguage()
const order = useOrderStore()
const brand = useBrand() // ordering (cart) = paid plans only

const fmt = (n: number) => n.toLocaleString('hy-AM')
const soldOut = computed(() => props.item.available === false)
// `showImage: false` is the admin saying this dish shows NO picture at all --
// so the media block is skipped entirely, placeholder included. When it is on
// but no file was uploaded, the theme's usual placeholder still appears.
const hasImage = computed(() => props.item.showImage !== false && !!props.item.image)
</script>

<template>
  <article
    class="group flex flex-col overflow-hidden rounded-[14px] border border-[#303339] bg-[#191B1F] shadow-[0_18px_38px_-26px_rgba(0,0,0,0.85)] transition-colors duration-300 hover:border-[#A9A49B]/60"
    :class="{ 'opacity-70': soldOut, 'self-start': !hasImage }"
  >
    <!-- Photograph (rendered only when the dish actually has one) -->
    <div v-if="hasImage" class="relative">
      <button
        type="button"
        class="block aspect-[4/3] w-full overflow-hidden"
        :aria-label="t(item.name)"
        @click="emit('open', item)"
      >
        <img
          :src="item.image"
          :alt="t(item.name)"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          :class="{ grayscale: soldOut }"
        />
      </button>

      <div v-if="badges.length" class="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
        <span
          v-for="b in badges"
          :key="b.key"
          class="nr-eyebrow-sm rounded-full border border-[#B8B4AC]/45 bg-[#0B0C0E]/80 px-2.5 py-1 font-sans text-[9px] text-[#D0CBC1] backdrop-blur-sm"
        >
          {{ t(b.text) }}
        </span>
      </div>

      <div v-if="soldOut" class="absolute inset-0 flex items-center justify-center bg-[#0B0C0E]/60">
        <span class="nr-eyebrow-sm rounded-full border border-[#A45B5B]/60 bg-[#0B0C0E]/85 px-3 py-1 font-sans text-[9px] text-[#A45B5B]">
          {{ t(ui.soldOut) }}
        </span>
      </div>
    </div>

    <!-- Copy -->
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <!-- badge / sold-out kept visible on image-less cards -->
      <div v-if="!hasImage && (badges.length || soldOut)" class="mb-2.5 flex flex-wrap items-center gap-2">
        <span
          v-for="b in badges"
          :key="b.key"
          class="nr-eyebrow-sm rounded-full border border-[#B8B4AC]/45 px-2.5 py-0.5 font-sans text-[9px] text-[#D0CBC1]"
        >{{ t(b.text) }}</span>
        <span
          v-if="soldOut"
          class="nr-eyebrow-sm rounded-full border border-[#A45B5B]/60 px-2.5 py-0.5 font-sans text-[9px] text-[#A45B5B]"
        >{{ t(ui.soldOut) }}</span>
      </div>

      <button
        type="button"
        class="text-left font-serif text-lg leading-snug text-[#F1EEE8] transition-colors group-hover:text-[#FFFFFF] sm:text-xl"
        @click="emit('open', item)"
      >
        {{ t(item.name) }}
      </button>

      <p class="mt-2 line-clamp-2 font-serif text-[14px] leading-relaxed text-[#A8A8A5]">
        {{ t(item.description) }}
      </p>

      <div class="mt-auto flex items-center justify-between gap-3 pt-5">
        <span class="nr-numeral font-serif text-xl text-[#D0CBC1]">
          {{ fmt(item.price) }}<span class="ml-1 text-sm text-[#777A7E]">{{ ui.currency.AM }}</span>
        </span>

        <!-- Add / stepper (ordering = paid plans only) -->
        <ClientOnly>
          <template v-if="brand.ordering">
            <div
              v-if="order.qtyOf(item.id) > 0"
              class="flex items-center gap-1 rounded-full border border-[#303339] bg-[#121417] p-1"
            >
              <button
                type="button"
                class="grid h-7 w-7 place-items-center rounded-full text-base leading-none text-[#A8A8A5] transition hover:bg-[#272A30] hover:text-[#F1EEE8]"
                aria-label="−"
                @click="order.dec(item.id)"
              >−</button>
              <span class="nr-numeral min-w-5 text-center font-serif text-sm text-[#F1EEE8]">{{ order.qtyOf(item.id) }}</span>
              <button
                type="button"
                class="grid h-7 w-7 place-items-center rounded-full bg-[#B8B4AC] text-base leading-none text-[#0B0C0E] transition hover:bg-[#D0CBC1] active:bg-[#A7A39B]"
                aria-label="+"
                @click="order.add(item.id)"
              >+</button>
            </div>
            <button
              v-else-if="!soldOut"
              type="button"
              class="nr-eyebrow-sm rounded-full border border-[#303339] px-4 py-2 font-sans text-[9px] text-[#F1EEE8] transition hover:border-[#B8B4AC] hover:bg-[#272A30] active:bg-[#30333A] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
              @click="order.add(item.id)"
            >
              {{ t(noirAdd) }}
            </button>
          </template>
        </ClientOnly>
      </div>
    </div>
  </article>
</template>
