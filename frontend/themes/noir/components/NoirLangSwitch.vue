<script setup lang="ts">
// Monochrome language switch — three letters, the active one lifted to ivory
// with a hairline platinum underline. Reads/sets the shared language state.
const { lang, languages, setLang } = useLanguage()
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
      class="relative px-1.5 py-1 transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C7C2B8]"
      :class="lang === l ? 'text-[#F1EEE8]' : 'text-[#777A7E] hover:text-[#A8A8A5]'"
      :aria-pressed="lang === l"
      @click="setLang(l)"
    >
      {{ l }}
      <span
        v-if="lang === l"
        class="absolute -bottom-0.5 left-1/2 h-px w-3 -translate-x-1/2 bg-[#B8B4AC]"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
