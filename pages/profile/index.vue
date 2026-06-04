<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRecipeStore } from '@/stores/recipe'
import CustomTabBar from '@/components/CustomTabBar.vue'
import PageShell from '@/components/PageShell.vue'
import { hasApiServer } from '@/api/request'
import { resolveMediaUrl } from '@/utils/media'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(useAuthStore())
const recipeStore = useRecipeStore()

const user = computed(() => ({
  ...userStore.currentUser,
  avatar: resolveMediaUrl(userStore.currentUser.avatar),
}))
const displayAvatar = computed(() => !!user.value.avatar)

const stats = computed(() => {
  if (hasApiServer()) return userStore.userStats
  const myRecipes = recipeStore.recipes.filter(
    (r) => r.author.id === userStore.currentUser.id
  )
  return {
    uploads: myRecipes.length,
    reviews: userStore.myReviews.length,
    suggestions: userStore.mySuggestions.length,
    favorites: userStore.favorites.length,
  }
})

onMounted(() => {
  if (hasApiServer() && isLoggedIn.value) userStore.refreshFromServer()
})

const menuItems = [
  { label: '我的上传', icon: '📋', url: '/pages/my-uploads/index' },
  { label: '我的收藏', icon: '❤️', badge: stats.value.favorites },
  { label: '我的评价', icon: '⭐', badge: stats.value.reviews },
  { label: '个人设置', icon: '⚙️', url: '/pages/settings/index' },
]

function onMenuTap(item) {
  if (item.url) {
    uni.navigateTo({ url: item.url })
  } else if (item.label === '我的收藏') {
    uni.navigateTo({ url: '/pages/my-uploads/index?tab=favorites' })
  } else if (item.label === '我的评价') {
    uni.navigateTo({ url: '/pages/my-uploads/index?tab=reviews' })
  }
}
</script>

<template>
  <PageShell>
  <view class="profile-page">
    <!-- Hero 头部 -->
    <view class="profile-header">
      <view class="profile-header__safe" />
      <view class="profile-header__info">
        <image v-if="displayAvatar" class="profile-avatar" :src="user.avatar" mode="aspectFill" />
        <view v-else class="profile-avatar profile-avatar--empty">
          <text>👤</text>
        </view>
        <text class="profile-name">{{ user.name }}</text>
        <text class="profile-bio">{{ user.bio || '写一句简介介绍自己吧' }}</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-num">{{ stats.uploads }}</text>
        <text class="stat-label">上传</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ stats.reviews }}</text>
        <text class="stat-label">评价</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ stats.suggestions }}</text>
        <text class="stat-label">建议</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ stats.favorites }}</text>
        <text class="stat-label">收藏</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view v-for="item in menuItems" :key="item.label" class="menu-item press-scale" @click="onMenuTap(item)">
        <text class="menu-item__icon">{{ item.icon }}</text>
        <text class="menu-item__label">{{ item.label }}</text>
        <text v-if="item.badge && item.badge > 0" class="menu-item__badge">{{ item.badge }}</text>
        <text class="menu-item__arrow">→</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="about-text">
      <text>小圈子菜谱 v1.0.0</text>
    </view>

    <view class="bottom-placeholder" />
    <CustomTabBar />
  </view>
  </PageShell>
</template>

<style lang="scss" scoped>
.profile-page { min-height: 100vh; padding-bottom: 140rpx; animation: fade-in-up 400ms ease-out; }

.profile-header { background: linear-gradient(160deg, #73D13D 0%, #52C41A 40%, #389E0D 100%); position: relative; overflow: hidden; }
.profile-header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 60rpx; background: #FBF8FD; border-radius: 28rpx 28rpx 0 0; }
.profile-header__safe { height: var(--status-bar-height, 44px); }
.profile-header__info { display: flex; flex-direction: column; align-items: center; padding: 48rpx 0 80rpx; }
.profile-avatar { width: 130rpx; height: 130rpx; border-radius: 50%; border: 3rpx solid rgba(255,255,255,0.5); box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.15); }
.profile-avatar--empty {
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
}
.profile-name { font-size: 36rpx; font-weight: 800; color: #FFF; margin-top: 20rpx; letter-spacing: 1rpx; }
.profile-bio { font-size: 24rpx; color: rgba(255,255,255,0.75); margin-top: 8rpx; }

.stats-row { display: flex; margin: -40rpx 28rpx 32rpx; position: relative; z-index: 1; }
.stat-card { flex: 1; background: #FFFFFF; border-radius: 20rpx; padding: 28rpx 8rpx 24rpx; text-align: center; box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06), 0 8rpx 48rpx rgba(0,0,0,0.035); margin: 0 6rpx; }
.stat-num { font-size: 44rpx; font-weight: 800; color: #52C41A; display: block; line-height: 1; }
.stat-label { font-size: 20rpx; color: #777777; margin-top: 8rpx; letter-spacing: 3rpx; }

.menu-list { background: #FFFFFF; margin: 0 28rpx; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03); }
.menu-item { display: flex; align-items: center; padding: 32rpx 28rpx; border-bottom: 1rpx solid #F0F0F0; }
.menu-item:last-child { border-bottom: none; }
.menu-item__icon { font-size: 36rpx; margin-right: 20rpx; }
.menu-item__label { flex: 1; font-size: 28rpx; color: #1a1a1a; font-weight: 500; }
.menu-item__badge { background: #52C41A; color: #FFF; font-size: 20rpx; padding: 4rpx 14rpx; border-radius: 9999rpx; margin-right: 12rpx; font-weight: 600; }
.menu-item__arrow { color: #777777; font-size: 28rpx; }

.about-text { text-align: center; padding: 48rpx 0 80rpx; color: #777777; font-size: 22rpx; letter-spacing: 2rpx; }
.bottom-placeholder { height: 120rpx; }
</style>
