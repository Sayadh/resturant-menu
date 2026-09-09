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
