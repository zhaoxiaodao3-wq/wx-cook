import { getRuntimeConfig } from '@/config/runtime'

/** 开发环境常见主机，体验版需替换为当前 fileBaseUrl */
const DEV_HOST_RE =
  /^https?:\/\/(?:localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?/i

function currentFileBase() {
  return getRuntimeConfig().fileBaseUrl.replace(/\/$/, '')
}

/** 将后端相对路径转为可访问的完整 URL；开发期 localhost 地址会按当前环境重写 */
export function resolveMediaUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('wxfile://')) return path

  const base = currentFileBase()

  if (path.startsWith('http://') || path.startsWith('https://')) {
    // 本地开发上传后写入库的 http://localhost:8000/uploads/... 在体验版无法访问，需重写
    if (DEV_HOST_RE.test(path)) {
      try {
        const u = new URL(path)
        if (u.pathname.startsWith('/uploads/')) {
          return `${base}${u.pathname}${u.search || ''}`
        }
      } catch {
        /* fall through */
      }
    }
    return path
  }

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
  const fileBase = currentFileBase()
  if (url.startsWith(fileBase)) {
    return url.slice(fileBase.length) || url
  }
  if (DEV_HOST_RE.test(url)) {
    try {
      const u = new URL(url)
      if (u.pathname.startsWith('/uploads/')) return u.pathname
    } catch {
      /* ignore */
    }
  }
  return url
}
