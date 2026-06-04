<script setup>
import { ref } from 'vue'

const props = defineProps({ currentContent: { type: String, default: '' } })
const emit = defineEmits(['submit', 'close'])
const content = ref(props.currentContent)

function submit() {
  const trimmed = content.value.trim()
  if (trimmed) emit('submit', trimmed)
}
</script>

<template>
  <view class="modal-mask" @click="emit('close')">
    <view class="modal-card" @click.stop>
      <text class="modal-title">写建议</text>
      <text class="modal-subtitle">Share your wisdom</text>
      <view class="textarea-wrap">
        <textarea
          class="modal-textarea"
          v-model="content"
          placeholder="分享你的烹饪心得或改进建议..."
          :maxlength="500"
          :auto-height="true"
        />
        <text class="counter">{{ content.length }}/500</text>
      </view>
      <view class="modal-actions">
        <text class="modal-btn modal-btn--ghost" @click="emit('close')">取消</text>
        <text class="modal-btn modal-btn--fill" @click="submit">提交</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(60,36,21,0.5); backdrop-filter: blur(8rpx);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fade-in 200ms ease;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.modal-card {
  background: #FFFCF7; border-radius: 28rpx; padding: 44rpx 36rpx 36rpx;
  width: 620rpx;
  box-shadow: 0 8rpx 48rpx rgba(60,36,21,0.12);
  animation: card-rise 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
@keyframes card-rise {
  from { opacity: 0; transform: translateY(32rpx); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-title { font-size: 32rpx; font-weight: 800; color: #3C2415; display: block; text-align: center; letter-spacing: 1rpx; }
.modal-subtitle { font-size: 20rpx; color: #A89885; display: block; text-align: center; margin-top: 6rpx; letter-spacing: 3rpx; }
.textarea-wrap { position: relative; margin: 28rpx 0; }
.modal-textarea {
  width: 100%; min-height: 220rpx; background: #FDF8F2; border-radius: 16rpx;
  padding: 24rpx; font-size: 26rpx; color: #3C2415; border: 1rpx solid #EDE4DA;
  box-sizing: border-box; line-height: 1.6;
}
.counter { text-align: right; font-size: 20rpx; color: #A89885; margin-top: 8rpx; display: block; }
.modal-actions { display: flex; gap: 16rpx; }
.modal-btn { flex: 1; padding: 20rpx 0; border-radius: 9999rpx; font-size: 28rpx; font-weight: 600; letter-spacing: 2rpx; text-align: center; }
.modal-btn--ghost { background: transparent; color: #5C4033; border: 1rpx solid #EDE4DA; }
.modal-btn--fill { background: #D4784C; color: #FFF; box-shadow: 0 4rpx 16rpx rgba(212,120,76,0.18); }
.modal-btn--fill:active { transform: scale(0.96); }
</style>
