<script setup lang="ts">
const { L } = useLandingI18n()
const { locale, toLocale } = useLocale()
// Keep every footer link within the visitor's language: hash anchors get the
// locale home prefix, real routes get the locale prefix via toLocale.
const lz = (h: string) =>
  h.startsWith('/#') ? (locale.value === 'hy' ? h : `/${locale.value}${h}`) : toLocale(h, locale.value)
const cols = computed(() => [
  { title: L.value.footer.product, links: [{ t: L.value.footer.links.features, h: '/#features' }, { t: L.value.footer.links.themes, h: '/#themes' }, { t: L.value.footer.links.pricing, h: '/#pricing' }, { t: L.value.footer.links.demo, h: '/#demo' }] },
  { title: L.value.footer.guides, links: [{ t: 'QR Menu', h: '/qr-menu' }, { t: 'Online Menu', h: '/online-menu' }, { t: 'Restaurant Menu', h: '/restaurant-menu' }, { t: L.value.footer.links.blog, h: '/blog' }] },
  { title: L.value.footer.company, links: [{ t: L.value.footer.links.about, h: '/#about' }, { t: L.value.footer.links.faq, h: '/#faq' }] },
])
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#080B16] pt-16 pb-8 text-slate-400">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <div class="flex items-center gap-2.5 text-white">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M7.5 23V10.6c0-.9 1.1-1.3 1.7-.6l6.8 7.7 6.8-7.7c.6-.7 1.7-.3 1.7.6V23" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="16" cy="23.5" r="1.6" fill="#FBBF24" />
              </svg>
            </span>
            <span class="text-[15px] font-bold">Menus</span>
          </div>
          <p class="mt-4 max-w-xs text-sm leading-relaxed">{{ L.footer.tagline }}</p>
        </div>

        <div v-for="c in cols" :key="c.title">
          <p class="text-sm font-semibold text-white">{{ c.title }}</p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li v-for="l in c.links" :key="l.t"><a :href="lz(l.h)" class="transition hover:text-white">{{ l.t }}</a></li>
          </ul>
        </div>

        <div>
          <p class="text-sm font-semibold text-white">{{ L.footer.contact }}</p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li><a href="tel:+37493632003" class="transition hover:text-white">+374 93 632 003</a></li>
            <li><a href="mailto:menusam9995@gmail.com" class="transition hover:text-white">menusam9995@gmail.com</a></li>
            <li>{{ L.footer.city }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
        <p>© {{ year }} Menus.am։ {{ L.footer.rights }}</p>
        <p>{{ L.footer.madeIn }}</p>
      </div>
    </div>
  </footer>
</template>
