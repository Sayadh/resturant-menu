// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    // SSR-only: the server calls the backend directly (localhost, fast).
    apiBaseServer: process.env.NUXT_API_BASE_SERVER || 'http://127.0.0.1:4000/api/v1',
    public: {
      // Client API base. Production: '/api/v1' (same-origin behind nginx).
      // Local dev: full backend URL (see frontend/.env) since Nitro owns /api.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api/v1',
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  app: {
    head: {
      title: 'QR Menu Platform — Ձեր թվային մենյուն',
      htmlAttrs: { lang: 'hy' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'Ստեղծեք ձեր թվային QR մենյուն՝ գեղեցիկ, բազմալեզու և հեշտ կառավարվող։ Պրեմիում թեմաներ, ակնթարթային թարմացումներ, QR կոդ։',
        },
        { name: 'theme-color', content: '#0B1020' },
        // Open Graph / link previews (Telegram, Messenger, etc.)
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'QR Menu Platform' },
        { property: 'og:title', content: 'QR Menu Platform — Ձեր թվային մենյուն' },
        {
          property: 'og:description',
          content:
            'Ստեղծեք ձեր թվային QR մենյուն՝ գեղեցիկ, բազմալեզու և հեշտ կառավարվող։',
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'QR Menu Platform — Ձեր թվային մենյուն' },
        {
          name: 'twitter:description',
          content: 'Ստեղծեք ձեր թվային QR մենյուն՝ գեղեցիկ, բազմալեզու և հեշտ կառավարվող։',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600;700;800;900&family=Noto+Serif+Armenian:wght@400;500;600;700&family=Noto+Sans+Armenian:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },
})
