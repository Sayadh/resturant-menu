<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────
// Marketing landing — home page ONLY. Every section is its own
// component under components/landing/. The `.landing` root scopes the
// modern Inter/dark theme so it never leaks into tenant/admin pages.
// ─────────────────────────────────────────────────────────────────
import { websiteSchema, organizationSchema } from '~/data/seo'

// hy at root, ru → /ru, en → /en (real per-language URLs for SEO).
definePageMeta({ alias: ['/ru', '/en'] })

useI18nSeo({
  base: '/',
  title: {
    hy: 'QR Menu և Online Menu հարթակ | menus.am',
    ru: 'Платформа QR-меню и онлайн-меню для ресторанов | menus.am',
    en: 'QR Menu & Online Menu Platform for Restaurants | menus.am',
  },
  description: {
    hy: 'Ստեղծեք ժամանակակից QR Menu ձեզ համար։ Թվային մենյու, 3 լեզու, AI թարգմանություն, հեշտ կառավարում, Online Menu և QR Code Menu՝ menus.am-ում։',
    ru: 'Создайте современное QR-меню для ресторана или кафе. Цифровое меню, 3 языка, AI-перевод, простое управление, онлайн-меню и QR-код меню на menus.am.',
    en: 'Create a modern QR menu for your restaurant or café. Digital menu, 3 languages, AI translation, easy management, online menu and QR code menu on menus.am.',
  },
})
useHead({ meta: [{ name: 'theme-color', content: '#0B1020' }] })

// Structured data — helps Google understand the platform (rich results).
useJsonLd([websiteSchema, organizationSchema])

const { L } = useLandingI18n()

// Generate dynamic schemas based on our landing translations
const faqItems = computed(() => L.value.faq.items)

const pricingPlans = computed(() => [
  {
    name: L.value.pricing.starter || 'Starter',
    price: 4900,
    description: L.value.pricing.starterHint || 'Սկսնակ փաթեթ փոքր սննդի բիզնեսների համար։',
  },
  {
    name: L.value.pricing.professional || 'Professional',
    price: 9900,
    description: L.value.pricing.proHint || 'Մասնագիտական փաթեթ՝ ընդլայնված հնարավորություններով և մինչև 3 լեզվով։',
  },
  {
    name: L.value.pricing.business || 'Business',
    price: 29900,
    description: L.value.pricing.bizHint || 'Բիզնես փաթեթ՝ սեփական դոմեյնի և ամբողջական հնարավորությունների համար։',
  },
])

useHomeStructuredData({
  faqItems: faqItems.value,
  pricingPlans: pricingPlans.value,
})
</script>

<template>
  <div class="landing">
    <LandingNav />
    <main>
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingDemo />
      <LandingAdminPreview />
      <LandingThemes />
      <LandingPricing />
      <LandingAbout />
      <LandingFaq />
      <LandingCta />
    </main>
    <LandingFooter />
    <LandingContactModal />
  </div>
</template>

<style scoped>
/* Scoped to the landing page only — modern sans stack + white base,
   overriding the global serif/parchment used by tenant menus. */
.landing {
  /* Anchor scroll offset for the fixed nav (global default is 160px for menus). */
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
