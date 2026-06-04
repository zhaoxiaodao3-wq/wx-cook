import { USER_SESSION_KEY } from '@/config/index'
import type { User } from '@/data/recipes'

/** 登录时微信授权的头像、昵称（用于一键恢复） */
export interface WechatProfile {
  name: string
  avatar: string
}

export interface UserSession {
  token: string
  user: User
  wechatProfile: WechatProfile
}

/** 是否为后端签发的 JWT（非本地 mock 的 dev_token） */
export function isApiToken(token: unknown): token is string {
  return typeof token === 'string' && token.length > 10 && token !== 'dev_token' && token.includes('.')
}

export function getSession(): UserSession | null {
  try {
    const raw = uni.getStorageSync(USER_SESSION_KEY)
    if (!raw) return null
    const session = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (isApiToken(session?.token) && session?.user?.id && session?.user?.name) {
      return session as UserSession
    }
    return null
  } catch {
    return null
  }
}

export function setSession(session: UserSession) {
  uni.setStorageSync(USER_SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  uni.removeStorageSync(USER_SESSION_KEY)
}

export function getWechatProfile(): WechatProfile | null {
  return getSession()?.wechatProfile ?? null
}
