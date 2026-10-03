<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// ImageCropEditor — modal that lets the admin pick which part of a photo
// stays inside the frame before it's baked into the two delivered sizes:
//   • preset 'product'      — 4:3 dish photo (1200×900 + 800×600)
//   • preset 'banner'       — 16:5 category desktop banner (1600×500 + 960×300)
//   • preset 'mobileBanner' — 4:3 category mobile banner (1200×900 + 800×600)
//
// The live preview draws with `drawCropped` from ~/utils/image.ts — the same
// function that bakes the blobs — so what's framed here is what gets saved.
// ─────────────────────────────────────────────────────────────────────────
import { CROP_PRESETS, CROP_REF_W, drawCropped, loadImage, processMenuImage, sampleEdgeColor, type CropPreset, type CropState } from '~/utils/image'

const props = defineProps<{
  file: File
  /** Restore a previous crop when re-editing an already-cropped photo. */
  initialCrop?: CropState
  /** Frame shape; defaults to the 4:3 product photo. */
  preset?: CropPreset
}>()
const emit = defineEmits<{
  save: [{ hiRes: Blob; stdRes: Blob; preview: string; crop: CropState }]
  cancel: []
}>()

const { t } = useAdminI18n()

const preset = computed<CropPreset>(() => props.preset ?? 'product')
// Canvas resolution; on screen it shrinks to the modal width if needed
// (pointer deltas are converted with the element's real width below).
const PREVIEW_W = computed(() => (preset.value === 'banner' ? 464 : 320))
const PREVIEW_H = computed(() => Math.round(PREVIEW_W.value / CROP_PRESETS[preset.value].ratio))
const frameEl = ref<HTMLElement | null>(null)

const canvasEl = ref<HTMLCanvasElement | null>(null)
const img = ref<HTMLImageElement | null>(null)
const bgColor = ref('#F5F5F2')
const crop = reactive<CropState>({
  offsetX: props.initialCrop?.offsetX ?? 0,
  offsetY: props.initialCrop?.offsetY ?? 0,
  zoom: props.initialCrop?.zoom ?? 1,
})
const ready = ref(false)
const saving = ref(false)
const error = ref('')

// Bounds so the photo can't be dragged/zoomed until it leaves the frame
// empty on a side — computed once the image is loaded.
const MIN_ZOOM = 0.6
// Zoom at which the photo just fills the frame (zoom 1 = whole photo fits).
const coverZoom = ref(1)
const MAX_ZOOM = computed(() => Math.max(3, coverZoom.value * 2))
// A banner starts filled edge to edge; a dish photo starts whole (bg-filled).
const defaultZoom = () => (CROP_PRESETS[preset.value].fill ? coverZoom.value : 1)
// Tells the admin which shape they are framing (a dish needs no note).
const frameNote = computed(() =>
  preset.value === 'banner' ? t('cropFrameBanner') : preset.value === 'mobileBanner' ? t('cropFrameMobile') : '',
)

const draw = () => {
  const canvas = canvasEl.value
  const image = img.value
  if (!canvas || !image) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  drawCropped(ctx, image, crop, PREVIEW_W.value, PREVIEW_H.value, bgColor.value)
}

watch(() => [crop.offsetX, crop.offsetY, crop.zoom], draw)

onMounted(async () => {
  try {
    img.value = await loadImage(props.file)
    bgColor.value = sampleEdgeColor(img.value)
    const imgRatio = img.value.naturalWidth / img.value.naturalHeight
    const frameRatio = CROP_PRESETS[preset.value].ratio
    coverZoom.value = Math.max(imgRatio / frameRatio, frameRatio / imgRatio)
    if (!props.initialCrop) crop.zoom = defaultZoom()
    ready.value = true
    await nextTick()
    draw()
  } catch {
    error.value = t('cropFailed')
  }
})

// ── drag to pan ────────────────────────────────────────────────────────
const dragging = ref(false)
let dragStartX = 0
let dragStartY = 0
let startOffsetX = 0
let startOffsetY = 0

const onPointerDown = (e: PointerEvent) => {
  if (!ready.value) return
  dragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  startOffsetX = crop.offsetX
  startOffsetY = crop.offsetY
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}
const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value) return
  // Screen px → CROP_REF_W-frame px (the unit a CropState is stored in).
  const toRef = CROP_REF_W / (frameEl.value?.clientWidth || PREVIEW_W.value)
  crop.offsetX = startOffsetX + ((e.clientX - dragStartX) * toRef) / crop.zoom
  crop.offsetY = startOffsetY + ((e.clientY - dragStartY) * toRef) / crop.zoom
}
const onPointerUp = () => {
  dragging.value = false
}

const reset = () => {
  crop.offsetX = 0
  crop.offsetY = 0
  crop.zoom = defaultZoom()
}

const save = async () => {
  if (!ready.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const { hiRes, stdRes, preview } = await processMenuImage(props.file, { ...crop }, bgColor.value, preset.value)
    emit('save', { hiRes, stdRes, preview, crop: { ...crop } })
  } catch {
    error.value = t('cropFailed')
    saving.value = false
  }
}
</script>

<template>
  <AdminModal :title="t('cropPhoto')" @close="emit('cancel')">
    <div class="space-y-3">
      <p class="text-xs text-slate-500">{{ t('cropHint') }}</p>

      <div
        ref="frameEl"
        class="relative mx-auto overflow-hidden rounded-xl border border-slate-200 shadow-inner"
        :style="{
          width: `min(100%, ${PREVIEW_W}px)`,
          aspectRatio: `${PREVIEW_W} / ${PREVIEW_H}`,
          touchAction: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
        }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerUp"
      >
        <canvas ref="canvasEl" :width="PREVIEW_W" :height="PREVIEW_H" class="block h-full w-full select-none" />
        <!-- the frame is the canvas itself; a subtle rule-of-thirds grid helps framing -->
        <div class="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
          <div v-for="i in 9" :key="i" class="border border-white/25" />
        </div>
      </div>

      <p v-if="frameNote" class="text-center text-[11px] text-slate-400">{{ frameNote }}</p>

      <div class="flex items-center gap-3 px-1">
        <span class="shrink-0 whitespace-nowrap text-xs font-medium text-slate-500">{{ t('cropZoom') }}</span>
        <input v-model.number="crop.zoom" type="range" :min="MIN_ZOOM" :max="MAX_ZOOM" step="0.01" class="w-full accent-slate-800" />
        <button type="button" class="shrink-0 text-xs font-semibold text-indigo-600 hover:underline" @click="reset">{{ t('cropReset') }}</button>
      </div>

      <p v-if="error" class="text-xs font-medium text-rose-500">{{ error }}</p>
    </div>
    <!-- Utilities, not .btn-*: those live in admin.vue's SCOPED style and don't reach this component. -->
    <template #footer>
      <button type="button" class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" :disabled="saving" @click="emit('cancel')">{{ t('cropCancel') }}</button>
      <button type="button" class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!ready || saving" @click="save">{{ saving ? t('cropSaving') : t('cropSave') }}</button>
    </template>
  </AdminModal>
</template>
