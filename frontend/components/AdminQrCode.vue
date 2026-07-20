<script setup lang="ts">
// Brandable QR code (qr-code-styling). Only the DESIGN changes — the encoded
// `url` (menus.am/<slug>) is fixed, so the QR always points to the same menu.
// Design choices persist per-restaurant in localStorage. Client-only (DOM lib).
import { useAdminI18n } from '~/composables/useAdminI18n'

const props = defineProps<{ url: string; logo?: string; restaurantId: string }>()
const { t } = useAdminI18n()

type DotType = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded'
type CornerType = 'square' | 'dot' | 'extra-rounded'

const opts = reactive({
  dotColor: '#3E2723',
  bgColor: '#FFFFFF',
  dotStyle: 'rounded' as DotType,
  cornerStyle: 'extra-rounded' as CornerType,
  useLogo: true,
})

const key = computed(() => `menus-qr-${props.restaurantId}`)
const holder = ref<HTMLElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let qr: any = null

function buildConfig() {
  return {
    width: 320,
    height: 320,
    type: 'svg' as const,
    data: props.url, // ← never changes with design
    // Always send `image` (undefined clears it) — omitting the key leaves the
    // previous logo in place on update(), so the toggle wouldn't work.
    image: opts.useLogo && props.logo ? props.logo : undefined,
    margin: 8,
    qrOptions: { errorCorrectionLevel: 'H' as const }, // high ECC → logo-safe
    dotsOptions: { color: opts.dotColor, type: opts.dotStyle },
    backgroundOptions: { color: opts.bgColor },
    cornersSquareOptions: { color: opts.dotColor, type: opts.cornerStyle },
    cornersDotOptions: { color: opts.dotColor },
    imageOptions: { crossOrigin: 'anonymous', margin: 6, imageSize: 0.32 },
  }
}

onMounted(async () => {
  try {
    const saved = localStorage.getItem(key.value)
    if (saved) Object.assign(opts, JSON.parse(saved))
  } catch { /* ignore */ }

  const { default: QRCodeStyling } = await import('qr-code-styling')
  qr = new QRCodeStyling(buildConfig())
  if (holder.value) qr.append(holder.value)

  watch(
    opts,
    () => {
      qr?.update(buildConfig())
      try { localStorage.setItem(key.value, JSON.stringify(opts)) } catch { /* ignore */ }
    },
    { deep: true },
  )
  // Re-encode if the URL/logo ever changes (e.g. logo uploaded).
  watch(() => [props.url, props.logo], () => qr?.update(buildConfig()))
})

const download = (ext: 'png' | 'svg') => qr?.download({ name: 'menus-qr', extension: ext })
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-[auto_1fr]">
    <!-- preview -->
    <div class="flex flex-col items-center gap-3">
      <div ref="holder" class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" />
      <div class="flex gap-2">
        <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" @click="download('png')">{{ t('downloadPng') }}</button>
        <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="download('svg')">{{ t('downloadSvg') }}</button>
      </div>
    </div>

    <!-- controls -->
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="lbl">{{ t('qrColor') }}</span>
          <input v-model="opts.dotColor" type="color" class="mt-1 h-10 w-full cursor-pointer rounded-lg border border-slate-300" />
        </label>
        <label class="block">
          <span class="lbl">{{ t('qrBackground') }}</span>
          <input v-model="opts.bgColor" type="color" class="mt-1 h-10 w-full cursor-pointer rounded-lg border border-slate-300" />
        </label>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="lbl">{{ t('qrStyle') }}</span>
          <select v-model="opts.dotStyle" class="inp mt-1">
            <option value="square">■ {{ t('qrSquare') }}</option>
            <option value="rounded">▢ {{ t('qrRounded') }}</option>
            <option value="dots">• {{ t('qrDots') }}</option>
            <option value="classy">◆ {{ t('qrClassy') }}</option>
            <option value="extra-rounded">◉ {{ t('qrExtraRounded') }}</option>
          </select>
        </label>
        <label class="block">
          <span class="lbl">{{ t('qrCorners') }}</span>
          <select v-model="opts.cornerStyle" class="inp mt-1">
            <option value="square">{{ t('qrSquare') }}</option>
            <option value="dot">{{ t('qrDots') }}</option>
            <option value="extra-rounded">{{ t('qrExtraRounded') }}</option>
          </select>
        </label>
      </div>
      <label v-if="logo" class="flex items-center justify-between text-sm">
        <span>{{ t('qrLogo') }}</span>
        <input v-model="opts.useLogo" type="checkbox" class="h-4 w-4" />
      </label>
      <p class="text-xs text-slate-400">{{ t('qrHint') }}</p>
    </div>
  </div>
</template>
