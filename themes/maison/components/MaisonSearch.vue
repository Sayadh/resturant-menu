<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// MaisonSearch — hidden by default, revealed as a calm full-width panel that
// drops from the top. Search becomes part of the experience rather than a
// utilitarian box.
// ─────────────────────────────────────────────────────────────────────────
import { maisonSearch } from '~/themes/maison/config'

const props = defineProps<{ open: boolean; modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'close'): void
}>()

const { t } = useLanguage()
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick()
      inputRef.value?.focus()
    }
  },
)
</script>

<template>
  <ClientOnly>
    <Transition name="ms-fade">
      <div v-if="open" class="fixed inset-0 z-50" @click="emit('close')">
        <Transition name="ms-modal" appear>
          <div
            v-if="open"
            class="maison-theme absolute inset-x-0 top-0 border-b border-[#DFD5C4] bg-[#F4EEE2] px-5 py-8 sm:px-8 sm:py-12"
            @click.stop
          >
            <div class="mx-auto flex max-w-3xl items-center gap-4">
              <svg viewBox="0 0 24 24" class="h-6 w-6 shrink-0 text-[#B08A4F]" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
              </svg>
              <input
                ref="inputRef"
                :value="modelValue"
                type="text"
                :placeholder="t(maisonSearch.placeholder)"
                class="w-full border-0 border-b border-[#DFD5C4] bg-transparent pb-3 font-serif text-2xl text-[#241B14] placeholder:text-[#BCB09C] focus:border-[#B08A4F] focus:outline-none focus:ring-0 sm:text-3xl"
                @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
              />
              <button
                type="button"
                class="shrink-0 text-[#8C8276] transition-colors hover:text-[#241B14]"
                aria-label="Close search"
                @click="emit('close')"
              >
                <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </ClientOnly>
</template>
