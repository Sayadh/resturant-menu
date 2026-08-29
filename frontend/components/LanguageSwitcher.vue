<script setup lang="ts">
// `theme` only swaps colours. The default keeps the original palette so Aria
// renders exactly as before; Heritage opts in to the stone/olive system.
withDefaults(defineProps<{ theme?: 'default' | 'heritage' }>(), { theme: 'default' })
const { lang, languages, langDisplay, langLabel, setLang } = useLanguage()
</script>

<template>
  <div
    class="flex items-center gap-1 rounded-full border px-1 py-1 shadow-sm backdrop-blur"
    :class="
      theme === 'heritage'
        ? 'border-[#D5D1C6] bg-[#FCFBF7]/80'
        : 'border-caramel/40 bg-card/70'
    "
    role="group"
    aria-label="Language switcher"
  >
    <button
      v-for="(code, i) in languages"
      :key="code"
      type="button"
      class="min-w-[34px] rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors duration-200"
      :class="
        theme === 'heritage'
          ? lang === code
            ? 'bg-[#64734D] text-[#FCFBF7] shadow-sm'
            : 'text-[#706F68] hover:text-[#292A27]'
          : lang === code
            ? 'bg-caramel text-cream shadow-sm'
            : 'text-brown/70 hover:text-brown'
      "
      :aria-pressed="lang === code"
      @click="setLang(code)"
    >
      <span :class="langDisplay === 'flag' && 'text-[15px] leading-none tracking-normal'">{{ langLabel(code) }}</span>
    </button>
  </div>
</template>
