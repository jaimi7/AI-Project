export type ReviewStatus = 'draft' | 'generated' | 'approved' | 'shared'
export type ReviewTone = 'natural' | 'friendly' | 'professional' | 'enthusiastic' | 'constructive'
export type ReviewLength = 'short' | 'medium' | 'detailed'

export type ReviewRecord = {
  id: string
  placeName: string
  category: string
  keywords: string[]
  experienceNotes: string
  rating: number
  tone: ReviewTone
  length: ReviewLength
  language: string
  generatedReview: string
  finalReview: string
  reviewUrl: string
  status: ReviewStatus
  provider: string
  createdAt: string
  updatedAt: string
}

export type GenerateReviewPayload = {
  place_name: string
  category: string
  keywords: string[]
  experience_notes: string
  rating: number
  tone: ReviewTone
  length: ReviewLength
  language: string
  review_url?: string
}

export type ReviewTextResponse = {
  review: string
  provider: string
}

export const createEmptyReview = (): ReviewRecord => {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    placeName: '',
    category: 'restaurant',
    keywords: [],
    experienceNotes: '',
    rating: 5,
    tone: 'natural',
    length: 'medium',
    language: 'English',
    generatedReview: '',
    finalReview: '',
    reviewUrl: '',
    status: 'draft',
    provider: '',
    createdAt: now,
    updatedAt: now,
  }
}
