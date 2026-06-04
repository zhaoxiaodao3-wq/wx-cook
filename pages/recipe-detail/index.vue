<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import RatingModal from '@/components/RatingModal.vue'
import SuggestionModal from '@/components/SuggestionModal.vue'

const recipeStore = useRecipeStore()
const userStore = useUserStore()

const recipe = ref(null)
const servings = ref(2)
const checkedIngredients = ref(new Set())
const showRating = ref(false)
const showSuggestion = ref(false)
const reviewTab = ref('reviews')

const scaledIngredients = computed(() => {
  if (!recipe.value) return []
  const ratio = servings.value / recipe.value.servings
  return recipe.value.ingredients.map(i => ({
    ...i,
    amount: i.amount ? (parseFloat(i.amount) * ratio).toFixed(1).replace(/\.0$/, '') : i.amount
  }))
})

const isFav = computed(() => userStore.isFavorite(recipe.value?.id))

onLoad((options) => {
  const r = recipeStore.recipeById(options.id)
  if (r) {
    recipe.value = r
    servings.value = r.servings
  }
})

function toggleFav() {
  if (!recipe.value) return
  userStore.toggleFavorite(recipe.value.id)
}

function toggleIngredient(name) {
  if (checkedIngredients.value.has(name)) {
    checkedIngredients.value.delete(name)
  } else {
    checkedIngredients.value.add(name)
  }
}

function onIngredientTap(name) {
  uni.navigateTo({ url: '/pages/recipes/index?query=' + encodeURIComponent(name) })
}

function submitRating(rating) {
  if (!recipe.value) return
  const u = userStore.currentUser
  recipeStore.rateRecipe(recipe.value.id, u.id, u.name, u.avatar, rating)
  userStore.addReview(recipe.value.id, rating)
  showRating.value = false
}

function submitSuggestion(content) {
  if (!recipe.value) return
  const u = userStore.currentUser
  recipeStore.suggestRecipe(recipe.value.id, u.id, u.name, u.avatar, content)
  userStore.addSuggestion(recipe.value.id, content)
  showSuggestion.value = false
}

function deleteMyReview() {
  if (!recipe.value) return
  const myReview = recipe.value.reviews.find(rv => rv.userId === userStore.currentUser.id)
  if (myReview) {
    recipeStore.deleteReview(recipe.value.id, myReview.id)
    userStore.removeReview(recipe.value.id)
  }
}

function deleteMySuggestion() {
  if (!recipe.value) return
  const mySuggestion = recipe.value.suggestions.find(s => s.userId === userStore.currentUser.id)
  if (mySuggestion) {
    recipeStore.deleteSuggestion(recipe.value.id, mySuggestion.id)
    userStore.removeSuggestion(recipe.value.id)
  }
}

const hasMyReview = computed(() =>
  recipe.value?.reviews.some(rv => rv.userId === userStore.currentUser.id)
)

const hasMySuggestion = computed(() =>
  recipe.value?.suggestions.some(s => s.userId === userStore.currentUser.id)
)
</script>

<template>
  <view v-if="recipe" class="detail-page">
    <!-- 封面图 -->
    <view class="detail-cover">
      <image :src="recipe.coverImage" mode="aspectFill" class="detail-cover__img" />
      <view class="cover-gradient" />
      <view class="detail-cover__top">
        <view class="detail-cover__back" @click="uni.navigateBack()">
          <text>←</text>
        </view>
        <view class="detail-cover__fav" @click="toggleFav">
          <text :style="{ color: isFav ? '#FF6B6B' : '#FFF' }">{{ isFav ? '♥' : '♡' }}</text>
        </view>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="detail-info">
      <text class="detail-title">{{ recipe.title }}</text>
      <view class="detail-author">
        <image class="detail-author__avatar" :src="recipe.author.avatar" mode="aspectFill" />
        <text class="detail-author__name">{{ recipe.author.name }}</text>
      </view>

      <view class="detail-actions">
        <view class="detail-action press-scale" @click="showRating = true">
          <text class="detail-action__icon">⭐</text>
          <text>{{ hasMyReview ? '修改评分' : '评分' }}</text>
        </view>
        <view class="detail-action press-scale" @click="showSuggestion = true">
          <text class="detail-action__icon">💡</text>
          <text>{{ hasMySuggestion ? '修改建议' : '写建议' }}</text>
        </view>
      </view>

      <view class="detail-meta">
        <view class="detail-meta__item">
          <text class="detail-meta__label">时长</text>
          <text class="detail-meta__value">{{ recipe.duration }}分钟</text>
        </view>
        <view class="detail-meta__item">
          <text class="detail-meta__label">难度</text>
          <text class="detail-meta__value">{{ recipe.difficulty }}</text>
        </view>
        <view class="detail-meta__item">
          <text class="detail-meta__label">分类</text>
          <text class="detail-meta__value">{{ recipe.category }}</text>
        </view>
        <view class="detail-meta__item">
          <text class="detail-meta__label">人群</text>
          <text class="detail-meta__value">{{ recipe.crowd || '无' }}</text>
        </view>
      </view>
    </view>

    <!-- 食材清单 -->
    <view class="detail-section">
      <view class="detail-section__header">
        <text class="detail-section__title">食材清单</text>
        <view class="serving-control">
          <text class="serving-btn" @click="servings = Math.max(1, servings - 1)">−</text>
          <text class="serving-num">{{ servings }}人份</text>
          <text class="serving-btn" @click="servings = servings + 1">+</text>
        </view>
      </view>
      <view class="ingredient-list">
        <view
          v-for="ing in scaledIngredients"
          :key="ing.name"
          class="ingredient-item"
          :class="{ 'ingredient-item--checked': checkedIngredients.has(ing.name) }"
          @click="toggleIngredient(ing.name)"
        >
          <view class="ingredient-check">
            <text v-if="checkedIngredients.has(ing.name)">✓</text>
          </view>
          <text class="ingredient-name" @click.stop="onIngredientTap(ing.name)">{{ ing.name }}</text>
          <text class="ingredient-amount">{{ ing.amount }}{{ ing.unit }}</text>
        </view>
      </view>
    </view>

    <!-- 制作步骤 -->
    <view class="detail-section">
      <text class="detail-section__title">制作步骤</text>
      <view class="step-list" style="margin-top: 20rpx;">
        <view v-for="(step, idx) in recipe.steps" :key="step.id" class="step-item">
          <view class="step-num">{{ idx + 1 }}</view>
          <view class="step-content">
            <text class="step-desc">{{ step.desc }}</text>
            <image v-if="step.image" :src="step.image" mode="widthFix" class="step-img" />
          </view>
        </view>
      </view>
    </view>

    <!-- 厨神贴士 -->
    <view v-if="recipe.tips" class="detail-section">
      <text class="detail-section__title">厨神贴士</text>
      <text class="tips-text">{{ recipe.tips }}</text>
    </view>

    <!-- 底部评价/建议 Tab -->
    <view class="detail-section">
      <view class="review-tabs">
        <text
          class="review-tab"
          :class="{ 'review-tab--active': reviewTab === 'reviews' }"
          @click="reviewTab = 'reviews'"
        >评分 ({{ recipe.reviews.length }})</text>
        <text
          class="review-tab"
          :class="{ 'review-tab--active': reviewTab === 'suggestions' }"
          @click="reviewTab = 'suggestions'"
        >建议 ({{ recipe.suggestions.length }})</text>
      </view>

      <view v-if="reviewTab === 'reviews'">
        <view v-for="rv in recipe.reviews" :key="rv.id" class="review-item">
          <image :src="rv.userAvatar" class="review-avatar" mode="aspectFill" />
          <view class="review-body">
            <view class="review-header">
              <text class="review-name">{{ rv.userName }}</text>
              <text class="review-stars">{{ '★'.repeat(rv.rating) }}{{ '☆'.repeat(5 - rv.rating) }}</text>
            </view>
            <text class="review-date">{{ rv.date.slice(0, 10) }}</text>
          </view>
          <view v-if="rv.userId === userStore.currentUser.id" class="review-del" @click="deleteMyReview">
            <text>删除</text>
          </view>
        </view>
        <view v-if="recipe.reviews.length === 0" class="review-empty">
          <text>暂无评分，快来第一个评分吧</text>
        </view>
      </view>

      <view v-if="reviewTab === 'suggestions'">
        <view v-for="s in recipe.suggestions" :key="s.id" class="review-item">
          <image :src="s.userAvatar" class="review-avatar" mode="aspectFill" />
          <view class="review-body">
            <text class="review-name">{{ s.userName }}</text>
            <text class="suggestion-text">{{ s.content }}</text>
            <text class="review-date">{{ s.date.slice(0, 10) }}</text>
          </view>
          <view v-if="s.userId === userStore.currentUser.id" class="review-del" @click="deleteMySuggestion">
            <text>删除</text>
          </view>
        </view>
        <view v-if="recipe.suggestions.length === 0" class="review-empty">
          <text>暂无建议，快来提建议吧</text>
        </view>
      </view>
    </view>

    <view class="bottom-placeholder" />

    <RatingModal
      v-if="showRating"
      :currentRating="recipe.reviews.find(rv => rv.userId === userStore.currentUser.id)?.rating || 0"
      @submit="submitRating"
      @close="showRating = false"
    />
    <SuggestionModal
      v-if="showSuggestion"
      :currentContent="recipe.suggestions.find(s => s.userId === userStore.currentUser.id)?.content || ''"
      @submit="submitSuggestion"
      @close="showSuggestion = false"
    />
  </view>
</template>

<style lang="scss" scoped>
.detail-page { min-height: 100vh; background: #FBF8FD; padding-bottom: 80rpx; }

.detail-cover { position: relative; width: 100%; height: 560rpx; }
.detail-cover__img { width: 100%; height: 100%; }
.cover-gradient {
  position: absolute; bottom: 0; left: 0; right: 0; height: 60%;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%);
}
.detail-cover__top {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; justify-content: space-between; padding: 60rpx 32rpx 0;
}
.detail-cover__back, .detail-cover__fav {
  width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; color: #FFF; background: rgba(255,255,255,0.2);
  backdrop-filter: blur(12rpx); border-radius: 50%;
}

.detail-info {
  background: #FFFFFF; border-radius: 28rpx 28rpx 0 0; margin-top: -36rpx;
  position: relative; padding: 36rpx 32rpx 32rpx;
}
.detail-title { font-size: 38rpx; font-weight: 800; color: #1a1a1a; letter-spacing: -1rpx; line-height: 1.2; }
.detail-author { display: flex; align-items: center; margin-top: 20rpx; }
.detail-author__avatar {
  width: 52rpx; height: 52rpx; border-radius: 50%; margin-right: 14rpx; border: 2rpx solid #F0F0F0;
}
.detail-author__name { font-size: 26rpx; color: #777777; font-weight: 600; }

.detail-actions { display: flex; gap: 12rpx; margin-top: 28rpx; }
.detail-action {
  display: flex; align-items: center; gap: 8rpx; padding: 16rpx 28rpx;
  background: #F8F6FA; border-radius: 9999rpx; font-size: 26rpx; color: #777777; border: 1rpx solid #F0F0F0;
}
.detail-action__icon { font-size: 26rpx; }

.detail-meta { display: flex; margin-top: 28rpx; gap: 12rpx; }
.detail-meta__item {
  flex: 1; text-align: center; padding: 20rpx 8rpx; background: #FBF8FD;
  border-radius: 16rpx; border: 1rpx solid #F0F0F0;
}
.detail-meta__label { font-size: 20rpx; color: #777777; display: block; letter-spacing: 2rpx; }
.detail-meta__value { font-size: 26rpx; font-weight: 700; color: #1a1a1a; margin-top: 6rpx; }

.detail-section {
  background: #FFFFFF; margin: 16rpx 32rpx; border-radius: 20rpx;
  padding: 28rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03);
}
.detail-section__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.detail-section__title { font-size: 30rpx; font-weight: 700; color: #1a1a1a; letter-spacing: 1rpx; }

.serving-control { display: flex; align-items: center; gap: 16rpx; }
.serving-btn {
  width: 44rpx; height: 44rpx; border-radius: 50%; background: #F8F6FA;
  display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: #52C41A; font-weight: 600;
}
.serving-num { font-size: 24rpx; color: #777777; font-weight: 600; }

.ingredient-list { border-top: 1rpx solid #F0F0F0; padding-top: 8rpx; }
.ingredient-item {
  display: flex; align-items: center; padding: 14rpx 0;
  border-bottom: 1px dashed #F0F0F0;
}
.ingredient-item--checked { opacity: 0.35; }
.ingredient-check {
  width: 36rpx; height: 36rpx; border: 1.5rpx solid #F0F0F0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin-right: 14rpx;
  font-size: 22rpx; color: transparent; transition: all 200ms ease; flex-shrink: 0;
}
.ingredient-item--checked .ingredient-check { background: #52C41A; border-color: #52C41A; color: #FFF; }
.ingredient-name { flex: 1; font-size: 27rpx; color: #1a1a1a; font-weight: 500; }
.ingredient-amount { font-size: 24rpx; color: #777777; font-family: monospace; }

.step-item { display: flex; margin-bottom: 28rpx; }
.step-num {
  width: 52rpx; height: 52rpx; border-radius: 16rpx; background: #52C41A; color: #FFF;
  display: flex; align-items: center; justify-content: center; font-size: 24rpx;
  font-weight: 700; flex-shrink: 0; margin-right: 20rpx;
}
.step-content { flex: 1; }
.step-desc { font-size: 26rpx; line-height: 1.75; color: #1a1a1a; }
.step-img { width: 100%; border-radius: 14rpx; margin-top: 14rpx; }

.tips-text {
  font-size: 26rpx; color: #777777; line-height: 1.75; margin-top: 12rpx;
  display: block; background: #FBF8FD; padding: 20rpx; border-radius: 14rpx;
  border-left: 4rpx solid #52C41A;
}

.review-tabs { display: flex; gap: 36rpx; margin-bottom: 24rpx; }
.review-tab {
  font-size: 26rpx; color: #777777; padding-bottom: 8rpx; letter-spacing: 1rpx;
}
.review-tab--active { color: #1a1a1a; font-weight: 700; border-bottom: 3rpx solid #52C41A; }

.review-item {
  display: flex; padding: 16rpx 0; border-bottom: 1rpx solid #F0F0F0; align-items: flex-start;
}
.review-avatar { width: 52rpx; height: 52rpx; border-radius: 50%; margin-right: 14rpx; flex-shrink: 0; }
.review-body { flex: 1; }
.review-header { display: flex; align-items: center; gap: 12rpx; }
.review-name { font-size: 26rpx; font-weight: 600; color: #1a1a1a; }
.review-stars { color: #52C41A; font-size: 20rpx; }
.suggestion-text { font-size: 26rpx; color: #777777; margin-top: 6rpx; display: block; line-height: 1.6; }
.review-date { font-size: 20rpx; color: #777777; margin-top: 4rpx; }
.review-empty { text-align: center; padding: 48rpx 0; color: #777777; font-size: 24rpx; }
.review-del { color: #FF4D4F; font-size: 22rpx; padding: 4rpx 8rpx; }

.bottom-placeholder { height: 48rpx; }
</style>
