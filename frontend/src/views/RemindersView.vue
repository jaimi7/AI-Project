<script setup lang="ts">
import ReminderCard from '../components/ReminderCard.vue'
import { useReminderStore } from '../stores/reminder'
import type { Reminder } from '../types/reminder'

const store = useReminderStore()
async function toggle(reminder: Reminder) {
  try {
    await store.toggleReminder(reminder)
  } catch {
    /* surfaced by store */
  }
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">All schedules</p>
        <h1>My Reminders</h1>
      </div>
      <RouterLink to="/reminders/new" class="button button-primary"
        >+ Create</RouterLink
      >
    </div>
    <p v-if="store.error" class="alert alert-error">{{ store.error }}</p>
    <div v-if="store.loading" class="empty-state">Loading reminders…</div>
    <div v-else-if="store.reminders.length" class="card-list">
      <ReminderCard
        v-for="reminder in store.reminders"
        :key="reminder.id"
        :reminder="reminder"
        @toggle="toggle"
      />
    </div>
    <div v-else class="empty-state">
      <span>🗓️</span>
      <h3>Your reminder list is empty</h3>
      <p>Add one to begin.</p>
    </div>
  </section>
</template>
