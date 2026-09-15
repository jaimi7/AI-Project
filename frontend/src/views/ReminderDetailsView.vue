<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useReminderStore } from '../stores/reminder'
import {
  formatNextOccurrence,
  formatTime,
  scheduleLabel,
} from '../utils/scheduling'

const route = useRoute()
const router = useRouter()
const store = useReminderStore()
const busy = ref(false)
const id = computed(() => String(route.params.id))
const reminder = computed(() => store.findById(id.value))
onMounted(() => {
  if (!reminder.value) store.loadReminders()
})
async function remove() {
  if (!reminder.value || !window.confirm('Delete this reminder?')) return
  busy.value = true
  try {
    await store.deleteReminder(reminder.value.id)
    await router.push('/reminders')
  } finally {
    busy.value = false
  }
}
async function toggle() {
  if (reminder.value) await store.toggleReminder(reminder.value)
}
</script>

<template>
  <section class="narrow">
    <RouterLink to="/reminders" class="back-link">← Reminders</RouterLink>
    <article v-if="reminder" class="details-card">
      <div class="details-icon">🔔</div>
      <p class="eyebrow">Reminder</p>
      <h1>{{ reminder.title }}</h1>
      <p class="details-copy">
        {{ reminder.details || 'No additional details.' }}
      </p>
      <dl>
        <div>
          <dt>Time</dt>
          <dd>{{ formatTime(reminder.time) }}</dd>
        </div>
        <div>
          <dt>Schedule</dt>
          <dd>{{ scheduleLabel(reminder.scheduleType) }}</dd>
        </div>
        <div>
          <dt>Next Notification</dt>
          <dd>{{ formatNextOccurrence(reminder) }}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd :class="{ success: reminder.enabled }">
            {{ reminder.enabled ? 'Active' : 'Disabled' }}
          </dd>
        </div>
      </dl>
      <div class="action-row">
        <RouterLink
          :to="`/reminders/${reminder.id}/edit`"
          class="button button-primary"
          >Edit</RouterLink
        ><button class="button button-secondary" type="button" @click="toggle">
          {{ reminder.enabled ? 'Disable' : 'Enable' }}</button
        ><button
          class="button button-danger"
          type="button"
          :disabled="busy"
          @click="remove"
        >
          Delete
        </button>
      </div>
    </article>
    <div v-else class="empty-state">Loading reminder…</div>
  </section>
</template>
