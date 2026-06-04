import { getRuntimeConfig } from '@/config/runtime'

const runtime = getRuntimeConfig()

/** 当前环境：develop | trial | release */
export const APP_ENV = runtime.env

/** 当前环境中文名 */
export const APP_ENV_LABEL = runtime.envLabel

/** REST API 根地址，例如 http://localhost:8000/api/v1 */
export const API_BASE_URL = runtime.apiBaseUrl

/** 静态资源根地址，例如 http://localhost:8000（拼接 /uploads/...） */
export const FILE_BASE_URL = runtime.fileBaseUrl

/** 升级 key 可使旧缓存失效，重新走登录 */
export const USER_SESSION_KEY = 'user_session_v5'

/** @deprecated 使用 session 内 token */
export const TOKEN_STORAGE_KEY = 'access_token'

export { getRuntimeConfig, setApiEnvOverride, getApiEnvOverride } from '@/config/runtime'
export type { AppEnv } from '@/config/env.profiles'
