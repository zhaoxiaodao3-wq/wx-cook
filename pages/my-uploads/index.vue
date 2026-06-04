<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'

const recipeStore = useRecipeStore()
const userStore = useUserStore()

const tabs = ['已发布', '收藏', '评价']
const activeTab = ref(0)

const myRecipes = computed(() => recipeStore.recipes.filter(r => r.author.id === userStore.currentUser.id))
const favRecipes = computed(() => recipeStore.recipes.filter(r => userStore.favorites.includes(r.id)))
const reviewedRecipes = computed(() =>
  userStore.myReviews.map(rv => {
    const recipe = recipeStore.recipeById(rv.recipeId)
    return { ...rv, recipe }
  }).filter(r => r.recipe)
)

onLoad((options) => {
  if (options && options.tab === 'favorites') activeTab.value = 1
  if (options && options.tab === 'reviews') activeTab.value = 2
})

function onRecipeClick(id) { uni.navigateTo({ url: '/pages/recipe-detail/index?id=' + id }) }
function removeFavorite(id) { userStore.toggleFavorite(id) }
</script>

<template>
  <view class="my-uploads-page">
    <view class="tabs">
      <text v-for="(tab, idx) in tabs" :key="tab" class="tab" :class="{ 'tab--active': activeTab === idx }" @click="activeTab = idx">{{ tab }}</text>
    </view>

    <view v-if="activeTab === 0">
      <view v-for="recipe in myRecipes" :key="recipe.id" class="list-item" @click="onRecipeClick(recipe.id)">
        <image :src="recipe.coverImage" mode="aspectFill" class="list-item__cover" />
        <view class="list-item__info">
          <text class="list-item__title">{{ recipe.title }}</text>
          <text class="list-item__sub">★ {{ recipe.rating }} · {{ recipe.reviews.length }}评</text>
        </view>
        <text class="list-item__arrow">→</text>
      </view>
      <view v-if="myRecipes.length === 0" class="empty">暂无已发布的菜谱</view>
    </view>

    <view v-if="activeTab === 1">
      <view v-for="recipe in favRecipes" :key="recipe.id" class="list-item" @click="onRecipeClick(recipe.id)">
        <image :src="recipe.coverImage" mode="aspectFill" class="list-item__cover" />
        <view class="list-item__info">
          <text class="list-item__title">{{ recipe.title }}</text>
          <text class="list-item__sub">{{ recipe.author.name }}</text>
        </view>
        <text class="unfav-btn" @click.stop="removeFavorite(recipe.id)">取消</text>
      </view>
      <view v-if="favRecipes.length === 0" class="empty">暂无收藏</view>
    </view>

    <view v-if="activeTab === 2">
      <view v-for="item in reviewedRecipes" :key="item.recipeId" class="list-item" @click="onRecipeClick(item.recipe.id)">
        <image :src="item.recipe.coverImage" mode="aspectFill" class="list-item__cover" />
        <view class="list-item__info">
          <text class="list-item__title">{{ item.recipe.title }}</text>
          <text class="list-item__sub">{{ '★'.repeat(item.rating) }}{{ '☆'.repeat(5 - item.rating) }}</text>
        </view>
        <text class="list-item__arrow">→</text>
      </view>
      <view v-if="reviewedRecipes.length === 0" class="empty">暂无评价</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.my-uploads-page { min-height: 100vh; background: #FAFCF9; }
.tabs { display: flex; background: #FFFFFF; padding: 0 32rpx; border-bottom: 1rpx solid #EAEFEB; }
.tab { flex: 1; text-align: center; padding: 28rpx 0; font-size: 26rpx; color: #8FA89B; border-bottom: 3rpx solid transparent; letter-spacing: 1rpx; transition: all 200ms ease; }
.tab--active { color: #5DBE9E; font-weight: 700; border-bottom-color: #5DBE9E; }
.list-item { display: flex; align-items: center; background: #FFFFFF; padding: 20rpx 28rpx; margin: 12rpx 28rpx; border-radius: 20rpx; box-shadow: 0 2rpx 12rpx rgba(44,62,51,0.03); }
.list-item__cover { width: 100rpx; height: 100rpx; border-radius: 16rpx; margin-right: 18rpx; }
.list-item__info { flex: 1; }
.list-item__title { font-size: 28rpx; font-weight: 600; color: #2C3E33; display: block; }
.list-item__sub { font-size: 22rpx; color: #8FA89B; margin-top: 6rpx; display: block; }
.list-item__arrow { color: #8FA89B; font-size: 28rpx; }
.unfav-btn { color: #E85D5D; font-size: 22rpx; padding: 8rpx 16rpx; font-weight: 500; }
.empty { text-align: center; padding: 100rpx 0; color: #8FA89B; font-size: 26rpx; letter-spacing: 1rpx; }
</style>
