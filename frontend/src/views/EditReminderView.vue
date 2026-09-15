<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ReminderForm from '../components/ReminderForm.vue'
import { useReminderStore } from '../stores/reminder'
import type { ReminderInput } from '../types/reminder'

const route = useRoute()
const router = useRouter()
const store = useReminderStore()
const id = computed(() => String(route.params.id))
const reminder = computed(() => store.findById(id.value))
onMounted(() => {
  if (!reminder.value) store.loadReminders()
})
async function update(input: ReminderInput) {
  try {
    await store.updateReminder(id.value, input)
    await router.push(`/reminders/${id.value}`)
  } catch {
    /* surfaced by store */
  }
}
</script>

<template>
  <section class="narrow">
    <RouterLink :to="`/reminders/${id}`" class="back-link"
      >← Reminder</RouterLink
    >
    <div class="page-heading">
      <div>
        <p class="eyebrow">Update schedule</p>
        <h1>Edit Reminder</h1>
      </div>
    </div>
    <p v-if="store.error" class="alert alert-error">{{ store.error }}</p>
    <ReminderForm
      v-if="reminder"
      :initial="reminder"
      submit-label="Save Changes"
      :saving="store.saving"
      @submit="update"
    />
    <div v-else class="empty-state">Loading reminder…</div>
  </section>
</template>
