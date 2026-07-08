<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────
// Marketing landing — home page ONLY. Every section is its own
// component under components/landing/. The `.landing` root scopes the
// modern Inter/dark theme so it never leaks into tenant/admin pages.
// ─────────────────────────────────────────────────────────────────
import { websiteSchema, organizationSchema, softwareSchema, faqSchema, homeFaq } from '~/data/seo'

useHead({
  title: 'QR Menu & Online Menu Platform | menus.am',
  meta: [
    { name: 'description', content: 'Ստեղծեք ժամանակակից QR Menu ձեզ համար։ Թվային մենյու, 3 լեզու, AI թարգմանություն, հեշտ կառավարում, Online Menu և QR Code Menu՝ menus.am-ում։' },
    { name: 'theme-color', content: '#0B1020' },
  ],
  link: [{ rel: 'canonical', href: 'https://menus.am' }],
})

// Structured data — helps Google understand the platform (rich results).
useJsonLd([websiteSchema, organizationSchema, softwareSchema, faqSchema(homeFaq)])
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
