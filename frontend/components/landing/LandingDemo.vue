<script setup lang="ts">
// Interactive live preview: switch theme + language on a real phone frame,
// plus a scannable QR that opens the live demo restaurant on the visitor's phone.
type ThemeKey = 'aria' | 'maison' | 'atelier'
type Lang = 'hy' | 'ru' | 'en'

const DEMO_SLUG = 'demo'

const themes: { key: ThemeKey; label: string }[] = [
  { key: 'aria', label: 'Aria' },
  { key: 'maison', label: 'Maison' },
  { key: 'atelier', label: 'Atelier' },
]
const langs: Lang[] = ['hy', 'ru', 'en']

const activeTheme = ref<ThemeKey>('aria')
const activeLang = ref<Lang>('hy')

// Per-theme visual tokens (Tailwind class strings).
const style: Record<ThemeKey, {
  screen: string; head: string; name: string; chip: string; chipOn: string;
  row: string; title: string; price: string; sub: string; dish: string; dark?: boolean
}> = {
  aria: {
    screen: 'bg-[#F7F5FF]', head: 'text-indigo-700', name: 'text-slate-900',
    chip: 'bg-indigo-100/70 text-indigo-500', chipOn: 'bg-indigo-600 text-white',
    row: 'bg-white', title: 'text-slate-800', price: 'text-indigo-600', sub: 'text-slate-400',
    dish: 'from-indigo-200 to-violet-200',
  },
  maison: {
    screen: 'bg-[#12100E]', head: 'text-amber-300', name: 'text-white',
    chip: 'bg-white/10 text-amber-200/70', chipOn: 'bg-amber-400 text-amber-950',
    row: 'bg-white/5', title: 'text-amber-50', price: 'text-amber-300', sub: 'text-white/40',
    dish: 'from-amber-700/50 to-stone-600/50', dark: true,
  },
  atelier: {
    screen: 'bg-[#FBF7F0]', head: 'text-emerald-700', name: 'text-stone-900',
    chip: 'bg-emerald-100/70 text-emerald-600', chipOn: 'bg-emerald-600 text-white',
    row: 'bg-white/70', title: 'text-stone-800', price: 'text-emerald-700', sub: 'text-stone-400',
    dish: 'from-emerald-200 to-teal-200',
  },
}
const cur = computed(() => style[activeTheme.value])

const restaurantName: Record<Lang, string> = { hy: 'Ձեր հաստատությունը', ru: 'Ваше заведение', en: 'Your Venue' }
const dishes: { price: string; name: Record<Lang, string>; sub: Record<Lang, string> }[] = [
  { price: '3 800', name: { hy: 'Խորոված', ru: 'Хоровац', en: 'Grilled meat' }, sub: { hy: 'Խնձորով', ru: 'С яблоком', en: 'With apple' } },
  { price: '1 500', name: { hy: 'Լահմաջո', ru: 'Лахмаджо', en: 'Lahmajo' }, sub: { hy: 'Ավանդական', ru: 'Традиционный', en: 'Traditional' } },
  { price: '2 900', name: { hy: 'Տոլմա', ru: 'Толма', en: 'Tolma' }, sub: { hy: 'Տնական', ru: 'Домашняя', en: 'Homemade' } },
]

const bullets = ['Ընտրեք թեմա', 'Փորձեք լեզուն', 'Դիտեք իրական մենյու']

// The demo link + QR follow the selected theme, so scanning/opening shows the
// same theme picked in the preview (?theme= is a render-only override).
const origin = ref('')
onMounted(() => (origin.value = window.location.origin))
const demoUrl = computed(() => `${origin.value}/${DEMO_SLUG}?theme=${activeTheme.value}`)
const qrSrc = computed(() =>
  origin.value
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(demoUrl.value)}`
    : '',
)
</script>

<template>
  <section id="demo" class="relative overflow-hidden bg-white py-24">
    <div class="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
      <!-- copy -->
      <LandingReveal>
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Փորձեք մեր <span class="text-indigo-600">դեմոն</span> հենց հիմա
        </h2>
        <p class="mt-4 max-w-md text-slate-500">Փոխեք թեման ու լեզուն ուղիղ այստեղ, կամ սկանավորեք QR-ը՝ կենդանի մենյուն ձեր հեռախոսում բացելու համար։</p>
        <ul class="mt-7 space-y-3">
          <li v-for="b in bullets" :key="b" class="flex items-center gap-3 text-sm font-medium text-slate-700">
            <span class="grid h-6 w-6 place-items-center rounded-full bg-indigo-100 text-indigo-600">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            {{ b }}
          </li>
        </ul>
        <a :href="demoUrl" target="_blank" class="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
          Բացել ամբողջական դեմոն ↗
        </a>
      </LandingReveal>

      <!-- interactive preview -->
      <LandingReveal :delay="120" :y="40">
        <div class="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
          <!-- phone -->
          <div class="w-[230px] shrink-0">
            <!-- theme tabs -->
            <div class="mb-4 flex justify-center gap-1.5">
              <button
                v-for="t in themes"
                :key="t.key"
                class="rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
                :class="activeTheme === t.key ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                @click="activeTheme = t.key"
              >{{ t.label }}</button>
            </div>

            <div class="rounded-[34px] border-[6px] border-slate-900 bg-slate-900 shadow-2xl">
              <div :class="['relative overflow-hidden rounded-[26px] transition-colors duration-500', cur.screen]">
                <!-- notch -->
                <div class="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full" :class="cur.dark ? 'bg-white/15' : 'bg-black/10'" />
                <!-- header -->
                <div class="flex items-center justify-between px-4 pb-3 pt-6">
                  <span class="text-sm font-bold transition-colors" :class="cur.head">{{ restaurantName[activeLang] }}</span>
                  <div class="flex gap-1">
                    <button
                      v-for="l in langs"
                      :key="l"
                      class="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase transition"
                      :class="activeLang === l ? cur.chipOn : cur.chip"
                      @click="activeLang = l"
                    >{{ l }}</button>
                  </div>
                </div>
                <!-- menu -->
                <Transition name="demo-fade" mode="out-in">
                  <div :key="activeTheme + activeLang" class="space-y-2 px-3 pb-5">
                    <div v-for="d in dishes" :key="d.price" class="flex items-center gap-2.5 rounded-2xl p-2 transition-colors" :class="cur.row">
                      <div class="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br" :class="cur.dish" />
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-[13px] font-semibold" :class="cur.title">{{ d.name[activeLang] }}</p>
                        <p class="truncate text-[10px]" :class="cur.sub">{{ d.sub[activeLang] }}</p>
                      </div>
                      <span class="text-[12px] font-bold" :class="cur.price">{{ d.price }} ֏</span>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- QR card -->
          <div class="w-full max-w-[220px] rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg">
            <div class="mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">
              <img v-if="qrSrc" :src="qrSrc" alt="QR" width="160" height="160" class="h-40 w-40" />
              <div v-else class="h-40 w-40 animate-pulse bg-slate-200" />
            </div>
            <p class="mt-4 text-sm font-bold text-slate-900">Սկանավորեք հեռախոսով</p>
            <p class="mt-1 text-xs leading-relaxed text-slate-400">Բացեք կենդանի մենյուն ձեր սարքում մեկ սկանավորմամբ։</p>
          </div>
        </div>
      </LandingReveal>
    </div>
  </section>
</template>

<style scoped>
.demo-fade-enter-active,
.demo-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.demo-fade-enter-from { opacity: 0; transform: translateY(8px); }
.demo-fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
