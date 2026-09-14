<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// ImageCropEditor — modal that lets the admin pick which part of a dish/
// category photo stays inside a 4:3 frame before it's baked into the two
// delivered sizes (1200×900 hi-res, 800×600 standard).
//
// The live preview redraws on a <canvas> using the exact same math as
// `renderCroppedBlob` in ~/utils/image.ts, so what's dragged here is what
// gets baked on Save — no separate CSS-transform approximation to drift
// out of sync.
// ─────────────────────────────────────────────────────────────────────────
import { loadImage, processMenuImage, sampleEdgeColor, type CropState } from '~/utils/image'

const props = defineProps<{
  file: File
  /** Restore a previous crop when re-editing an already-cropped photo. */
  initialCrop?: CropState
}>()
const emit = defineEmits<{
  save: [{ hiRes: Blob; stdRes: Blob; preview: string; crop: CropState }]
  cancel: []
}>()

const { t } = useAdminI18n()

const PREVIEW_W = 320
const PREVIEW_H = 240

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
const MAX_ZOOM = 3

const draw = () => {
  const canvas = canvasEl.value
  const image = img.value
  if (!canvas || !image) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H)

  const imgAspect = image.naturalWidth / image.naturalHeight
  const canvasAspect = PREVIEW_W / PREVIEW_H
  let drawW: number
  let drawH: number
  if (imgAspect > canvasAspect) {
    drawW = PREVIEW_W * crop.zoom
    drawH = drawW / imgAspect
  } else {
    drawH = PREVIEW_H * crop.zoom
    drawW = drawH * imgAspect
  }
  const drawX = (PREVIEW_W - drawW) / 2 + crop.offsetX * crop.zoom
  const drawY = (PREVIEW_H - drawH) / 2 + crop.offsetY * crop.zoom
  ctx.drawImage(image, drawX, drawY, drawW, drawH)
}

watch(() => [crop.offsetX, crop.offsetY, crop.zoom], draw)

onMounted(async () => {
  try {
    img.value = await loadImage(props.file)
    bgColor.value = sampleEdgeColor(img.value)
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
  crop.offsetX = startOffsetX + (e.clientX - dragStartX) / crop.zoom
  crop.offsetY = startOffsetY + (e.clientY - dragStartY) / crop.zoom
}
const onPointerUp = () => {
  dragging.value = false
}

const reset = () => {
  crop.offsetX = 0
  crop.offsetY = 0
  crop.zoom = 1
}

const save = async () => {
  if (!ready.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const { hiRes, stdRes, preview } = await processMenuImage(props.file, { ...crop }, bgColor.value)
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
        class="relative mx-auto overflow-hidden rounded-xl border border-slate-200 shadow-inner"
        :style="{ width: PREVIEW_W + 'px', height: PREVIEW_H + 'px', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerUp"
      >
        <canvas ref="canvasEl" :width="PREVIEW_W" :height="PREVIEW_H" class="block h-full w-full select-none" />
        <!-- 4:3 frame is the canvas itself; a subtle rule-of-thirds grid helps framing -->
        <div class="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
          <div v-for="i in 9" :key="i" class="border border-white/25" />
        </div>
      </div>

      <div class="flex items-center gap-3 px-1">
        <span class="w-12 shrink-0 text-xs font-medium text-slate-500">{{ t('cropZoom') }}</span>
        <input v-model.number="crop.zoom" type="range" :min="MIN_ZOOM" :max="MAX_ZOOM" step="0.01" class="w-full accent-slate-800" />
        <button type="button" class="shrink-0 text-xs font-semibold text-indigo-600 hover:underline" @click="reset">{{ t('cropReset') }}</button>
      </div>

      <p v-if="error" class="text-xs font-medium text-rose-500">{{ error }}</p>
    </div>
    <template #footer>
      <button class="btn-ghost" :disabled="saving" @click="emit('cancel')">{{ t('cropCancel') }}</button>
      <button class="btn-primary" :disabled="!ready || saving" @click="save">{{ saving ? t('cropSaving') : t('cropSave') }}</button>
    </template>
  </AdminModal>
</template>
