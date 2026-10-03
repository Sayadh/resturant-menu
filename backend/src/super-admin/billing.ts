// ─────────────────────────────────────────────────────────────────────────
// Subscription payments — the pure date arithmetic (no Nest, no Prisma), so
// it is unit tested on its own (test/billing.test.ts).
//
// Dates are calendar DAYS, not instants: "2026-10-03" means that day wherever
// the super-admin is. They travel as 'YYYY-MM-DD' strings, are stored in DATE
// columns, and are only ever turned into a Date at UTC midnight.
// ─────────────────────────────────────────────────────────────────────────

/** The periods a restaurant can pay for at once. */
export const PAYMENT_MONTHS = [1, 3, 6, 12] as const
export type PaymentMonths = (typeof PAYMENT_MONTHS)[number]

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/

/** 'YYYY-MM-DD' → UTC-midnight Date, or null when it is not a real day (e.g. 2026-02-30). */
export function parseDay(value: string): Date | null {
  const m = DAY.exec(value)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null
  return date
}

/** UTC-midnight Date → 'YYYY-MM-DD'. */
export const formatDay = (date: Date): string => date.toISOString().slice(0, 10)

/**
 * Add calendar months, keeping the day of the month and clamping to the last
 * day when the target month is shorter: Jan 31 + 1 month = Feb 28 (29 in a
 * leap year), never "March 3".
 */
export function addMonths(day: Date, months: number): Date {
  const y = day.getUTCFullYear()
  const m = day.getUTCMonth() + months
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m, Math.min(day.getUTCDate(), lastDay)))
}
