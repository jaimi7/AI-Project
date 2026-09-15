<script setup lang="ts">
import type { Reminder } from '../types/reminder'
import {
  formatNextOccurrence,
  formatTime,
  scheduleLabel,
} from '../utils/scheduling'

defineProps<{ reminder: Reminder }>()
defineEmits<{ toggle: [reminder: Reminder] }>()
</script>

<template>
  <article class="reminder-card" :class="{ muted: !reminder.enabled }">
    <RouterLink :to="`/reminders/${reminder.id}`" class="card-link">
      <div class="reminder-icon">🔔</div>
      <div class="reminder-copy">
        <div class="card-heading">
          <h3>{{ reminder.title }}</h3>
          <span :class="['status-pill', { inactive: !reminder.enabled }]">
            {{ reminder.enabled ? 'Active' : 'Paused' }}
          </span>
        </div>
        <p class="reminder-time">{{ formatTime(reminder.time) }}</p>
        <p class="card-meta">{{ scheduleLabel(reminder.scheduleType) }}</p>
        <p class="next-time">Next: {{ formatNextOccurrence(reminder) }}</p>
      </div>
    </RouterLink>
    <button
      class="switch"
      :class="{ on: reminder.enabled }"
      type="button"
      :aria-label="`${reminder.enabled ? 'Disable' : 'Enable'} ${reminder.title}`"
      :aria-pressed="reminder.enabled"
      @click="$emit('toggle', reminder)"
    >
      <span />
    </button>
  </article>
</template>
