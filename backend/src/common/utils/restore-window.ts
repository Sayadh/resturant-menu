// "Undo" for deletes. Products, categories and sections are soft-deleted
// (deletedAt); one delete stamps the item AND everything it cascaded to with
// the SAME timestamp, so a restore brings back exactly that operation.
//
// The admin offers "Undo" for 10 s. The server accepts a restore a little
// longer to absorb latency and clock drift, then the delete is final.

export const RESTORE_WINDOW_MS = 60_000

/** True while a soft-deleted row may still be brought back. */
export function isRestorable(deletedAt: Date | null, now: number = Date.now()): boolean {
  if (!deletedAt) return false
  const age = now - deletedAt.getTime()
  return age >= 0 && age <= RESTORE_WINDOW_MS
}
