<script setup lang="ts">
const cols = [
  { title: 'Ապրանք', links: [{ t: 'Հնարավորություններ', h: '#features' }, { t: 'Թեմաներ', h: '#themes' }, { t: 'Գնացուցակ', h: '#pricing' }, { t: 'Դեմո', h: '#demo' }] },
  { title: 'Ընկերություն', links: [{ t: 'Մեր մասին', h: '#about' }, { t: 'Հաճախ տրվող հարցեր', h: '#faq' }] },
]
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#080B16] pt-16 pb-8 text-slate-400">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
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
          <p class="mt-4 max-w-xs text-sm leading-relaxed">Ձեր թվային մենյուն՝ գեղեցիկ, արագ և միշտ արդիական։</p>
        </div>

        <div v-for="c in cols" :key="c.title">
          <p class="text-sm font-semibold text-white">{{ c.title }}</p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li v-for="l in c.links" :key="l.t"><a :href="l.h" class="transition hover:text-white">{{ l.t }}</a></li>
          </ul>
        </div>

        <div>
          <p class="text-sm font-semibold text-white">Կապ</p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li><a href="tel:+37493632003" class="transition hover:text-white">+374 93 632 003</a></li>
            <li><a href="mailto:info@menus.am" class="transition hover:text-white">info@menus.am</a></li>
            <li>Երևան, Հայաստան</li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
        <p>© {{ year }} Menus.am։ Բոլոր իրավունքները պաշտպանված են։</p>
        <p>Ստեղծված է ❤ Հայաստանում</p>
      </div>
    </div>
  </footer>
</template>
