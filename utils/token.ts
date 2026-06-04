import { getSession, isApiToken } from '@/utils/session'

export function getToken(): string {
  const token = getSession()?.token
  return isApiToken(token) ? token : ''
}

export function hasValidToken(): boolean {
  return !!getToken()
}
