<script setup lang="ts">
import { ui, type MenuItem } from '~/data/menu'

const props = defineProps<{ item: MenuItem }>()
const emit = defineEmits<{ open: [item: MenuItem] }>()
const { t } = useLanguage()
const { add, decrement, qtyOf } = useOrder()
const { isFavorite, toggle } = useFavorites()

const formattedPrice = computed(() => props.item.price.toLocaleString('hy-AM'))
const qty = computed(() => qtyOf(props.item.id))
const fav = computed(() => isFavorite(props.item.id))
</script>

<template>
  <article
    class="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-card-hover"
  >
    <!-- Image (4:3) with zoomable lightbox trigger -->
    <div class="relative aspect-[4/3] w-full overflow-hidden">
      <button
        type="button"
        class="block h-full w-full"
        :aria-label="t(item.name)"
        @click="emit('open', item)"
      >
        <img
          :src="item.image"
          :alt="t(item.name)"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      </button>

      <span v-if="item.badge" class="absolute left-3 top-3">
        <MenuBadge :badge="item.badge" />
      </span>

      <!-- Favorite -->
      <button
        type="button"
        class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 shadow-sm backdrop-blur transition active:scale-90"
        :class="fav ? 'text-[#C0492F]' : 'text-brown/60 hover:text-[#C0492F]'"
        :aria-pressed="fav"
        :aria-label="t(ui.favorites)"
        @click="toggle(item.id)"
      >
        <IconHeart class="h-5 w-5" :filled="fav" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4">
      <h3 class="font-serif text-xl font-semibold leading-snug text-brown">
        {{ t(item.name) }}
      </h3>
      <p class="mt-1 line-clamp-2 font-serif text-[15px] leading-relaxed text-brown-soft">
        {{ t(item.description) }}
      </p>

      <div class="mt-4 flex items-center justify-between gap-2 pt-1">
        <p class="font-display text-xl font-bold tracking-wide text-brown">
          {{ formattedPrice }}
          <span class="text-caramel-dark">{{ ui.currency.AM }}</span>
        </p>

        <!-- Add / quantity stepper -->
        <Transition name="swap" mode="out-in">
          <div
            v-if="qty > 0"
            key="stepper"
            class="flex items-center gap-1 rounded-pill bg-caramel/15 p-1"
          >
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-card text-brown shadow-sm transition active:scale-90"
              :aria-label="'-'"
              @click="decrement(item.id)"
            >
              <IconMinus class="h-4 w-4" />
            </button>
            <span class="min-w-[1.25rem] text-center font-display text-base font-bold text-brown">
              {{ qty }}
            </span>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-caramel text-cream shadow-sm transition active:scale-90"
              :aria-label="t(ui.add)"
              @click="add(item)"
            >
              <IconPlus class="h-4 w-4" />
            </button>
          </div>

          <button
            v-else
            key="add"
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-caramel text-cream shadow-pill transition hover:bg-caramel-dark active:scale-90"
            :aria-label="t(ui.add)"
            @click="add(item)"
          >
            <IconPlus class="h-5 w-5" />
          </button>
        </Transition>
      </div>
    </div>
  </article>
</template>

<style scoped>
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
