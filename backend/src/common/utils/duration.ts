/** Parse a short duration string ("15m", "7d", "3600s") to milliseconds. */
export function durationToMs(input: string): number {
  const m = /^(\d+)\s*(s|m|h|d)$/.exec(input.trim())
  if (!m) return 0
  const n = parseInt(m[1], 10)
  const mult = m[2] === 's' ? 1_000 : m[2] === 'm' ? 60_000 : m[2] === 'h' ? 3_600_000 : 86_400_000
  return n * mult
}
