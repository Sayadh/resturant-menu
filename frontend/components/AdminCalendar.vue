<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// AdminCalendar — a small inline month calendar for the admin panel.
// Value is a calendar day 'YYYY-MM-DD' (no time zone). Weeks start on Monday;
// days of the neighbouring months are shown muted and stay selectable. Month
// and weekday names come from Intl in the admin's language.
// ─────────────────────────────────────────────────────────────────────────
import { dateToDay, dayToDate, todayDay } from '~/utils/billing'

const props = defineProps<{
  modelValue: string | null
  /** BCP-47 locale for month/weekday names, e.g. 'hy-AM'. */
  locale: string
  todayLabel: string
}>()

const emit = defineEmits<{ 'update:modelValue': [day: string] }>()

const today = todayDay()

/** First day of the month being shown. */
const view = ref(dateToDay(monthStart(dayToDate(props.modelValue ?? today))))

function monthStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

const shift = (months: number) => {
  const d = dayToDate(view.value)
  view.value = dateToDay(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1)))
}

const fmt = (opts: Intl.DateTimeFormatOptions) => {
  try {
    return new Intl.DateTimeFormat(props.locale, { timeZone: 'UTC', ...opts })
  } catch {
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts })
  }
}

// Armenian is spelled out: several browsers ship Intl without `hy` data and
// silently fall back to English month names.
const HY_MONTHS = ['հունվար', 'փետրվար', 'մարտ', 'ապրիլ', 'մայիս', 'հունիս', 'հուլիս', 'օգոստոս', 'սեպտեմբեր', 'հոկտեմբեր', 'նոյեմբեր', 'դեկտեմբեր']
const HY_WEEKDAYS = ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուր', 'Շբթ', 'Կիր']
const isHy = computed(() => props.locale.startsWith('hy'))

const monthLabel = computed(() => {
  const d = dayToDate(view.value)
  return isHy.value
    ? `${HY_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
    : fmt({ month: 'long', year: 'numeric' }).format(d)
})

/** Mon … Sun — 2024-01-01 was a Monday. */
const weekdays = computed(() => {
  if (isHy.value) return HY_WEEKDAYS
  const f = fmt({ weekday: 'short' })
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2024, 0, 1 + i))))
})

const fullDate = computed(() => {
  const f = fmt({ day: 'numeric', month: 'long', year: 'numeric' })
  return {
    format: (d: Date) =>
      isHy.value ? `${d.getUTCDate()} ${HY_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : f.format(d),
  }
})

/** Six weeks × seven days, Monday first. */
const cells = computed(() => {
  const first = dayToDate(view.value)
  const lead = (first.getUTCDay() + 6) % 7 // days before the 1st to reach Monday
  const start = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1 - lead))
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getTime() + i * 86_400_000)
    return {
      day: dateToDay(d),
      date: d.getUTCDate(),
      inMonth: d.getUTCMonth() === first.getUTCMonth(),
      label: fullDate.value.format(d),
    }
  })
})

const cellClass = (c: { day: string; inMonth: boolean }) =>
  c.day === props.modelValue
    ? 'bg-slate-900 font-semibold text-white'
    : c.day === today
      ? 'font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50'
      : c.inMonth
        ? 'text-slate-700 hover:bg-slate-100'
        : 'text-slate-300 hover:bg-slate-50'

const pick = (day: string) => {
  emit('update:modelValue', day)
  const d = dayToDate(day)
  const v = dayToDate(view.value)
  if (d.getUTCMonth() !== v.getUTCMonth() || d.getUTCFullYear() !== v.getUTCFullYear()) {
    view.value = dateToDay(monthStart(d))
  }
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-3">
    <div class="flex items-center justify-between gap-2">
      <button
        type="button"
        class="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label="‹"
        @click="shift(-1)"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div class="flex items-center gap-2">
        <p class="text-sm font-semibold capitalize text-slate-900" aria-live="polite">{{ monthLabel }}</p>
        <button
          type="button"
          class="rounded-md px-2 py-0.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
          @click="pick(today)"
        >
          {{ todayLabel }}
        </button>
      </div>
      <button
        type="button"
        class="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label="›"
        @click="shift(1)"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>

    <div class="mt-2 grid grid-cols-7 gap-1 text-center">
      <span v-for="w in weekdays" :key="w" class="py-1 text-[11px] font-medium uppercase text-slate-400">{{ w }}</span>

      <button
        v-for="c in cells"
        :key="c.day"
        type="button"
        class="relative h-9 rounded-lg text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
        :class="cellClass(c)"
        :aria-label="c.label"
        :aria-pressed="c.day === modelValue"
        @click="pick(c.day)"
      >
        {{ c.date }}
      </button>
    </div>
  </div>
</template>
