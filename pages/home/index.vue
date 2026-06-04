<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import CustomTabBar from '@/components/CustomTabBar.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { CATEGORIES } from '@/data/recipes'

const store = useRecipeStore()
const categories = CATEGORIES
const rankTab = ref('rating')
const page = ref(1)
const pageSize = 10

const topRanked = computed(() => store.topRanked)
const latestRecipes = computed(() => store.latestRecipes)
const waterfallList = computed(() => {
  const list = rankTab.value === 'new' ? latestRecipes.value : store.filteredRecipes
  return list.slice(0, page.value * pageSize)
})

onMounted(() => {
  store.setCategory('全部')
  store.setSearchQuery('')
})

function onSearchTap() {
  uni.navigateTo({ url: '/pages/recipes/index?focusSearch=1' })
}

function onCategoryTap(cat) {
  store.setCategory(cat)
  page.value = 1
}

function onRecipeClick(id) {
  uni.navigateTo({ url: '/pages/recipe-detail/index?id=' + id })
}

function loadMore() {
  page.value++
}
</script>

<template>
  <view class="home-page">
    <!-- 头部 -->
    <view class="home-header">
      <view class="home-header__safe" />
      <view class="home-header__bar">
        <text class="home-header__tagline">Recipe Community</text>
        <text class="home-header__title">小圈子菜谱</text>
        <text class="home-header__subtitle">发现美味，分享你的厨房故事</text>
        <view class="home-header__search" @click="onSearchTap">
          <text class="home-header__search-icon">🔍</text>
          <text class="home-header__search-placeholder">搜索菜谱或食材...</text>
        </view>
      </view>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-bar">
      <view class="category-bar__inner">
        <view
          v-for="cat in categories"
          :key="cat"
          class="category-chip"
          :class="{ 'category-chip--active': store.activeCategory === cat }"
          @click="onCategoryTap(cat)"
        >
          {{ cat }}
        </view>
      </view>
    </scroll-view>

    <!-- 排行榜区域 -->
    <view class="section">
      <view class="section-header">
        <text class="section-label">DISCOVER</text>
        <view class="rank-tabs">
          <text
            class="rank-tab"
            :class="{ 'rank-tab--active': rankTab === 'rating' }"
            @click="rankTab = 'rating'"
          >热门排行</text>
          <text
            class="rank-tab"
            :class="{ 'rank-tab--active': rankTab === 'new' }"
            @click="rankTab = 'new'"
          >最新上传</text>
        </view>
      </view>

      <!-- 排行榜列表 -->
      <view v-if="rankTab === 'rating'" class="rank-list">
        <view
          v-for="(recipe, idx) in topRanked.slice(0, 3)"
          :key="recipe.id"
          class="rank-item card-stagger"
          @click="onRecipeClick(recipe.id)"
        >
          <text class="rank-item__num" :class="{ 'rank-item__num--top': idx < 3 }">{{ idx + 1 }}</text>
          <image class="rank-item__cover" :src="recipe.coverImage" mode="aspectFill" />
          <view class="rank-item__info">
            <text class="rank-item__title">{{ recipe.title }}</text>
            <text class="rank-item__author">{{ recipe.author.name }}</text>
            <view class="rank-item__rating">
              <text>★ {{ recipe.rating }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 双列瀑布流 -->
      <view class="waterfall">
        <view class="waterfall__col">
          <RecipeCard
            v-for="(recipe, idx) in waterfallList.filter((_, i) => i % 2 === 0)"
            :key="recipe.id"
            :recipe="recipe"
            @click="onRecipeClick"
          />
        </view>
        <view class="waterfall__col">
          <RecipeCard
            v-for="(recipe, idx) in waterfallList.filter((_, i) => i % 2 === 1)"
            :key="recipe.id"
            :recipe="recipe"
            @click="onRecipeClick"
          />
        </view>
      </view>

      <view class="load-more" @click="loadMore">
        <text>— 加载更多 —</text>
      </view>
    </view>

    <view class="bottom-placeholder" />
    <CustomTabBar />
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  animation: fade-in-up 400ms ease-out;
}

/* ── 头部 Hero ── */
.home-header {
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.home-header__safe {
  height: var(--status-bar-height, 44px);
}

.home-header__bar {
  display: flex;
  flex-direction: column;
  padding: 24rpx 32rpx 32rpx;
}

.home-header__tagline {
  font-size: 22rpx;
  color: #777777;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.home-header__title {
  font-size: 48rpx;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -1rpx;
  margin-top: 8rpx;
  line-height: 1.15;
}

.home-header__subtitle {
  font-size: 24rpx;
  color: #777777;
  margin-top: 12rpx;
  line-height: 1.5;
}

/* ── 搜索框 ── */
.home-header__search {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  background: #F8F6FA;
  border-radius: 9999rpx;
  padding: 18rpx 28rpx;
  border: 1rpx solid #F0F0F0;
}

.home-header__search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  opacity: 0.6;
}

.home-header__search-placeholder {
  color: #777777;
  font-size: 26rpx;
}

/* ── 分类标签 (pill风格) ── */
.category-bar {
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
  padding-bottom: 20rpx;
  white-space: nowrap;
}

.category-bar__inner {
  display: flex;
  padding: 0 32rpx;
}

.category-chip {
  display: inline-block;
  padding: 12rpx 32rpx;
  border-radius: 9999rpx;
  font-size: 26rpx;
  color: #777777;
  background: transparent;
  margin-right: 12rpx;
  border: 1rpx solid #F0F0F0;
  transition: all 200ms ease;
}

.category-chip--active {
  background: #52C41A;
  color: #FFF;
  border-color: #52C41A;
  box-shadow: 0 4rpx 16rpx rgba(82,196,26,0.2);
}

/* ── 区域标题 ── */
.section {
  padding: 24rpx 32rpx;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-label {
  font-size: 22rpx;
  color: #777777;
  letter-spacing: 4rpx;
}

.rank-tabs {
  display: flex;
  gap: 32rpx;
}

.rank-tab {
  font-size: 30rpx;
  color: #777777;
  font-weight: 500;
  padding-bottom: 8rpx;
  position: relative;
}

.rank-tab--active {
  color: #1a1a1a;
  font-weight: 700;
}

.rank-tab--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: #52C41A;
  border-radius: 2rpx;
}

/* ── 排行榜 ── */
.rank-list {
  margin-bottom: 40rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.04), 0 4rpx 32rpx rgba(0,0,0,0.025);
  transition: transform 150ms ease;
}

.rank-item:active {
  transform: scale(0.98);
}

.rank-item__num {
  font-size: 56rpx;
  font-weight: 800;
  width: 72rpx;
  text-align: center;
  color: #F0F0F0;
  font-style: italic;
  line-height: 1;
}

.rank-item__num--top {
  color: #52C41A;
}

.rank-item__cover {
  width: 110rpx;
  height: 110rpx;
  border-radius: 16rpx;
  margin: 0 20rpx;
}

.rank-item__info {
  flex: 1;
}

.rank-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6rpx;
}

.rank-item__author {
  font-size: 22rpx;
  color: #777777;
  margin-bottom: 6rpx;
}

.rank-item__rating {
  font-size: 24rpx;
  color: #52C41A;
}

/* ── 瀑布流 ── */
.waterfall {
  display: flex;
  gap: 20rpx;
}

.waterfall__col {
  flex: 1;
}

/* ── 加载更多 ── */
.load-more {
  text-align: center;
  padding: 32rpx;
  color: #777777;
  font-size: 24rpx;
  letter-spacing: 2rpx;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
