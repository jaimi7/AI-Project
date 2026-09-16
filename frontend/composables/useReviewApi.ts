import type {
  GenerateReviewPayload,
  ReviewTextResponse,
} from '~/types/review'

export const useReviewApi = () => {
  const config = useRuntimeConfig()
  const endpoint = (path: string) => `${config.public.apiBaseUrl}/api/reviews${path}`

  const generate = (payload: GenerateReviewPayload) => $fetch<ReviewTextResponse>(
    endpoint('/generate'),
    { method: 'POST', body: payload },
  )

  const optimize = (review: string, instruction: string, language: string) => (
    $fetch<ReviewTextResponse>(endpoint('/optimize'), {
      method: 'POST',
      body: { review, instruction, language },
    })
  )

  return { generate, optimize }
}
