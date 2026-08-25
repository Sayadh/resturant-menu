<script setup lang="ts">
// Floating Wi-Fi info button — shared across all 5 public themes, but themed
// per-restaurant via the `theme` prop: each mount passes its own theme key,
// and the button/popover pick up that theme's dark-surface + accent colors
// (same idea as each theme's own basket dock, just parameterized once instead
// of five near-identical components). Sits bottom-right (baskets/tables dock
// bottom-left). Hidden entirely when the restaurant hasn't set a network name.
import { ui } from '~/data/menu'

type ThemeKey = 'aria' | 'atelier' | 'maison' | 'noir' | 'heritage' | 'opaline'

const props = defineProps<{ theme: ThemeKey }>()

// Surface/hover/text/ring lifted from each theme's own floating dock button
// (AriaBasket, AtelierBasketBar, MaisonBasket, NoirBasketBar) so this widget
// reads as part of the same design, not a bolted-on generic control.
const THEMES: Record<ThemeKey, { surface: string; hover: string; text: string; ring: string }> = {
  aria: { surface: '#3E2723', hover: '#5A4038', text: '#FFF9EF', ring: 'rgba(198,154,90,0.35)' },
  atelier: { surface: '#111827', hover: '#1E293B', text: '#F8FAFC', ring: 'rgba(255,255,255,0.10)' },
  maison: { surface: '#541C2E', hover: '#6B2740', text: '#FFFBFC', ring: 'rgba(185,151,104,0.30)' },
  noir: { surface: '#191B1F', hover: '#272A30', text: '#F1EEE8', ring: 'rgba(184,180,172,0.25)' },
  heritage: { surface: '#292A27', hover: '#3A3B37', text: '#FCFBF7', ring: 'rgba(164,123,69,0.30)' },
  opaline: { surface: '#172033', hover: '#222D43', text: '#FFFFFF', ring: 'rgba(216,95,61,0.28)' },
}
const look = computed(() => THEMES[props.theme] ?? THEMES.atelier)
const surfaceStyle = computed(() => ({
  backgroundColor: look.value.surface,
  color: look.value.text,
  '--wifi-hover': look.value.hover,
  '--tw-ring-color': look.value.ring,
}))

const { t } = useLanguage()
const brand = useBrand()

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const toggle = () => { open.value = !open.value }
const close = () => { open.value = false }

const copyPassword = async () => {
  if (!brand.wifiPassword) return
  try {
    await navigator.clipboard.writeText(brand.wifiPassword)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { copied.value = false }, 1600)
  } catch {
    // Clipboard API unavailable/blocked — the password is still selectable text.
  }
}

const onDocClick = (e: MouseEvent) => {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close()
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKey)
  clearTimeout(copiedTimer)
})
</script>

<template>
  <div v-if="brand.wifiName" ref="root" class="fixed bottom-5 right-5 z-40">
    <Transition name="wifi-pop">
      <div
        v-if="open"
        class="wifi-surface absolute bottom-[calc(100%+12px)] right-0 w-72 rounded-2xl p-5 shadow-[0_24px_50px_-18px_rgba(17,24,39,0.75)] ring-1"
        :style="surfaceStyle"
      >
        <div class="flex items-center gap-2 border-b border-white/10 pb-3">
          <svg viewBox="0 0 24 24" class="h-4 w-4 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 8.5a16 16 0 0 1 20 0" />
            <path d="M5.5 12.5a11 11 0 0 1 13 0" />
            <path d="M9 16.5a6 6 0 0 1 6 0" />
            <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
          </svg>
          <p class="text-sm font-semibold tracking-wide">{{ t(ui.wifi) }}</p>
        </div>

        <div class="mt-3.5">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">{{ t(ui.wifiNetwork) }}</p>
          <p class="mt-1 break-words pl-2 text-base font-bold">{{ brand.wifiName }}</p>
        </div>

        <div v-if="brand.wifiPassword" class="mt-3.5">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">{{ t(ui.wifiPasswordLabel) }}</p>
          <div class="mt-1.5 flex items-center justify-between gap-2 rounded-xl bg-white/[0.06] py-2 pl-3 pr-2">
            <p class="break-all font-mono text-base font-bold tracking-wide">{{ brand.wifiPassword }}</p>
            <button
              type="button"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition"
              :class="copied ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 opacity-90 hover:bg-white/20'"
              :aria-label="copied ? t(ui.wifiCopied) : t(ui.wifiCopy)"
              @click="copyPassword"
            >
              <svg v-if="!copied" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
              <svg v-else viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <button
      type="button"
      class="wifi-fab flex h-14 w-14 items-center justify-center rounded-full shadow-[0_24px_50px_-18px_rgba(17,24,39,0.75)] ring-1 transition active:scale-95"
      :style="surfaceStyle"
      :aria-label="t(ui.wifi)"
      :aria-expanded="open"
      @click="toggle"
    >
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2 8.5a16 16 0 0 1 20 0" />
        <path d="M5.5 12.5a11 11 0 0 1 13 0" />
        <path d="M9 16.5a6 6 0 0 1 6 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.wifi-fab:hover {
  background-color: var(--wifi-hover) !important;
}

.wifi-pop-enter-active,
.wifi-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.wifi-pop-enter-from,
.wifi-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
