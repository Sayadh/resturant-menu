<script setup lang="ts">
const { lang, languages, setLang } = useLanguage()
</script>

<template>
  <div
    class="flex items-center gap-1 rounded-full border border-caramel/40 bg-card/70 px-1 py-1 shadow-sm backdrop-blur"
    role="group"
    aria-label="Language switcher"
  >
    <button
      v-for="(code, i) in languages"
      :key="code"
      type="button"
      class="min-w-[34px] rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors duration-200"
      :class="
        lang === code
          ? 'bg-caramel text-cream shadow-sm'
          : 'text-brown/70 hover:text-brown'
      "
      :aria-pressed="lang === code"
      @click="setLang(code)"
    >
      {{ code }}
    </button>
  </div>
</template>
