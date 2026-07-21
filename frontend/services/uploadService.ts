/**
 * Image handling.
 *  • uploadImage: optimize the file in the browser (resize + WebP + compress),
 *    then POST it to the backend, which stores it in Supabase Storage and
 *    returns a hosted public URL (+ storageKey). Smaller files → faster menu,
 *    less storage/bandwidth. No dependency: pure Canvas API.
 *  • resolveImage: resolve a page / Google link to a direct image URL.
 */
import { useApiClient } from './http'

/** Downscale to `maxDim`, re-encode as WebP at `quality`. Skips GIFs (animation)
 *  and non-images, and keeps the original if optimization doesn't help. */
async function optimizeImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (!import.meta.client) return file
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.onerror = () => reject(new Error('read failed'))
      r.readAsDataURL(file)
    })
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('decode failed'))
      i.src = dataUrl
    })

    let { width, height } = img
    if (width > maxDim || height > maxDim) {
      const s = maxDim / Math.max(width, height)
      width = Math.round(width * s)
      height = Math.round(height * s)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    )
    if (!blob || blob.size >= file.size) return file // no gain → keep original

    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
  } catch {
    return file // optimization is best-effort; never block the upload
  }
}

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; storageKey?: string }> {
    const config = useRuntimeConfig()
    const auth = useAuthStore()
    const base = config.public.apiBase as string

    const optimized = await optimizeImage(file)
    const form = new FormData()
    form.append('file', optimized)

    const res = await $fetch<{ success: boolean; data: { url: string; storageKey: string } }>(
      `${base}/uploads/image`,
      {
        method: 'POST',
        body: form,
        headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      },
    )
    return res.data
  },

  /** Delete a previously uploaded object from storage (scoped to this tenant). */
  async deleteImage(url: string): Promise<void> {
    if (!url) return
    const { useApiClient } = await import('./http')
    await useApiClient().del('/uploads/image', { url }).catch(() => undefined)
  },

  /** Resolve a page / Google link to a direct image URL. */
  async resolveImage(link: string): Promise<{ url: string }> {
    const r = await $fetch<{ image: string }>('/api/resolve-image', { params: { url: link } })
    return { url: r.image }
  },
}
