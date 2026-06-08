import { getRuntimeConfig } from '@/config/runtime'
import { getToken, hasValidToken } from '@/utils/token'
import { clearSession } from '@/utils/session'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: Record<string, unknown>
  query?: Record<string, string | number | boolean | undefined | null>
  /**
   * true（默认）：有 token 则附带 Authorization
   * false：公开接口，不带 token，401 也不清 session
   */
  auth?: boolean
  /** true：必须先有 token，否则本地直接报错（用于必须登录的接口） */
  requireAuth?: boolean
  token?: string
}

let handling401 = false

function parseErrorMessage(resData: unknown, status: number): string {
  if (!resData || typeof resData !== 'object') return `请求失败 (${status})`
  const body = resData as Record<string, unknown>
  if (typeof body.message === 'string' && body.message) return body.message
  if (typeof body.detail === 'string' && body.detail) return body.detail
  if (Array.isArray(body.detail) && body.detail[0] && typeof body.detail[0] === 'object') {
    const first = body.detail[0] as { msg?: string }
    if (first.msg) return first.msg
  }
  return `请求失败 (${status})`
}

/** 登录失效：清本地 session，回到登录门帘 */
function handleUnauthorized() {
  if (handling401) return
  handling401 = true
  clearSession()
  import('@/stores/auth')
    .then(({ useAuthStore }) => useAuthStore().invalidateSession())
    .catch(() => {})
  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
  setTimeout(() => {
    handling401 = false
  }, 1500)
}

export function hasApiServer() {
  const { apiBaseUrl } = getRuntimeConfig()
  return (
    !!apiBaseUrl &&
    !apiBaseUrl.includes('your-staging') &&
    !apiBaseUrl.includes('your-production')
  )
}

/** 已登录且配置了后端时才应拉远程数据（避免登录门前请求接口） */
export function canLoadRemoteContent() {
  return hasApiServer() && hasValidToken()
}

/** 体验版/线上 Render 冷启动可能较慢 */
const REQUEST_TIMEOUT_MS = 60000

function buildNetworkError(err: UniApp.GeneralCallbackResult) {
  const msg = err.errMsg || '网络请求失败'
  if (msg.includes('timeout')) {
    return '请求超时：服务器可能正在唤醒，或网络较慢，请稍后重试'
  }
  if (msg.includes('url not in domain list') || msg.includes('不在以下 request 合法域名')) {
    return '域名未配置：请在微信公众平台添加 request 合法域名'
  }
  return msg
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const { apiBaseUrl } = getRuntimeConfig()
  let url = `${apiBaseUrl}${path}`
  if (!query) return url
  const parts: string[] = []
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  })
  if (parts.length) url += (url.includes('?') ? '&' : '?') + parts.join('&')
  return url
}

export function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, query, auth = true, requireAuth = false } = options
  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = options.token ?? (auth !== false ? getToken() : '')

  if (requireAuth && !token) {
    return Promise.reject(new Error('请先登录'))
  }

  if (token) header.Authorization = `Bearer ${token}`

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(url, query),
      method,
      data,
      header,
      timeout: REQUEST_TIMEOUT_MS,
      success(res) {
        const status = res.statusCode || 0
        const body = res.data as ApiResponse<T> & { detail?: string }

        // 仅「已带 token 仍 401」视为登录失效；公开接口 / 登录接口不清 session
        if (status === 401 && token) {
          handleUnauthorized()
          reject(new Error(parseErrorMessage(res.data, status)))
          return
        }

        if (status >= 200 && status < 300 && body?.code === 0) {
          resolve(body.data as T)
          return
        }
        reject(new Error(parseErrorMessage(res.data, status)))
      },
      fail(err) {
        reject(new Error(buildNetworkError(err)))
      },
    })
  })
}
