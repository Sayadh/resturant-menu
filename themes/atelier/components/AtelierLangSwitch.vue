<script setup lang="ts">
// Minimal editorial language toggle — AM · EN · RU as letter-spaced text.
const { lang, languages, setLang } = useLanguage()
</script>

<template>
  <div class="flex items-center gap-1 font-display text-[11px] tracking-[0.18em]">
    <template v-for="(l, i) in languages" :key="l">
      <button
        type="button"
        class="px-1 py-0.5 transition-colors duration-300"
        :class="lang === l ? 'text-[#A1502E]' : 'text-[#16130F]/45 hover:text-[#16130F]'"
        :aria-pressed="lang === l"
        @click="setLang(l)"
      >
        {{ l }}
      </button>
      <span v-if="i < languages.length - 1" class="text-[#16130F]/20" aria-hidden="true">·</span>
    </template>
  </div>
</template>
