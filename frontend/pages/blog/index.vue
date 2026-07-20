<script setup lang="ts">
import { publishedArticles, localizeArticle } from '~/data/blog'

const { L, lang } = useLandingI18n()
const { toLocale } = useLocale()
const articles = computed(() => publishedArticles().map((a) => localizeArticle(a, lang.value)))
// Keep in-page links within the current locale (/ru/blog/… , /en/blog/…).
const blogPath = (slug: string) => toLocale(`/blog/${slug}`, lang.value)

definePageMeta({ alias: ['/ru/blog', '/en/blog'] })
useI18nSeo({
  base: '/blog',
  title: {
    hy: 'Բլոգ — QR Menu, Online Menu և թվային մենյու | menus.am',
    ru: 'Блог — QR-меню, онлайн-меню и цифровое меню | menus.am',
    en: 'Blog — QR Menu, Online Menu & Digital Menu | menus.am',
  },
  description: {
    hy: 'QR Menu, Online Menu և թվային մենյուի մասին ուղեցույցներ, խորհուրդներ և հոդվածներ՝ menus.am-ի բլոգում։',
    ru: 'Руководства, советы и статьи о QR-меню, онлайн-меню и цифровом меню в блоге menus.am.',
    en: 'Guides, tips and articles about QR menus, online menus and digital menus on the menus.am blog.',
  },
})
</script>

<template>
  <div class="landing">
    <LandingNav solid />
    <main class="mx-auto max-w-5xl px-5 pt-32 pb-20 sm:px-8 sm:pt-40">
      <header class="text-center">
        <span class="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600">{{ L.blog.badge }}</span>
        <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{{ L.blog.title }}</h1>
        <p class="mx-auto mt-4 max-w-xl text-slate-500">{{ L.blog.subtitle }}</p>
      </header>

      <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="a in articles"
          :key="a.slug"
          :to="blogPath(a.slug)"
          class="group flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
        >
          <span class="text-xs font-semibold uppercase tracking-wide text-indigo-500">{{ a.keyword }}</span>
          <h2 class="mt-3 text-lg font-bold leading-snug text-slate-900 group-hover:text-indigo-700">{{ a.title }}</h2>
          <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{{ a.excerpt }}</p>
          <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">{{ L.blog.read }}</span>
        </NuxtLink>
      </div>
    </main>
    <LandingFooter />
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
