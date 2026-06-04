import {
  type AppEnv,
  type ServerEndpoints,
  ENV_PROFILES,
  ENV_LABELS,
  getDevelopDeviceEndpoints,
  DEVELOP_DEVTOOLS,
} from '@/config/env.profiles'
import { isWxDevtools } from '@/utils/wx-env'

const OVERRIDE_STORAGE_KEY = 'app_api_env_override'

export interface RuntimeConfig extends ServerEndpoints {
  env: AppEnv
  envLabel: string
  /** 是否开发者工具 + 开发环境 */
  isDevtoolsDevelop: boolean
}

/** 读取微信小程序运行环境：develop | trial | release */
export function getMiniProgramEnvVersion(): AppEnv {
  try {
    const accountInfo = uni.getAccountInfoSync()
    const version = accountInfo?.miniProgram?.envVersion as string | undefined
    if (version === 'release' || version === 'trial' || version === 'develop') {
      return version
    }
  } catch {
    /* 非小程序或 API 不可用 */
  }
  return 'develop'
}

/** 开发调试：强制指定环境（传 null 清除） */
export function setApiEnvOverride(env: AppEnv | null) {
  if (env) uni.setStorageSync(OVERRIDE_STORAGE_KEY, env)
  else uni.removeStorageSync(OVERRIDE_STORAGE_KEY)
  _cached = null
}

export function getApiEnvOverride(): AppEnv | null {
  const v = uni.getStorageSync(OVERRIDE_STORAGE_KEY) as AppEnv
  if (v === 'develop' || v === 'trial' || v === 'release') return v
  return null
}

let _cached: RuntimeConfig | null = null

function resolveDevelopEndpoints(): ServerEndpoints {
  return isWxDevtools() ? DEVELOP_DEVTOOLS : getDevelopDeviceEndpoints()
}

/**
 * 按当前运行环境解析 API / 静态资源根地址
 * - 开发版 + 开发者工具 → localhost:8000
 * - 开发版 + 真机预览 → DEVELOP_LAN_HOST（config/env.profiles.ts）
 * - 体验版 → TRIAL_ENDPOINTS
 * - 正式版 → RELEASE_ENDPOINTS
 */
export function getRuntimeConfig(): RuntimeConfig {
  if (_cached) return _cached

  const override = getApiEnvOverride()
  const env = override ?? getMiniProgramEnvVersion()

  let endpoints: ServerEndpoints
  if (env === 'develop') {
    endpoints = resolveDevelopEndpoints()
  } else {
    endpoints = ENV_PROFILES[env]
  }

  _cached = {
    ...endpoints,
    env,
    envLabel: ENV_LABELS[env],
    isDevtoolsDevelop: env === 'develop' && isWxDevtools(),
  }
  return _cached
}

/** 环境或覆盖项变更后调用（一般不需要） */
export function clearRuntimeConfigCache() {
  _cached = null
}
