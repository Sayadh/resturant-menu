/* ───────────────────────────────────────────────────────────────────────────
 * Seed structure for the QR Menu Platform.
 *
 *   Run:  npx prisma db seed
 *   Wire: package.json → "prisma": { "seed": "ts-node prisma/seed.ts" }
 *
 * Idempotent: every create uses upsert on a natural key so re-running is safe.
 * This is the STRUCTURE (representative data) — full menus come from the real
 * admin/import later. Mirrors the frontend's current mock tenants so the API
 * can drop in without UI changes.
 * ─────────────────────────────────────────────────────────────────────────── */
import { PrismaClient, UserRole, SectionType, DayOfWeek } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Demo owner password (every seeded owner uses this). Change in real setups.
const DEMO_PASSWORD = 'password123'

async function seedLanguages() {
  const langs = [
    { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  ]
  for (const l of langs) {
    await prisma.language.upsert({ where: { code: l.code }, update: l, create: l })
  }
  return prisma.language.findMany()
}

async function seedThemes() {
  const themes = [
    { key: 'aria', name: 'Aria', description: 'Modern, premium' },
    { key: 'atelier', name: 'Atelier', description: 'Editorial fine-dining' },
    { key: 'maison', name: 'Maison', description: 'Luxe, immersive' },
    { key: 'heritage', name: 'Heritage', description: 'Warm, traditional' },
    { key: 'noir', name: 'Noir', description: 'Dark, dramatic', isActive: false },
  ]
  for (const t of themes) {
    await prisma.theme.upsert({ where: { key: t.key }, update: t, create: t })
  }
  return prisma.theme.findMany()
}

async function seedPlans() {
  const plans = [
    { key: 'free', name: 'Free', priceMonthly: 0, maxProducts: 50, maxDomains: 1 },
    { key: 'pro', name: 'Pro', priceMonthly: 9900, maxProducts: 1000, maxDomains: 3 },
  ]
  for (const p of plans) {
    await prisma.plan.upsert({ where: { key: p.key }, update: p, create: p })
  }
}

async function seedSystemBadges(langs: { id: string; code: string }[]) {
  const badges = [
    { key: 'hit', icon: '🔥', label: { hy: 'Հիթ', en: 'Hit', ru: 'Хит' } },
    { key: 'new', icon: '🆕', label: { hy: 'Նոր', en: 'New', ru: 'Новинка' } },
    { key: 'recommended', icon: '⭐', label: { hy: 'Խորհուրդ', en: 'Recommended', ru: 'Рекомендуем' } },
    { key: 'spicy', icon: '🌶', label: { hy: 'Կծու', en: 'Spicy', ru: 'Острое' } },
    { key: 'vegan', icon: '🌱', label: { hy: 'Վեգան', en: 'Vegan', ru: 'Веган' } },
  ]
  for (const b of badges) {
    // System badges have restaurantId = null; a compound upsert on a null key
    // is unreliable in Postgres, so find-or-create explicitly.
    const existing = await prisma.badge.findFirst({ where: { key: b.key, restaurantId: null } })
    const badge =
      existing ??
      (await prisma.badge.create({ data: { key: b.key, icon: b.icon, isSystem: true } }))
    for (const l of langs) {
      await prisma.badgeTranslation.upsert({
        where: { badgeId_languageId: { badgeId: badge.id, languageId: l.id } },
        update: { label: (b.label as never)[l.code] },
        create: { badgeId: badge.id, languageId: l.id, label: (b.label as never)[l.code] },
      })
    }
  }
}

interface RestaurantInfo {
  slug: string
  name: string
  themeKey: string
  defaultLang: string
  email: string
  phone: string
  address: string
  currency: string
  timezone: string
  workingHours?: string
  rating?: number
  tagline?: Record<string, string>
  logoUrl?: string
  coverImageUrl?: string
  social: { instagram?: string; facebook?: string; website?: string }
  colors?: { primaryColor?: string; secondaryColor?: string; backgroundColor?: string; accentColor?: string }
}

async function seedRestaurant(opts: RestaurantInfo & { langs: { id: string; code: string }[] }) {
  const theme = await prisma.theme.findUnique({ where: { key: opts.themeKey } })
  const defaultLanguage = opts.langs.find((l) => l.code === opts.defaultLang)!

  const info = {
    name: opts.name,
    email: opts.email,
    phone: opts.phone,
    address: opts.address,
    workingHoursText: opts.workingHours ?? null,
    rating: opts.rating ?? null,
    currency: opts.currency,
    timezone: opts.timezone,
    logoUrl: opts.logoUrl ?? null,
    coverImageUrl: opts.coverImageUrl ?? null,
    themeId: theme?.id,
    defaultLanguageId: defaultLanguage.id,
  }

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: opts.slug },
    update: info,
    create: { slug: opts.slug, ...info },
  })

  // trilingual tagline → RestaurantTranslation
  if (opts.tagline) {
    for (const l of opts.langs) {
      const tagline = opts.tagline[l.code]
      if (tagline === undefined) continue
      await prisma.restaurantTranslation.upsert({
        where: { restaurantId_languageId: { restaurantId: restaurant.id, languageId: l.id } },
        update: { tagline },
        create: { restaurantId: restaurant.id, languageId: l.id, tagline },
      })
    }
  }

  // settings (social links + theme colors) — idempotent
  const settingsData = {
    instagramUrl: opts.social.instagram ?? null,
    facebookUrl: opts.social.facebook ?? null,
    websiteUrl: opts.social.website ?? null,
    ...opts.colors,
  }
  await prisma.restaurantSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: settingsData,
    create: { restaurantId: restaurant.id, ...settingsData },
  })

  // active languages
  for (const [i, l] of opts.langs.entries()) {
    await prisma.restaurantLanguage.upsert({
      where: { restaurantId_languageId: { restaurantId: restaurant.id, languageId: l.id } },
      update: { sortOrder: i, isDefault: l.code === opts.defaultLang },
      create: { restaurantId: restaurant.id, languageId: l.id, sortOrder: i, isDefault: l.code === opts.defaultLang },
    })
  }

  // working hours (Mon–Sun, with a split-shift example on Fri/Sat)
  const days = Object.values(DayOfWeek)
  for (const [i, day] of days.entries()) {
    // delete + recreate to keep idempotent for split shifts
    await prisma.restaurantWorkingHour.deleteMany({ where: { restaurantId: restaurant.id, dayOfWeek: day } })
    const shifts =
      day === 'FRI' || day === 'SAT'
        ? [{ open: '10:00', close: '16:00' }, { open: '18:00', close: '23:00' }]
        : [{ open: '10:00', close: '23:00' }]
    for (const [j, s] of shifts.entries()) {
      await prisma.restaurantWorkingHour.create({
        data: { restaurantId: restaurant.id, dayOfWeek: day, openTime: s.open, closeTime: s.close, sortOrder: i * 10 + j },
      })
    }
  }

  // owner user — login with: owner@<slug>.test / password123
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)
  await prisma.user.upsert({
    where: { email: `owner@${opts.slug}.test` },
    update: { passwordHash },
    create: {
      email: `owner@${opts.slug}.test`,
      passwordHash,
      role: UserRole.OWNER,
      restaurantId: restaurant.id,
    },
  })

  return restaurant
}

interface SeedProduct {
  price: number
  oldPrice?: number
  name: Record<string, string>
  desc?: Record<string, string>
  badges?: string[] // system badge keys: hit | new | recommended | spicy | vegan
}
interface SeedCategory {
  section: SectionType
  icon: string
  name: Record<string, string>
  products: SeedProduct[]
}

/** Seed one category + its products with translations + badge links. */
async function seedCategoryWithProducts(
  restaurantId: string,
  langs: { id: string; code: string }[],
  badgeIdByKey: Map<string, string>,
  cat: SeedCategory,
  sortOrder: number,
) {
  const category = await prisma.category.create({
    data: {
      restaurantId,
      section: cat.section,
      icon: cat.icon,
      sortOrder,
      translations: { create: langs.map((l) => ({ languageId: l.id, name: cat.name[l.code] ?? cat.name.en })) },
    },
  })
  for (const [i, p] of cat.products.entries()) {
    const keys = p.badges ?? []
    await prisma.product.create({
      data: {
        restaurantId,
        categoryId: category.id,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        sortOrder: i,
        isPopular: keys.includes('hit'),
        isNew: keys.includes('new'),
        isRecommended: keys.includes('recommended'),
        translations: {
          create: langs.map((l) => ({
            languageId: l.id,
            name: p.name[l.code] ?? p.name.en,
            description: p.desc?.[l.code] ?? null,
          })),
        },
        badges: {
          create: keys
            .map((k) => badgeIdByKey.get(k))
            .filter((id): id is string => !!id)
            .map((badgeId) => ({ badgeId })),
        },
      },
    })
  }
}

/** Seed a full menu for a tenant — idempotent (skips if it already has data). */
async function seedMenu(
  restaurantId: string,
  langs: { id: string; code: string }[],
  badgeIdByKey: Map<string, string>,
  menu: SeedCategory[],
) {
  const existing = await prisma.category.count({ where: { restaurantId } })
  if (existing > 0) return
  for (const [i, cat] of menu.entries()) {
    await seedCategoryWithProducts(restaurantId, langs, badgeIdByKey, cat, i)
  }
}

// ── full tenant dataset (info + settings + menu) ──────────────────────────
const TENANTS: (RestaurantInfo & { menu: SeedCategory[] })[] = [
  {
    slug: 'tun-lahmajo',
    name: 'TUN LAHMAJO',
    themeKey: 'aria',
    defaultLang: 'hy',
    email: 'info@tun-lahmajo.am',
    phone: '+374 99 230696',
    address: 'Աբովյան 12, Երևան',
    currency: 'AMD',
    timezone: 'Asia/Yerevan',
    workingHours: '09:00 – 23:00',
    rating: 4.8,
    tagline: { hy: 'Ավանդական հայկական համեր', en: 'Traditional Armenian flavors', ru: 'Традиционные армянские вкусы' },
    coverImageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200',
    social: { instagram: 'https://instagram.com/tunlahmajo', facebook: 'https://facebook.com/tunlahmajo', website: 'https://tun-lahmajo.am' },
    colors: { primaryColor: '#3E2723', accentColor: '#C69A5A' },
    menu: [
      {
        section: SectionType.FOOD, icon: '🥙', name: { hy: 'Լահմաջո', en: 'Lahmajo', ru: 'Лахмаджо' },
        products: [
          { price: 900, name: { hy: 'Դասական լահմաջո', en: 'Classic lahmajo', ru: 'Классический лахмаджо' }, desc: { hy: 'Տավարի մսով', en: 'With beef', ru: 'С говядиной' }, badges: ['hit'] },
          { price: 1100, name: { hy: 'Կծու լահմաջո', en: 'Spicy lahmajo', ru: 'Острый лахмаджо' }, badges: ['spicy'] },
        ],
      },
      {
        section: SectionType.FOOD, icon: '🍢', name: { hy: 'Խորոված', en: 'BBQ', ru: 'Шашлык' },
        products: [
          { price: 3200, name: { hy: 'Խոզի խորոված', en: 'Pork BBQ', ru: 'Свиной шашлык' }, badges: ['recommended'] },
          { price: 3600, name: { hy: 'Հավի խորոված', en: 'Chicken BBQ', ru: 'Куриный шашлык' } },
        ],
      },
      {
        section: SectionType.DRINKS, icon: '🥤', name: { hy: 'Ըմպելիքներ', en: 'Drinks', ru: 'Напитки' },
        products: [
          { price: 500, name: { hy: 'Թան', en: 'Tan', ru: 'Тан' } },
          { price: 700, name: { hy: 'Կոմպոտ', en: 'Compote', ru: 'Компот' }, badges: ['new'] },
        ],
      },
    ],
  },
  {
    slug: 'yasaman',
    name: 'YASAMAN',
    themeKey: 'maison',
    defaultLang: 'hy',
    email: 'info@yasaman.am',
    phone: '+374 10 555 444',
    address: 'Սայաթ-Նովա 40, Երևան',
    currency: 'AMD',
    timezone: 'Asia/Yerevan',
    workingHours: '11:00 – 24:00',
    rating: 4.6,
    tagline: { hy: 'Արևելյան հյուրընկալություն', en: 'Eastern hospitality', ru: 'Восточное гостеприимство' },
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    social: { instagram: 'https://instagram.com/yasaman', facebook: 'https://facebook.com/yasaman', website: 'https://yasaman.am' },
    colors: { primaryColor: '#4A2C2A', accentColor: '#B58A5A' },
    menu: [
      {
        section: SectionType.FOOD, icon: '🍖', name: { hy: 'Քյաբաբ', en: 'Kebab', ru: 'Кебаб' },
        products: [
          { price: 2900, name: { hy: 'Իշխանական քյաբաբ', en: 'Royal kebab', ru: 'Королевский кебаб' }, badges: ['hit'] },
          { price: 2400, name: { hy: 'Բանջարեղենով դոլմա', en: 'Veggie dolma', ru: 'Овощная долма' }, badges: ['vegan'] },
        ],
      },
      {
        section: SectionType.DRINKS, icon: '🍷', name: { hy: 'Գինի', en: 'Wine', ru: 'Вино' },
        products: [
          { price: 4500, name: { hy: 'Կարմիր գինի', en: 'Red wine', ru: 'Красное вино' }, badges: ['recommended'] },
          { price: 4500, name: { hy: 'Սպիտակ գինի', en: 'White wine', ru: 'Белое вино' } },
        ],
      },
    ],
  },
  {
    slug: 'karas',
    name: 'KARAS',
    themeKey: 'atelier',
    defaultLang: 'hy',
    email: 'info@karas.am',
    phone: '+374 60 700 700',
    address: 'Թումանյան 8, Երևան',
    currency: 'AMD',
    timezone: 'Asia/Yerevan',
    workingHours: '10:00 – 23:00',
    rating: 4.9,
    tagline: { hy: 'Հայկական խոհանոց՝ նոր շունչով', en: 'Armenian cuisine, reimagined', ru: 'Армянская кухня по-новому' },
    coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
    social: { instagram: 'https://instagram.com/karas', facebook: 'https://facebook.com/karas', website: 'https://karas.am' },
    colors: { primaryColor: '#2B2B2B', accentColor: '#A8884C' },
    menu: [
      {
        section: SectionType.FOOD, icon: '🍲', name: { hy: 'Ավանդական', en: 'Traditional', ru: 'Традиционные' },
        products: [
          { price: 2200, name: { hy: 'Տոլմա', en: 'Tolma', ru: 'Толма' }, badges: ['hit'] },
          { price: 5000, name: { hy: 'Խաշ', en: 'Khash', ru: 'Хаш' }, desc: { hy: 'Ձմեռային', en: 'Winter special', ru: 'Зимнее' } },
        ],
      },
      {
        section: SectionType.DRINKS, icon: '🥤', name: { hy: 'Ըմպելիքներ', en: 'Drinks', ru: 'Напитки' },
        products: [
          { price: 600, name: { hy: 'Հանքային ջուր', en: 'Mineral water', ru: 'Минеральная вода' } },
          { price: 900, name: { hy: 'Թարմ հյութ', en: 'Fresh juice', ru: 'Свежий сок' }, badges: ['new'] },
        ],
      },
    ],
  },
]

async function main() {
  const langs = await seedLanguages()
  await seedThemes()
  await seedPlans()
  await seedSystemBadges(langs)

  // Map system badge keys → ids (for product badge links).
  const systemBadges = await prisma.badge.findMany({ where: { restaurantId: null } })
  const badgeIdByKey = new Map(systemBadges.map((b) => [b.key, b.id]))

  for (const t of TENANTS) {
    const restaurant = await seedRestaurant({ ...t, langs })
    await seedMenu(restaurant.id, langs, badgeIdByKey, t.menu)
  }

  // silence unused import in the structure template
  void randomUUID
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
