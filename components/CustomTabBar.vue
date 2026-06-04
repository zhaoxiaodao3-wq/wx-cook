<script setup>
import { computed } from 'vue'

const tabs = [
  { path: '/pages/home/index', label: '首页', icon: 'home' },
  { path: '/pages/recipes/index', label: '发现', icon: 'search' },
  { path: '/pages/upload/index', label: '上传', icon: 'plus' },
  { path: '/pages/profile/index', label: '我的', icon: 'user' },
]

const currentRoute = computed(() => {
  const pages = getCurrentPages()
  return pages.length > 0 ? '/' + pages[pages.length - 1].route : ''
})

function switchTab(path) {
  uni.switchTab({ url: path })
}
</script>

<template>
  <view class="tab-bar">
    <view
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-bar__item"
      :class="{ 'tab-bar__item--active': currentRoute === tab.path }"
      @click="switchTab(tab.path)"
    >
      <view class="tab-bar__icon-wrap">
        <view class="tab-bar__icon" :class="'tab-bar__icon--' + tab.icon" />
      </view>
      <text class="tab-bar__label">{{ tab.label }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(253, 248, 242, 0.92);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1rpx solid #EDE4DA;
  z-index: 999;
}

.tab-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 20rpx;
  position: relative;
  transition: transform 150ms ease;
}

.tab-bar__item:active {
  transform: scale(0.92);
}

.tab-bar__icon-wrap {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
  border-radius: 16rpx;
  transition: background 200ms ease;
}

.tab-bar__item--active .tab-bar__icon-wrap {
  background: #F5E6DC;
}

.tab-bar__icon {
  width: 36rpx;
  height: 36rpx;
  background: #A89885;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  transition: background 200ms ease;
}

.tab-bar__icon--home {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'%3E%3C/path%3E%3Cpolyline points='9 22 9 12 15 12 15 22'%3E%3C/polyline%3E%3C/svg%3E");
}
.tab-bar__icon--search {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
}
.tab-bar__icon--plus {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='16'%3E%3C/line%3E%3Cline x1='8' y1='12' x2='16' y2='12'%3E%3C/line%3E%3C/svg%3E");
}
.tab-bar__icon--user {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E");
}

.tab-bar__item--active .tab-bar__icon {
  background: #D4784C;
}

.tab-bar__label {
  font-size: 20rpx;
  color: #A89885;
  letter-spacing: 2rpx;
  font-weight: 500;
}

.tab-bar__item--active .tab-bar__label {
  color: #D4784C;
  font-weight: 600;
}
</style>
