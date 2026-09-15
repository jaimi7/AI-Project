<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { notificationService } from '../services/notification'

const permission = ref('Checking…')
const message = ref('')
async function refresh() {
  permission.value = await notificationService.permissionStatus()
}
async function enable() {
  const granted = await notificationService.requestPermission()
  await refresh()
  message.value = granted
    ? 'Notifications are enabled.'
    : 'Permission was not granted. You can enable it in device settings.'
}
onMounted(refresh)
</script>

<template>
  <section class="narrow">
    <div class="page-heading">
      <div>
        <p class="eyebrow">Preferences</p>
        <h1>Settings</h1>
      </div>
    </div>
    <article class="settings-card">
      <div>
        <h2>Local notifications</h2>
        <p>
          Permission: <strong>{{ permission }}</strong>
        </p>
        <p class="card-meta">
          Permission is requested here or when you enable your first
          reminder—not when the app opens.
        </p>
      </div>
      <button class="button button-primary" type="button" @click="enable">
        Enable notifications
      </button>
      <p v-if="message" class="alert alert-info">{{ message }}</p>
    </article>
  </section>
</template>
