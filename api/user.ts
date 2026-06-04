import { getRuntimeConfig } from '@/config/runtime'
import { request } from '@/api/request'
import { getToken } from '@/utils/token'
import { resolveMediaUrl } from '@/utils/media'
import type { User } from '@/data/recipes'
import type { ApiRecipeListItem } from '@/api/adapters'
import type { PageResult } from '@/api/request'

export interface UserMe extends User {
  stats?: {
    uploads: number
    reviews: number
    suggestions: number
    favorites: number
  }
}

export function fetchCurrentUser() {
  return request<UserMe>({
    url: '/users/me',
    method: 'GET',
    requireAuth: true,
  })
}

export function patchCurrentUser(data: Partial<Pick<User, 'name' | 'bio'>>) {
  return request<UserMe>({
    url: '/users/me',
    method: 'PATCH',
    data: data as Record<string, unknown>,
    requireAuth: true,
  })
}

/** 上传头像（multipart），返回相对路径并已写入用户资料 */
export function uploadUserAvatar(filePath: string): Promise<string> {
  const token = getToken()
  if (!token) return Promise.reject(new Error('请先登录'))

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${getRuntimeConfig().apiBaseUrl}/users/me/avatar`,
      filePath,
      name: 'file',
      header: { Authorization: `Bearer ${token}` },
      success(res) {
        try {
          const body = JSON.parse(res.data) as {
            code: number
            message: string
            data: { avatarUrl: string }
          }
          if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
            resolve(resolveMediaUrl(body.data.avatarUrl))
            return
          }
          reject(new Error(body.message || `上传失败 (${res.statusCode})`))
        } catch {
          reject(new Error('上传响应解析失败'))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '头像上传失败'))
      },
    })
  })
}

export function fetchMyRecipes(page = 1, pageSize = 20) {
  return request<PageResult<ApiRecipeListItem>>({
    url: '/users/me/recipes',
    query: { page, pageSize },
    requireAuth: true,
  })
}

export function fetchMyFavorites(page = 1, pageSize = 20) {
  return request<PageResult<ApiRecipeListItem>>({
    url: '/users/me/favorites',
    query: { page, pageSize },
    requireAuth: true,
  })
}

export interface MyReviewItem {
  recipeId: string
  rating: number
  date: string
  recipe?: { id: string; title: string; coverImage?: string | null }
}

export function fetchMyReviews(page = 1, pageSize = 20) {
  return request<PageResult<MyReviewItem>>({
    url: '/users/me/reviews',
    query: { page, pageSize },
    requireAuth: true,
  })
}
