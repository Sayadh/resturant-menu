<script setup lang="ts">
const { L } = useLandingI18n()
const icons = ['▦', '📂', '🎨', '▣', '🌐', '✅']
const items = computed(() => L.value.admin.features.map((label, i) => ({ icon: icons[i], label })))
const nav = ['Dashboard', 'Categories', 'Products', 'QR Code', 'Themes', 'Languages', 'Settings']
const stats = computed(() => [
  { n: '128', l: L.value.admin.stats.products },
  { n: '24', l: L.value.admin.stats.categories },
  { n: '3', l: L.value.admin.stats.languages },
  { n: '4', l: L.value.admin.stats.themes },
])
const rows = computed(() => L.value.admin.dishes.map((d) => ({
  name: d.name,
  cat: d.cat,
  price: d.price,
  status: d.inStock ? L.value.admin.statusIn : L.value.admin.statusOut,
  s: d.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
})))
</script>

<template>
  <section class="relative bg-slate-50 py-24">
    <div class="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr]">
      <LandingReveal>
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {{ L.admin.titleA }} <span class="text-indigo-600">{{ L.admin.highlight }}</span>
        </h2>
        <p class="mt-4 text-slate-500">{{ L.admin.subtitle }}</p>
        <ul class="mt-7 grid gap-3 sm:grid-cols-2">
          <li v-for="it in items" :key="it.label" class="flex items-center gap-3 text-sm font-medium text-slate-700">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">{{ it.icon }}</span>
            {{ it.label }}
          </li>
        </ul>
      </LandingReveal>

      <LandingReveal :delay="120" :y="40">
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
          <div class="flex">
            <!-- sidebar -->
            <div class="hidden w-44 shrink-0 bg-[#0E1428] p-3 sm:block">
              <div class="mb-4 flex items-center gap-2 px-2 py-1 text-white">
                <span class="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500">
                  <svg width="17" height="17" viewBox="0 0 32 32" fill="none">
                    <path d="M7.5 23V10.6c0-.9 1.1-1.3 1.7-.6l6.8 7.7 6.8-7.7c.6-.7 1.7-.3 1.7.6V23" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="16" cy="23.5" r="1.6" fill="#FBBF24" />
                  </svg>
                </span>
                <span class="text-xs font-bold">Menus</span>
              </div>
              <button
                v-for="(n, i) in nav"
                :key="n"
                class="mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-medium"
                :class="i === 0 ? 'bg-white/10 text-white' : 'text-slate-400'"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="i === 0 ? 'bg-indigo-400' : 'bg-slate-600'" />
                {{ n }}
              </button>
            </div>
            <!-- main -->
            <div class="min-w-0 flex-1 p-5">
              <p class="text-sm font-bold text-slate-900">Dashboard</p>
              <div class="mt-4 grid grid-cols-4 gap-3">
                <div v-for="(m, i) in stats" :key="i" class="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p class="text-lg font-bold text-slate-900">{{ m.n }}</p>
                  <p class="text-[10px] text-slate-400">{{ m.l }}</p>
                </div>
              </div>
              <div class="mt-4 overflow-hidden rounded-xl border border-slate-100">
                <div class="flex items-center justify-between bg-slate-50 px-3 py-2.5">
                  <span class="text-[11px] font-semibold text-slate-500">{{ L.admin.recent }}</span>
                  <span class="rounded-lg bg-indigo-600 px-2 py-1 text-[9px] font-semibold text-white">{{ L.admin.addProduct }}</span>
                </div>
                <div class="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] bg-white px-3 py-2 text-[10px] font-semibold uppercase text-slate-400">
                  <span>{{ L.admin.cols.name }}</span><span>{{ L.admin.cols.category }}</span><span>{{ L.admin.cols.price }}</span><span class="text-right">{{ L.admin.cols.actions }}</span>
                </div>
                <div v-for="r in rows" :key="r.name" class="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] items-center border-t border-slate-50 px-3 py-2.5 text-[11px] text-slate-600">
                  <span class="flex items-center gap-2 font-medium text-slate-800">
                    <span class="h-6 w-6 rounded-md bg-gradient-to-br from-slate-200 to-slate-300" />
                    {{ r.name }}
                  </span>
                  <span class="truncate">{{ r.cat }}</span>
                  <span>{{ r.price }} ֏</span>
                  <span class="text-right"><span class="whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold" :class="r.s">{{ r.status }}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LandingReveal>
    </div>
  </section>
</template>
