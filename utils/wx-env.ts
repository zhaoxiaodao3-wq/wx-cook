/** 是否在微信开发者工具模拟器中运行 */
export function isWxDevtools() {
  try {
    const sys = uni.getSystemInfoSync()
    return sys.platform === 'devtools' || sys.environment === 'wxdev'
  } catch {
    return false
  }
}

/** 真机/预览：须用 chooseAvatar + nickname，getUserProfile 拿不到真实资料 */
export function isRealWeixinDevice() {
  return !isWxDevtools()
}
