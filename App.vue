<script setup>
</script>

<template></template>

<style lang="scss">
@import '@/uni.scss';

/* 页面通用动画 */
.editorial-page {
  animation: editorial-enter 400ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 交错卡片动画 — 每个卡片延迟 80ms */
.card-stagger {
  opacity: 0;
  animation: card-rise 500ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

.card-stagger:nth-child(1) { animation-delay: 0ms; }
.card-stagger:nth-child(2) { animation-delay: 80ms; }
.card-stagger:nth-child(3) { animation-delay: 160ms; }
.card-stagger:nth-child(4) { animation-delay: 240ms; }
.card-stagger:nth-child(5) { animation-delay: 320ms; }
.card-stagger:nth-child(6) { animation-delay: 400ms; }
.card-stagger:nth-child(n+7) { animation-delay: 480ms; }

/* 点击缩放反馈 */
.press-scale:active {
  transform: scale(0.96);
  transition: transform 120ms ease;
}

/* ═══════════════════════════════════════════
   通用装饰样式
   ═══════════════════════════════════════════ */

/* 分割装饰线 — 橄榄枝风格 */
.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 8rpx 0;
}

.section-divider::before,
.section-divider::after {
  content: '';
  width: 48rpx;
  height: 1rpx;
  background: $color-warm-border;
}

.section-divider__dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: $color-terracotta;
}

/* 陶土按钮 */
.btn-terracotta {
  background: $color-terracotta;
  color: #FFF;
  border-radius: $radius-full;
  padding: 18rpx 40rpx;
  font-size: $font-label;
  font-weight: 600;
  text-align: center;
  box-shadow: $shadow-terracotta;
  letter-spacing: 2rpx;
}

.btn-terracotta:active {
  transform: scale(0.96);
  opacity: 0.9;
}

/* 图文蒙版渐变 */
.cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(44,62,51,0.7) 0%, transparent 100%);
}

/* 标签徽章 */
.tag-badge {
  display: inline-block;
  padding: 6rpx 18rpx;
  border-radius: $radius-full;
  font-size: $font-caption;
  background: $color-sage-light;
  color: $color-sage;
  letter-spacing: 1rpx;
}
</style>
