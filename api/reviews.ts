import { request } from '@/api/request'

export function submitReview(recipeId: string, rating: number) {
  return request<{
    review: {
      id: string
      userId: string
      userName: string
      userAvatar: string
      rating: number
      date: string
    }
    recipeRating: number
    ratingCount: number
  }>({
    url: `/recipes/${recipeId}/reviews`,
    method: 'POST',
    data: { rating },
  })
}

export function deleteMyReview(recipeId: string) {
  return request<{ recipeRating: number; ratingCount: number }>({
    url: `/recipes/${recipeId}/reviews/me`,
    method: 'DELETE',
  })
}
