<script setup lang="ts">
const { L } = useLandingI18n()
const links = computed(() => [
  { href: '/#features', label: L.value.nav.features },
  { href: '/#demo', label: L.value.nav.demo },
  { href: '/#themes', label: L.value.nav.themes },
  { href: '/#pricing', label: L.value.nav.pricing },
  { href: '/blog', label: L.value.nav.blog },
  { href: '/#about', label: L.value.nav.about },
])

const { openModal } = useLeadModal()
const scrolled = ref(false)
const open = ref(false)

const onScroll = () => (scrolled.value = window.scrollY > 24)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="scrolled ? 'border-b border-white/10 bg-[#0B1020]/80 backdrop-blur-xl' : 'bg-transparent'"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
      <a href="/" class="flex items-center gap-2.5 text-white">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M7.5 23V10.6c0-.9 1.1-1.3 1.7-.6l6.8 7.7 6.8-7.7c.6-.7 1.7-.3 1.7.6V23" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="16" cy="23.5" r="1.6" fill="#FBBF24" />
          </svg>
        </span>
        <span class="text-[15px] font-bold tracking-tight">Menus</span>
      </a>

      <div class="hidden items-center gap-1 lg:flex">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          class="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
        >{{ l.label }}</a>
      </div>

      <div class="hidden items-center gap-2.5 lg:flex">
        <LandingLangSwitch />
        <NuxtLink to="/admin" class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/15 transition hover:bg-white/5 hover:text-white">{{ L.nav.login }}</NuxtLink>
        <button type="button" class="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:shadow-indigo-500/50" @click="openModal()">
          <span class="relative z-10">{{ L.nav.start }}</span>
          <span class="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
        </button>
      </div>

      <button class="rounded-lg p-2 text-white ring-1 ring-white/15 lg:hidden touch-manipulation" aria-label="Menu" @click="open = !open">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" /></svg>
      </button>
    </nav>

    <Transition name="drop">
      <div v-show="open" class="border-t border-white/10 bg-[#0B1020]/95 px-5 py-4 backdrop-blur-xl lg:hidden">
        <a v-for="l in links" :key="l.href" :href="l.href" class="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5" @click="open = false">{{ l.label }}</a>
        <div class="mt-3 flex justify-center"><LandingLangSwitch /></div>
        <div class="mt-3 flex gap-2.5">
          <NuxtLink to="/admin" class="flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-slate-200 ring-1 ring-white/15">{{ L.nav.login }}</NuxtLink>
          <button type="button" class="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white" @click="open = false; openModal()">{{ L.nav.start }}</button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
