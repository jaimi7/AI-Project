export default defineNuxtConfig({
  compatibilityDate: '2026-09-16',
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  ssr: false,
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000',
    },
  },
  typescript: {
    strict: true,
  },
})
