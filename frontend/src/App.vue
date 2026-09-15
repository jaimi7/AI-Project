<script setup lang="ts">
import { onMounted } from 'vue'

import AppShell from './components/AppShell.vue'
import { useReminderStore } from './stores/reminder'

const reminderStore = useReminderStore()
onMounted(() => reminderStore.loadReminders())
</script>

<template>
  <AppShell />
</template>
