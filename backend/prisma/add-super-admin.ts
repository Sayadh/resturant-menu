/* ───────────────────────────────────────────────────────────────────────────
 * Create (or reset) the platform SUPER_ADMIN login — no restaurant attached.
 *
 *   npm run add:superadmin
 *   EMAIL=me@platform.test PASSWORD=secret123 npm run add:superadmin
 *
 * After it runs, log into /admin with the printed credentials. The super-admin
 * sees a single "Restaurants" tab where new restaurants can be created.
 * Idempotent on email — safe to re-run (updates password + role).
 * ─────────────────────────────────────────────────────────────────────────── */
import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const EMAIL = (process.env.EMAIL || 'superadmin@platform.test').toLowerCase().trim()
// No fallback: a shared default here would create a platform-wide
// SUPER_ADMIN with a guessable password. Fail loudly instead.
function requirePassword(): string {
  const value = process.env.PASSWORD
  if (!value || value.length < 12) {
    console.error(
      'PASSWORD env var is required (min 12 chars). Example:\n' +
        '  PASSWORD="$(openssl rand -base64 24)" npm run add:superadmin',
    )
    process.exit(1)
  }
  return value
}
const PASSWORD = requirePassword()

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  await prisma.user.upsert({
    where: { email: EMAIL },
    update: { passwordHash, role: UserRole.SUPER_ADMIN, restaurantId: null, isActive: true },
    create: { email: EMAIL, passwordHash, role: UserRole.SUPER_ADMIN, restaurantId: null },
  })

  console.log('\n✅ Super-admin ready')
  console.log(`   login: ${EMAIL} / ${PASSWORD}`)
  console.log('   open:  /admin  → "Restaurants" tab\n')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
