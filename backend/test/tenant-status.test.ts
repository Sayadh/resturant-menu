// Regression tests for MED-5 — a suspended or deleted restaurant must lose
// admin API access, not just its public menu.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  tenantBlockReason,
  tenantBlockMessage,
} from '../src/common/guards/tenant-status.ts'

const ACTIVE = { isActive: true, deletedAt: null }

describe('tenantBlockReason', () => {
  it('allows a live restaurant', () => {
    assert.equal(tenantBlockReason(ACTIVE), null)
  })

  it('BLOCKS a suspended restaurant (isActive = false)', () => {
    assert.equal(tenantBlockReason({ isActive: false, deletedAt: null }), 'suspended')
  })

  it('BLOCKS a soft-deleted restaurant', () => {
    assert.equal(tenantBlockReason({ isActive: true, deletedAt: new Date() }), 'deleted')
  })

  it('BLOCKS when soft-deleted AND suspended (deletion wins)', () => {
    assert.equal(tenantBlockReason({ isActive: false, deletedAt: new Date() }), 'deleted')
  })

  it('BLOCKS when the restaurant no longer exists (JWT outlived it)', () => {
    assert.equal(tenantBlockReason(null), 'missing')
    assert.equal(tenantBlockReason(undefined), 'missing')
  })
})

describe('tenantBlockMessage', () => {
  it('tells a suspended tenant something actionable', () => {
    assert.match(tenantBlockMessage('suspended'), /suspended/i)
  })

  it('does not distinguish deleted from missing (no existence oracle)', () => {
    assert.equal(tenantBlockMessage('deleted'), tenantBlockMessage('missing'))
  })

  it('never leaks internal state words to the client', () => {
    for (const reason of ['suspended', 'deleted', 'missing'] as const) {
      const msg = tenantBlockMessage(reason)
      assert.ok(!msg.includes('isActive'))
      assert.ok(!msg.includes('deletedAt'))
      assert.ok(!msg.includes('restaurantId'))
    }
  })
})
