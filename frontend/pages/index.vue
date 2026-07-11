<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────
// Marketing landing — home page ONLY. Every section is its own
// component under components/landing/. The `.landing` root scopes the
// modern Inter/dark theme so it never leaks into tenant/admin pages.
// ─────────────────────────────────────────────────────────────────
import { websiteSchema, organizationSchema } from '~/data/seo'
useHead({
  title: 'QR Menu & Online Menu Platform | menus.am',
  meta: [
    { name: 'description', content: 'Ստեղծեք ժամանակակից QR Menu ձեզ համար։ Թվային մենյու, 3 լեզու, AI թարգմանություն, հեշտ կառավարում, Online Menu և QR Code Menu՝ menus.am-ում։' },
    { name: 'theme-color', content: '#0B1020' },
  ],
  link: [{ rel: 'canonical', href: 'https://menus.am' }],
})

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
