/* ───────────────────────────────────────────────────────────────────────────
 * Clone one restaurant's full menu (sections + categories + products, with all
 * translations, images and badges) into every OTHER restaurant.
 *
 *   Run:  npm run clone:menu
 *   Source slug defaults to 'tun-lahmajo' (override: CLONE_SOURCE=karas npm run clone:menu)
 *
 * Each target's existing menu is WIPED first, then replaced with an exact copy
 * of the source — so all restaurants end up identical. Idempotent (re-runnable).
 * ─────────────────────────────────────────────────────────────────────────── */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SOURCE_SLUG = process.env.CLONE_SOURCE || 'tun-lahmajo'

async function clearMenu(restaurantId: string) {
  // products first (FK Restrict on category), then categories, then sections.
  // Deleting a product cascades its translations / images / badges.
  await prisma.product.deleteMany({ where: { restaurantId } })
  await prisma.category.deleteMany({ where: { restaurantId } })
  await prisma.section.deleteMany({ where: { restaurantId } })
}

type Source = NonNullable<Awaited<ReturnType<typeof loadSource>>>

function loadSource(slug: string) {
  return prisma.restaurant.findFirst({
    where: { slug },
    include: {
      sections: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        include: { translations: true },
      },
      categories: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        include: { translations: true },
      },
      products: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        include: {
          translations: true,
          images: { where: { deletedAt: null } },
          badges: { include: { badge: true } },
        },
      },
    },
  })
}

async function cloneInto(source: Source, targetId: string) {
  // 1) sections
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

  // 2) categories (parents resolved in a 2nd pass)
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
        translations: {
          create: c.translations.map((t) => ({ languageId: t.languageId, name: t.name, description: t.description })),
        },
      },
    })
    catMap.set(c.id, created.id)
  }
  for (const c of source.categories) {
    if (c.parentId && catMap.has(c.parentId)) {
      await prisma.category.update({
        where: { id: catMap.get(c.id)! },
        data: { parentId: catMap.get(c.parentId)! },
      })
    }
  }

  // 3) products (+ translations, images; only SYSTEM badges are portable)
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
        translations: {
          create: p.translations.map((t) => ({ languageId: t.languageId, name: t.name, description: t.description })),
        },
        images: {
          create: p.images.map((im) => ({
            url: im.url,
            storageKey: im.storageKey,
            altText: im.altText,
            isMain: im.isMain,
            sortOrder: im.sortOrder,
          })),
        },
        badges: {
          create: p.badges
            .filter((b) => b.badge.restaurantId === null) // system badges are shared
            .map((b) => ({ badgeId: b.badgeId })),
        },
      },
    })
  }
}

async function main() {
  const source = await loadSource(SOURCE_SLUG)
  if (!source) throw new Error(`Source restaurant "${SOURCE_SLUG}" not found`)
  console.log(
    `Source ${SOURCE_SLUG}: ${source.sections.length} sections, ${source.categories.length} categories, ${source.products.length} products`,
  )

  const targets = await prisma.restaurant.findMany({
    where: { slug: { not: SOURCE_SLUG }, deletedAt: null },
  })

  for (const t of targets) {
    console.log(`→ Cloning into ${t.slug}…`)
    await clearMenu(t.id)
    await cloneInto(source, t.id)
  }
  console.log(`Done. Cloned into ${targets.length} restaurant(s).`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
