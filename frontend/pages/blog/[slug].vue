<script setup lang="ts">
import { getArticle, publishedArticles, localizeArticle } from '~/data/blog'
import { SITE, breadcrumbSchema } from '~/data/seo'

const { L, lang } = useLandingI18n()
const { toLocale, absolute } = useLocale()
const route = useRoute()
const article = getArticle(route.params.slug as string)
if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })

definePageMeta({ alias: ['/ru/blog/:slug', '/en/blog/:slug'] })

// Per-locale views so title/description are localized on their own URL.
const byLocale = { hy: localizeArticle(article, 'hy'), ru: localizeArticle(article, 'ru'), en: localizeArticle(article, 'en') }
const view = computed(() => byLocale[lang.value])
const canonicalUrl = computed(() => absolute(toLocale(`/blog/${article!.slug}`, lang.value)))
const related = computed(() =>
  publishedArticles().filter((a) => a.slug !== article!.slug).slice(0, 3).map((a) => localizeArticle(a, lang.value)),
)
const blogHome = computed(() => toLocale('/blog', lang.value))
const relatedPath = (slug: string) => toLocale(`/blog/${slug}`, lang.value)
const pricingHref = computed(() => (lang.value === 'hy' ? '/#pricing' : `/${lang.value}#pricing`))

useI18nSeo(() => ({
  base: `/blog/${article!.slug}`,
  type: 'article',
  title: {
    hy: `${byLocale.hy.title} | menus.am`,
    ru: `${byLocale.ru.title} | menus.am`,
    en: `${byLocale.en.title} | menus.am`,
  },
  description: { hy: byLocale.hy.description, ru: byLocale.ru.description, en: byLocale.en.description },
}))

useJsonLd(() => [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: view.value.title,
    description: view.value.description,
    datePublished: article!.date,
    dateModified: article!.date,
    author: { '@type': 'Organization', name: SITE.brand, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.brand, logo: { '@type': 'ImageObject', url: SITE.logo } },
    mainEntityOfPage: canonicalUrl.value,
    image: SITE.ogImage,
    inLanguage: lang.value,
  },
  breadcrumbSchema([
    { name: 'Գլխավոր', url: SITE.url },
    { name: 'Բլոգ', url: absolute(toLocale('/blog', lang.value)) },
    { name: view.value.title, url: canonicalUrl.value },
  ]),
])
</script>

<template>
  <div class="landing">
    <LandingNav solid />
    <article class="mx-auto max-w-3xl px-5 pt-32 pb-16 sm:px-8 sm:pt-40">
      <NuxtLink :to="blogHome" class="text-sm font-semibold text-indigo-600 hover:underline">{{ L.blog.back }}</NuxtLink>
      <span class="mt-6 block text-xs font-semibold uppercase tracking-wide text-indigo-500">{{ view.keyword }}</span>
      <h1 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{{ view.title }}</h1>
      <time class="mt-3 block text-sm text-slate-400">{{ new Date(view.date).toLocaleDateString(L.blog.locale, { year: 'numeric', month: 'long', day: 'numeric' }) }}</time>

      <div class="mt-8 space-y-5">
        <template v-for="(b, i) in view.body" :key="i">
          <h2 v-if="b.h2" class="pt-3 text-2xl font-bold tracking-tight text-slate-900">{{ b.h2 }}</h2>
          <p class="text-base leading-relaxed text-slate-600 sm:text-lg">{{ b.p }}</p>
        </template>
      </div>

      <!-- CTA -->
      <div class="mt-12 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-center text-white">
        <h3 class="text-xl font-bold">{{ L.blog.ctaTitle }}</h3>
        <p class="mx-auto mt-2 max-w-md text-sm text-indigo-100">{{ L.blog.ctaText }}</p>
        <NuxtLink :to="pricingHref" class="mt-5 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5">{{ L.blog.ctaBtn }}</NuxtLink>
      </div>

      <!-- Related -->
      <div v-if="related.length" class="mt-14">
        <h3 class="text-lg font-bold text-slate-900">{{ L.blog.related }}</h3>
        <div class="mt-5 grid gap-4 sm:grid-cols-3">
          <NuxtLink v-for="r in related" :key="r.slug" :to="relatedPath(r.slug)" class="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            {{ r.title }}
          </NuxtLink>
        </div>
      </div>
    </article>
    <LandingFooter />
    <LandingContactModal />
  </div>
</template>

<style scoped>
.landing {
  --nav-h: 64px;
  font-family: 'Inter', 'Noto Sans Armenian', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: #ffffff;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
}
.landing :deep(*) {
  font-family: inherit;
}
</style>
