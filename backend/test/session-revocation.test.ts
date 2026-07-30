// Regression tests for HIGH-3 — the stateful half: an admin-initiated
// credential change must revoke every refresh token IN THE SAME TRANSACTION as
// the password write.
//
// Runs against the COMPILED service (dist/) because the source carries Nest
// decorators, which Node's type-stripping runner cannot parse. Run `npm run
// build` first — `npm run verify` does this in the right order.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

// Resolved from the package root (npm scripts run with cwd = backend/), which
// avoids `import.meta` so this file typechecks under the CommonJS build config.
const require_ = createRequire(join(process.cwd(), 'package.json'))
const DIST = join(process.cwd(), 'dist', 'super-admin', 'super-admin.service.js')

// The compiled service pulls in bcrypt — a NATIVE module whose binding is
// built per-platform, so it fails to load when node_modules was installed on a
// different OS. Hashing isn't what we're testing here (we assert the
// transaction shape), so pre-seed the require cache with a tiny stub. This
// keeps the suite runnable on any platform and in CI.
let SuperAdminService: any
let skip: string | false = false
try {
  if (!existsSync(DIST)) throw new Error('dist/ missing — run "npm run build" first')
  const bcryptPath = require_.resolve('bcrypt')
  require_.cache[bcryptPath] = {
    id: bcryptPath,
    filename: bcryptPath,
    loaded: true,
    children: [],
    paths: [],
    exports: { hash: async (_pw: string, _rounds: number) => '$2b$10$stub-hash-for-tests' },
  } as unknown as NodeJS.Module
  SuperAdminService = require_(DIST).SuperAdminService
} catch (e) {
  skip = `cannot load compiled service: ${(e as Error).message.split('\n')[0]}`
}

type Captured = { op: string; args: any }

/** Minimal Prisma double that records every call the service makes. */
function makePrisma(owner: any) {
  const calls: Captured[] = []
  const rec = (op: string) => (args: any) => {
    calls.push({ op, args })
    return { __op: op, args } // stand-in for a PrismaPromise
  }
  const prisma: any = {
    calls,
    restaurant: {
      findFirst: async (args: any) => {
        calls.push({ op: 'restaurant.findFirst', args })
        return { id: args.where.id, name: 'R' }
      },
      update: async (args: any) => {
        calls.push({ op: 'restaurant.update', args })
        return { id: args.where.id }
      },
    },
    user: {
      findFirst: async (args: any) => {
        calls.push({ op: 'user.findFirst', args })
        // email-clash probe → no clash; owner lookup → the owner
        return args.where?.email ? null : owner
      },
      update: rec('user.update'),
      create: rec('user.create'),
    },
    refreshToken: { updateMany: rec('refreshToken.updateMany') },
    $transaction: async (ops: any[]) => {
      calls.push({ op: '$transaction', args: ops })
      return ops
    },
  }
  return prisma
}

const OWNER = { id: 'owner-1', email: 'old@x.am', role: 'OWNER', restaurantId: 'rest-1' }

describe('admin-initiated password reset', { skip }, () => {
  it('revokes refresh tokens and stamps passwordChangedAt in ONE transaction', async () => {
    const prisma = makePrisma(OWNER)
    const svc = new SuperAdminService(prisma)

    await svc.updateRestaurant('rest-1', { ownerPassword: 'a-new-password' })

    const tx = prisma.calls.find((c: Captured) => c.op === '$transaction')
    assert.ok(tx, 'credential change must run inside $transaction')

    const ops = tx.args.map((o: any) => o.__op)
    assert.deepEqual(ops, ['user.update', 'refreshToken.updateMany'],
      'the transaction must contain BOTH the credential write and the revocation')

    const [userUpdate, revoke] = tx.args
    assert.ok(userUpdate.args.data.passwordHash, 'password must be re-hashed')
    assert.ok(userUpdate.args.data.passwordChangedAt instanceof Date,
      'passwordChangedAt must be stamped so old access tokens are rejected')
    assert.equal(revoke.args.where.userId, OWNER.id)
    assert.equal(revoke.args.where.revokedAt, null, 'only still-live sessions are revoked')
    assert.ok(revoke.args.data.revokedAt instanceof Date)

    // Same instant for both → no window where one applies and the other doesn't.
    assert.equal(
      userUpdate.args.data.passwordChangedAt.getTime(),
      revoke.args.data.revokedAt.getTime(),
    )
  })

  it('revokes sessions when only the login email changes', async () => {
    const prisma = makePrisma(OWNER)
    const svc = new SuperAdminService(prisma)

    await svc.updateRestaurant('rest-1', { ownerEmail: 'new@x.am' })

    const tx = prisma.calls.find((c: Captured) => c.op === '$transaction')
    assert.ok(tx, 'an email (login identity) change must also evict sessions')
    assert.deepEqual(tx.args.map((o: any) => o.__op), ['user.update', 'refreshToken.updateMany'])
    assert.equal(tx.args[0].args.data.email, 'new@x.am')
  })

  it("does NOT touch other users' sessions", async () => {
    const prisma = makePrisma(OWNER)
    const svc = new SuperAdminService(prisma)

    await svc.updateRestaurant('rest-1', { ownerPassword: 'a-new-password' })

    const tx = prisma.calls.find((c: Captured) => c.op === '$transaction')
    const revoke = tx.args[1]
    assert.equal(revoke.args.where.userId, OWNER.id,
      'revocation must be scoped to this user only — never a blanket updateMany')
  })

  it('does not revoke anything when no credential field is supplied', async () => {
    const prisma = makePrisma(OWNER)
    const svc = new SuperAdminService(prisma)

    await svc.updateRestaurant('rest-1', { name: 'Renamed' })

    assert.equal(prisma.calls.some((c: Captured) => c.op === '$transaction'), false)
    assert.equal(prisma.calls.some((c: Captured) => c.op === 'refreshToken.updateMany'), false)
  })

  it('creating a brand-new owner does not attempt a revocation', async () => {
    const prisma = makePrisma(null) // no existing owner
    const svc = new SuperAdminService(prisma)

    await svc.updateRestaurant('rest-1', { ownerEmail: 'first@x.am', ownerPassword: 'secret123' })

    assert.equal(prisma.calls.some((c: Captured) => c.op === '$transaction'), false)
    assert.ok(prisma.calls.some((c: Captured) => c.op === 'user.create'))
  })
})
