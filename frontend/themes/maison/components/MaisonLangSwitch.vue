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
        tone === 'light' ? 'text-[#FFFBFC]/55 hover:text-[#FFFBFC]' : 'text-[#74656B] hover:text-[#2C1B22]',
        lang === l && (tone === 'light' ? '!text-[#FFFBFC]' : '!text-[#2C1B22]'),
      ]"
      :aria-pressed="lang === l"
      @click="setLang(l)"
    >
      {{ l }}
      <span
        v-if="lang === l"
        class="absolute -bottom-0.5 left-1/2 h-px w-3 -translate-x-1/2"
        :class="tone === 'light' ? 'bg-[#B99768]' : 'bg-[#8C304A]'"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
