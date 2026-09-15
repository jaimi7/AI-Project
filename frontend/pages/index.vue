<script setup lang="ts">
type HealthResponse = {
  status: string
  app: string
  environment: string
}

const config = useRuntimeConfig()
const health = ref<HealthResponse | null>(null)
const errorMessage = ref('')
const isLoading = ref(false)

async function checkApiHealth() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    health.value = await $fetch<HealthResponse>(
      `${config.public.apiBaseUrl}/health`,
    )
  } catch {
    health.value = null
    errorMessage.value =
      'Could not reach the API. Make sure the FastAPI server is running.'
  } finally {
    isLoading.value = false
  }
}

onMounted(checkApiHealth)
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">Nuxt 3 + FastAPI</p>
      <h1>AI Project</h1>
      <p>This app is ready for web, Android, and iOS development.</p>

      <div class="status" aria-live="polite">
        <span :class="['indicator', { online: health?.status === 'ok' }]" />
        <span v-if="isLoading">Checking API…</span>
        <span v-else-if="health"
          >API connected: {{ health.app }} ({{ health.environment }})</span
        >
        <span v-else>{{ errorMessage }}</span>
      </div>

      <button type="button" :disabled="isLoading" @click="checkApiHealth">
        Check again
      </button>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  color: #172033;
  background: #f4f7fb;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.page {
  display: grid;
  min-height: 100vh;
  padding: 1.5rem;
  place-items: center;
}

.card {
  width: min(100%, 40rem);
  padding: 2.5rem;
  border: 1px solid #dfe6f1;
  border-radius: 1.25rem;
  background: white;
  box-shadow: 0 1.25rem 3.5rem rgb(31 54 88 / 10%);
}

.eyebrow {
  margin: 0;
  color: #5263d9;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0.5rem 0;
  font-size: clamp(2.25rem, 8vw, 4rem);
}

.status {
  display: flex;
  align-items: center;
  min-height: 3rem;
  margin: 2rem 0 1rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: #f4f7fb;
  gap: 0.7rem;
}

.indicator {
  width: 0.65rem;
  height: 0.65rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #d14343;
}

.indicator.online {
  background: #1e9c63;
}

button {
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: 0.7rem;
  color: white;
  background: #5263d9;
  cursor: pointer;
  font: inherit;
  font-weight: 650;
}

button:disabled {
  cursor: wait;
  opacity: 0.65;
}
</style>
