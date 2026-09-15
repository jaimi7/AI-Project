<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import type { ReminderInput } from '../types/reminder'
import { scheduleOptions, weekDays } from '../types/reminder'
import { calculateOccurrences } from '../utils/scheduling'

const props = withDefaults(
  defineProps<{
    initial?: ReminderInput
    submitLabel?: string
    saving?: boolean
  }>(),
  { submitLabel: 'Create Reminder', saving: false },
)
const emit = defineEmits<{ submit: [value: ReminderInput] }>()

function localDateValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const nextHour = new Date()
nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)

const form = reactive<ReminderInput>({
  title: props.initial?.title ?? '',
  details: props.initial?.details ?? '',
  date: props.initial?.date ?? localDateValue(new Date()),
  time: props.initial?.time.slice(0, 5) ?? nextHour.toTimeString().slice(0, 5),
  scheduleType: props.initial?.scheduleType ?? 'once',
  customDays: [...(props.initial?.customDays ?? [])],
  enabled: props.initial?.enabled ?? true,
})
const validationError = ref('')
const showCustomDays = computed(() => form.scheduleType === 'custom')

function toggleDay(day: number): void {
  form.customDays = form.customDays.includes(day)
    ? form.customDays.filter((value) => value !== day)
    : [...form.customDays, day]
}

function submit(): void {
  validationError.value = ''
  form.title = form.title.trim()
  if (!form.title) {
    validationError.value = 'Please enter a reminder title.'
    return
  }

  try {
    calculateOccurrences(form)
  } catch (reason) {
    validationError.value =
      reason instanceof Error ? reason.message : 'Check the reminder schedule.'
    return
  }

  emit('submit', { ...form, details: form.details?.trim() || undefined })
}
</script>

<template>
  <form
    data-cy="reminder-form"
    class="form-card"
    novalidate
    @submit.prevent="submit"
  >
    <label class="field">
      <span>Title <b>*</b></span>
      <input
        v-model="form.title"
        data-cy="reminder-title"
        maxlength="120"
        placeholder="e.g. Daily Standup"
        autocomplete="off"
      />
    </label>

    <label class="field">
      <span>Details <small>Optional</small></span>
      <textarea
        v-model="form.details"
        data-cy="reminder-details"
        maxlength="1000"
        rows="4"
        placeholder="Add helpful context…"
      />
    </label>

    <div class="field-row">
      <label class="field">
        <span>Date</span>
        <input
          v-model="form.date"
          data-cy="reminder-date"
          type="date"
          required
        />
      </label>
      <label class="field">
        <span>Time</span>
        <input
          v-model="form.time"
          data-cy="reminder-time"
          type="time"
          required
        />
      </label>
    </div>

    <label class="field">
      <span>Schedule</span>
      <select v-model="form.scheduleType" data-cy="reminder-schedule">
        <option
          v-for="option in scheduleOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </label>

    <fieldset v-if="showCustomDays" class="days-fieldset">
      <legend>Repeat on</legend>
      <div class="day-picker">
        <button
          v-for="day in weekDays"
          :key="day.value"
          type="button"
          :class="{ selected: form.customDays.includes(day.value) }"
          :aria-pressed="form.customDays.includes(day.value)"
          :title="day.label"
          @click="toggleDay(day.value)"
        >
          {{ day.short }}
        </button>
      </div>
    </fieldset>

    <label class="notification-toggle">
      <span
        ><strong>Notification</strong
        ><small>Alert me when this reminder is due</small></span
      >
      <input v-model="form.enabled" type="checkbox" role="switch" />
    </label>

    <p v-if="validationError" class="alert alert-error">
      {{ validationError }}
    </p>
    <button
      class="button button-primary button-block"
      data-cy="reminder-submit"
      type="submit"
      :disabled="saving"
    >
      {{ saving ? 'Saving…' : submitLabel }}
    </button>
  </form>
</template>
