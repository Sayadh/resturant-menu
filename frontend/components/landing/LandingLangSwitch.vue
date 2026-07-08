<script setup lang="ts">
const { lang, langs, setLang } = useLandingI18n()
</script>

<template>
  <div class="flex items-center gap-0.5 rounded-full bg-white/5 p-0.5 ring-1 ring-white/10">
    <button
      v-for="l in langs"
      :key="l"
      type="button"
      class="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase leading-none transition"
      :class="lang === l ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'"
      :aria-pressed="lang === l"
      @click="setLang(l)"
    >{{ l }}</button>
  </div>
</template>
