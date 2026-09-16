<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { copyText, openExternalUrl, parseReviewQr, scanQrCode } from '~/services/device'
import { useReviewsStore } from '~/stores/reviews'
import { createEmptyReview, type GenerateReviewPayload, type ReviewLength, type ReviewRecord, type ReviewStatus, type ReviewTone } from '~/types/review'

type AppView = 'create' | 'history'

const reviewsStore = useReviewsStore()
const { reviews, reviewCount, approvedCount } = storeToRefs(reviewsStore)
const { generate, optimize } = useReviewApi()
const activeView = ref<AppView>('create')
const form = reactive<ReviewRecord>(createEmptyReview())
const keywordInput = ref('')
const search = ref('')
const statusFilter = ref<'all' | ReviewStatus>('all')
const busy = ref(false)
const errorMessage = ref('')
const notice = ref('')

const categories = ['restaurant', 'food', 'hotel', 'travel', 'attraction', 'service', 'product', 'other']
const toneOptions: ReviewTone[] = ['natural', 'friendly', 'professional', 'enthusiastic', 'constructive']
const lengthOptions: ReviewLength[] = ['short', 'medium', 'detailed']
const optimizationOptions = [
  'Make it shorter',
  'Make it sound more natural',
  'Improve grammar and clarity',
  'Make it more professional',
  'Keep the criticism constructive',
]

const filteredReviews = computed(() => {
  const query = search.value.trim().toLowerCase()
  return reviews.value.filter((review) => {
    const matchesStatus = statusFilter.value === 'all' || review.status === statusFilter.value
    const matchesQuery = !query || [review.placeName, review.category, review.finalReview, review.generatedReview, ...review.keywords]
      .join(' ').toLowerCase().includes(query)
    return matchesStatus && matchesQuery
  })
})
const hasReview = computed(() => Boolean(form.finalReview || form.generatedReview))
const activeReviewText = computed({
  get: () => form.finalReview || form.generatedReview,
  set: (value: string) => { form.finalReview = value },
})

onMounted(() => reviewsStore.initialize())

const showNotice = (message: string) => {
  notice.value = message
  window.setTimeout(() => { if (notice.value === message) notice.value = '' }, 2600)
}
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const candidate = error as { data?: { detail?: string }; message?: string }
    return candidate.data?.detail || candidate.message || 'Something went wrong'
  }
  return 'Something went wrong'
}
const addKeyword = () => {
  const keyword = keywordInput.value.trim()
  if (!keyword || form.keywords.includes(keyword)) return
  form.keywords.push(keyword)
  keywordInput.value = ''
}
const removeKeyword = (keyword: string) => { form.keywords = form.keywords.filter((item) => item !== keyword) }
const resetForm = () => {
  Object.assign(form, createEmptyReview())
  keywordInput.value = ''
  errorMessage.value = ''
  activeView.value = 'create'
}
const saveReview = async () => {
  const saved = await reviewsStore.save({ ...form, keywords: [...form.keywords] })
  Object.assign(form, saved)
  showNotice('Review saved locally')
}
const generateReview = async () => {
  errorMessage.value = ''
  if (!form.placeName.trim()) return void (errorMessage.value = 'Add the place or item name.')
  if (!form.experienceNotes.trim() && !form.keywords.length) {
    return void (errorMessage.value = 'Add honest experience notes or at least one keyword.')
  }
  const payload: GenerateReviewPayload = {
    place_name: form.placeName.trim(), category: form.category, keywords: form.keywords,
    experience_notes: form.experienceNotes.trim(), rating: form.rating, tone: form.tone,
    length: form.length, language: form.language,
  }
  if (form.reviewUrl) payload.review_url = form.reviewUrl
  busy.value = true
  try {
    const response = await generate(payload)
    form.generatedReview = response.review
    form.finalReview = response.review
    form.provider = response.provider
    form.status = 'generated'
    await saveReview()
    showNotice('Review generated and saved')
  } catch (error) { errorMessage.value = getErrorMessage(error) } finally { busy.value = false }
}
const optimizeReview = async (instruction: string) => {
  if (!activeReviewText.value) return
  busy.value = true
  errorMessage.value = ''
  try {
    const response = await optimize(activeReviewText.value, instruction, form.language)
    form.finalReview = response.review
    form.provider = response.provider
    form.status = 'generated'
    await saveReview()
  } catch (error) { errorMessage.value = getErrorMessage(error) } finally { busy.value = false }
}
const approveReview = async () => {
  if (!activeReviewText.value.trim()) return
  form.finalReview = activeReviewText.value.trim()
  form.status = 'approved'
  await saveReview()
  showNotice('Review approved')
}
const copyReview = async () => {
  if (!activeReviewText.value) return
  await copyText(activeReviewText.value)
  showNotice('Review copied')
}
const openReviewPage = async () => {
  errorMessage.value = ''
  if (!form.reviewUrl) return void (errorMessage.value = 'Add or scan the review page URL first.')
  if (!['approved', 'shared'].includes(form.status)) return void (errorMessage.value = 'Approve the review before opening the publishing page.')
  await copyReview()
  await openExternalUrl(form.reviewUrl)
  form.status = 'shared'
  await saveReview()
}
const scanReviewUrl = async () => {
  errorMessage.value = ''
  try {
    const parsed = parseReviewQr(await scanQrCode())
    form.reviewUrl = parsed.reviewUrl
    if (!form.placeName && parsed.placeName) form.placeName = parsed.placeName
    showNotice('Review page linked')
  } catch (error) { errorMessage.value = getErrorMessage(error) }
}
const validateReviewUrl = () => {
  if (!form.reviewUrl) return
  try { form.reviewUrl = parseReviewQr(form.reviewUrl).reviewUrl } catch (error) {
    errorMessage.value = getErrorMessage(error)
    form.reviewUrl = ''
  }
}
const editReview = (review: ReviewRecord) => {
  Object.assign(form, JSON.parse(JSON.stringify(review)))
  activeView.value = 'create'
  errorMessage.value = ''
}
const deleteReview = async (review: ReviewRecord) => {
  if (!window.confirm(`Delete the review for ${review.placeName}?`)) return
  await reviewsStore.remove(review.id)
  if (form.id === review.id) resetForm()
  showNotice('Review deleted')
}
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <button class="brand" type="button" @click="resetForm">
        <span class="brand__mark">R</span>
        <span><strong>ReviewMate</strong><small>AI review assistant</small></span>
      </button>
      <div class="account-chip" title="History is stored on this device">
        <span class="account-chip__avatar">JP</span>
        <span><strong>Local account</strong><small>{{ reviewCount }} reviews</small></span>
      </div>
    </header>

    <nav class="tabs" aria-label="Primary navigation">
      <button :class="{ active: activeView === 'create' }" type="button" @click="activeView = 'create'">Create</button>
      <button :class="{ active: activeView === 'history' }" type="button" @click="activeView = 'history'">History <span>{{ reviewCount }}</span></button>
    </nav>

    <main>
      <section v-if="activeView === 'create'" class="workspace">
        <div class="hero">
          <p class="eyebrow">Write from your real experience</p>
          <h1>Turn a few honest notes into a polished review.</h1>
          <p>Generate, improve, approve, copy, and open the correct review page—all while keeping your history on this device.</p>
        </div>

        <div class="workspace__grid">
          <form class="panel form-panel" @submit.prevent="generateReview">
            <div class="panel__heading">
              <div><span class="step">1</span><h2>Your experience</h2></div>
              <button class="button button--soft" type="button" data-cy="scan-qr" @click="scanReviewUrl">Scan QR</button>
            </div>

            <label class="field"><span>Place or item name</span><input v-model="form.placeName" data-cy="place-name" required maxlength="160" placeholder="e.g. Spice Garden" /></label>
            <div class="field-row">
              <label class="field"><span>Category</span><select v-model="form.category"><option v-for="category in categories" :key="category" :value="category">{{ category }}</option></select></label>
              <label class="field"><span>Language</span><input v-model="form.language" maxlength="50" placeholder="English" /></label>
            </div>

            <fieldset class="field rating-field">
              <legend>Your rating</legend>
              <div class="stars" role="radiogroup" aria-label="Rating">
                <button v-for="star in 5" :key="star" :class="{ selected: star <= form.rating }" type="button" :aria-label="`${star} stars`" @click="form.rating = star">★</button>
                <strong>{{ form.rating }}/5</strong>
              </div>
            </fieldset>

            <label class="field"><span>What happened?</span><textarea v-model="form.experienceNotes" data-cy="experience-notes" maxlength="3000" rows="5" placeholder="Describe what you genuinely liked, disliked, ordered, saw, or experienced." /><small>{{ form.experienceNotes.length }}/3000</small></label>

            <div class="field">
              <span>Keywords</span>
              <div class="keyword-entry"><input v-model="keywordInput" maxlength="50" placeholder="friendly staff" @keydown.enter.prevent="addKeyword" /><button type="button" @click="addKeyword">Add</button></div>
              <div v-if="form.keywords.length" class="chips"><button v-for="keyword in form.keywords" :key="keyword" type="button" @click="removeKeyword(keyword)">{{ keyword }} ×</button></div>
            </div>

            <div class="field-row">
              <label class="field"><span>Tone</span><select v-model="form.tone"><option v-for="tone in toneOptions" :key="tone" :value="tone">{{ tone }}</option></select></label>
              <label class="field"><span>Length</span><select v-model="form.length"><option v-for="option in lengthOptions" :key="option" :value="option">{{ option }}</option></select></label>
            </div>

            <label class="field"><span>Review-page URL <em>optional</em></span><div class="url-field"><input v-model="form.reviewUrl" type="url" placeholder="https://g.page/r/.../review" @blur="validateReviewUrl" /><button type="button" @click="scanReviewUrl">QR</button></div></label>
            <p class="privacy-note">Your notes and history stay on this device. Notes are sent to the configured AI service only when you generate or optimize.</p>
            <p v-if="errorMessage" class="error" data-cy="error-message">{{ errorMessage }}</p>
            <div class="form-actions"><button class="button button--secondary" type="button" @click="saveReview">Save draft</button><button class="button button--primary" data-cy="generate-review" type="submit" :disabled="busy">{{ busy ? 'Working…' : hasReview ? 'Regenerate review' : 'Generate review' }}</button></div>
          </form>

          <section class="panel result-panel" :class="{ empty: !hasReview }">
            <div class="panel__heading"><div><span class="step">2</span><h2>Review studio</h2></div><span v-if="hasReview" class="status-badge" :class="`status-badge--${form.status}`">{{ form.status }}</span></div>
            <div v-if="!hasReview" class="empty-state"><span class="empty-state__icon">✦</span><h3>Your generated review appears here</h3><p>Add details from your real experience, then choose Generate review.</p></div>
            <template v-else>
              <textarea v-model="activeReviewText" data-cy="review-output" class="review-editor" rows="12" aria-label="Generated review" />
              <p class="word-count">{{ activeReviewText.trim() ? activeReviewText.trim().split(/\s+/).length : 0 }} words · {{ form.provider }} provider</p>
              <div class="optimizer"><span>Quick improvements</span><div class="chips chips--actions"><button v-for="instruction in optimizationOptions" :key="instruction" type="button" :disabled="busy" @click="optimizeReview(instruction)">{{ instruction }}</button></div></div>
              <div class="review-actions"><button class="button button--soft" type="button" @click="copyReview">Copy</button><button class="button button--secondary" data-cy="approve-review" type="button" @click="approveReview">Approve</button><button class="button button--primary" type="button" :disabled="!form.reviewUrl" @click="openReviewPage">Copy & open page</button></div>
              <p class="publishing-note">You stay in control: the app never submits a review automatically. Review the text, choose your rating, and post it yourself.</p>
            </template>
          </section>
        </div>
      </section>

      <section v-else class="history-view">
        <div class="history-header"><div><p class="eyebrow">Saved on this device</p><h1>Review history</h1><p>{{ approvedCount }} approved · {{ reviewCount }} total</p></div><button class="button button--primary" type="button" @click="resetForm">New review</button></div>
        <div class="history-tools"><input v-model="search" type="search" placeholder="Search places, keywords, or reviews" /><select v-model="statusFilter" aria-label="Filter by status"><option value="all">All statuses</option><option value="draft">Draft</option><option value="generated">Generated</option><option value="approved">Approved</option><option value="shared">Shared</option></select></div>
        <div v-if="!filteredReviews.length" class="panel history-empty"><h2>No reviews found</h2><p>Create your first review or change the current filters.</p></div>
        <div v-else class="history-grid" data-cy="review-history">
          <article v-for="review in filteredReviews" :key="review.id" class="history-card">
            <div class="history-card__top"><span class="category-icon">{{ review.category.slice(0, 1).toUpperCase() }}</span><div><h2>{{ review.placeName }}</h2><p>{{ review.category }} · {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</p></div><span class="status-badge" :class="`status-badge--${review.status}`">{{ review.status }}</span></div>
            <p class="history-card__review">{{ review.finalReview || review.generatedReview || review.experienceNotes || 'Empty draft' }}</p>
            <div v-if="review.keywords.length" class="chips"><span v-for="keyword in review.keywords.slice(0, 4)" :key="keyword">{{ keyword }}</span></div>
            <footer><small>{{ formatDate(review.updatedAt) }}</small><div><button type="button" @click="editReview(review)">Edit</button><button class="danger-link" type="button" @click="deleteReview(review)">Delete</button></div></footer>
          </article>
        </div>
      </section>
    </main>
    <Transition name="toast"><div v-if="notice" class="toast" role="status">{{ notice }}</div></Transition>
  </div>
</template>
