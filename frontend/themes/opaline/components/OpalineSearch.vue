<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineSearch — a porcelain sheet over the whole menu, opened from the
// header. One large serif field and nothing else: no sections, no categories,
// just the dishes that match, as the same cards the menu uses (price, badges,
// sold-out and the order controls behave exactly as they do in a category).
//
// Matching is done by the backend through useMenuSearch. Picking a dish opens
// the shared product detail ABOVE this sheet (z-70 > z-60); closing it brings
// the guest back to their results.
// ─────────────────────────────────────────────────────────────────────────
import { ui, type MenuItem } from '~/data/menu'
import { opalineClose, opalineSearch } from '~/themes/opaline/config'
import OpalineProductCard from './OpalineProductCard.vue'

const props = defineProps<{
  open: boolean
  /** Another overlay (the dish detail) sits on top — Escape belongs to it. */
  blocked?: boolean
}>()

const emit = defineEmits<{ close: []; open: [item: MenuItem] }>()

const { t } = useLanguage()

const query = ref('')
const field = ref<HTMLInputElement | null>(null)
const { active, hits, pending, ready } = useMenuSearch(query)

const clear = () => {
  query.value = ''
  field.value?.focus()
}

// Capture phase on purpose: it runs BEFORE the dish detail's own Escape
// listener. Otherwise the detail closes first, Vue flushes in the microtask
// between the two listeners, `blocked` turns false, and one Escape would
// close both the detail and this sheet.
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !props.blocked) emit('close')
}

watch(
  () => props.open,
  async (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      window.addEventListener('keydown', onKey, true)
      await nextTick()
      field.value?.focus()
    } else {
      window.removeEventListener('keydown', onKey, true)
      query.value = ''
    }
  },
)

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey, true)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="op-search">
      <div
        v-if="open"
        class="opaline-theme fixed inset-0 z-[60] flex flex-col bg-[#FAFAF8]"
        role="dialog"
        aria-modal="true"
        :aria-label="t(opalineSearch.title)"
      >
        <!-- The field -->
        <div class="relative border-b border-[#E2E5E8] bg-[#FAFAF8]">
          <div class="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5 sm:px-8 sm:py-5">
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5 shrink-0 text-[#A1A6B0]"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>

            <input
              ref="field"
              v-model="query"
              type="search"
              inputmode="search"
              enterkeyhint="search"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              maxlength="64"
              :placeholder="t(ui.searchPlaceholder)"
              :aria-label="t(ui.searchPlaceholder)"
              class="op-serif min-w-0 flex-1 bg-transparent text-[20px] leading-tight text-[#172033] outline-none placeholder:text-[#A1A6B0] sm:text-[26px] [&::-webkit-search-cancel-button]:hidden"
            />

            <button
              v-if="query"
              type="button"
              class="op-label shrink-0 rounded-full px-2 py-1.5 text-[9px] text-[#747D90] transition hover:text-[#172033] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
              @click="clear"
            >
              {{ t(opalineSearch.clear) }}
            </button>

            <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#E2E5E8] bg-[#FFFFFF] text-[#172033] transition hover:border-[#CCD1D7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
              :aria-label="t(opalineClose)"
              @click="emit('close')"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <!-- A thin coral thread while the kitchen looks -->
          <span v-if="pending" class="absolute inset-x-0 bottom-[-1px] h-px overflow-hidden" aria-hidden="true">
            <span class="op-search-thread block h-px w-1/3 bg-[#D85F3D]" />
          </span>
        </div>

        <!-- The dishes -->
        <div class="flex-1 overflow-y-auto overscroll-contain">
          <div class="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8 sm:pt-8">
            <p v-if="!active" class="op-sans py-16 text-center text-[14px] text-[#747D90]">
              {{ t(opalineSearch.hint) }}
            </p>

            <template v-else>
              <!-- First answer on its way -->
              <div v-if="pending && !hits.length" class="grid grid-cols-6 gap-3 sm:gap-5 lg:grid-cols-12" aria-hidden="true">
                <div
                  v-for="n in 3"
                  :key="n"
                  class="col-span-6 h-72 animate-pulse rounded-[18px] border border-[#E2E5E8] bg-[#FFFFFF] sm:col-span-3 lg:col-span-4"
                />
              </div>

              <template v-else-if="hits.length">
                <p class="op-label text-[9px] text-[#A1A6B0]">{{ hits.length }} {{ t(opalineSearch.found) }}</p>
                <div
                  class="mt-4 grid grid-cols-6 gap-3 transition-opacity duration-200 sm:gap-5 lg:grid-cols-12"
                  :class="{ 'opacity-60': pending }"
                  :aria-busy="pending"
                >
                  <OpalineProductCard
                    v-for="h in hits"
                    :key="h.item.id"
                    :item="h.item"
                    :class="
                      h.item.showImage === false
                        ? 'col-span-3 sm:col-span-2 lg:col-span-3'
                        : 'col-span-6 sm:col-span-3 lg:col-span-4'
                    "
                    @open="emit('open', $event)"
                  />
                </div>
              </template>

              <p v-else-if="ready" class="op-serif py-16 text-center text-[18px] text-[#747D90]">
                {{ t(ui.noResults) }}
              </p>
            </template>

            <p class="sr-only" aria-live="polite">{{ active && ready ? `${hits.length} ${t(opalineSearch.found)}` : '' }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.op-search-enter-active,
.op-search-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.op-search-enter-from,
.op-search-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.op-search-thread {
  animation: op-search-thread 1.1s ease-in-out infinite;
}
@keyframes op-search-thread {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(300%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .op-search-enter-active,
  .op-search-leave-active {
    transition: none;
  }
  .op-search-thread {
    animation: none;
  }
}
</style>
