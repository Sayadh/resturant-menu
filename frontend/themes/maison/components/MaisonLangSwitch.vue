<script setup lang="ts">
// Minimal Maison language switch — three understated letters with a gold
// underline on the active language. Reads/sets the shared language state.
const { lang, languages, setLang } = useLanguage()

withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'dark' })
</script>

<template>
  <div
    class="flex items-center gap-1 font-sans text-[11px] tracking-[0.18em]"
    role="group"
    aria-label="Language"
  >
    <button
      v-for="l in languages"
      :key="l"
      type="button"
      class="relative px-1.5 py-1 transition-colors duration-300"
      :class="[
        tone === 'light' ? 'text-[#FBF8F1]/55 hover:text-[#FBF8F1]' : 'text-[#8C8276] hover:text-[#241B14]',
        lang === l && (tone === 'light' ? '!text-[#FBF8F1]' : '!text-[#241B14]'),
      ]"
      :aria-pressed="lang === l"
      @click="setLang(l)"
    >
      {{ l }}
      <span
        v-if="lang === l"
        class="absolute -bottom-0.5 left-1/2 h-px w-3 -translate-x-1/2 bg-[#B08A4F]"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
