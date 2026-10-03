<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// AdminPaymentModal — super-admin records a subscription payment:
//   1. pick the day the paid period starts (past, today or future),
//   2. pick 1 / 3 / 6 / 12 months — the "paid until" day is previewed,
//   3. save — the dialog closes and the table shows the new period.
// The history below lists every payment; a wrong one can be removed.
// The backend is the source of truth for `paidUntil`; the preview mirrors it.
// ─────────────────────────────────────────────────────────────────────────
import { superAdminService, type AdminRestaurantRow, type RestaurantPayment } from '~/services/superAdminService'
import { PAYMENT_MONTHS, addMonths, displayDay, type PaymentMonths } from '~/utils/billing'

const props = defineProps<{ restaurant: Pick<AdminRestaurantRow, 'id' | 'name'> }>()
// saved   → a payment was recorded (the parent closes, reloads, confirms)
// changed → the history changed while the dialog stays open (a removal)
const emit = defineEmits<{ close: []; saved: []; changed: [] }>()

const { t, lang } = useAdminI18n()
const LOCALES = { hy: 'hy-AM', ru: 'ru-RU', en: 'en-GB' } as const
const locale = computed(() => LOCALES[lang.value] ?? 'en-GB')

const MONTH_LABEL = {
  1: 'paymentMonths1',
  3: 'paymentMonths3',
  6: 'paymentMonths6',
  12: 'paymentMonths12',
} as const satisfies Record<PaymentMonths, string>

// ── new payment ──────────────────────────────────────────────────────────
const day = ref<string | null>(null)
const months = ref<PaymentMonths | null>(null)
const saving = ref(false)
const error = ref('')

const until = computed(() => (day.value && months.value ? addMonths(day.value, months.value) : null))

const save = async () => {
  if (!day.value || !months.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await superAdminService.addPayment(props.restaurant.id, { paidAt: day.value, months: months.value })
    emit('saved')
  } catch (e) {
    error.value = (e as Error)?.message || t('loadFailed')
  } finally {
    saving.value = false
  }
}

// ── history ──────────────────────────────────────────────────────────────
const history = ref<RestaurantPayment[]>([])
const loading = ref(true)
const confirmId = ref<string | null>(null)
const removingId = ref<string | null>(null)

async function loadHistory() {
  try {
    history.value = await superAdminService.listPayments(props.restaurant.id)
  } catch (e) {
    error.value = (e as Error)?.message || t('loadFailed')
  } finally {
    loading.value = false
  }
}

const remove = async (id: string) => {
  removingId.value = id
  error.value = ''
  try {
    await superAdminService.removePayment(props.restaurant.id, id)
    confirmId.value = null
    await loadHistory()
    emit('changed')
  } catch (e) {
    error.value = (e as Error)?.message || t('loadFailed')
  } finally {
    removingId.value = null
  }
}

onMounted(loadHistory)
</script>

<template>
  <AdminModal :title="`${t('paymentTitle')} — ${restaurant.name}`" @close="emit('close')">
    <div class="space-y-5">
      <!-- 1 · the day -->
      <div>
        <p class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span class="grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[11px] text-white">1</span>
          {{ t('paymentStepDay') }}
          <span v-if="day" class="ml-auto normal-case tracking-normal text-slate-900">{{ displayDay(day) }}</span>
        </p>
        <AdminCalendar v-model="day" :locale="locale" :today-label="t('paymentToday')" />
      </div>

      <!-- 2 · the period — asked once a day is picked -->
      <Transition name="pay-step">
        <div v-if="day">
          <p class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span class="grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[11px] text-white">2</span>
            {{ t('paymentStepPeriod') }}
          </p>
          <div class="grid grid-cols-4 gap-2" role="radiogroup" :aria-label="t('paymentStepPeriod')">
            <button
              v-for="m in PAYMENT_MONTHS"
              :key="m"
              type="button"
              role="radio"
              :aria-checked="months === m"
              class="rounded-lg border px-2 py-2.5 text-sm font-semibold transition"
              :class="
                months === m
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-900'
              "
              @click="months = m"
            >
              {{ t(MONTH_LABEL[m]) }}
            </button>
          </div>

          <div
            v-if="until"
            class="mt-3 flex items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          >
            <span>{{ displayDay(day) }}</span>
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            <span>{{ displayDay(until) }}</span>
          </div>
        </div>
      </Transition>

      <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>

      <!-- History -->
      <div class="border-t border-slate-100 pt-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('paymentHistory') }}</p>
        <p v-if="loading" class="mt-3 text-sm text-slate-400">…</p>
        <p v-else-if="!history.length" class="mt-3 text-sm text-slate-400">{{ t('paymentHistoryEmpty') }}</p>
        <ul v-else class="mt-2 divide-y divide-slate-100">
          <li v-for="p in history" :key="p.id" class="flex items-center gap-3 py-2.5 text-sm">
            <span class="font-medium tabular-nums text-slate-900">{{ displayDay(p.paidAt) }} → {{ displayDay(p.paidUntil) }}</span>
            <span class="text-slate-400">· {{ t(MONTH_LABEL[p.months as PaymentMonths] ?? 'paymentMonths1') }}</span>
            <span class="ml-auto flex items-center gap-2">
              <template v-if="confirmId === p.id">
                <button type="button" class="text-xs font-medium text-slate-500 hover:text-slate-900" @click="confirmId = null">{{ t('cancel') }}</button>
                <button
                  type="button"
                  class="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  :disabled="removingId === p.id"
                  @click="remove(p.id)"
                >
                  {{ t('paymentDeleteConfirm') }}
                </button>
              </template>
              <button v-else type="button" class="text-xs font-medium text-rose-600 hover:text-rose-700" @click="confirmId = p.id">{{ t('delete') }}</button>
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Utilities, not .btn-*: those live in admin.vue's SCOPED style and don't reach this component. -->
    <template #footer>
      <button type="button" class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" :disabled="saving" @click="emit('close')">{{ t('cancel') }}</button>
      <button type="button" class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!day || !months || saving" @click="save">
        {{ saving ? t('saving') : t('paymentSave') }}
      </button>
    </template>
  </AdminModal>
</template>

<style scoped>
.pay-step-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.pay-step-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>
