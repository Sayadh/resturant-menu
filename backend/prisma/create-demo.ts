/* ───────────────────────────────────────────────────────────────────────────
 * Create the public DEMO restaurant used by the landing page.
 *
 *   npm run create:demo
 *
 * It has the SAME menu as tun-lahmajo (cloned: sections + categories + products
 * with all translations, images, badges) but a generic, brand-neutral name
 * ("Ձեր մենյուն" / "Ваш ресторан" / "Your Restaurant") — so the demo doesn't
 * advertise a specific restaurant. Slug: `demo`  →  public URL: /demo
 * Idempotent: re-running wipes & re-clones the demo menu.
 * ─────────────────────────────────────────────────────────────────────────── */
import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const SOURCE_SLUG = process.env.CLONE_SOURCE || 'tun-lahmajo'
const DEMO_SLUG = 'demo'
const DEMO_NAME = 'Ձեր մենյուն'
const TAGLINE: Record<string, string> = {
  hy: 'Ձեր թվային մենյուն՝ այսպիսի տեսքով',
  ru: 'Ваше цифровое меню в таком виде',
  en: 'Your digital menu, right here',
}

// ── menu cloning (same logic as clone:menu, targeted at the demo) ──
function loadSource(slug: string) {
  return prisma.restaurant.findFirst({
    where: { slug },
    include: {
      sections: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, include: { translations: true } },
      categories: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, include: { translations: true } },
      products: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        include: { translations: true, images: { where: { deletedAt: null } }, badges: { include: { badge: true } } },
      },
    },
  })
}
type Source = NonNullable<Awaited<ReturnType<typeof loadSource>>>

async function clearMenu(restaurantId: string) {
  await prisma.product.deleteMany({ where: { restaurantId } })
  await prisma.category.deleteMany({ where: { restaurantId } })
  await prisma.section.deleteMany({ where: { restaurantId } })
}

async function cloneInto(source: Source, targetId: string) {
  const sectionMap = new Map<string, string>()
  for (const s of source.sections) {
    const created = await prisma.section.create({
      data: {
        restaurantId: targetId,
        icon: s.icon,
        sortOrder: s.sortOrder,
        isActive: s.isActive,
        translations: { create: s.translations.map((t) => ({ languageId: t.languageId, name: t.name })) },
      },
    })
    sectionMap.set(s.id, created.id)
  }

  const catMap = new Map<string, string>()
  for (const c of source.categories) {
    const created = await prisma.category.create({
      data: {
        restaurantId: targetId,
        sectionId: c.sectionId ? sectionMap.get(c.sectionId) ?? null : null,
        icon: c.icon,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        translations: { create: c.translations.map((t) => ({ languageId: t.languageId, name: t.name, description: t.description })) },
      },
    })
    catMap.set(c.id, created.id)
  }
  for (const c of source.categories) {
    if (c.parentId && catMap.has(c.parentId)) {
      await prisma.category.update({ where: { id: catMap.get(c.id)! }, data: { parentId: catMap.get(c.parentId)! } })
    }
  }

  for (const p of source.products) {
    const newCatId = catMap.get(p.categoryId)
    if (!newCatId) continue
    await prisma.product.create({
      data: {
        restaurantId: targetId,
        categoryId: newCatId,
        price: p.price,
        oldPrice: p.oldPrice,
        isAvailable: p.isAvailable,
        isActive: p.isActive,
        isPopular: p.isPopular,
        isNew: p.isNew,
        isRecommended: p.isRecommended,
        sortOrder: p.sortOrder,
        translations: { create: p.translations.map((t) => ({ languageId: t.languageId, name: t.name, description: t.description })) },
        images: {
          create: p.images.map((im) => ({ url: im.url, storageKey: im.storageKey, altText: im.altText, isMain: im.isMain, sortOrder: im.sortOrder })),
        },
        badges: { create: p.badges.filter((b) => b.badge.restaurantId === null).map((b) => ({ badgeId: b.badgeId })) },
      },
    })
  }
}

async function main() {
  const source = await loadSource(SOURCE_SLUG)
  if (!source) throw new Error(`Source restaurant "${SOURCE_SLUG}" not found — seed it first`)

  const langs = await prisma.language.findMany()
  if (!langs.length) throw new Error('No languages found — run `npm run db:seed` first')
  const defaultLanguage = langs.find((l) => l.code === 'hy') ?? langs[0]
  const theme = await prisma.theme.findFirst({ where: { key: 'aria' } })

  const info = {
    name: DEMO_NAME,
    currency: source.currency,
    timezone: source.timezone,
    themeId: theme?.id ?? source.themeId,
    defaultLanguageId: defaultLanguage.id,
    rating: source.rating,
    workingHoursText: source.workingHoursText,
    isActive: true,
  }

  const demo = await prisma.restaurant.upsert({
    where: { slug: DEMO_SLUG },
    update: info,
    create: { slug: DEMO_SLUG, ...info, settings: { create: {} } },
  })

  // active languages
  for (const [i, l] of langs.entries()) {
    await prisma.restaurantLanguage.upsert({
      where: { restaurantId_languageId: { restaurantId: demo.id, languageId: l.id } },
      update: { sortOrder: i, isDefault: l.code === 'hy' },
      create: { restaurantId: demo.id, languageId: l.id, sortOrder: i, isDefault: l.code === 'hy' },
    })
  }

  // tagline translations (brand-neutral)
  for (const l of langs) {
    await prisma.restaurantTranslation.upsert({
      where: { restaurantId_languageId: { restaurantId: demo.id, languageId: l.id } },
      update: { tagline: TAGLINE[l.code] ?? TAGLINE.en },
      create: { restaurantId: demo.id, languageId: l.id, tagline: TAGLINE[l.code] ?? TAGLINE.en },
    })
  }

  // owner login (optional but consistent): owner@demo.test / password123
  const email = `owner@${DEMO_SLUG}.test`
  const passwordHash = await bcrypt.hash('password123', 10)
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, restaurantId: demo.id },
    create: { email, passwordHash, role: UserRole.OWNER, restaurantId: demo.id },
  })

  // clone the menu
  await clearMenu(demo.id)
  await cloneInto(source, demo.id)

  console.log('\n✅ Demo restaurant ready')
  console.log(`   name:   ${DEMO_NAME}`)
  console.log(`   public: /${DEMO_SLUG}`)
  console.log(`   cloned from: ${SOURCE_SLUG} (${source.sections.length} sections, ${source.categories.length} categories, ${source.products.length} products)\n`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
