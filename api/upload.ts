import { getRuntimeConfig } from '@/config/runtime'
import { getToken } from '@/utils/token'
import { resolveMediaUrl } from '@/utils/media'

interface UploadResponse {
  code: number
  message: string
  data: { url: string; filename?: string }
}

/** 上传通用图片，返回可访问的完整 URL */
export function uploadImage(filePath: string, token?: string): Promise<string> {
  const authToken = token || getToken()
  if (!authToken) return Promise.reject(new Error('请先登录'))

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${getRuntimeConfig().apiBaseUrl}/upload/image`,
      filePath,
      name: 'file',
      header: { Authorization: `Bearer ${authToken}` },
      success(res) {
        try {
          const body = JSON.parse(res.data) as UploadResponse
          if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
            resolve(resolveMediaUrl(body.data.url))
            return
          }
          reject(new Error(body.message || `上传失败 (${res.statusCode})`))
        } catch {
          reject(new Error('上传响应解析失败'))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '图片上传失败'))
      },
    })
  })
}
