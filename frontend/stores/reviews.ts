import { defineStore } from 'pinia'

import { reviewRepository } from '~/services/reviewRepository'
import type { ReviewRecord } from '~/types/review'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [] as ReviewRecord[],
    loading: false,
    initialized: false,
  }),
  getters: {
    reviewCount: (state) => state.reviews.length,
    approvedCount: (state) => state.reviews.filter(
      ({ status }) => status === 'approved' || status === 'shared',
    ).length,
  },
  actions: {
    async initialize() {
      if (this.initialized) return
      this.loading = true
      try {
        this.reviews = await reviewRepository.list()
        this.initialized = true
      } finally {
        this.loading = false
      }
    },
    async save(review: ReviewRecord) {
      const saved = { ...review, updatedAt: new Date().toISOString() }
      await reviewRepository.save(saved)
      const index = this.reviews.findIndex(({ id }) => id === saved.id)
      if (index >= 0) this.reviews[index] = saved
      else this.reviews.unshift(saved)
      this.reviews.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      return saved
    },
    async remove(id: string) {
      await reviewRepository.remove(id)
      this.reviews = this.reviews.filter((review) => review.id !== id)
    },
  },
})
