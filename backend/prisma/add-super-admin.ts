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
const PASSWORD = process.env.PASSWORD || 'password123'

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
