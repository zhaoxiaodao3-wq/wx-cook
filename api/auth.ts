import { request } from '@/api/request'
import type { User } from '@/data/recipes'

export interface LoginPayload {
  /** uni.login 返回，后端用其换取 openid/session */
  code: string
  /** 用户通过 type=nickname 填写的昵称 */
  nickName: string
  /**
   * 头像 URL：若已是 CDN/https 可直接传；
   * 若为微信临时路径则传空字符串，由前端登录后调 /upload/image 上传
   */
  avatarUrl: string
}

export interface LoginResult {
  token: string
  expiresIn?: number
  user: User
}

export function wechatLogin(payload: LoginPayload) {
  return request<LoginResult>({
    url: '/auth/wechat-login',
    method: 'POST',
    data: payload,
    auth: false,
  })
}
