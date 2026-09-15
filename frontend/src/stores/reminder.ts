import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { reminderApi } from '../services/api'
import { notificationService } from '../services/notification'
import type { Reminder, ReminderInput } from '../types/reminder'

export const useReminderStore = defineStore('reminders', () => {
  const reminders = ref<Reminder[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  const activeReminders = computed(() =>
    reminders.value.filter((item) => item.enabled),
  )

  function replaceReminder(reminder: Reminder): void {
    const index = reminders.value.findIndex((item) => item.id === reminder.id)
    if (index === -1) reminders.value.push(reminder)
    else reminders.value[index] = reminder
  }

  async function loadReminders(): Promise<void> {
    if (loading.value) return
    loading.value = true
    error.value = ''
    try {
      reminders.value = await reminderApi.list()
      if ((await notificationService.permissionStatus()) === 'granted') {
        await Promise.all(
          reminders.value
            .filter((item) => item.enabled)
            .map((item) => notificationService.schedule(item, false)),
        )
      }
    } catch (reason) {
      error.value =
        reason instanceof Error ? reason.message : 'Could not load reminders.'
    } finally {
      loading.value = false
    }
  }

  async function createReminder(input: ReminderInput): Promise<Reminder> {
    saving.value = true
    error.value = ''
    try {
      let reminder = await reminderApi.create(input)
      replaceReminder(reminder)
      if (reminder.enabled) {
        try {
          await notificationService.schedule(reminder)
        } catch (reason) {
          reminder = await reminderApi.setStatus(reminder.id, false)
          replaceReminder(reminder)
          throw reason
        }
      }
      return reminder
    } catch (reason) {
      error.value =
        reason instanceof Error
          ? reason.message
          : 'Could not create the reminder.'
      throw reason
    } finally {
      saving.value = false
    }
  }

  async function updateReminder(
    id: string,
    input: ReminderInput,
  ): Promise<Reminder> {
    saving.value = true
    error.value = ''
    try {
      let reminder = await reminderApi.update(id, input)
      replaceReminder(reminder)
      try {
        await notificationService.schedule(reminder)
      } catch (reason) {
        reminder = await reminderApi.setStatus(id, false)
        replaceReminder(reminder)
        throw reason
      }
      return reminder
    } catch (reason) {
      error.value =
        reason instanceof Error
          ? reason.message
          : 'Could not update the reminder.'
      throw reason
    } finally {
      saving.value = false
    }
  }

  async function deleteReminder(id: string): Promise<void> {
    await reminderApi.delete(id)
    await notificationService.cancel(id)
    reminders.value = reminders.value.filter((item) => item.id !== id)
  }

  async function toggleReminder(reminder: Reminder): Promise<void> {
    const enabled = !reminder.enabled
    let updated = await reminderApi.setStatus(reminder.id, enabled)
    replaceReminder(updated)
    try {
      if (enabled) await notificationService.schedule(updated)
      else await notificationService.cancel(updated.id)
    } catch (reason) {
      updated = await reminderApi.setStatus(reminder.id, false)
      replaceReminder(updated)
      throw reason
    }
  }

  const findById = (id: string) =>
    reminders.value.find((item) => item.id === id)

  return {
    reminders,
    activeReminders,
    loading,
    saving,
    error,
    loadReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    findById,
  }
})
