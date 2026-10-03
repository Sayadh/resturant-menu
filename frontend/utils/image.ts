// ─────────────────────────────────────────────────────────────────────────
// Delivery-size images.
//
// Nothing resizes an upload: whatever a restaurant picks from their phone is
// stored as-is and sent to every guest, so one 4 MB photo becomes 4 MB on
// every phone that opens the menu. Supabase Storage can render a resized copy
// on the fly, so the SIZE is decided here, at the point of display, where the
// needed width is actually known.
//
// Anything that is not a Supabase public object (an external URL a tenant
// pasted, a local asset) is returned untouched.
// ─────────────────────────────────────────────────────────────────────────
const OBJECT = '/storage/v1/object/public/'
const RENDER = '/storage/v1/render/image/public/'

/**
 * @param width  CSS pixels of the box the image fills, doubled for retina by
 *               the caller's choice of value (a 300px card asks for 600).
 */
export const imgUrl = (url: string | null | undefined, width: number, quality = 75): string => {
  if (!url || !url.includes(OBJECT)) return url ?? ''
  const [base] = url.split('?')
  return `${base.replace(OBJECT, RENDER)}?width=${width}&quality=${quality}`
}

// ─────────────────────────────────────────────────────────────────────────
// Multi-resolution image processing (product 4:3 / category banners 16:5 + 4:3).
//
// When an admin uploads a photo, the browser generates TWO versions:
//   • 1200×900  (hi-res, for retina / detail modals)
//   • 800×600   (standard, for cards on normal screens)
// Both are WebP. The original is never sent to guests — only processed copies.
// ─────────────────────────────────────────────────────────────────────────

/** Load a File into an HTMLImageElement (client only). */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')) }
    img.src = url
  })
}

/** Load an image from a data-URL or object-URL string. */
export function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image decode failed'))
    img.src = src
  })
}

/**
 * Frame presets for the crop editor — each photo is framed AND baked in the
 * shape it is shown in, otherwise the display box re-crops it and the
 * admin's framing is lost:
 *   • product      — 4:3 dish card
 *   • banner       — category desktop banner, wide 16:5 (admin label 1600×500)
 *   • mobileBanner — category mobile banner, 4:3 (admin label 800×600)
 * `fill`: a banner starts filled edge to edge; a dish photo starts whole on a
 * soft background (zoom 1), as it always has.
 */
export const CROP_PRESETS = {
  product: { ratio: 4 / 3, hiRes: [1200, 900], stdRes: [800, 600], fill: false },
  banner: { ratio: 16 / 5, hiRes: [1600, 500], stdRes: [960, 300], fill: true },
  mobileBanner: { ratio: 4 / 3, hiRes: [1200, 900], stdRes: [800, 600], fill: true },
} as const
export type CropPreset = keyof typeof CROP_PRESETS

/**
 * Offsets are stored in pixels of a frame CROP_REF_W wide (the original
 * 320px editor canvas), whatever size the frame is actually drawn or baked
 * at — so a stored crop means the same framing in the editor and in every
 * delivered size.
 */
export const CROP_REF_W = 320

/** Crop state produced by the crop editor. */
export interface CropState {
  /** Offset of the image center relative to the frame center, in CROP_REF_W-frame pixels. */
  offsetX: number
  offsetY: number
  /** Zoom factor (1 = fit, >1 = crop in, <1 = zoom out with bg fill). */
  zoom: number
}

/**
 * Draw `img` into a `width × height` frame with the given crop. Shared by the
 * editor's live canvas and the baked blobs, so the preview IS the result.
 * At zoom 1 the whole image fits ("contain"); the rest is `bgColor`.
 */
export function drawCropped(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  crop: CropState,
  width: number,
  height: number,
  bgColor: string,
): void {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  const imgAspect = img.naturalWidth / img.naturalHeight
  let drawW: number, drawH: number
  if (imgAspect > width / height) {
    drawW = width * crop.zoom
    drawH = drawW / imgAspect
  } else {
    drawH = height * crop.zoom
    drawW = drawH * imgAspect
  }
  // Offsets are in CROP_REF_W-frame pixels → scale to this frame.
  const k = (width / CROP_REF_W) * crop.zoom
  const drawX = (width - drawW) / 2 + crop.offsetX * k
  const drawY = (height - drawH) / 2 + crop.offsetY * k
  ctx.drawImage(img, drawX, drawY, drawW, drawH)
}

/**
 * Render a cropped WebP blob from an image + crop state.
 * The image is drawn at the given zoom / offset into a canvas of `width × height`.
 * If the image doesn't fill the canvas (zoom < 1), the remaining area is filled
 * with `bgColor` (a soft pastel sampled from the image edges).
 */
export async function renderCroppedBlob(
  img: HTMLImageElement,
  crop: CropState,
  width: number,
  height: number,
  quality: number,
  bgColor = '#F5F5F2',
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  drawCropped(ctx, img, crop, width, height, bgColor)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      'image/webp',
      quality,
    )
  })
}

/**
 * Process a raw upload into the two delivered WebP sizes of `preset`
 * (see CROP_PRESETS) + a small preview.
 */
export async function processMenuImage(
  file: File,
  crop: CropState = { offsetX: 0, offsetY: 0, zoom: 1 },
  bgColor = '#F5F5F2',
  preset: CropPreset = 'product',
): Promise<{ hiRes: Blob; stdRes: Blob; preview: string }> {
  const img = await loadImage(file)
  const { hiRes: [hw, hh], stdRes: [sw, sh], ratio } = CROP_PRESETS[preset]

  const [hiRes, stdRes] = await Promise.all([
    renderCroppedBlob(img, crop, hw, hh, 0.88, bgColor),
    renderCroppedBlob(img, crop, sw, sh, 0.82, bgColor),
  ])

  const previewCanvas = document.createElement('canvas')
  previewCanvas.width = 400
  previewCanvas.height = Math.round(400 / ratio)
  drawCropped(previewCanvas.getContext('2d')!, img, crop, previewCanvas.width, previewCanvas.height, bgColor)
  const preview = previewCanvas.toDataURL('image/webp', 0.6)

  return { hiRes, stdRes, preview }
}

/**
 * Sample a soft, light background colour from the edges of an image.
 * Returns a CSS hex colour string. Used for canvas fill when zoomed out.
 */
export function sampleEdgeColor(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  // Sample at a tiny resolution for speed.
  const sw = Math.min(img.naturalWidth, 32)
  const sh = Math.min(img.naturalHeight, 32)
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, sw, sh)
  const data = ctx.getImageData(0, 0, sw, sh).data

  // Average the border pixels.
  let r = 0, g = 0, b = 0, count = 0
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (x === 0 || x === sw - 1 || y === 0 || y === sh - 1) {
        const i = (y * sw + x) * 4
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        count++
      }
    }
  }
  if (count === 0) return '#F5F5F2'
  r = Math.round(r / count)
  g = Math.round(g / count)
  b = Math.round(b / count)

  // Push toward a lighter pastel so it doesn't dominate the card.
  r = Math.round(r * 0.3 + 245 * 0.7)
  g = Math.round(g * 0.3 + 245 * 0.7)
  b = Math.round(b * 0.3 + 242 * 0.7)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Convert focal-point percentages to a CSS `object-position` value.
 * @param focalX  0–100 (default 50 = center)
 * @param focalY  0–100 (default 50 = center)
 */
export function getObjectPosition(focalX?: number, focalY?: number): string {
  const x = focalX ?? 50
  const y = focalY ?? 50
  return `${x}% ${y}%`
}
