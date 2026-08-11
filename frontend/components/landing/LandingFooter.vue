<script setup lang="ts">
const { L } = useLandingI18n()
const { locale, toLocale } = useLocale()
const lz = (h: string) =>
  h.startsWith('/#') ? (locale.value === 'hy' ? h : `/${locale.value}${h}`) : toLocale(h, locale.value)
const cols = computed(() => [
  { title: L.value.footer.product, links: [{ t: L.value.footer.links.features, h: '/#features' }, { t: L.value.footer.links.themes, h: '/#themes' }, { t: L.value.footer.links.pricing, h: '/#pricing' }, { t: L.value.footer.links.demo, h: '/#demo' }] },
  { title: L.value.footer.guides, links: [{ t: 'QR Menu', h: '/qr-menu' }, { t: 'Online Menu', h: '/online-menu' }, { t: 'Restaurant Menu', h: '/restaurant-menu' }, { t: L.value.footer.links.blog, h: '/blog' }] },
  { title: L.value.footer.company, links: [{ t: L.value.footer.links.about, h: '/#about' }, { t: L.value.footer.links.faq, h: '/#faq' }] },
])
const year = new Date().getFullYear()

const socials = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/menus.am',
    gradient: 'from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/menusam.official',
    gradient: 'from-[#1877F2] to-[#0C5DC7]',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
]
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

          <!-- Social icons -->
          <div class="mt-6 flex items-center gap-3">
            <a
              v-for="s in socials"
              :key="s.name"
              :href="s.href"
              :aria-label="s.name"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-white/10 text-slate-400 transition-all duration-300 hover:scale-110 hover:border-transparent hover:text-white hover:shadow-lg"
            >
              <!-- gradient bg on hover -->
              <span
                class="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                :class="s.gradient"
              />
              <span class="relative z-10" v-html="s.icon" />
            </a>
          </div>
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
            <li><a href="tel:+37477135299" class="transition hover:text-white">+374 77 135 299</a></li>
            <li><a href="mailto:menusam9995@gmail.com" class="transition hover:text-white">menusam9995@gmail.com</a></li>
            <li>{{ L.footer.city }}</li>
          </ul>
          <!-- Social links text -->
          <div class="mt-5 space-y-2">
            <a
              href="https://www.instagram.com/menus.am"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-sm transition hover:text-[#e6683c]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              @menus.am
            </a>
            <a
              href="https://www.facebook.com/menusam.official"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-sm transition hover:text-[#1877F2]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              menusam.official
            </a>
          </div>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
        <p>© {{ year }} Menus.am։ {{ L.footer.rights }}</p>
        <div class="flex items-center gap-4">
          <a href="https://www.instagram.com/menus.am" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="transition hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.facebook.com/menusam.official" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="transition hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <p>{{ L.footer.madeIn }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

