<script setup lang="ts">
import { computed } from 'vue'

import ReminderCard from '../components/ReminderCard.vue'
import { useReminderStore } from '../stores/reminder'
import type { Reminder } from '../types/reminder'
import { getNextOccurrence } from '../utils/scheduling'

const store = useReminderStore()
const upcoming = computed(() =>
  [...store.activeReminders]
    .sort(
      (a, b) =>
        (getNextOccurrence(a)?.getTime() ?? Infinity) -
        (getNextOccurrence(b)?.getTime() ?? Infinity),
    )
    .slice(0, 3),
)

async function toggle(reminder: Reminder): Promise<void> {
  try {
    await store.toggleReminder(reminder)
  } catch {
    // The store exposes the actionable error.
  }
}
</script>

<template>
  <section>
    <div class="hero">
      <p class="eyebrow">Stay on track</p>
      <h1>Good day, Jaimi</h1>
      <p>Small reminders, perfectly timed.</p>
      <RouterLink to="/reminders/new" class="button button-light"
        >+ Create Reminder</RouterLink
      >
    </div>

    <div class="section-heading">
      <div>
        <p class="eyebrow">Coming up</p>
        <h2>Your next reminders</h2>
      </div>
      <RouterLink to="/reminders">View all</RouterLink>
    </div>

    <p v-if="store.error" class="alert alert-error">{{ store.error }}</p>
    <div v-if="store.loading" class="empty-state">Loading reminders…</div>
    <div v-else-if="upcoming.length" class="card-list">
      <ReminderCard
        v-for="reminder in upcoming"
        :key="reminder.id"
        :reminder="reminder"
        @toggle="toggle"
      />
    </div>
    <div v-else class="empty-state">
      <span>🔔</span>
      <h3>No upcoming reminders</h3>
      <p>Create your first reminder and we’ll keep you on schedule.</p>
    </div>
  </section>
</template>
