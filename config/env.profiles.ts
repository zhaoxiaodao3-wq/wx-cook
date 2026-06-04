/**
 * 各环境后端地址（与 cookbook-server 一致：API 前缀 /api/v1，静态资源 /uploads）
 * 部署后请把 trial / release 改成真实域名。
 */

export type AppEnv = 'develop' | 'trial' | 'release'

export interface ServerEndpoints {
  apiBaseUrl: string
  fileBaseUrl: string
}

const PORT = 8000

function endpoints(host: string): ServerEndpoints {
  const base = host.replace(/\/$/, '')
  return {
    apiBaseUrl: `${base}/api/v1`,
    fileBaseUrl: base,
  }
}

/** 开发者工具：本机 localhost */
export const DEVELOP_DEVTOOLS = endpoints(`http://localhost:${PORT}`)

/**
 * 真机调试「开发版」：填你电脑在局域网中的 IP（手机与电脑同一 WiFi）
 * 示例：192.168.1.100 → http://192.168.1.100:8000/api/v1
 */
export const DEVELOP_LAN_HOST = '192.168.1.100'

export function getDevelopDeviceEndpoints(): ServerEndpoints {
  return endpoints(`http://${DEVELOP_LAN_HOST}:${PORT}`)
}

/** 体验版（微信后台「体验版」扫码） */
export const TRIAL_ENDPOINTS = endpoints('https://your-staging-domain.com')

/** 正式版（线上用户） */
export const RELEASE_ENDPOINTS = endpoints('https://your-production-domain.com')

export const ENV_PROFILES: Record<AppEnv, ServerEndpoints> = {
  develop: DEVELOP_DEVTOOLS,
  trial: TRIAL_ENDPOINTS,
  release: RELEASE_ENDPOINTS,
}

export const ENV_LABELS: Record<AppEnv, string> = {
  develop: '开发',
  trial: '体验',
  release: '正式',
}
