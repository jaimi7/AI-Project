<script setup lang="ts">
import { useRouter } from 'vue-router'

import ReminderForm from '../components/ReminderForm.vue'
import { useReminderStore } from '../stores/reminder'
import type { ReminderInput } from '../types/reminder'

const router = useRouter()
const store = useReminderStore()
async function create(input: ReminderInput) {
  try {
    const reminder = await store.createReminder(input)
    await router.push(`/reminders/${reminder.id}`)
  } catch {
    /* surfaced by store */
  }
}
</script>

<template>
  <section class="narrow">
    <RouterLink to="/reminders" class="back-link">← Reminders</RouterLink>
    <div class="page-heading">
      <div>
        <p class="eyebrow">New schedule</p>
        <h1>Create Reminder</h1>
      </div>
    </div>
    <p v-if="store.error" class="alert alert-error">{{ store.error }}</p>
    <ReminderForm :saving="store.saving" @submit="create" />
  </section>
</template>
