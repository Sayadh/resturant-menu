import { seoPageSlugs } from '~/data/seoPages'
import { publishedArticles } from '~/data/blog'

// Dynamic sitemap covering the homepage, keyword SEO pages and blog articles.
export default defineEventHandler((event) => {
  const base = 'https://menus.am'
  const today = new Date().toISOString().slice(0, 10)

  const entries: { loc: string; priority: string; changefreq: string }[] = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'daily' },
    ...seoPageSlugs.map((s) => ({ loc: `/${s}`, priority: '0.9', changefreq: 'weekly' })),
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
