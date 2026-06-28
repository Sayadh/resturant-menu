<script setup lang="ts">
const { lang, languages, setLang } = useLanguage()
</script>

<template>
  <div
    class="flex items-center gap-1 rounded-pill border border-cream/25 bg-cream/10 px-1 py-1 shadow-sm backdrop-blur-md"
    role="group"
    aria-label="Language switcher"
  >
    <button
      v-for="code in languages"
      :key="code"
      type="button"
      class="min-w-[36px] rounded-pill px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors duration-200"
      :class="
        lang === code
          ? 'bg-caramel text-brown shadow-sm'
          : 'text-cream/80 hover:text-cream'
      "
      :aria-pressed="lang === code"
      @click="setLang(code)"
    >
      {{ code }}
    </button>
  </div>
</template>
