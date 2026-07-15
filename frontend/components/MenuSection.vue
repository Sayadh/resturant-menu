<script setup lang="ts">
import { ui, type MenuCategory, type MenuItem } from '~/data/menu'
const props = defineProps<{ category: MenuCategory }>()
const emit = defineEmits<{ open: [item: MenuItem] }>()
const { t } = useLanguage()

// The category's own uploaded banner wins; fall back to the first dish photo.
const banner = computed(() => props.category.image || props.category.items[0]?.image || '')
const mobileBanner = computed(() => props.category.mobileImage || banner.value)
const iconImage = computed(() => props.category.iconImage || '')
const bannerFailed = ref(false)
watch(banner, () => (bannerFailed.value = false))
</script>

<template>
  <section :id="category.id">
    <!-- Category banner card -->
    <div class="group relative h-36 overflow-hidden rounded-card shadow-card sm:h-44">
      <!-- fallback base -->
      <div class="absolute inset-0 bg-gradient-to-br from-brown-light to-brown" />
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
        :src="banner"
        :alt="t(category.title)"
        loading="lazy"
        class="absolute inset-0 hidden h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:block"
        @error="bannerFailed = true"
      />
      <!-- mobile banner -->
      <img
        v-if="mobileBanner && !bannerFailed"
        :src="mobileBanner"
        :alt="t(category.title)"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:hidden"
        @error="bannerFailed = true"
      />
      <!-- dark gradient overlay for contrast -->
      <div class="absolute inset-0 bg-gradient-to-t from-brown/95 via-brown/50 to-brown/15" />
      <!-- decorative wheat -->
      <IconWheat
        class="pointer-events-none absolute -right-1 top-1 h-24 w-24 rotate-[14deg] text-caramel opacity-25"
      />

      <!-- content -->
      <div class="absolute inset-0 flex flex-col justify-end p-5">
        <div class="flex items-center gap-3">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-caramel/60 bg-brown/40 text-xl shadow-sm backdrop-blur-sm sm:h-12 sm:w-12 sm:text-2xl"
            aria-hidden="true"
          >
            <img v-if="iconImage" :src="iconImage" alt="" class="h-full w-full object-cover" />
            <template v-else>{{ category.icon }}</template>
          </span>
          <div class="min-w-0">
            <h2
              class="font-display text-2xl font-bold uppercase leading-tight tracking-[0.12em] text-cream drop-shadow sm:text-3xl"
            >
              {{ t(category.title) }}
            </h2>
            <p class="mt-0.5 font-serif text-sm text-cream/80">
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
