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
  // 301 redirects from the old (Armenian-transliterated) blog slugs to the new
  // English ones, so any indexed/shared old URLs don't 404 and pass link equity.
  routeRules: {
    '/blog/inch-e-qr-menu': { redirect: { to: '/blog/what-is-qr-menu', statusCode: 301 } },
    '/blog/inchpes-stexcel-qr-menu': { redirect: { to: '/blog/how-to-create-qr-menu', statusCode: 301 } },
    '/blog/lavaguyn-qr-menu-hamakargery': { redirect: { to: '/blog/best-qr-menu-platforms', statusCode: 301 } },
    '/blog/inchpes-tarmacnel-menyun-arcanc': { redirect: { to: '/blog/how-to-update-menu', statusCode: 301 } },
    '/blog/inchu-yntrel-tvayin-menyu': { redirect: { to: '/blog/digital-menu', statusCode: 301 } },
    '/blog/qr-menu-aravelutyunnery': { redirect: { to: '/blog/qr-menu-benefits', statusCode: 301 } },
  },
  app: {
    head: {
      title: 'QR Menu & Online Menu Platform | menus.am',
      htmlAttrs: { lang: 'hy' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'Ստեղծեք ժամանակակից QR Menu ձեզ համար։ Թվային մենյու, 3 լեզու, AI թարգմանություն, հեշտ կառավարում, Online Menu և QR Code Menu՝ menus.am-ում։',
        },
        {
          name: 'keywords',
          content:
            'QR Menu, Online Menu, QR Code Menu, Digital Menu, Restaurant Menu, թվային մենյու, QR մենյու, օնլայն մենյու, ռեստորանի մենյու, menus.am',
        },
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
        { name: 'theme-color', content: '#0B1020' },
        // Open Graph / link previews (Telegram, Messenger, Facebook, etc.)
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Menus.am' },
        { property: 'og:url', content: 'https://menus.am' },
        { property: 'og:title', content: 'QR Menu & Online Menu Platform | menus.am' },
        {
          property: 'og:description',
          content:
            'Ստեղծեք ժամանակակից QR Menu ձեզ համար։ Թվային մենյու, 3 լեզու, AI թարգմանություն, Online Menu և QR Code Menu՝ menus.am-ում։',
        },
        { property: 'og:image', content: 'https://menus.am/og-image.png' },
        { property: 'og:image:secure_url', content: 'https://menus.am/og-image.png' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Menus.am — թվային QR մենյու հարթակ' },
        { property: 'og:locale', content: 'hy_AM' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Menus.am — Ձեր թվային մենյուն՝ գեղեցիկ և պրոֆեսիոնալ' },
        {
          name: 'twitter:description',
          content: 'Թվային QR մենյու սննդի և հյուրընկալության ոլորտի բոլոր բիզնեսների համար։',
        },
        { name: 'twitter:image', content: 'https://menus.am/og-image.png' },
      ],
      link: [
        { rel: 'canonical', href: 'https://menus.am' },
        // Brand favicon (replaces the default browser globe)
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },
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
