<script setup lang="ts">
// Language switch — three letters on porcelain, the active one in coral with
// a short hairline underneath. Reads/sets the shared language state only; the
// switching logic itself lives in useLanguage() and is untouched.
const { lang, languages, setLang } = useLanguage()
</script>

<template>
  <div class="op-sans flex items-center gap-0.5 text-[11px]" role="group" aria-label="Language">
    <button
      v-for="l in languages"
      :key="l"
      type="button"
      class="op-label relative rounded-[6px] px-2 py-1.5 text-[10px] transition-colors duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#D85F3D]"
      :class="lang === l ? 'text-[#D85F3D]' : 'text-[#747D90] hover:text-[#172033]'"
      :aria-pressed="lang === l"
      @click="setLang(l)"
    >
      {{ l }}
      <span
        v-if="lang === l"
        class="absolute bottom-0 left-1/2 h-px w-3 -translate-x-1/2 bg-[#D85F3D]"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
