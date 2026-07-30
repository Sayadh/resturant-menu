// Regression tests for HIGH-3 — sessions must not survive a credential change.
//
// Covers the stateless half of the fix (access-token staleness). The stateful
// half (refresh-token revocation in the same transaction) is asserted in
// session-revocation.test.ts.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { isTokenStale, IAT_GRACE_MS } from '../src/auth/token-freshness.ts'

/** JWT `iat` — whole seconds, as produced by the signing library. */
const iatOf = (d: Date) => Math.floor(d.getTime() / 1000)

describe('isTokenStale', () => {
  it('accepts any token when credentials were never changed', () => {
    assert.equal(isTokenStale(iatOf(new Date('2020-01-01T00:00:00Z')), null), false)
    assert.equal(isTokenStale(iatOf(new Date()), undefined), false)
  })

  it('REJECTS a token issued before the password change', () => {
    const changedAt = new Date('2026-07-31T10:00:00.000Z')
    const oldToken = iatOf(new Date('2026-07-31T09:59:00.000Z')) // 1 min earlier
    assert.equal(isTokenStale(oldToken, changedAt), true)
  })

  it('REJECTS a long-lived token from well before the change', () => {
    const changedAt = new Date('2026-07-31T10:00:00.000Z')
    const ancient = iatOf(new Date('2026-01-01T00:00:00.000Z'))
    assert.equal(isTokenStale(ancient, changedAt), true)
  })

  it('accepts a token issued after the password change (new login works)', () => {
    const changedAt = new Date('2026-07-31T10:00:00.000Z')
    const fresh = iatOf(new Date('2026-07-31T10:00:05.000Z'))
    assert.equal(isTokenStale(fresh, changedAt), false)
  })

  it('accepts a token minted in the SAME second as the change (precision guard)', () => {
    // iat is floored to 10:00:00 while the change lands at 10:00:00.400 — the
    // grace window must stop this legitimate login being rejected.
    const changedAt = new Date('2026-07-31T10:00:00.400Z')
    const sameSecond = iatOf(new Date('2026-07-31T10:00:00.900Z')) // → 10:00:00
    assert.equal(isTokenStale(sameSecond, changedAt), false)
  })

  it('grace window is exactly one second and no wider', () => {
    const changedAt = new Date('2026-07-31T10:00:10.000Z')
    const justInside = Math.floor((changedAt.getTime() - IAT_GRACE_MS) / 1000)
    const clearlyOutside = Math.floor((changedAt.getTime() - IAT_GRACE_MS - 2000) / 1000)
    assert.equal(isTokenStale(justInside, changedAt), false)
    assert.equal(isTokenStale(clearlyOutside, changedAt), true)
  })

  it('REJECTS a token with a missing or unusable iat once credentials changed', () => {
    const changedAt = new Date('2026-07-31T10:00:00.000Z')
    assert.equal(isTokenStale(undefined, changedAt), true)
    assert.equal(isTokenStale(Number.NaN, changedAt), true)
    assert.equal(isTokenStale(Number.POSITIVE_INFINITY, changedAt), true)
  })

  it('does not affect users whose credentials never changed (other accounts)', () => {
    // Same old token, but this user has no passwordChangedAt → still valid.
    const oldToken = iatOf(new Date('2026-01-01T00:00:00.000Z'))
    assert.equal(isTokenStale(oldToken, null), false)
  })
})
