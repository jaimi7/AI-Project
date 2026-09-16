<script setup lang="ts">
type HealthResponse = {
  status: string
  service: string
}

const config = useRuntimeConfig()
const healthUrl = `${config.public.apiBaseUrl}/api/health`

const {
  data: health,
  error,
  status,
  refresh,
} = await useFetch<HealthResponse>(healthUrl, {
  server: false,
})
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">AI Review Assistant</p>
      <h1>Nuxt + FastAPI</h1>
      <p class="intro">
        The mobile-ready frontend checks whether the backend API is available.
      </p>

      <div class="status" :class="`status--${status}`">
        <span class="status__dot" aria-hidden="true" />
        <div>
          <strong v-if="status === 'pending'">Checking API…</strong>
          <strong v-else-if="health">Backend connected</strong>
          <strong v-else>Backend unavailable</strong>
          <p v-if="health">{{ health.service }} returned “{{ health.status }}”.</p>
          <p v-else-if="error">Start FastAPI on port 8000 and try again.</p>
        </div>
      </div>

      <button type="button" :disabled="status === 'pending'" @click="refresh">
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
  background: #f4f6fb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page {
  display: grid;
  min-height: 100vh;
  padding: 24px;
  place-items: center;
}

.card {
  width: min(100%, 560px);
  padding: 40px;
  border: 1px solid #e4e8f1;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgb(30 44 80 / 10%);
}

.eyebrow {
  margin: 0 0 8px;
  color: #6457d9;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 8vw, 3.5rem);
  letter-spacing: -0.05em;
}

.intro {
  margin: 16px 0 28px;
  color: #5a6375;
  line-height: 1.6;
}

.status {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px;
  border-radius: 16px;
  background: #fff3f2;
}

.status--success {
  background: #eafaf2;
}

.status--pending {
  background: #f2f0ff;
}

.status__dot {
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
  margin-top: 5px;
  border-radius: 50%;
  background: #d54a43;
}

.status--success .status__dot {
  background: #198754;
}

.status--pending .status__dot {
  background: #6457d9;
}

.status p {
  margin: 4px 0 0;
  color: #5a6375;
}

button {
  width: 100%;
  margin-top: 20px;
  padding: 13px 18px;
  border: 0;
  border-radius: 12px;
  color: white;
  background: #6457d9;
  font: inherit;
  font-weight: 750;
  cursor: pointer;
}

button:disabled {
  cursor: wait;
  opacity: 0.6;
}

@media (max-width: 480px) {
  .card {
    padding: 28px 22px;
  }
}
</style>
