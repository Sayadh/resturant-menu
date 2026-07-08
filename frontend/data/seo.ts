// ─────────────────────────────────────────────────────────────────────────
// Central SEO data: site constants, reusable schema.org blocks and the
// keyword landing-page definitions. Keeping it here keeps pages thin and DRY.
// ─────────────────────────────────────────────────────────────────────────
export const SITE = {
  url: 'https://menus.am',
  name: 'menus.am',
  brand: 'Menus.am',
  logo: 'https://menus.am/favicon.svg',
  ogImage: 'https://menus.am/og-image.png',
  email: 'info@menus.am',
  phone: '+374 93 632 003',
  locale: 'hy_AM',
} as const

// ── Global schema.org blocks (homepage) ─────────────────────────────────────
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.brand,
  url: SITE.url,
  logo: SITE.logo,
  email: SITE.email,
  telephone: SITE.phone,
  address: { '@type': 'PostalAddress', addressLocality: 'Yerevan', addressCountry: 'AM' },
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'menus.am — QR Menu & Online Menu Platform',
  url: SITE.url,
  inLanguage: 'hy',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE.url}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Menus.am — QR Menu & Online Menu Platform',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  url: SITE.url,
  description:
    'QR Menu և Online Menu հարթակ ռեստորանների, սրճարանների և սննդի բիզնեսների համար՝ թվային մենյու, 3 լեզու, AI թարգմանություն, հեշտ կառավարում։',
  offers: { '@type': 'Offer', price: '4900', priceCurrency: 'AMD' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '320' },
}

export interface FaqItem { q: string; a: string }

export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function breadcrumbSchema(trail: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: t.url,
    })),
  }
}

// Homepage FAQ (search-intent). Also surfaced in the schema.
export const homeFaq: FaqItem[] = [
  { q: 'Ինչ է QR Menu-ն?', a: 'QR Menu-ն թվային մենյու է, որը հաճախորդը բացում է հեռախոսով՝ սեղանի QR կոդը սկանավորելով, առանց թղթային մենյուի։' },
  { q: 'Ինչ արժե QR Menu-ն?', a: 'menus.am-ում QR Menu-ն սկսվում է ամսական 4 900 ֏-ից՝ Starter փաթեթով։ Կան Professional և Business փաթեթներ ավելի մեծ հնարավորություններով։' },
  { q: 'Ինչպես է աշխատում QR Menu-ն?', a: 'Դուք ստեղծում եք ձեր թվային մենյուն ադմին վահանակից, ստանում QR կոդ և տպում այն սեղանների վրա։ Հաճախորդը սկանավորում է և տեսնում մենյուն ակնթարթորեն։' },
  { q: 'QR Menu-ն աշխատո՞ւմ է iPhone-ում։', a: 'Այո։ QR Menu-ն բացվում է ցանկացած iPhone-ի տեսախցիկով՝ առանց հավելված ներբեռնելու։' },
  { q: 'QR Menu-ն աշխատո՞ւմ է Android-ում։', a: 'Այո։ QR Menu-ն աշխատում է բոլոր Android սարքերում՝ ուղղակի տեսախցիկով սկանավորելով։' },
]
