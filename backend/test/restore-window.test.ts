// Undo-delete window: a soft-deleted row can be restored only briefly.
//
// Run: npm test   (Node's built-in runner + type stripping — no extra deps)
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { isRestorable, RESTORE_WINDOW_MS } from '../src/common/utils/restore-window.ts'

const now = Date.parse('2026-10-03T12:00:00.000Z')
const ago = (ms: number) => new Date(now - ms)

describe('isRestorable', () => {
  it('allows a restore right after the delete', () => {
    assert.equal(isRestorable(ago(0), now), true)
    assert.equal(isRestorable(ago(10_000), now), true)
  })

  it('allows it up to the edge of the window', () => {
    assert.equal(isRestorable(ago(RESTORE_WINDOW_MS), now), true)
  })

  it('refuses once the window has passed', () => {
    assert.equal(isRestorable(ago(RESTORE_WINDOW_MS + 1), now), false)
    assert.equal(isRestorable(ago(24 * 3600_000), now), false)
  })

  it('refuses rows that are not deleted', () => {
    assert.equal(isRestorable(null, now), false)
  })

  it('refuses a deletedAt from the future (clock skew / bad data)', () => {
    assert.equal(isRestorable(new Date(now + 5_000), now), false)
  })
})
