// Subscription payments — the "paid until" date the super-admin table shows.
//
// Run: npm test   (Node's built-in runner + type stripping — no extra deps)
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { addMonths, formatDay, parseDay } from '../src/super-admin/billing.ts'

const until = (day: string, months: number) => formatDay(addMonths(parseDay(day)!, months))

describe('parseDay', () => {
  it('accepts a real calendar day', () => {
    assert.equal(formatDay(parseDay('2026-10-03')!), '2026-10-03')
  })

  it('rejects days that do not exist', () => {
    assert.equal(parseDay('2026-02-30'), null)
    assert.equal(parseDay('2026-13-01'), null)
    assert.equal(parseDay('2025-02-29'), null) // not a leap year
  })

  it('rejects anything that is not YYYY-MM-DD', () => {
    assert.equal(parseDay('03.10.2026'), null)
    assert.equal(parseDay('2026-10-03T00:00:00Z'), null)
    assert.equal(parseDay(''), null)
  })
})

describe('addMonths — paid until', () => {
  it('1, 3, 6 and 12 months keep the day of the month', () => {
    assert.equal(until('2026-10-03', 1), '2026-11-03')
    assert.equal(until('2026-10-03', 3), '2027-01-03')
    assert.equal(until('2026-10-03', 6), '2027-04-03')
    assert.equal(until('2026-10-03', 12), '2027-10-03')
  })

  it('clamps to the last day of a shorter month', () => {
    assert.equal(until('2026-01-31', 1), '2026-02-28')
    assert.equal(until('2028-01-31', 1), '2028-02-29') // leap year
    assert.equal(until('2026-08-31', 3), '2026-11-30')
  })

  it('crosses the year boundary', () => {
    assert.equal(until('2026-12-15', 1), '2027-01-15')
    assert.equal(until('2026-11-30', 3), '2027-02-28')
  })

  it('works for a day in the past or in the future alike', () => {
    assert.equal(until('2024-02-29', 12), '2025-02-28')
    assert.equal(until('2030-05-10', 6), '2030-11-10')
  })
})
