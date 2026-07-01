// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    // SSR-only: the server calls the backend directly (local, fast).
    apiBaseServer: process.env.NUXT_API_BASE_SERVER || 'http://127.0.0.1:4000/api/v1',
    public: {
      // Client: RELATIVE path → goes to the same origin and is proxied to the
      // backend by Nitro (see nitro.devProxy). This means ONE tunnel/domain is
      // enough (no CORS, no second URL). Override with NUXT_PUBLIC_API_BASE only
      // for a real deploy where the API lives on a different domain.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api/v1',
      // 'true' → use the real NestJS API; anything else → mock/localStorage layer.
      useApi: process.env.NUXT_PUBLIC_USE_API === 'true',
      // Default tenant slug used by the admin demo / landing.
      defaultSlug: process.env.NUXT_PUBLIC_DEFAULT_SLUG || 'tun-lahmajo',
    },
  },
  // Proxy /api/* to the local NestJS backend so the whole app is served from a
  // single origin (works through one Cloudflare tunnel, no CORS needed).
  nitro: {
    devProxy: {
      '/api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
    },
  },
   vite: {
    server: {
      allowedHosts: true
    }
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  app: {
    head: {
      title: 'TUN LAHMAJO — Ավանդական հայկական համեր',
      htmlAttrs: { lang: 'hy' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'TUN LAHMAJO — ավանդական հայկական ճաշարան Երևանում: Թարմ բաղադրիչներ, տնական համեր և ջերմ հյուրընկալություն:',
        },
        { name: 'theme-color', content: '#F5EFE2' },
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
