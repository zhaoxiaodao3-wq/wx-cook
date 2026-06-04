import { request, type PageResult } from '@/api/request'
import type { ApiRecipeDetail, ApiRecipeListItem } from '@/api/adapters'

export interface RecipeListQuery {
  page?: number
  pageSize?: number
  q?: string
  category?: string
  cuisine?: string
  tag?: string
  sort?: 'createdAt' | 'rating'
}

export function fetchRecipes(query: RecipeListQuery) {
  return request<PageResult<ApiRecipeListItem>>({
    url: '/recipes',
    query: query as Record<string, string | number | undefined>,
    auth: false,
  })
}

export function fetchRankedRecipes(limit = 10) {
  return request<ApiRecipeListItem[]>({
    url: '/recipes/ranked',
    query: { limit },
    auth: false,
  })
}

export function fetchRecipeDetail(id: string) {
  return request<ApiRecipeDetail>({
    url: `/recipes/${id}`,
    auth: true,
  })
}

export interface PublishRecipePayload {
  title: string
  coverImage?: string | null
  duration?: number
  difficulty?: string
  category: string
  cuisine?: string
  tags?: string[]
  servings?: number
  ingredients: { name: string; amount?: string; unit?: string }[]
  steps: { id?: number | null; desc: string; image?: string | null }[]
  tips?: string
  crowd?: string
}

export function createRecipe(payload: PublishRecipePayload) {
  return request<ApiRecipeDetail>({
    url: '/recipes',
    method: 'POST',
    data: payload as Record<string, unknown>,
  })
}
