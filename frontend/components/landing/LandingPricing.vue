<script setup lang="ts">
const { openModal } = useLeadModal()
const { L } = useLandingI18n()

// ── Billing periods ──────────────────────────────────────────────
type Period = 'monthly' | 'quarterly' | 'semi' | 'yearly'
const periods = computed<{ id: Period; label: string; short: string }[]>(() => [
  { id: 'monthly', label: L.value.pricing.periods.monthly, short: L.value.pricing.periodsShort.monthly },
  { id: 'quarterly', label: L.value.pricing.periods.quarterly, short: L.value.pricing.periodsShort.quarterly },
  { id: 'semi', label: L.value.pricing.periods.semi, short: L.value.pricing.periodsShort.semi },
  { id: 'yearly', label: L.value.pricing.periods.yearly, short: L.value.pricing.periodsShort.yearly },
])
const period = ref<Period>('yearly')
const activeIndex = computed(() => periods.value.findIndex((p) => p.id === period.value))

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ')

// ── Plan pricing ─────────────────────────────────────────────────
interface PriceRow { total: number; months: number; save?: number; free?: boolean }
const starter: Record<Period, PriceRow> = {
  monthly: { total: 4900, months: 1 },
  quarterly: { total: 13900, months: 3, save: 800 },
  semi: { total: 26000, months: 6, save: 3400 },
  yearly: { total: 49000, months: 12, free: true },
}
const pro: Record<Period, PriceRow> = {
  monthly: { total: 9900, months: 1 },
  quarterly: { total: 28000, months: 3, save: 1700 },
  semi: { total: 53000, months: 6, save: 6400 },
  yearly: { total: 99000, months: 12, free: true },
}
// Business — custom/enterprise, priced "from" per billing period.
const biz: Record<Period, PriceRow> = {
  monthly: { total: 29900, months: 1 },
  quarterly: { total: 85000, months: 3, save: 4700 },
  semi: { total: 159000, months: 6, save: 20400 },
  yearly: { total: 299000, months: 12, free: true },
}
const starterNow = computed(() => starter[period.value])
const proNow = computed(() => pro[period.value])
const bizNow = computed(() => biz[period.value])
const suffix = computed(() => periods.value[activeIndex.value].short)

const starterFeatures = computed(() => L.value.pricing.starterFeatures)
const proFeatures = computed(() => L.value.pricing.proFeatures)
const bizFeatures = computed(() => L.value.pricing.bizFeatures)

// ── Comparison matrix ────────────────────────────────────────────
const compare = computed(() => L.value.pricing.compare)
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
          {{ L.pricing.badge }}
        </span>
        <h2 class="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {{ L.pricing.titleA }}
          <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{{ L.pricing.highlight }}</span>
        </h2>
        <p class="mx-auto mt-5 max-w-xl text-slate-500">
          {{ L.pricing.subtitle }}
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
            <p class="text-sm font-bold uppercase tracking-wide text-slate-400">{{ L.pricing.starter }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ L.pricing.starterHint }}</p>
            <div class="mt-6">
              <Transition name="price" mode="out-in">
                <div :key="period">
                  <div class="flex items-end gap-2">
                    <span class="text-5xl font-extrabold tracking-tight text-slate-900">{{ fmt(starterNow.total) }}</span>
                    <span class="pb-1.5 text-lg font-semibold text-slate-400">֏{{ suffix }}</span>
                  </div>
                  <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    ≈ {{ fmt(Math.round(starterNow.total / starterNow.months)) }} {{ L.pricing.perMonth }}
                    <span v-if="starterNow.save" class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">{{ L.pricing.save }} {{ fmt(starterNow.save) }} ֏</span>
                    <span v-else-if="starterNow.free" class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{{ L.pricing.freeMonths }}</span>
                  </p>
                </div>
              </Transition>
            </div>

            <button type="button" class="mt-6 rounded-2xl border border-slate-300 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white" @click="openModal('Starter')">
              {{ L.pricing.startBtn }}
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
                ⭐ {{ L.pricing.popular }}
              </span>
            </div>

            <p class="text-sm font-bold uppercase tracking-wide text-indigo-200">{{ L.pricing.professional }}</p>
            <p class="mt-1 text-sm text-indigo-100/70">{{ L.pricing.proHint }}</p>

            <div class="mt-6">
              <Transition name="price" mode="out-in">
                <div :key="period">
                  <div class="flex items-end gap-2">
                    <span class="text-5xl font-extrabold tracking-tight">{{ fmt(proNow.total) }}</span>
                    <span class="pb-1.5 text-lg font-semibold text-indigo-200">֏{{ suffix }}</span>
                  </div>
                  <p v-if="period !== 'monthly'" class="mt-1 flex items-center gap-2 text-sm text-indigo-100/80">
                    ≈ {{ fmt(Math.round(proNow.total / proNow.months)) }} {{ L.pricing.perMonth }}
                    <span v-if="proNow.save" class="rounded-full bg-emerald-400/90 px-2 py-0.5 text-[11px] font-bold text-emerald-950">{{ L.pricing.save }} {{ fmt(proNow.save) }} ֏</span>
                    <span v-else-if="proNow.free" class="rounded-full bg-amber-400/90 px-2 py-0.5 text-[11px] font-bold text-amber-950">{{ L.pricing.freeMonths }}</span>
                  </p>
                </div>
              </Transition>
            </div>

            <button type="button" class="mt-6 rounded-2xl bg-white py-3 text-center text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl" @click="openModal('Professional')">
              {{ L.pricing.choosePro }}
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
            <p class="text-sm font-bold uppercase tracking-wide text-slate-400">{{ L.pricing.business }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ L.pricing.bizHint }}</p>

            <div class="mt-6">
              <p class="text-sm font-medium text-slate-400">{{ L.pricing.from }}</p>
              <Transition name="price" mode="out-in">
                <div :key="period">
                  <div class="flex items-end gap-2">
                    <span class="text-5xl font-extrabold tracking-tight text-slate-900">{{ fmt(bizNow.total) }}</span>
                    <span class="pb-1.5 text-lg font-semibold text-slate-400">֏{{ suffix }}</span>
                  </div>
                  <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    ≈ {{ fmt(Math.round(bizNow.total / bizNow.months)) }} {{ L.pricing.perMonth }} · {{ L.pricing.customShort }}
                  </p>
                </div>
              </Transition>
            </div>

            <button type="button" class="mt-6 rounded-2xl border border-slate-300 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white" @click="openModal('Business')">
              {{ L.pricing.chooseBiz }}
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
        <h3 class="text-center text-2xl font-extrabold tracking-tight text-slate-900">{{ L.pricing.compareTitle }}</h3>
        <div class="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="grid grid-cols-[1.6fr_1fr_1fr_1fr] bg-slate-50 px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 sm:text-sm">
            <span>{{ L.pricing.compareCols.feature }}</span>
            <span class="text-center">{{ L.pricing.starter }}</span>
            <span class="text-center text-indigo-600">{{ L.pricing.professional }}</span>
            <span class="text-center">{{ L.pricing.business }}</span>
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
