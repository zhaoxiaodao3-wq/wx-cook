import { getRuntimeConfig } from '@/config/runtime'

/** 将后端相对路径转为可访问的完整 URL */
export function resolveMediaUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('wxfile://')) {
    return path
  }
  const base = getRuntimeConfig().fileBaseUrl.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/** 提交给后端时：完整 URL 或相对路径保留，微信临时路径返回空由上传接口处理 */
export function toApiMediaPath(url?: string | null): string {
  if (!url) return ''
  if (
    url.startsWith('wxfile://') ||
    url.startsWith('http://tmp/') ||
    url.startsWith('https://tmp/')
  ) {
    return ''
  }
  const fileBase = getRuntimeConfig().fileBaseUrl
  if (url.startsWith(fileBase)) {
    return url.slice(fileBase.length) || url
  }
  return url
}
