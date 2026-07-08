/**
 * Image handling.
 *  • uploadImage: POST the file (multipart) to the backend, which stores it in
 *    Supabase Storage and returns a hosted public URL (+ storageKey). No more
 *    giant base64 data URLs in the database.
 *  • resolveImage: resolve a page / Google link to a direct image URL.
 */
export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; storageKey?: string }> {
    const config = useRuntimeConfig()
    const auth = useAuthStore()
    const base = config.public.apiBase as string

    const form = new FormData()
    form.append('file', file)

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

  /** Resolve a page / Google link to a direct image URL. */
  async resolveImage(link: string): Promise<{ url: string }> {
    const r = await $fetch<{ image: string }>('/api/resolve-image', { params: { url: link } })
    return { url: r.image }
  },
}
