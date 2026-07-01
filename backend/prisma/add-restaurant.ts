/* ───────────────────────────────────────────────────────────────────────────
 * Add a NEW restaurant (tenant) with an owner login + default sections.
 *
 *   SLUG=my-cafe NAME="My Cafe" npm run add:restaurant
 *
 * Optional env: THEME (default 'aria'), DEFAULT_LANG ('hy'|'en'|'ru', default 'hy'),
 *               PASSWORD (default 'password123'), EMAIL, ADDRESS.
 * Idempotent on slug (re-running updates the restaurant + ensures sections).
 * After it runs, log into /admin with:  owner@<slug>.test / <password>
 * ─────────────────────────────────────────────────────────────────────────── */
import { PrismaClient, UserRole, SectionType } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const SLUG = process.env.SLUG
const NAME = process.env.NAME
const THEME = process.env.THEME || 'aria'
const DEFAULT_LANG = process.env.DEFAULT_LANG || 'hy'
const PASSWORD = process.env.PASSWORD || 'password123'
const EMAIL = process.env.EMAIL
const ADDRESS = process.env.ADDRESS

const SECTION_DEFS: { key: SectionType; icon: string; name: Record<string, string> }[] = [
  { key: SectionType.FOOD, icon: '🍽', name: { hy: 'Ուտեստներ', en: 'Food', ru: 'Блюда' } },
  { key: SectionType.DRINKS, icon: '🥤', name: { hy: 'Ըմպելիքներ', en: 'Drinks', ru: 'Напитки' } },
  { key: SectionType.ALCOHOL, icon: '🍷', name: { hy: 'Ալկոհոլ', en: 'Alcohol', ru: 'Алкоголь' } },
]

async function main() {
  if (!SLUG || !NAME) {
    throw new Error('Usage: SLUG=my-cafe NAME="My Cafe" npm run add:restaurant')
  }
  const slug = SLUG.toLowerCase().trim()

  const langs = await prisma.language.findMany()
  if (!langs.length) throw new Error('No languages found — run `npm run db:seed` first')
  const defaultLanguage = langs.find((l) => l.code === DEFAULT_LANG) ?? langs[0]
  const theme = await prisma.theme.findFirst({ where: { key: THEME } })

  const info = {
    name: NAME,
    email: EMAIL ?? null,
    address: ADDRESS ?? null,
    currency: 'AMD',
    timezone: 'Asia/Yerevan',
    themeId: theme?.id ?? null,
    defaultLanguageId: defaultLanguage.id,
    isActive: true,
  }

  const restaurant = await prisma.restaurant.upsert({
    where: { slug },
    update: info,
    create: { slug, ...info, settings: { create: {} } },
  })

  // active languages
  for (const [i, l] of langs.entries()) {
    await prisma.restaurantLanguage.upsert({
      where: { restaurantId_languageId: { restaurantId: restaurant.id, languageId: l.id } },
      update: { sortOrder: i, isDefault: l.code === DEFAULT_LANG },
      create: { restaurantId: restaurant.id, languageId: l.id, sortOrder: i, isDefault: l.code === DEFAULT_LANG },
    })
  }

  // default sections (idempotent by hy name)
  for (const [i, def] of SECTION_DEFS.entries()) {
    const existing = await prisma.section.findFirst({
      where: { restaurantId: restaurant.id, deletedAt: null, translations: { some: { name: def.name.hy } } },
    })
    if (!existing) {
      await prisma.section.create({
        data: {
          restaurantId: restaurant.id,
          icon: def.icon,
          sortOrder: i,
          translations: { create: langs.map((l) => ({ languageId: l.id, name: def.name[l.code] ?? def.name.en })) },
        },
      })
    }
  }

  // owner login
  const email = `owner@${slug}.test`
  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, restaurantId: restaurant.id },
    create: { email, passwordHash, role: UserRole.OWNER, restaurantId: restaurant.id },
  })

  console.log('\n✅ Restaurant ready')
  console.log(`   slug:   ${slug}`)
  console.log(`   name:   ${NAME}`)
  console.log(`   public: /${slug}`)
  console.log(`   login:  ${email} / ${PASSWORD}`)
  console.log(`   sections: ${SECTION_DEFS.length} default\n`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
