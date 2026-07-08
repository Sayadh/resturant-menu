<script setup lang="ts">
import { leadService } from '~/services/leadService'

const PHONE = '+374 93 632 003'
const PHONE_TEL = '+37493632003'

const { open, plan, closeModal } = useLeadModal()
const { L } = useLandingI18n()

const form = reactive({ name: '', phone: '', message: '', website: '' })
const submitting = ref(false)
const done = ref(false)
const error = ref('')

watch(open, (v) => {
  if (v) {
    done.value = false
    error.value = ''
    form.name = ''
    form.phone = ''
    form.message = ''
    form.website = ''
  }
})

const submit = async () => {
  error.value = ''
  const phone = form.phone.trim()
  if (phone.replace(/\D/g, '').length < 6) {
    error.value = L.value.contact.invalidPhone
    return
  }
  submitting.value = true
  try {
    await leadService.submit({
      phone,
      name: form.name.trim() || undefined,
      message: form.message.trim() || undefined,
      plan: plan.value || undefined,
      website: form.website || undefined,
    })
    done.value = true
  } catch (e) {
    error.value = (e as Error)?.message || L.value.contact.failed
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lm">
      <div v-if="open" class="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <!-- backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeModal" />

        <!-- panel -->
        <div class="lm-panel relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" style="font-family:'Inter','Noto Sans Armenian',sans-serif">
          <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" :aria-label="L.contact.close" @click="closeModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" /></svg>
          </button>

          <!-- SUCCESS -->
          <div v-if="done" class="px-7 py-12 text-center">
            <div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </div>
            <h3 class="mt-5 text-xl font-bold text-slate-900">{{ L.contact.successTitle }}</h3>
            <p class="mt-2 text-sm text-slate-500">{{ L.contact.successText }}</p>
            <button class="mt-6 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" @click="closeModal">{{ L.contact.close }}</button>
          </div>

          <!-- FORM -->
          <div v-else class="px-7 pb-7 pt-8">
            <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {{ L.contact.badge }}
              <span v-if="plan" class="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] text-white">{{ plan }}</span>
            </div>
            <h3 class="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">{{ L.contact.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-500">
              {{ L.contact.subtitle }}
            </p>

            <div class="mt-6 space-y-3">
              <input v-model="form.name" type="text" :placeholder="L.contact.namePh" class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
              <input v-model="form.phone" type="tel" inputmode="tel" :placeholder="L.contact.phonePh" class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" @keyup.enter="submit" />
              <textarea v-model="form.message" rows="2" :placeholder="L.contact.messagePh" class="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
              <!-- honeypot (hidden from users) -->
              <input v-model="form.website" type="text" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
            </div>

            <p v-if="error" class="mt-3 text-sm text-rose-600">{{ error }}</p>

            <button
              class="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:translate-y-0 disabled:opacity-60"
              :disabled="submitting"
              @click="submit"
            >
              <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {{ submitting ? L.contact.sending : L.contact.send }}
            </button>

            <div class="my-5 flex items-center gap-3 text-xs text-slate-400">
              <span class="h-px flex-1 bg-slate-200" /> {{ L.contact.or }} <span class="h-px flex-1 bg-slate-200" />
            </div>

            <a :href="`tel:${PHONE_TEL}`" class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ L.contact.call }} {{ PHONE }}
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lm-enter-active,
.lm-leave-active {
  transition: opacity 0.25s ease;
}
.lm-enter-active .lm-panel,
.lm-leave-active .lm-panel {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.lm-enter-from,
.lm-leave-to {
  opacity: 0;
}
.lm-enter-from .lm-panel,
.lm-leave-to .lm-panel {
  transform: translateY(24px);
}
</style>
