import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSession, setSession, clearSession, isApiToken } from '@/utils/session'
import { hasApiServer } from '@/api/request'
import { wechatLogin } from '@/api/auth'
import { uploadImage } from '@/api/upload'
import { useUserStore } from '@/stores/user'
import { useRecipeStore } from '@/stores/recipe'
import { isWxDevtools } from '@/utils/wx-env'
import { DEFAULT_LOGIN_NICKNAME, DEFAULT_LOGIN_AVATAR } from '@/config/constants'
import { resolveMediaUrl } from '@/utils/media'

/** 是否为微信临时本地路径，需上传后得到 CDN URL */
function isLocalTempPath(url) {
  const urlStr = String(url || '')
  return (
    urlStr.startsWith('wxfile://') ||
    urlStr.startsWith('http://tmp/') ||
    urlStr.startsWith('https://tmp/') ||
    urlStr.includes('/tmp/')
  )
}

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const isReady = ref(false)
  const isLoggingIn = ref(false)

  function applyUser(user) {
    const normalized = {
      ...user,
      avatar: resolveMediaUrl(user.avatar),
    }
    useUserStore().setUser(normalized)
    isLoggedIn.value = true
    if (hasApiServer() && isApiToken(getSession()?.token)) {
      useUserStore().refreshFromServer().catch(() => {})
    }
  }

  function saveLoginSession(token, user, wechatProfile) {
    setSession({ token, user, wechatProfile })
    applyUser(user)
  }

  function init() {
    const session = getSession()
    if (session && isApiToken(session.token)) {
      if (!session.wechatProfile) {
        session.wechatProfile = {
          name: session.user.name,
          avatar: session.user.avatar,
        }
        setSession(session)
      }
      applyUser(session.user)
      if (hasApiServer()) {
        useRecipeStore().initRecipes().catch(() => {})
      }
    } else {
      if (hasApiServer()) clearSession()
      isLoggedIn.value = false
      useUserStore().clearUser()
    }
    isReady.value = true
  }

  function wxLogin() {
    return new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success(res) {
          if (res.code) resolve(res.code)
          else reject(new Error('获取登录凭证失败'))
        },
        fail(err) {
          reject(new Error(err.errMsg || '微信登录失败'))
        },
      })
    })
  }

  /** 开发者工具且无后端时的模拟登录 */
  function loginInDevtools() {
    if (isLoggingIn.value) return
    isLoggingIn.value = true
    try {
      const wechatProfile = {
        name: DEFAULT_LOGIN_NICKNAME,
        avatar: DEFAULT_LOGIN_AVATAR,
      }
      const user = {
        id: 'dev_user',
        name: DEFAULT_LOGIN_NICKNAME,
        avatar: DEFAULT_LOGIN_AVATAR,
        bio: '',
      }
      saveLoginSession('dev_token', user, wechatProfile)
    } finally {
      isLoggingIn.value = false
    }
  }

  /** 调用后端完成登录，默认昵称与空头像 */
  async function loginViaBackend(code, nickName, avatarUrl) {
    const result = await wechatLogin({
      code,
      nickName,
      avatarUrl: avatarUrl || '',
    })

    const user = {
      id: result.user.id,
      name: result.user.name || nickName,
      avatar: resolveMediaUrl(result.user.avatar || avatarUrl || ''),
      bio: result.user.bio ?? '',
    }

    const wechatProfile = {
      name: nickName,
      avatar: avatarUrl || '',
    }

    saveLoginSession(result.token, user, wechatProfile)
  }

  /**
   * 微信一键登录：uni.login → POST /auth/wechat-login
   * 默认昵称「微信用户」、默认空头像；资料可在个人设置中用微信能力完善
   */
  async function loginWithWechatOneTap() {
    if (isLoggingIn.value) return

    if (isWxDevtools() && !hasApiServer()) {
      loginInDevtools()
      return
    }

    if (!hasApiServer()) {
      throw new Error('请先在 config/env.profiles.ts 配置对应环境的 API 地址')
    }

    isLoggingIn.value = true
    try {
      const code = await wxLogin()
      await loginViaBackend(code, DEFAULT_LOGIN_NICKNAME, DEFAULT_LOGIN_AVATAR)
      useRecipeStore().initRecipes().catch(() => {})
      uni.showToast({
        title: '登录成功，可在个人设置完善资料',
        icon: 'none',
        duration: 2500,
      })
    } finally {
      isLoggingIn.value = false
    }
  }

  /** 设置页保存资料：支持微信头像 + 昵称，同步后端 */
  async function loginWithProfile(profile) {
    if (isLoggingIn.value) return

    const name = (profile.nickName || '').trim()
    const avatar = (profile.avatarUrl || '').trim()
    if (!name) throw new Error('请填写昵称')
    if (!avatar) throw new Error('请选择头像')

    if (!hasApiServer()) {
      throw new Error('请先在 config/env.profiles.ts 配置对应环境的 API 地址')
    }

    isLoggingIn.value = true
    try {
      const code = await wxLogin()
      let avatarFinal = avatar

      const result = await wechatLogin({
        code,
        nickName: name,
        avatarUrl: isLocalTempPath(avatar) ? '' : avatar,
      })

      if (isLocalTempPath(avatar)) {
        avatarFinal = await uploadImage(avatar, result.token)
      }

      const user = {
        ...result.user,
        name: result.user.name || name,
        avatar: result.user.avatar || avatarFinal,
        bio: result.user.bio ?? '',
      }

      saveLoginSession(result.token, user, { name, avatar: avatarFinal })
    } finally {
      isLoggingIn.value = false
    }
  }

  function logout() {
    clearSession()
    useUserStore().clearUser()
    isLoggedIn.value = false
    uni.showToast({ title: '已退出登录', icon: 'none' })
  }

  /** 401 等场景：清登录态，不重复 toast */
  function invalidateSession() {
    clearSession()
    useUserStore().clearUser()
    isLoggedIn.value = false
    isReady.value = true
  }

  return {
    isLoggedIn,
    isReady,
    isLoggingIn,
    init,
    loginWithWechatOneTap,
    loginWithProfile,
    loginInDevtools,
    logout,
    invalidateSession,
  }
})
