import { seoPageSlugs } from '~/data/seoPages'
import { publishedArticles } from '~/data/blog'

// Dynamic sitemap: homepage, keyword SEO pages, blog articles AND every
// published restaurant menu page (fetched from the backend at request time).
export default defineEventHandler(async (event) => {
  const base = 'https://menus.am'
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

  const entries: { loc: string; priority: string; changefreq: string }[] = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'daily' },
    ...seoPageSlugs.map((s) => ({ loc: `/${s}`, priority: '0.9', changefreq: 'weekly' })),
    ...restaurantSlugs.map((s) => ({ loc: `/${s}`, priority: '0.8', changefreq: 'weekly' })),
    ...publishedArticles().map((a) => ({ loc: `/blog/${a.slug}`, priority: '0.7', changefreq: 'monthly' })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
    .map(
      (e) =>
        `  <url><loc>${base}${e.loc}</loc><lastmod>${today}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
    )
    .join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
