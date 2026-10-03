<script setup lang="ts">
import { imgUrl } from '~/utils/image'
import { ui, type MenuCategory, type MenuItem } from '~/data/menu'
const props = defineProps<{ category: MenuCategory }>()
const emit = defineEmits<{ open: [item: MenuItem] }>()
const { t } = useLanguage()

// The category's own uploaded banner wins; fall back to the first dish photo.
// Retina copies first: a wide desktop banner / a 3× phone needs more pixels
// than the standard copy (the standard one stays the fallback).
const banner = computed(() => {
  const c = props.category
  const dish = c.items[0]
  return c.imageHiRes || c.image || dish?.imageHiRes || dish?.image || ''
})
const mobileBanner = computed(() => props.category.mobileImageHiRes || props.category.mobileImage || banner.value)
const iconImage = computed(() => props.category.iconImage || '')
const bannerFailed = ref(false)
watch(banner, () => (bannerFailed.value = false))
// Admin's "banner text colour": 'dark' = dark title on a light scrim, for
// light photos; default 'light' = light title on the dark scrim. Without a
// photo the banner is the dark base, so the light title always applies.
const darkText = computed(() => props.category.bannerTextColor === 'dark' && !!banner.value && !bannerFailed.value)
</script>

<template>
  <section :id="category.id">
    <!-- Category banner card -->
    <div class="group relative h-36 overflow-hidden rounded-card shadow-[0_4px_18px_-6px_rgba(38,56,47,0.16)] sm:h-44">
      <!-- fallback base -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#33473C] to-[#26382F]" />
      <!-- big category emoji watermark when there is no banner photo -->
      <span
        v-if="!banner || bannerFailed"
        class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-25 sm:text-8xl"
        aria-hidden="true"
      >
        {{ category.icon }}
      </span>
      <!-- desktop banner -->
      <img
        v-if="banner && !bannerFailed"
        :src="imgUrl(banner, 1600)"
        :alt="t(category.title)"
        loading="lazy"
        class="absolute inset-0 hidden h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:block"
        @error="bannerFailed = true"
      />
      <!-- mobile banner -->
      <img
        v-if="mobileBanner && !bannerFailed"
        :src="imgUrl(mobileBanner, 1080)"
        :alt="t(category.title)"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:hidden"
        @error="bannerFailed = true"
      />
      <!-- dark gradient overlay for contrast -->
      <div
        class="absolute inset-0 bg-gradient-to-t"
        :class="darkText
          ? 'from-[#FCFBF7]/95 via-[#FCFBF7]/60 to-[#FCFBF7]/10'
          : 'from-[#26382F]/95 via-[#26382F]/50 to-[#26382F]/15'"
      />
      <!-- decorative wheat -->
      <IconWheat
        class="pointer-events-none absolute -right-1 top-1 h-24 w-24 rotate-[14deg] text-[#A47B45] opacity-25"
      />

      <!-- content -->
      <div class="absolute inset-0 flex flex-col justify-end p-5">
        <div class="flex items-center gap-3">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#A47B45]/60 text-xl shadow-sm backdrop-blur-sm sm:h-12 sm:w-12 sm:text-2xl"
            :class="darkText ? 'bg-[#FCFBF7]/50' : 'bg-[#26382F]/40'"
            aria-hidden="true"
          >
            <img loading="lazy" decoding="async" v-if="iconImage" :src="imgUrl(iconImage, 256)" alt="" class="h-full w-full object-cover" />
            <template v-else>{{ category.icon }}</template>
          </span>
          <div class="min-w-0">
            <h2
              class="font-display text-2xl font-bold uppercase leading-tight tracking-[0.12em] sm:text-3xl"
              :class="darkText ? 'text-[#26382F]' : 'text-[#FCFBF7] drop-shadow'"
            >
              {{ t(category.title) }}
            </h2>
            <p class="mt-0.5 font-serif text-sm" :class="darkText ? 'text-[#26382F]/80' : 'text-[#FCFBF7]/80'">
              {{ category.items.length }} {{ t(ui.dishCount) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards grid -->
    <div class="mt-5 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      <MenuCard
        v-for="item in category.items"
        :key="item.id"
        :item="item"
        :icon="category.icon"
        @open="emit('open', $event)"
      />
    </div>
  </section>
</template>
