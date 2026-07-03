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
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black">QR</span>
            <span class="text-[15px] font-bold">QR MENU</span>
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
            <li>+374 93 632 003</li>
            <li>info@qrmenu.am</li>
            <li>Երևան, Հայաստան</li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
        <p>© {{ year }} QR Menu Platform։ Բոլոր իրավունքները պաշտպանված են։</p>
        <p>Ստեղծված է ❤ Հայաստանում</p>
      </div>
    </div>
  </footer>
</template>
