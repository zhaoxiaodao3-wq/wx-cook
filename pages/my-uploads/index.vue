<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import PageShell from '@/components/PageShell.vue'
import { hasApiServer } from '@/api/request'
import { mapApiRecipeListItem } from '@/api/adapters'
import { fetchMyRecipes, fetchMyFavorites, fetchMyReviews } from '@/api/user'
import { resolveMediaUrl } from '@/utils/media'

const recipeStore = useRecipeStore()
const userStore = useUserStore()

const tabs = ['已发布', '收藏', '评价']
const activeTab = ref(0)
const loading = ref(false)

const apiMyRecipes = ref([])
const apiFavRecipes = ref([])
const apiReviewed = ref([])

const myRecipes = computed(() =>
  hasApiServer()
    ? apiMyRecipes.value
    : recipeStore.recipes.filter((r) => r.author.id === userStore.currentUser.id)
)

const favRecipes = computed(() =>
  hasApiServer()
    ? apiFavRecipes.value
    : recipeStore.recipes.filter((r) => userStore.favorites.includes(r.id))
)

const reviewedRecipes = computed(() => {
  if (hasApiServer()) {
    return apiReviewed.value
  }
  return userStore.myReviews
    .map((rv) => {
      const recipe = recipeStore.recipeById(rv.recipeId)
      return { ...rv, recipe }
    })
    .filter((r) => r.recipe)
})

async function loadTabData() {
  if (!hasApiServer()) return
  loading.value = true
  try {
    if (activeTab.value === 0) {
      const data = await fetchMyRecipes(1, 50)
      apiMyRecipes.value = data.items.map(mapApiRecipeListItem)
    } else if (activeTab.value === 1) {
      const data = await fetchMyFavorites(1, 50)
      apiFavRecipes.value = data.items.map(mapApiRecipeListItem)
    } else {
      const data = await fetchMyReviews(1, 50)
      apiReviewed.value = data.items.map((item) => ({
        recipeId: item.recipeId,
        rating: item.rating,
        date: item.date,
        recipe: item.recipe
          ? {
              id: item.recipe.id,
              title: item.recipe.title,
              coverImage: resolveMediaUrl(item.recipe.coverImage),
            }
          : recipeStore.recipeById(item.recipeId),
      }))
    }
  } catch (e) {
    uni.showToast({
      title: e instanceof Error ? e.message : '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  if (options && options.tab === 'favorites') activeTab.value = 1
  if (options && options.tab === 'reviews') activeTab.value = 2
})

onMounted(() => {
  loadTabData()
})

function onTabChange(idx) {
  activeTab.value = idx
  loadTabData()
}

function onRecipeClick(id) {
  uni.navigateTo({ url: '/pages/recipe-detail/index?id=' + id })
}

async function removeFavorite(id) {
  try {
    await userStore.toggleFavorite(id)
    apiFavRecipes.value = apiFavRecipes.value.filter((r) => r.id !== id)
  } catch (e) {
    uni.showToast({
      title: e instanceof Error ? e.message : '操作失败',
      icon: 'none',
    })
  }
}
</script>

<template>
  <PageShell>
  <view class="my-uploads-page">
    <view class="tabs">
      <text
        v-for="(tab, idx) in tabs"
        :key="tab"
        class="tab"
        :class="{ 'tab--active': activeTab === idx }"
        @click="onTabChange(idx)"
      >{{ tab }}</text>
    </view>

    <view v-if="activeTab === 0">
      <view v-for="recipe in myRecipes" :key="recipe.id" class="list-item" @click="onRecipeClick(recipe.id)">
        <image :src="recipe.coverImage" mode="aspectFill" class="list-item__cover" />
        <view class="list-item__info">
          <text class="list-item__title">{{ recipe.title }}</text>
          <text class="list-item__sub">★ {{ recipe.rating }} · {{ recipe.ratingCount }}评</text>
        </view>
        <text class="list-item__arrow">→</text>
      </view>
      <view v-if="!loading && myRecipes.length === 0" class="empty">暂无已发布的菜谱</view>
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
      <view v-if="!loading && favRecipes.length === 0" class="empty">暂无收藏</view>
    </view>

    <view v-if="activeTab === 2">
      <view
        v-for="item in reviewedRecipes"
        :key="item.recipeId"
        class="list-item"
        @click="item.recipe && onRecipeClick(item.recipe.id || item.recipeId)"
      >
        <image
          v-if="item.recipe"
          :src="item.recipe.coverImage"
          mode="aspectFill"
          class="list-item__cover"
        />
        <view class="list-item__info">
          <text class="list-item__title">{{ item.recipe?.title || '菜谱' }}</text>
          <text class="list-item__sub">我的评分：★ {{ item.rating }}</text>
        </view>
        <text class="list-item__arrow">→</text>
      </view>
      <view v-if="!loading && reviewedRecipes.length === 0" class="empty">暂无评价</view>
    </view>
  </view>
  </PageShell>
</template>

<style lang="scss" scoped>
.my-uploads-page { min-height: 100vh; background: #FBF8FD; padding: 24rpx 28rpx; }
.tabs { display: flex; background: #FFF; border-radius: 16rpx; padding: 8rpx; margin-bottom: 24rpx; }
.tab { flex: 1; text-align: center; padding: 20rpx 0; font-size: 26rpx; color: #777; border-radius: 12rpx; }
.tab--active { background: #52C41A; color: #FFF; font-weight: 600; }
.list-item { display: flex; align-items: center; background: #FFF; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx; }
.list-item__cover { width: 120rpx; height: 90rpx; border-radius: 12rpx; flex-shrink: 0; }
.list-item__info { flex: 1; margin-left: 20rpx; }
.list-item__title { font-size: 28rpx; font-weight: 600; color: #1a1a1a; display: block; }
.list-item__sub { font-size: 22rpx; color: #999; margin-top: 8rpx; display: block; }
.list-item__arrow { color: #ccc; font-size: 28rpx; }
.unfav-btn { font-size: 24rpx; color: #FF4D4F; padding: 8rpx 16rpx; }
.empty { text-align: center; padding: 80rpx 0; color: #999; font-size: 26rpx; }
</style>
