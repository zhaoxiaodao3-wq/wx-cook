import { resolveMediaUrl } from '@/utils/media'
import type { Recipe, User, Review, Suggestion } from '@/data/recipes'

export interface ApiAuthor {
  id: string
  name: string
  avatar?: string
}

export interface ApiRecipeListItem {
  id: string
  title: string
  coverImage?: string | null
  author?: ApiAuthor | null
  rating?: number
  ratingCount?: number
  createdAt?: string
  duration?: number | null
  difficulty?: string | null
  category?: string | null
  cuisine?: string | null
  tags?: string[]
  servings?: number | null
  isFavorite?: boolean | null
}

export interface ApiRecipeDetail extends ApiRecipeListItem {
  ingredients?: { name: string; amount?: string; unit?: string }[]
  steps?: { id?: number | null; desc: string; image?: string | null }[]
  tips?: string
  crowd?: string
  reviews?: {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    rating: number
    date: string
  }[]
  suggestions?: {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    date: string
  }[]
  myReview?: { id: string; rating: number } | null
  mySuggestion?: { id: string; content: string } | null
}

export function mapApiUser(u?: ApiAuthor | null): User {
  if (!u) return { id: '', name: '匿名', avatar: '', bio: '' }
  return {
    id: u.id,
    name: u.name || '',
    avatar: resolveMediaUrl(u.avatar),
    bio: '',
  }
}

function mapReview(r: NonNullable<ApiRecipeDetail['reviews']>[number]): Review {
  return {
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    userAvatar: resolveMediaUrl(r.userAvatar),
    rating: r.rating,
    date: r.date,
  }
}

function mapSuggestion(s: NonNullable<ApiRecipeDetail['suggestions']>[number]): Suggestion {
  return {
    id: s.id,
    userId: s.userId,
    userName: s.userName,
    userAvatar: resolveMediaUrl(s.userAvatar),
    content: s.content,
    date: s.date,
  }
}

export function mapApiRecipeListItem(item: ApiRecipeListItem): Recipe {
  return {
    id: item.id,
    title: item.title,
    coverImage: resolveMediaUrl(item.coverImage) || '',
    author: mapApiUser(item.author),
    rating: item.rating ?? 0,
    ratingCount: item.ratingCount ?? 0,
    createdAt: item.createdAt || '',
    duration: item.duration ?? 0,
    difficulty: (item.difficulty as Recipe['difficulty']) || '简单',
    category: (item.category as Recipe['category']) || 'lunch',
    cuisine: item.cuisine || '',
    tags: item.tags || [],
    servings: item.servings ?? 2,
    ingredients: [],
    steps: [],
    tips: '',
    crowd: '',
    reviews: [],
    suggestions: [],
    isFavorite: item.isFavorite ?? undefined,
  }
}

export function mapApiRecipeDetail(item: ApiRecipeDetail): Recipe {
  const base = mapApiRecipeListItem(item)
  return {
    ...base,
    ingredients: (item.ingredients || []).map((i) => ({
      name: i.name,
      amount: i.amount || '',
      unit: i.unit || '',
    })),
    steps: (item.steps || []).map((s, idx) => ({
      id: s.id ?? idx + 1,
      desc: s.desc,
      image: s.image ? resolveMediaUrl(s.image) : undefined,
    })),
    tips: item.tips || '',
    crowd: item.crowd || '',
    reviews: (item.reviews || []).map(mapReview),
    suggestions: (item.suggestions || []).map(mapSuggestion),
    isFavorite: item.isFavorite ?? undefined,
    myReview: item.myReview ?? undefined,
    mySuggestion: item.mySuggestion ?? undefined,
  }
}
