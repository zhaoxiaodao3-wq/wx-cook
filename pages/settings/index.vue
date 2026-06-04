<script setup>
import { ref, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import PageShell from '@/components/PageShell.vue'

const userStore = useUserStore()
const authStore = useAuthStore()

const name = ref(userStore.currentUser.name)
const bio = ref(userStore.currentUser.bio)
const avatar = ref(userStore.currentUser.avatar)

const hasAvatar = computed(() => !!avatar.value)

watch(
  () => userStore.currentUser,
  (u) => {
    name.value = u.name
    bio.value = u.bio
    avatar.value = u.avatar
  },
  { deep: true }
)

function onChooseAvatar(e) {
  avatar.value = e.detail.avatarUrl
}

function onNicknameInput(e) {
  name.value = e.detail.value
}

async function saveProfile() {
  try {
    await userStore.updateProfile(
      {
        name: name.value.trim() || userStore.currentUser.name,
        avatar: avatar.value,
        bio: bio.value.trim(),
      },
      { saveWechatSnapshot: true }
    )
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '保存失败',
      icon: 'none',
    })
  }
}

async function restoreLoginDefault() {
  if (!userStore.restoreWechatProfile()) {
    uni.showToast({ title: '暂无初始资料', icon: 'none' })
    return
  }
  const wx = userStore.getWechatProfile()
  if (wx) {
    name.value = wx.name
    avatar.value = wx.avatar
  }
  uni.showToast({ title: '已恢复为登录时资料', icon: 'none' })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '退出后需重新登录',
    success(res) {
      if (res.confirm) authStore.logout()
    },
  })
}
</script>

<template>
  <PageShell>
  <view class="settings-page">
    <view class="settings-section">
      <view class="settings-label-block">
        <text class="settings-hint">头像、昵称支持使用微信能力（点头像选图，昵称框可选用微信昵称）</text>
      </view>

      <view class="avatar-row">
        <text class="settings-label">头像</text>
        <button class="avatar-picker" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image
            v-if="hasAvatar"
            class="settings-avatar"
            :src="avatar"
            mode="aspectFill"
          />
          <view v-else class="settings-avatar settings-avatar--empty">
            <text class="settings-avatar__icon">👤</text>
          </view>
        </button>
      </view>

      <view class="settings-row settings-row--nickname">
        <text class="settings-label">昵称</text>
        <input
          class="settings-input settings-input--nickname"
          type="nickname"
          :value="name"
          placeholder="点击填写或选用微信昵称"
          @input="onNicknameInput"
          @blur="onNicknameInput"
        />
      </view>

      <view class="settings-row">
        <text class="settings-label">简介</text>
        <input class="settings-input" v-model="bio" placeholder="一句话介绍自己" />
      </view>
    </view>

    <view class="restore-btn press-scale" @click="restoreLoginDefault">
      <text>恢复为登录时资料</text>
    </view>

    <view class="save-btn press-scale" @click="saveProfile"><text>保存</text></view>
    <view class="logout-btn press-scale" @click="handleLogout"><text>退出登录</text></view>
  </view>
  </PageShell>
</template>

<style lang="scss" scoped>
.settings-page { min-height: 100vh; background: #FBF8FD; padding: 24rpx 28rpx; }
.settings-section { background: #FFFFFF; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03); }
.settings-label-block { padding: 24rpx 28rpx 0; }
.settings-hint { font-size: 22rpx; color: #8fa89b; line-height: 1.5; }
.settings-row, .avatar-row { display: flex; align-items: center; justify-content: space-between; padding: 32rpx 28rpx; border-bottom: 1rpx solid #F0F0F0; }
.settings-row:last-child { border-bottom: none; }
.settings-label { font-size: 28rpx; color: #1a1a1a; flex-shrink: 0; font-weight: 500; }
.settings-input { text-align: right; font-size: 26rpx; color: #777777; flex: 1; margin-left: 32rpx; }
.settings-input--nickname { flex: 1; margin-left: 20rpx; }

.avatar-picker {
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  line-height: 1;
}
.avatar-picker::after { border: none; }

.settings-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 2rpx solid #F0F0F0;
  display: block;
}
.settings-avatar--empty {
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ccc;
}
.settings-avatar__icon { font-size: 40rpx; opacity: 0.5; }

.restore-btn {
  margin-top: 32rpx;
  background: #F0FAF0;
  color: #52C41A;
  text-align: center;
  padding: 24rpx;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: 1rpx solid rgba(82, 196, 26, 0.35);
}
.restore-btn:active { transform: scale(0.97); }

.save-btn { background: #52C41A; color: #FFF; text-align: center; padding: 24rpx; border-radius: 9999rpx; margin-top: 24rpx; font-size: 30rpx; font-weight: 700; letter-spacing: 3rpx; box-shadow: 0 4rpx 16rpx rgba(82,196,26,0.2); }
.save-btn:active { transform: scale(0.97); }
.logout-btn { background: #FFF; color: #FF4D4F; text-align: center; padding: 24rpx; border-radius: 9999rpx; margin-top: 24rpx; font-size: 28rpx; font-weight: 600; border: 1rpx solid #FFE0E0; }
.logout-btn:active { transform: scale(0.97); }
</style>
