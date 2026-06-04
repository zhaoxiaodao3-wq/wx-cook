<script setup>
const props = defineProps({
  recipe: { type: Object, required: true }
})
const emit = defineEmits(['click'])
function handleClick() { emit('click', props.recipe.id) }
</script>

<template>
  <view class="recipe-card card-stagger press-scale" @click="handleClick">
    <!-- 封面区 -->
    <view class="recipe-card__cover-wrap">
      <image class="recipe-card__cover" :src="recipe.coverImage" mode="widthFix" lazy-load />
      <!-- 难度标签 — 斜放角落 -->
      <view class="recipe-card__difficulty">
        <text>{{ recipe.difficulty }}</text>
      </view>
    </view>

    <!-- 信息区 — 非对称排版 -->
    <view class="recipe-card__body">
      <text class="recipe-card__title">{{ recipe.title }}</text>

      <!-- 作者行 — 小头像 + 名字 -->
      <view class="recipe-card__meta">
        <image class="recipe-card__avatar" :src="recipe.author.avatar" mode="aspectFill" />
        <text class="recipe-card__author">{{ recipe.author.name }}</text>
        <view class="recipe-card__dot" />
        <text class="recipe-card__time">{{ recipe.duration }}min</text>
      </view>

      <!-- 底部：星级 + 标签 -->
      <view class="recipe-card__footer">
        <view class="recipe-card__stars">
          <text class="recipe-card__star-icon">★</text>
          <text class="recipe-card__rating">{{ recipe.rating }}</text>
          <text class="recipe-card__count">({{ recipe.ratingCount }})</text>
        </view>
        <view class="recipe-card__tags">
          <text class="recipe-card__tag" v-for="tag in recipe.tags.slice(0, 2)" :key="tag">{{ tag }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.recipe-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.04), 0 4rpx 32rpx rgba(0,0,0,0.025);
  margin-bottom: 32rpx;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.recipe-card__cover-wrap {
  position: relative;
  overflow: hidden;
}

.recipe-card__cover {
  width: 100%;
  display: block;
  transition: transform 400ms ease;
}

.recipe-card:active .recipe-card__cover {
  transform: scale(1.03);
}

.recipe-card__difficulty {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: rgba(253, 248, 242, 0.9);
  backdrop-filter: blur(8rpx);
  padding: 6rpx 16rpx;
  border-radius: 9999rpx;
  font-size: 20rpx;
  color: #999999;
  letter-spacing: 2rpx;
  font-weight: 500;
}

.recipe-card__body {
  padding: 20rpx 24rpx 24rpx;
}

.recipe-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: 1rpx;
}

.recipe-card__meta {
  display: flex;
  align-items: center;
  margin-top: 14rpx;
}

.recipe-card__avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.recipe-card__author {
  font-size: 22rpx;
  color: #999999;
}

.recipe-card__dot {
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: #52C41A;
  margin: 0 10rpx;
}

.recipe-card__time {
  font-size: 22rpx;
  color: #999999;
}

.recipe-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid #F0F0F0;
}

.recipe-card__stars {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.recipe-card__star-icon {
  color: #52C41A;
  font-size: 22rpx;
}

.recipe-card__rating {
  font-size: 24rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.recipe-card__count {
  font-size: 20rpx;
  color: #999999;
}

.recipe-card__tags {
  display: flex;
  gap: 8rpx;
}

.recipe-card__tag {
  font-size: 20rpx;
  color: #52C41A;
  background: #F0FAF0;
  padding: 4rpx 14rpx;
  border-radius: 9999rpx;
  letter-spacing: 1rpx;
}
</style>
