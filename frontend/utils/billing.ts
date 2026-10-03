// ─────────────────────────────────────────────────────────────────────────
// Subscription payments — date helpers for the super-admin panel.
//
// Days travel as 'YYYY-MM-DD' strings (calendar days, no time zone). The
// backend computes and stores `paidUntil` (src/super-admin/billing.ts); the
// `addMonths` here only previews it in the dialog before saving.
// ─────────────────────────────────────────────────────────────────────────

export const PAYMENT_MONTHS = [1, 3, 6, 12] as const
export type PaymentMonths = (typeof PAYMENT_MONTHS)[number]

/** A period that ends within this many days is flagged as "ending soon". */
export const SOON_DAYS = 7

const pad = (n: number) => String(n).padStart(2, '0')

/** Today in the viewer's own calendar, as 'YYYY-MM-DD'. */
export function todayDay(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 'YYYY-MM-DD' → UTC-midnight Date (for arithmetic only). */
export const dayToDate = (day: string): Date =>
  new Date(Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10))))

/** UTC-midnight Date → 'YYYY-MM-DD'. */
export const dateToDay = (date: Date): string => date.toISOString().slice(0, 10)

/** '2026-10-03' → '03.10.2026'. */
export const displayDay = (day: string): string => `${day.slice(8, 10)}.${day.slice(5, 7)}.${day.slice(0, 4)}`

/** Calendar months later, clamped to the month's last day (Jan 31 + 1 → Feb 28). */
export function addMonths(day: string, months: number): string {
  const d = dayToDate(day)
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + months
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  return dateToDay(new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), last))))
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export const daysBetween = (from: string, to: string): number =>
  Math.round((dayToDate(to).getTime() - dayToDate(from).getTime()) / 86_400_000)

export type PaymentState = 'none' | 'active' | 'soon' | 'expired'

/** Where a restaurant stands, from its longest-running payment. */
export function paymentState(
  payment: { paidAt: string; paidUntil: string } | null,
  today = todayDay(),
): { state: PaymentState; daysLeft: number; upcoming: boolean } {
  if (!payment) return { state: 'none', daysLeft: 0, upcoming: false }
  const daysLeft = daysBetween(today, payment.paidUntil)
  const state: PaymentState = daysLeft < 0 ? 'expired' : daysLeft <= SOON_DAYS ? 'soon' : 'active'
  return { state, daysLeft, upcoming: payment.paidAt > today }
}
