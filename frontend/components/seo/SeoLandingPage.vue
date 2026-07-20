<script setup lang="ts">
// Reusable keyword landing page. Given a slug, it pulls its content from
// data/seoPages, sets unique <title>/description/canonical + JSON-LD
// (SoftwareApplication, FAQPage, Breadcrumb) and reuses the marketing blocks.
import { seoPages, localizeSeoPage } from '~/data/seoPages'
import { SITE, faqSchema, breadcrumbSchema, softwareSchema } from '~/data/seo'

const props = defineProps<{ slug: string }>()
const page = seoPages[props.slug]
const { openModal } = useLeadModal()
const { L, lang } = useLandingI18n()
const { toLocale, absolute } = useLocale()

// Per-locale content so each language URL carries its own localized <head>.
const byLocale = { hy: localizeSeoPage(page, 'hy'), ru: localizeSeoPage(page, 'ru'), en: localizeSeoPage(page, 'en') }
const view = computed(() => byLocale[lang.value])
const canonicalUrl = computed(() => absolute(toLocale(`/${props.slug}`, lang.value)))
const pricingHref = computed(() => (lang.value === 'hy' ? '/#pricing' : `/${lang.value}#pricing`))

useI18nSeo(() => ({
  base: `/${props.slug}`,
  title: { hy: byLocale.hy.title, ru: byLocale.ru.title, en: byLocale.en.title },
  description: { hy: byLocale.hy.description, ru: byLocale.ru.description, en: byLocale.en.description },
}))

useJsonLd(() => [
  softwareSchema,
  faqSchema(view.value.faq),
  breadcrumbSchema([
    { name: 'Գլխավոր', url: absolute(toLocale('/', lang.value)) },
    { name: view.value.keyword, url: canonicalUrl.value },
  ]),
])
</script>

<template>
  <div class="landing">
    <LandingNav />
    <main>
      <!-- Hero -->
      <section class="relative overflow-hidden bg-[#0B1020] px-5 pt-32 pb-20 text-white sm:px-8 sm:pt-40">
        <div class="pointer-events-none absolute inset-0">
          <div class="absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
          <div class="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        </div>
        <div class="relative mx-auto max-w-4xl text-center">
          <span class="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-indigo-200 ring-1 ring-white/10">{{ view.keyword }}</span>
          <h1 class="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">{{ view.h1 }}</h1>
          <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{{ view.intro }}</p>
          <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button type="button" class="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-semibold shadow-xl shadow-indigo-600/30 transition hover:-translate-y-0.5" @click="openModal(view.keyword)">{{ L.hero.start }}</button>
            <NuxtLink :to="pricingHref" class="rounded-2xl px-6 py-3.5 text-sm font-semibold text-slate-200 ring-1 ring-white/15 transition hover:bg-white/5">{{ L.pricing.view }}</NuxtLink>
          </div>
        </div>
      </section>

      <!-- Content sections -->
      <section class="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div v-for="s in view.sections" :key="s.h2" class="mb-10 last:mb-0">
          <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{{ s.h2 }}</h2>
          <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">{{ s.body }}</p>
        </div>
      </section>

      <!-- Visible FAQ (matches the FAQPage schema) -->
      <section class="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20">
        <div class="mx-auto max-w-3xl">
          <h2 class="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{{ L.faq.titleA }} {{ L.faq.highlight }}</h2>
          <div class="mt-10 space-y-3.5">
            <div v-for="f in view.faq" :key="f.q" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 class="font-semibold text-slate-900">{{ f.q }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ f.a }}</p>
            </div>
          </div>
        </div>
      </section>

      <LandingPricing />
      <LandingCta />
    </main>
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
