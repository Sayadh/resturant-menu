/**
 * Image handling. Today: file → data URL, and link → og:image via the existing
 * server route. Future: POST multipart to /uploads returning a CDN URL.
 */
export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ url: reader.result as string })
      reader.onerror = () => reject(new Error('Could not read the file'))
      reader.readAsDataURL(file)
    })
  },

  /** Resolve a page / Google link to a direct image URL. */
  async resolveImage(link: string): Promise<{ url: string }> {
    const r = await $fetch<{ image: string }>('/api/resolve-image', { params: { url: link } })
    return { url: r.image }
  },
}
