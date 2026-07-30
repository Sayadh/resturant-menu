// Regression tests for MED-1 — internal error detail must not reach clients.
//
// The filter used to return `exception.message` verbatim for any non-HTTP
// error. Prisma's messages name tables, columns, constraints and query
// fragments, handing an attacker a free schema map.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { sanitizeUnexpectedError, GENERIC_ERROR_MESSAGE } from '../src/common/filters/error-sanitizer.ts'

// Representative of what Prisma actually throws.
const PRISMA_ERROR = new Error(
  'Invalid `prisma.user.findUnique()` invocation:\n' +
    'Unique constraint failed on the fields: (`email`)\n' +
    'in table `users`, column `passwordHash`',
)

describe('sanitizeUnexpectedError — production', () => {
  it('never leaks the original message to the client', () => {
    const { clientMessage } = sanitizeUnexpectedError(PRISMA_ERROR, true)
    assert.equal(clientMessage, GENERIC_ERROR_MESSAGE)
  })

  it('leaks no schema identifiers at all', () => {
    const { clientMessage } = sanitizeUnexpectedError(PRISMA_ERROR, true)
    for (const secret of ['prisma', 'users', 'email', 'passwordHash', 'constraint', 'table']) {
      assert.ok(
        !clientMessage.toLowerCase().includes(secret.toLowerCase()),
        `client message must not contain "${secret}"`,
      )
    }
  })

  it('still preserves the full detail for the server log', () => {
    const { logMessage } = sanitizeUnexpectedError(PRISMA_ERROR, true)
    assert.ok(logMessage.includes('users'))
    assert.ok(logMessage.includes('Unique constraint failed'))
  })

  it('handles non-Error throwables without crashing the filter', () => {
    for (const thrown of ['a string', 42, null, undefined, { weird: true }]) {
      const r = sanitizeUnexpectedError(thrown, true)
      assert.equal(r.clientMessage, GENERIC_ERROR_MESSAGE)
      assert.equal(typeof r.logMessage, 'string')
    }
  })

  it('does not leak a database URL embedded in an error', () => {
    const e = new Error('connect ECONNREFUSED postgresql://user:secret@db.host:5432/prod')
    const { clientMessage } = sanitizeUnexpectedError(e, true)
    assert.ok(!clientMessage.includes('postgresql://'))
    assert.ok(!clientMessage.includes('secret'))
  })
})

describe('sanitizeUnexpectedError — development', () => {
  it('surfaces the real message for local debugging', () => {
    const { clientMessage } = sanitizeUnexpectedError(new Error('boom'), false)
    assert.equal(clientMessage, 'boom')
  })
})
