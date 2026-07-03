<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────
// Marketing landing — home page ONLY. Every section is its own
// component under components/landing/. The `.landing` root scopes the
// modern Inter/dark theme so it never leaks into tenant/admin pages.
// ─────────────────────────────────────────────────────────────────
useHead({
  title: 'Menus.am — Ձեր թվային մենյուն',
  meta: [
    { name: 'description', content: 'Թվային QR մենյու սննդի և հյուրընկալության ոլորտի բոլոր բիզնեսների համար՝ ռեստորաններ, սրճարաններ, բարեր և ավելին։ Գեղեցիկ, բազմալեզու և հեշտ կառավարվող։' },
    { name: 'theme-color', content: '#0B1020' },
  ],
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
