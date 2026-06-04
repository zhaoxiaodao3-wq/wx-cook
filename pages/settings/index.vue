<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const name = ref(userStore.currentUser.name)
const bio = ref(userStore.currentUser.bio)
const avatar = ref(userStore.currentUser.avatar)

function changeAvatar() {
  uni.chooseImage({ count: 1, success(res) { avatar.value = res.tempFilePaths[0] } })
}

function saveProfile() {
  userStore.updateProfile({
    name: name.value.trim() || userStore.currentUser.name,
    avatar: avatar.value,
    bio: bio.value.trim()
  })
  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<template>
  <view class="settings-page">
    <view class="settings-section">
      <view class="avatar-row" @click="changeAvatar">
        <text class="settings-label">头像</text>
        <image class="settings-avatar" :src="avatar" mode="aspectFill" />
      </view>
      <view class="settings-row">
        <text class="settings-label">昵称</text>
        <input class="settings-input" v-model="name" placeholder="输入昵称" />
      </view>
      <view class="settings-row">
        <text class="settings-label">简介</text>
        <input class="settings-input" v-model="bio" placeholder="一句话介绍自己" />
      </view>
    </view>
    <view class="save-btn press-scale" @click="saveProfile"><text>保存</text></view>
  </view>
</template>

<style lang="scss" scoped>
.settings-page { min-height: 100vh; background: #FBF8FD; padding: 24rpx 28rpx; }
.settings-section { background: #FFFFFF; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03); }
.settings-row, .avatar-row { display: flex; align-items: center; justify-content: space-between; padding: 32rpx 28rpx; border-bottom: 1rpx solid #F0F0F0; }
.settings-row:last-child { border-bottom: none; }
.settings-label { font-size: 28rpx; color: #1a1a1a; flex-shrink: 0; font-weight: 500; }
.settings-input { text-align: right; font-size: 26rpx; color: #999999; flex: 1; margin-left: 32rpx; }
.settings-avatar { width: 88rpx; height: 88rpx; border-radius: 50%; border: 2rpx solid #F0F0F0; }
.save-btn { background: #52C41A; color: #FFF; text-align: center; padding: 24rpx; border-radius: 9999rpx; margin-top: 56rpx; font-size: 30rpx; font-weight: 700; letter-spacing: 3rpx; box-shadow: 0 4rpx 16rpx rgba(82,196,26,0.2); }
.save-btn:active { transform: scale(0.97); }
</style>
