<script setup lang="ts">
const { openModal } = useLeadModal()

// ── Billing periods ──────────────────────────────────────────────
type Period = 'monthly' | 'quarterly' | 'semi' | 'yearly'
const periods: { id: Period; label: string; short: string }[] = [
  { id: 'monthly', label: 'Ամսական', short: '/ամիս' },
  { id: 'quarterly', label: 'Եռամսյակ', short: '/3 ամիս' },
  { id: 'semi', label: 'Կիսամյակ', short: '/6 ամիս' },
  { id: 'yearly', label: 'Տարեկան', short: '/տարի' },
]
const period = ref<Period>('yearly')
const activeIndex = computed(() => periods.findIndex((p) => p.id === period.value))

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ')

// ── Plan pricing ─────────────────────────────────────────────────
interface PriceRow { total: number; months: number; save?: number; note?: string }
const pro: Record<Period, PriceRow> = {
  monthly: { total: 14900, months: 1 },
  quarterly: { total: 42000, months: 3, save: 2700 },
  semi: { total: 79000, months: 6, save: 10400 },
  yearly: { total: 149000, months: 12, note: '≈ 2 ամիս անվճար' },
}
const biz: Record<Period, PriceRow> = {
  monthly: { total: 29900, months: 1 },
  quarterly: { total: 84000, months: 3, save: 5700 },
  semi: { total: 159000, months: 6, save: 20400 },
  yearly: { total: 299000, months: 12, note: '≈ 2 ամիս անվճար' },
}
const proNow = computed(() => pro[period.value])
const bizNow = computed(() => biz[period.value])
const suffix = computed(() => periods[activeIndex.value].short)

const starterFeatures = [
  'Պրեմիում QR մենյու', 'Մենյուի սկզբնական տեղադրում', 'Մեկ պրեմիում թեմա', 'Մեկ լեզու',
  'Անսահմանափակ ապրանքներ', 'QR կոդի գեներացում',
  'Մեկ տարվա տեխնիկական սպասարկում', 'Մենյուի թարմացումները մեր թիմի կողմից',
]
const proFeatures = [
  'Ադմին վահանակ', 'Անսահմանափակ ապրանքներ', 'Անսահմանափակ կատեգորիաներ', '3 լեզու',
  'Թեմաների ընտրություն', 'Նկարների կառավարում', 'Հասանելիության վերահսկում',
  'QR մենյու', 'Ավտոմատ թարմացումներ', 'Տեխնիկական աջակցություն',
]
const bizFeatures = [
  'Professional-ի ամբողջ փաթեթը', 'Սեփական դոմեյն', 'Բազմաթիվ օգտատերեր (Owner/Manager/Employee)',
  'Պրեմիում թեմաներ', 'Վիճակագրություն', 'Անհատական կարգավորումներ',
]

// ── Comparison matrix ────────────────────────────────────────────
const compare: { label: string; s: boolean | string; p: boolean | string; b: boolean | string }[] = [
  { label: 'QR մենյու և հոսթինգ', s: true, p: true, b: true },
  { label: 'Անսահմանափակ ապրանքներ', s: true, p: true, b: true },
  { label: 'Լեզուներ', s: '1', p: '3', b: '3+' },
  { label: 'Թեմաների ընտրություն', s: '1', p: true, b: 'Պրեմիում' },
  { label: 'Ադմին վահանակ', s: false, p: true, b: true },
  { label: 'Ավտոմատ թարմացումներ', s: false, p: true, b: true },
  { label: 'Սեփական դոմեյն', s: false, p: false, b: true },
  { label: 'Բազմաթիվ օգտատերեր', s: false, p: false, b: true },
  { label: 'Վիճակագրություն', s: false, p: false, b: true },
  { label: 'Առաջնահերթ աջակցություն', s: true, p: true, b: true },
]
</script>

<template>
  <section id="pricing" class="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-28">
    <!-- animated background glow -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="pr-glow pr-glow-a" />
      <div class="pr-glow pr-glow-b" />
    </div>

    <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
      <!-- header -->
      <LandingReveal class="mx-auto max-w-2xl text-center">
        <span class="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600">
          Պարզ և թափանցիկ գնացուցակ
        </span>
        <h2 class="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Ընտրեք Ձեր ռեստորանի
          <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">կատարյալ փաթեթը</span>
        </h2>
        <p class="mx-auto mt-5 max-w-xl text-slate-500">
          Սկսեք Ձեր կարիքներին համապատասխան փաթեթով և բարձրացրեք ցանկացած պահի՝ առանց տվյալների կորստի։
        </p>
      </LandingReveal>

      <!-- billing toggle -->
      <LandingReveal :delay="80" class="mt-10 flex justify-center">
        <div class="relative flex w-full max-w-md rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-auto">
          <!-- sliding highlight: exactly 1/4 of the inner (padded) width -->
          <span
            class="pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            :style="{ width: 'calc((100% - 12px) / 4)', transform: `translateX(${activeIndex * 100}%)` }"
          />
          <button
            v-for="p in periods"
            :key="p.id"
            class="relative z-10 flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
            :class="period === p.id ? 'text-white' : 'text-slate-500 hover:text-slate-800'"
            @click="period = p.id"
          >
            {{ p.label }}
            <span
              v-if="p.id === 'yearly'"
              class="hidden rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:inline"
              :class="period === 'yearly' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'"
            >-17%</span>
          </button>
        </div>
      </LandingReveal>

      <!-- cards -->
      <div class="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
        <!-- Starter -->
        <LandingReveal :delay="0" class="flex">
          <div class="group flex w-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <p class="text-sm font-bold uppercase tracking-wide text-slate-400">Starter</p>
            <p class="mt-1 text-sm text-slate-500">Մեկանգամյա տեղադրման ծառայություն</p>
            <div class="mt-6 flex items-end gap-2">
              <span class="text-5xl font-extrabold tracking-tight text-slate-900">79 000</span>
              <span class="pb-1.5 text-lg font-semibold text-slate-400">֏</span>
            </div>
            <p class="mt-1 text-sm font-medium text-slate-500">մեկանգամյա վճար</p>

            <button type="button" class="mt-6 rounded-2xl border border-slate-300 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white" @click="openModal('Starter')">
              Սկսել
            </button>

            <ul class="mt-7 space-y-3 text-sm">
              <li v-for="f in starterFeatures" :key="f" class="flex gap-2.5 text-slate-600">
                <svg class="mt-0.5 shrink-0 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ f }}
              </li>
            </ul>
          </div>
        </LandingReveal>

        <!-- Professional (highlighted) -->
        <LandingReveal :delay="90" class="flex">
          <div class="pro-card group relative flex w-full flex-col rounded-3xl p-8 text-white shadow-2xl transition duration-300 hover:-translate-y-2 lg:-mt-4 lg:mb-4">
            <div class="pro-badge absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-1.5 text-xs font-bold text-amber-950 shadow-lg">
                ⭐ Founding Partner
              </span>
            </div>

            <p class="text-sm font-bold uppercase tracking-wide text-indigo-200">Professional</p>
            <p class="mt-1 text-sm text-indigo-100/70">Ամենապահանջված ընտրությունը</p>

            <div class="mt-6">
              <Transition name="price" mode="out-in">
                <div :key="period">
                  <template v-if="period === 'monthly'">
                    <div class="flex items-end gap-2">
                      <span class="text-5xl font-extrabold tracking-tight">9 900</span>
                      <span class="pb-1.5 text-lg font-semibold text-indigo-200">֏{{ suffix }}</span>
                    </div>
                    <p class="mt-1 flex items-center gap-2 text-sm">
                      <span class="text-indigo-200/60 line-through">14 900 ֏</span>
                      <span class="rounded-full bg-amber-400/90 px-2 py-0.5 text-[11px] font-bold text-amber-950">Առաջին 30 ռեստորանի համար</span>
                    </p>
                  </template>
                  <template v-else>
                    <div class="flex items-end gap-2">
                      <span class="text-5xl font-extrabold tracking-tight">{{ fmt(proNow.total) }}</span>
                      <span class="pb-1.5 text-lg font-semibold text-indigo-200">֏{{ suffix }}</span>
                    </div>
                    <p class="mt-1 flex items-center gap-2 text-sm text-indigo-100/80">
                      ≈ {{ fmt(Math.round(proNow.total / proNow.months)) }} ֏/ամիս
                      <span v-if="proNow.save" class="rounded-full bg-emerald-400/90 px-2 py-0.5 text-[11px] font-bold text-emerald-950">Խնայեք {{ fmt(proNow.save) }} ֏</span>
                      <span v-else-if="proNow.note" class="rounded-full bg-amber-400/90 px-2 py-0.5 text-[11px] font-bold text-amber-950">{{ proNow.note }}</span>
                    </p>
                  </template>
                </div>
              </Transition>
            </div>

            <button type="button" class="mt-6 rounded-2xl bg-white py-3 text-center text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl" @click="openModal('Professional')">
              Ընտրել Professional
            </button>

            <ul class="mt-7 space-y-3 text-sm">
              <li v-for="f in proFeatures" :key="f" class="flex gap-2.5 text-indigo-50">
                <svg class="mt-0.5 shrink-0 text-emerald-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ f }}
              </li>
            </ul>
          </div>
        </LandingReveal>

        <!-- Business -->
        <LandingReveal :delay="180" class="flex">
          <div class="group flex w-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <p class="text-sm font-bold uppercase tracking-wide text-slate-400">Business</p>
            <p class="mt-1 text-sm text-slate-500">Աճող ռեստորանների համար</p>

            <div class="mt-6">
              <Transition name="price" mode="out-in">
                <div :key="period">
                  <div class="flex items-end gap-2">
                    <span class="text-5xl font-extrabold tracking-tight text-slate-900">{{ fmt(bizNow.total) }}</span>
                    <span class="pb-1.5 text-lg font-semibold text-slate-400">֏{{ suffix }}</span>
                  </div>
                  <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    ≈ {{ fmt(Math.round(bizNow.total / bizNow.months)) }} ֏/ամիս
                    <span v-if="bizNow.save" class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Խնայեք {{ fmt(bizNow.save) }} ֏</span>
                    <span v-else-if="bizNow.note" class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{{ bizNow.note }}</span>
                  </p>
                </div>
              </Transition>
            </div>

            <button type="button" class="mt-6 rounded-2xl border border-slate-300 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white" @click="openModal('Business')">
              Ընտրել Business
            </button>

            <ul class="mt-7 space-y-3 text-sm">
              <li v-for="f in bizFeatures" :key="f" class="flex gap-2.5 text-slate-600">
                <svg class="mt-0.5 shrink-0 text-indigo-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ f }}
              </li>
            </ul>
          </div>
        </LandingReveal>
      </div>

      <!-- comparison -->
      <LandingReveal :delay="60" class="mt-20">
        <h3 class="text-center text-2xl font-extrabold tracking-tight text-slate-900">Համեմատեք փաթեթները</h3>
        <div class="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="grid grid-cols-[1.6fr_1fr_1fr_1fr] bg-slate-50 px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 sm:text-sm">
            <span>Հնարավորություն</span>
            <span class="text-center">Starter</span>
            <span class="text-center text-indigo-600">Professional</span>
            <span class="text-center">Business</span>
          </div>
          <div
            v-for="(row, i) in compare"
            :key="row.label"
            class="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-t border-slate-100 px-5 py-3.5 text-sm transition-colors hover:bg-slate-50/70"
            :class="i % 2 ? 'bg-white' : 'bg-slate-50/30'"
          >
            <span class="pr-2 text-slate-700">{{ row.label }}</span>
            <span class="flex justify-center">
              <template v-if="typeof row.s === 'string'"><span class="text-sm font-semibold text-slate-700">{{ row.s }}</span></template>
              <svg v-else-if="row.s" class="text-emerald-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <span v-else class="text-slate-300">—</span>
            </span>
            <span class="flex justify-center">
              <template v-if="typeof row.p === 'string'"><span class="text-sm font-semibold text-indigo-600">{{ row.p }}</span></template>
              <svg v-else-if="row.p" class="text-indigo-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <span v-else class="text-slate-300">—</span>
            </span>
            <span class="flex justify-center">
              <template v-if="typeof row.b === 'string'"><span class="text-sm font-semibold text-slate-700">{{ row.b }}</span></template>
              <svg v-else-if="row.b" class="text-emerald-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <span v-else class="text-slate-300">—</span>
            </span>
          </div>
        </div>
      </LandingReveal>
    </div>
  </section>
</template>

<style scoped>
.pro-card {
  background: linear-gradient(160deg, #4f46e5 0%, #6d28d9 55%, #7c3aed 100%);
  position: relative;
}
.pro-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 24px;
  padding: 1px;
  pointer-events: none;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0) 40%, rgba(251, 191, 36, 0.6));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.7;
  animation: borderglow 4s ease-in-out infinite;
}
@keyframes borderglow {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.9; }
}
.pro-badge { animation: bob 3s ease-in-out infinite; }
@keyframes bob {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -3px); }
}

.price-enter-active,
.price-leave-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.price-enter-from { opacity: 0; transform: translateY(10px); }
.price-leave-to { opacity: 0; transform: translateY(-10px); }

.pr-glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(100px);
  opacity: 0.18;
}
.pr-glow-a { top: 5%; left: -5%; height: 400px; width: 400px; background: #6366f1; animation: prdrift 16s ease-in-out infinite; }
.pr-glow-b { bottom: 0; right: -5%; height: 460px; width: 460px; background: #a855f7; animation: prdrift 20s ease-in-out infinite reverse; }
@keyframes prdrift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40px, -30px); }
}
@media (prefers-reduced-motion: reduce) {
  .pro-card::before, .pro-badge, .pr-glow { animation: none; }
}
</style>
