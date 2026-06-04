<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { isWxDevtools } from '@/utils/wx-env'
import { hasApiServer } from '@/api/request'

const authStore = useAuthStore()
const { isLoggingIn } = storeToRefs(authStore)
const showDevtoolsMock = isWxDevtools() && !hasApiServer()

async function handleOneTapLogin() {
  try {
    await authStore.loginWithWechatOneTap()
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '登录失败',
      icon: 'none',
    })
  }
}
</script>

<template>
  <view class="login-gate" @touchmove.stop.prevent>
    <view class="login-gate__card">
      <text class="login-gate__logo">🍳</text>
      <text class="login-gate__title">小圈子菜谱</text>
      <text class="login-gate__desc">点击微信一键登录，进入后可在个人设置中完善头像与昵称</text>

      <button
        class="login-gate__btn"
        :loading="isLoggingIn"
        :disabled="isLoggingIn"
        @click="handleOneTapLogin"
      >
        微信一键登录
      </button>

      <text v-if="showDevtoolsMock" class="login-gate__tip">
        未配置后端地址时，模拟器使用本地模拟登录
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-gate {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(251, 248, 253, 0.96);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.login-gate__card {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 28rpx;
  padding: 56rpx 48rpx 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.08);
}

.login-gate__logo {
  font-size: 88rpx;
  line-height: 1;
}

.login-gate__title {
  margin-top: 24rpx;
  font-size: 40rpx;
  font-weight: 800;
  color: #1a1a1a;
}

.login-gate__desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #777;
  text-align: center;
  line-height: 1.55;
  padding: 0 8rpx;
}

.login-gate__tip {
  margin-top: 20rpx;
  font-size: 22rpx;
  color: #aaa;
  text-align: center;
}

.login-gate__btn {
  margin-top: 48rpx;
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: #52c41a;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  border-radius: 9999rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.3);
}

.login-gate__btn::after {
  border: none;
}
</style>
