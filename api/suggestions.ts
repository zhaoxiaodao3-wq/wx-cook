import { request } from '@/api/request'

export function submitSuggestion(recipeId: string, content: string) {
  return request<{
    id: string
    userId: string
    userName: string
    userAvatar: string
    content: string
    date: string
  }>({
    url: `/recipes/${recipeId}/suggestions`,
    method: 'POST',
    data: { content },
  })
}

export function deleteMySuggestion(recipeId: string) {
  return request<null>({
    url: `/recipes/${recipeId}/suggestions/me`,
    method: 'DELETE',
  })
}
