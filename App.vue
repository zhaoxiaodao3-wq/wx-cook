<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useRecipeStore } from '@/stores/recipe'
import { hasApiServer } from '@/api/request'
import { getRuntimeConfig } from '@/config/runtime'

onLaunch(() => {
  const cfg = getRuntimeConfig()
  console.info(`[API] 环境=${cfg.envLabel}(${cfg.env}) api=${cfg.apiBaseUrl}`)
  useAuthStore().init()
  if (hasApiServer()) {
    useRecipeStore().initRecipes().catch(() => {})
  }
})
</script>

<template></template>

<style lang="scss">
@import '@/uni.scss';

/* 页面通用动画 */
.editorial-page {
  animation: fade-in-up 400ms ease-out;
}

/* 交错卡片动画 */
.card-stagger {
  opacity: 0;
  animation: card-rise 500ms ease-out forwards;
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

/* 封面底部渐变蒙版 */
.cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
}
</style>
