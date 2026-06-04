<script setup>
import { ref } from 'vue'

const props = defineProps({ currentRating: { type: Number, default: 0 } })
const emit = defineEmits(['submit', 'close'])
const rating = ref(props.currentRating)

function selectRating(r) { rating.value = r }
function submit() { if (rating.value > 0) emit('submit', rating.value) }
</script>

<template>
  <view class="modal-mask" @click="emit('close')">
    <view class="modal-card" @click.stop>
      <text class="modal-title">为这道菜评分</text>
      <text class="modal-subtitle">Tap the stars</text>
      <view class="stars-row">
        <text
          v-for="i in 5" :key="i"
          class="star" :class="{ 'star--active': i <= rating }"
          @click="selectRating(i)"
        >{{ i <= rating ? '★' : '☆' }}</text>
      </view>
      <text class="modal-hint" v-if="rating > 0">
        {{ ['', '还可以', '不错', '好吃', '非常棒', '惊艳'][rating] }}
      </text>
      <view class="modal-actions">
        <text class="modal-btn modal-btn--ghost" @click="emit('close')">取消</text>
        <text class="modal-btn modal-btn--fill" @click="submit">确认</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44,62,51,0.5); backdrop-filter: blur(8rpx);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fade-in 200ms ease;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.modal-card {
  background: #FFFFFF; border-radius: 28rpx; padding: 52rpx 44rpx 40rpx;
  width: 560rpx; text-align: center;
  box-shadow: 0 8rpx 48rpx rgba(44,62,51,0.12);
  animation: card-rise 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
@keyframes card-rise {
  from { opacity: 0; transform: translateY(32rpx); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-title { font-size: 32rpx; font-weight: 800; color: #2C3E33; display: block; letter-spacing: 1rpx; }
.modal-subtitle { font-size: 22rpx; color: #8FA89B; display: block; margin-top: 8rpx; letter-spacing: 3rpx; }
.stars-row { display: flex; justify-content: center; gap: 20rpx; margin: 36rpx 0 16rpx; }
.star { font-size: 64rpx; color: #EAEFEB; transition: all 150ms ease; }
.star:active { transform: scale(1.15); }
.star--active { color: #F0C060; text-shadow: 0 2rpx 8rpx rgba(240,192,96,0.3); }
.modal-hint { font-size: 24rpx; color: #5DBE9E; display: block; margin-bottom: 32rpx; }
.modal-actions { display: flex; gap: 16rpx; }
.modal-btn { flex: 1; padding: 20rpx 0; border-radius: 9999rpx; font-size: 28rpx; font-weight: 600; letter-spacing: 2rpx; }
.modal-btn--ghost { background: transparent; color: #6B8274; border: 1rpx solid #EAEFEB; }
.modal-btn--fill { background: #5DBE9E; color: #FFF; box-shadow: 0 4rpx 16rpx rgba(93,190,158,0.2); }
.modal-btn--fill:active { transform: scale(0.96); }
</style>
