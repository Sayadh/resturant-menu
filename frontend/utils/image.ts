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
// Multi-resolution 4:3 image processing (product / category images).
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

/** Crop state produced by the crop editor. */
export interface CropState {
  /** Offset of the image center relative to the viewport center, in image-pixels. */
  offsetX: number
  offsetY: number
  /** Zoom factor (1 = fit, >1 = crop in, <1 = zoom out with bg fill). */
  zoom: number
}

/**
 * Render a cropped 4:3 WebP blob from an image + crop state.
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

  // Fill background (visible when zoomed out).
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  // Calculate draw dimensions: the image should fill the canvas at zoom=1
  // using "contain" logic (fit the full image), then zoom scales from there.
  const imgAspect = img.naturalWidth / img.naturalHeight
  const canvasAspect = width / height
  let drawW: number, drawH: number
  if (imgAspect > canvasAspect) {
    // Image is wider → fit by width (height might not fill)
    drawW = width * crop.zoom
    drawH = drawW / imgAspect
  } else {
    // Image is taller → fit by height (width might not fill)
    drawH = height * crop.zoom
    drawW = drawH * imgAspect
  }

  const drawX = (width - drawW) / 2 + crop.offsetX * crop.zoom
  const drawY = (height - drawH) / 2 + crop.offsetY * crop.zoom

  ctx.drawImage(img, drawX, drawY, drawW, drawH)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      'image/webp',
      quality,
    )
  })
}

/**
 * Process a raw upload into two 4:3 WebP blobs + a preview data URL.
 * Does NOT require a crop state — uses default center crop.
 */
export async function processMenuImage(
  file: File,
  crop: CropState = { offsetX: 0, offsetY: 0, zoom: 1 },
  bgColor = '#F5F5F2',
): Promise<{ hiRes: Blob; stdRes: Blob; preview: string }> {
  const img = await loadImage(file)

  const [hiRes, stdRes] = await Promise.all([
    renderCroppedBlob(img, crop, 1200, 900, 0.88, bgColor),
    renderCroppedBlob(img, crop, 800, 600, 0.82, bgColor),
  ])

  // Generate a small preview URL for the admin UI.
  const previewCanvas = document.createElement('canvas')
  previewCanvas.width = 400
  previewCanvas.height = 300
  const pCtx = previewCanvas.getContext('2d')!
  pCtx.fillStyle = bgColor
  pCtx.fillRect(0, 0, 400, 300)
  const imgAspect = img.naturalWidth / img.naturalHeight
  const canvasAspect = 400 / 300
  let dw: number, dh: number
  if (imgAspect > canvasAspect) {
    dw = 400 * crop.zoom
    dh = dw / imgAspect
  } else {
    dh = 300 * crop.zoom
    dw = dh * imgAspect
  }
  pCtx.drawImage(img, (400 - dw) / 2 + crop.offsetX * crop.zoom, (300 - dh) / 2 + crop.offsetY * crop.zoom, dw, dh)
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
