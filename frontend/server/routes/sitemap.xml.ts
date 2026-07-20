import { seoPageSlugs } from '~/data/seoPages'
import { publishedArticles } from '~/data/blog'

// Dynamic sitemap. Marketing pages are emitted in all three languages
// (hy at root, /ru, /en) with hreflang alternates so Google indexes each
// language separately. Tenant restaurant menus are single-locale.
const LOCALES = ['hy', 'ru', 'en'] as const
const BASE = 'https://menus.am'

const toLoc = (base: string, loc: string) => {
  const clean = base === '/' ? '' : base
  return loc === 'hy' ? clean || '/' : `/${loc}${clean}`
}
const abs = (path: string) => `${BASE}${path === '/' ? '' : path}`

export default defineEventHandler(async (event) => {
  const today = new Date().toISOString().slice(0, 10)
  const config = useRuntimeConfig(event)
  const apiBase = (config.apiBaseServer as string) || 'http://127.0.0.1:4000/api/v1'

  // Restaurant slugs — best effort; if the API is unreachable, keep the rest.
  let restaurantSlugs: string[] = []
  try {
    const res = await $fetch<
      { success?: boolean; data?: { slug: string }[] } | { slug: string }[]
    >(`${apiBase}/public/restaurants`)
    const rows = Array.isArray(res) ? res : (res.data ?? [])
    restaurantSlugs = rows.map((r) => r.slug).filter(Boolean)
  } catch {
    /* ignore — sitemap still serves the static entries */
  }

  // Locale-independent marketing routes (each expands into 3 language URLs).
  const marketing: { base: string; priority: string; changefreq: string }[] = [
    { base: '/', priority: '1.0', changefreq: 'weekly' },
    { base: '/blog', priority: '0.8', changefreq: 'daily' },
    ...seoPageSlugs.map((s) => ({ base: `/${s}`, priority: '0.9', changefreq: 'weekly' })),
    ...publishedArticles().map((a) => ({ base: `/blog/${a.slug}`, priority: '0.7', changefreq: 'monthly' })),
  ]

  const marketingUrls = marketing
    .flatMap((m) =>
      LOCALES.map((loc) => {
        const alternates = LOCALES.map(
          (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(toLoc(m.base, l))}"/>`,
        )
        alternates.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(toLoc(m.base, 'hy'))}"/>`,
        )
        return `  <url>
    <loc>${abs(toLoc(m.base, loc))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${m.changefreq}</changefreq>
    <priority>${m.priority}</priority>
${alternates.join('\n')}
  </url>`
      }),
    )
    .join('\n')

  const tenantUrls = restaurantSlugs
    .map(
      (s) =>
        `  <url><loc>${abs(`/${s}`)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    )
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${marketingUrls}
${tenantUrls}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
