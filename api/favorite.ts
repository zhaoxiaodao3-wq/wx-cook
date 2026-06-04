import { request } from '@/api/request'

export function addFavorite(recipeId: string) {
  return request<{ favorited: boolean }>({
    url: `/recipes/${recipeId}/favorite`,
    method: 'POST',
  })
}

export function removeFavorite(recipeId: string) {
  return request<{ favorited: boolean }>({
    url: `/recipes/${recipeId}/favorite`,
    method: 'DELETE',
  })
}
