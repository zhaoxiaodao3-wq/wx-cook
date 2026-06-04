<script setup>
import { computed } from 'vue'

const props = defineProps({
  recipe: { type: Object, required: true },
})
const emit = defineEmits(['click'])

const authorName = computed(() => props.recipe.author?.name || '匿名')
const authorAvatar = computed(() => props.recipe.author?.avatar || '')
const tagList = computed(() =>
  Array.isArray(props.recipe.tags) ? props.recipe.tags.slice(0, 2) : []
)
const coverSrc = computed(() => props.recipe.coverImage || '')
const difficulty = computed(() => props.recipe.difficulty || '')
const rating = computed(() => props.recipe.rating ?? 0)
const ratingCount = computed(() => props.recipe.ratingCount ?? 0)
const duration = computed(() => props.recipe.duration ?? 0)
const title = computed(() => props.recipe.title || '未命名菜谱')

function handleClick() {
  emit('click', props.recipe.id)
}
</script>

<template>
  <view class="recipe-card press-scale" @click="handleClick">
    <view class="recipe-card__cover-wrap">
      <image
        v-if="coverSrc"
        class="recipe-card__cover"
        :src="coverSrc"
        mode="widthFix"
        lazy-load
      />
      <view v-else class="recipe-card__cover recipe-card__cover--empty">
        <text>暂无图片</text>
      </view>
      <view v-if="difficulty" class="recipe-card__difficulty">
        <text>{{ difficulty }}</text>
      </view>
    </view>

    <view class="recipe-card__body">
      <text class="recipe-card__title">{{ title }}</text>

      <view class="recipe-card__meta">
        <image
          v-if="authorAvatar"
          class="recipe-card__avatar"
          :src="authorAvatar"
          mode="aspectFill"
        />
        <view v-else class="recipe-card__avatar recipe-card__avatar--empty" />
        <text class="recipe-card__author">{{ authorName }}</text>
        <view class="recipe-card__dot" />
        <text class="recipe-card__time">{{ duration }}分钟</text>
      </view>

      <view class="recipe-card__footer">
        <view class="recipe-card__stars">
          <text class="recipe-card__rating">{{ rating }}</text>
          <text class="recipe-card__count">分 ({{ ratingCount }})</text>
        </view>
        <view v-if="tagList.length" class="recipe-card__tags">
          <text v-for="tag in tagList" :key="tag" class="recipe-card__tag">{{ tag }}</text>
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
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 32rpx;
}

.recipe-card__cover-wrap {
  position: relative;
  overflow: hidden;
}

.recipe-card__cover {
  width: 100%;
  display: block;
}

.recipe-card__cover--empty {
  height: 200rpx;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #999;
}

.recipe-card__difficulty {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: rgba(255, 255, 255, 0.92);
  padding: 6rpx 16rpx;
  border-radius: 9999rpx;
  font-size: 20rpx;
  color: #777777;
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
  flex-shrink: 0;
}

.recipe-card__avatar--empty {
  background: #e8e8e8;
}

.recipe-card__author {
  font-size: 22rpx;
  color: #777777;
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
  color: #777777;
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
  align-items: baseline;
  gap: 4rpx;
}

.recipe-card__rating {
  font-size: 24rpx;
  font-weight: 700;
  color: #52C41A;
}

.recipe-card__count {
  font-size: 20rpx;
  color: #777777;
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
}
</style>
