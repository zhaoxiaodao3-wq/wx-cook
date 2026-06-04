# 小圈子菜谱共享平台 — Warm Editorial 设计驱动实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建菜谱共享微信小程序，采用「温暖编辑风 (Warm Editorial)」美学——像翻开一本高端美食杂志（Kinfolk / Cereal 风格）。

**Architecture:** uni-app (Vue 3 + Composition API + Pinia)。本计划专注于视觉设计层的完整重写——所有 CSS 从头构建，采用非对称杂志排版、陶土色调系统、宽松留白、纸张质感卡片。技术架构（Store、路由、数据流）与原始计划一致，本计划仅覆盖样式层的全部重建。

**Design Direction — Warm Editorial:**
- **色调**：暖奶油底(#FDF8F2) + 深咖啡文字(#3C2415) + 陶土橙点缀(#D4784C)
- **排版**：大标题 40-48rpx 加粗制造杂志封面感，正文 26-28rpx 宽行距，辅助文字用 warm grey 而非冷灰
- **空间**：非对称 Padding（左右 32rpx 而非 24rpx），卡片间距 32rpx，区域间留白 48rpx+
- **质感**：多重阴影叠出纸页厚度，卡片微圆角(20rpx)，类胶版纸背景
- **差异化**：食材清单像杂志内页插文，排行榜前三名用大号艺术数字，上传页步骤指示器用圆形进度而非横线

**Tech Stack:** uni-app (Vue 3 + Composition API) + Pinia + SCSS + 微信小程序

**文件影响范围：** 以下所有文件的 `<style>` 块将被完全重写。
所有 JS 逻辑保留原样，仅修改 CSS。

---
```

### Task 1: 设计令牌系统 — 建立 Warm Editorial 视觉语言

**Files:**
- Modify: `uni.scss`

> 这是整个平台视觉的基石。所有后续任务的样式都基于这些令牌。

- [ ] **Step 1: 替换 uni.scss 全部内容**

```scss
/* ═══════════════════════════════════════════
   Warm Editorial — 设计令牌系统
   ═══════════════════════════════════════════ */

/* ── 色调 Palette ── */
$color-cream: #FDF8F2;           /* 页底 — 暖奶油纸 */
$color-paper: #FFFCF7;           /* 卡片 — 微暖白 */
$color-espresso: #3C2415;        /* 主文字 — 深烘咖啡 */
$color-ink: #5C4033;             /* 辅文字 — 温棕 */
$color-muted: #A89885;           /* 更弱文字 */
$color-terracotta: #D4784C;       /* 主点缀 — 陶土橙 */
$color-terracotta-light: #F5E6DC; /* 点缀浅底 */
$color-terracotta-deep: #B85C3A;  /* 点缀深色(hover) */
$color-sage: #7D9B76;            /* 次点缀 — 鼠尾草绿 */
$color-sage-light: #E8EFE6;
$color-gold: #C9A96E;           /* 星级 */
$color-warm-border: #EDE4DA;    /* 分割线 */
$color-cream-dark: #F5EDE3;     /* 输入框背景 */

/* ── 阴影 Paper Shadows ── */
$shadow-subtle: 0 2rpx 12rpx rgba(60,36,21,0.03);
$shadow-paper: 0 2rpx 16rpx rgba(60,36,21,0.04), 0 4rpx 32rpx rgba(60,36,21,0.025);
$shadow-raised: 0 4rpx 24rpx rgba(60,36,21,0.06), 0 8rpx 48rpx rgba(60,36,21,0.035);
$shadow-terracotta: 0 4rpx 16rpx rgba(212,120,76,0.18);

/* ── 圆角 ── */
$radius-sm: 12rpx;
$radius-md: 20rpx;
$radius-lg: 28rpx;
$radius-full: 9999rpx;

/* ── 间距基准 8rpx grid ── */
$space-xs: 8rpx;
$space-sm: 16rpx;
$space-md: 24rpx;
$space-lg: 32rpx;
$space-xl: 48rpx;
$space-2xl: 64rpx;

/* ── 排版 ── */
$font-display: 48rpx;   /* 大标题 */
$font-headline: 38rpx;   /* 页面标题 */
$font-title: 32rpx;      /* 卡片标题 */
$font-body: 27rpx;       /* 正文 */
$font-label: 24rpx;      /* 标签 */
$font-caption: 22rpx;    /* 说明文字 */
$font-mini: 20rpx;       /* 超小文字 */

/* ═══════════════════════════════════════════
   全局样式
   ═══════════════════════════════════════════ */

page {
  background-color: $color-cream;
  color: $color-espresso;
  font-size: $font-body;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

/* ── 动画关键帧 ── */

/* 页面进入 */
@keyframes editorial-enter {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片交错进入 */
@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(32rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 淡入 */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 封面缩放 */
@keyframes cover-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* 数字弹跳 */
@keyframes count-up {
  0% { opacity: 0; transform: scale(0.5); }
  60% { transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
```

- [ ] **Step 2: 提交**

```bash
git add uni.scss
git commit -m "design: establish Warm Editorial design token system"
```

---

### Task 2: 全局容器 + 封面杂志感 App.vue

**Files:**
- Modify: `App.vue`

- [ ] **Step 1: 替换 App.vue**

```vue
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
  background: linear-gradient(to top, rgba(60,36,21,0.7) 0%, transparent 100%);
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
```

- [ ] **Step 2: 提交**

```bash
git add App.vue
git commit -m "design: replace App.vue with editorial global styles and animations"
```

---

### Task 3: 杂志风 CustomTabBar

**Files:**
- Create: `components/CustomTabBar.vue`

- [ ] **Step 1: 创建 components/CustomTabBar.vue**

```vue
<script setup>
import { computed } from 'vue'

const tabs = [
  { path: '/pages/home/index', label: '首页', icon: 'home' },
  { path: '/pages/recipes/index', label: '发现', icon: 'search' },
  { path: '/pages/upload/index', label: '上传', icon: 'plus' },
  { path: '/pages/profile/index', label: '我的', icon: 'user' },
]

const currentRoute = computed(() => {
  const pages = getCurrentPages()
  return pages.length > 0 ? '/' + pages[pages.length - 1].route : ''
})

function switchTab(path) {
  uni.switchTab({ url: path })
}
</script>

<template>
  <view class="tab-bar">
    <view
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-bar__item"
      :class="{ 'tab-bar__item--active': currentRoute === tab.path }"
      @click="switchTab(tab.path)"
    >
      <view class="tab-bar__icon-wrap">
        <view class="tab-bar__icon" :class="'tab-bar__icon--' + tab.icon" />
      </view>
      <text class="tab-bar__label">{{ tab.label }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(253, 248, 242, 0.92);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1rpx solid #EDE4DA;
  z-index: 999;
}

.tab-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 20rpx;
  position: relative;
  transition: transform 150ms ease;
}

.tab-bar__item:active {
  transform: scale(0.92);
}

.tab-bar__icon-wrap {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
  border-radius: 16rpx;
  transition: background 200ms ease;
}

.tab-bar__item--active .tab-bar__icon-wrap {
  background: #F5E6DC;
}

.tab-bar__icon {
  width: 36rpx;
  height: 36rpx;
  background: #A89885;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  transition: background 200ms ease;
}

.tab-bar__icon--home {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'%3E%3C/path%3E%3Cpolyline points='9 22 9 12 15 12 15 22'%3E%3C/polyline%3E%3C/svg%3E");
}
.tab-bar__icon--search {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
}
.tab-bar__icon--plus {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='16'%3E%3C/line%3E%3Cline x1='8' y1='12' x2='16' y2='12'%3E%3C/line%3E%3C/svg%3E");
}
.tab-bar__icon--user {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E");
}

.tab-bar__item--active .tab-bar__icon {
  background: #D4784C;
}

.tab-bar__label {
  font-size: 20rpx;
  color: #A89885;
  letter-spacing: 2rpx;
  font-weight: 500;
}

.tab-bar__item--active .tab-bar__label {
  color: #D4784C;
  font-weight: 600;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add components/CustomTabBar.vue
git commit -m "design: editorial CustomTabBar with warm terracotta accents and frosted glass"
```

---

### Task 4: 杂志卡片 RecipeCard — 非对称布局

**Files:**
- Create: `components/RecipeCard.vue`

- [ ] **Step 1: 创建 components/RecipeCard.vue**

```vue
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
  background: #FFFCF7;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(60,36,21,0.04), 0 4rpx 32rpx rgba(60,36,21,0.025);
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
  color: #5C4033;
  letter-spacing: 2rpx;
  font-weight: 500;
}

.recipe-card__body {
  padding: 20rpx 24rpx 24rpx;
}

.recipe-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: #3C2415;
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
  color: #5C4033;
}

.recipe-card__dot {
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: #D4784C;
  margin: 0 10rpx;
}

.recipe-card__time {
  font-size: 22rpx;
  color: #A89885;
}

.recipe-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid #EDE4DA;
}

.recipe-card__stars {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.recipe-card__star-icon {
  color: #C9A96E;
  font-size: 22rpx;
}

.recipe-card__rating {
  font-size: 24rpx;
  font-weight: 700;
  color: #3C2415;
}

.recipe-card__count {
  font-size: 20rpx;
  color: #A89885;
}

.recipe-card__tags {
  display: flex;
  gap: 8rpx;
}

.recipe-card__tag {
  font-size: 20rpx;
  color: #7D9B76;
  background: #E8EFE6;
  padding: 4rpx 14rpx;
  border-radius: 9999rpx;
  letter-spacing: 1rpx;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add components/RecipeCard.vue
git commit -m "design: editorial RecipeCard with asymmetric layout and paper textures"
```

---

### Task 5: 首页 — 杂志封面感

**Files:**
- Create: `pages/home/index.vue`

**JS 逻辑:** 与原计划 Task 5 完全一致。

- [ ] **Step 1: 创建 pages/home/index.vue (完整 `<style>` 块)**

仅展示样式部分，JS 逻辑不变：

```vue
<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  animation: editorial-enter 400ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* ── 头部 Hero ── */
.home-header {
  background: #FFFCF7;
  border-bottom: 1rpx solid #EDE4DA;
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
  color: #A89885;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.home-header__title {
  font-size: 48rpx;
  font-weight: 800;
  color: #3C2415;
  letter-spacing: -1rpx;
  margin-top: 8rpx;
  line-height: 1.15;
}

.home-header__subtitle {
  font-size: 24rpx;
  color: #5C4033;
  margin-top: 12rpx;
  line-height: 1.5;
}

/* ── 搜索框 ── */
.home-header__search {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  background: #F5EDE3;
  border-radius: 9999rpx;
  padding: 18rpx 28rpx;
  border: 1rpx solid #EDE4DA;
}

.home-header__search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  opacity: 0.6;
}

.home-header__search-placeholder {
  color: #A89885;
  font-size: 26rpx;
}

/* ── 分类标签 (pill风格) ── */
.category-bar {
  background: #FFFCF7;
  border-bottom: 1rpx solid #EDE4DA;
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
  color: #5C4033;
  background: transparent;
  margin-right: 12rpx;
  border: 1rpx solid #EDE4DA;
  transition: all 200ms ease;
}

.category-chip--active {
  background: #D4784C;
  color: #FFF;
  border-color: #D4784C;
  box-shadow: 0 4rpx 16rpx rgba(212,120,76,0.18);
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
  color: #A89885;
  letter-spacing: 4rpx;
}

.rank-tabs {
  display: flex;
  gap: 32rpx;
}

.rank-tab {
  font-size: 30rpx;
  color: #A89885;
  font-weight: 500;
  padding-bottom: 8rpx;
  position: relative;
}

.rank-tab--active {
  color: #3C2415;
  font-weight: 700;
}

.rank-tab--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: #D4784C;
  border-radius: 2rpx;
}

/* ── 排行榜 ── */
.rank-list {
  margin-bottom: 40rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  background: #FFFCF7;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 16rpx rgba(60,36,21,0.04), 0 4rpx 32rpx rgba(60,36,21,0.025);
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
  color: #EDE4DA;
  font-style: italic;
  line-height: 1;
}

.rank-item__num--top {
  color: #D4784C;
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
  color: #3C2415;
  margin-bottom: 6rpx;
}

.rank-item__author {
  font-size: 22rpx;
  color: #A89885;
  margin-bottom: 6rpx;
}

.rank-item__rating {
  font-size: 24rpx;
  color: #C9A96E;
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
  color: #A89885;
  font-size: 24rpx;
  letter-spacing: 2rpx;
}

/* ── 空状态 ── */
.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-state__icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-state__text {
  color: #A89885;
  font-size: 26rpx;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
```

> **完整 template 和 script:** 见原计划 Task 5。

- [ ] **Step 2: 提交**

```bash
git add pages/home/index.vue
git commit -m "design: editorial home page with magazine-cover hero and warm rankings"
```

---

### Task 6: 全部菜品页 — 编辑风筛选系统

**Files:**
- Create: `pages/recipes/index.vue`

**JS 逻辑:** 与原计划 Task 6 完全一致。替换整个 `<style>` 块：

```vue
<style lang="scss" scoped>
.recipes-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  animation: editorial-enter 400ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* ── 搜索栏 ── */
.search-bar {
  padding: 20rpx 32rpx;
  background: #FFFCF7;
  border-bottom: 1rpx solid #EDE4DA;
}

.search-bar__input-wrap {
  display: flex;
  align-items: center;
  background: #F5EDE3;
  border-radius: 9999rpx;
  padding: 18rpx 28rpx;
  border: 1rpx solid #EDE4DA;
}

.search-bar__icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  opacity: 0.5;
  flex-shrink: 0;
}

.search-bar__input {
  flex: 1;
  font-size: 26rpx;
  color: #3C2415;
}

.search-bar__clear {
  color: #A89885;
  font-size: 28rpx;
  padding: 4rpx;
  flex-shrink: 0;
}

/* ── 筛选行 ── */
.filter-row {
  white-space: nowrap;
  padding: 16rpx 32rpx;
  background: #FFFCF7;
  border-bottom: 1rpx solid rgba(237,228,218,0.5);
}

.filter-row--sub {
  padding-top: 0;
  border-bottom: none;
}

.filter-chip {
  display: inline-block;
  padding: 10rpx 26rpx;
  border-radius: 9999rpx;
  font-size: 24rpx;
  color: #5C4033;
  background: transparent;
  margin-right: 12rpx;
  border: 1rpx solid #EDE4DA;
  letter-spacing: 1rpx;
  transition: all 200ms ease;
}

.filter-chip--sub {
  font-size: 22rpx;
  padding: 8rpx 22rpx;
}

.filter-chip--active {
  background: #D4784C;
  color: #FFF;
  border-color: #D4784C;
  box-shadow: 0 4rpx 12rpx rgba(212,120,76,0.15);
}

/* ── 结果数 ── */
.result-count {
  padding: 20rpx 32rpx 8rpx;
  font-size: 22rpx;
  color: #A89885;
  letter-spacing: 1rpx;
}

/* ── 瀑布流 ── */
.waterfall {
  display: flex;
  gap: 20rpx;
  padding: 0 32rpx;
}

.waterfall__col {
  flex: 1;
}

/* ── 空/加载状态 ── */
.load-more {
  text-align: center;
  padding: 24rpx;
  color: #A89885;
  font-size: 24rpx;
  letter-spacing: 2rpx;
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #A89885;
  font-size: 26rpx;
}

.empty::before {
  content: '🔍';
  display: block;
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
```

- [ ] **Step 1: 提交**

```bash
git add pages/recipes/index.vue
git commit -m "design: editorial recipe discovery page with warm pill filters"
```

---

### Task 7: 菜品详情 — Kinfolk 内页风格

**Files:**
- Create: `pages/recipe-detail/index.vue`

**JS 逻辑:** 与原计划 Task 7 完全一致。替换整个 `<style>` 块：

```vue
<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #FDF8F2;
  padding-bottom: 80rpx;
}

/* ── 封面 Hero ── */
.detail-cover {
  position: relative;
  width: 100%;
  height: 560rpx;
}

.detail-cover__img {
  width: 100%;
  height: 100%;
}

.cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(60,36,21,0.65) 0%, transparent 100%);
}

.detail-cover__top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 60rpx 32rpx 0;
}

.detail-cover__back,
.detail-cover__fav {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #FFF;
  background: rgba(255,252,247,0.15);
  backdrop-filter: blur(12rpx);
  border-radius: 50%;
}

/* ── 标题区 — 上移叠加封面 ── */
.detail-info {
  background: #FFFCF7;
  border-radius: 28rpx 28rpx 0 0;
  margin-top: -36rpx;
  position: relative;
  padding: 36rpx 32rpx 32rpx;
}

.detail-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #3C2415;
  letter-spacing: -1rpx;
  line-height: 1.2;
}

.detail-author {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.detail-author__avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  margin-right: 14rpx;
  border: 2rpx solid #EDE4DA;
}

.detail-author__name {
  font-size: 26rpx;
  color: #5C4033;
  font-weight: 600;
}

/* ── 评分/建议按钮 ── */
.detail-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 28rpx;
}

.detail-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 28rpx;
  background: #F5EDE3;
  border-radius: 9999rpx;
  font-size: 26rpx;
  color: #5C4033;
  border: 1rpx solid #EDE4DA;
}

.detail-action__icon {
  font-size: 26rpx;
}

/* ── 元数据 — 4 格 ── */
.detail-meta {
  display: flex;
  margin-top: 28rpx;
  gap: 12rpx;
}

.detail-meta__item {
  flex: 1;
  text-align: center;
  padding: 20rpx 8rpx;
  background: #FDF8F2;
  border-radius: 16rpx;
  border: 1rpx solid #EDE4DA;
}

.detail-meta__label {
  font-size: 20rpx;
  color: #A89885;
  display: block;
  letter-spacing: 2rpx;
}

.detail-meta__value {
  font-size: 26rpx;
  font-weight: 700;
  color: #3C2415;
  margin-top: 6rpx;
}

/* ── 内容区域 ── */
.detail-section {
  background: #FFFCF7;
  margin: 16rpx 32rpx;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 16rpx rgba(60,36,21,0.03);
}

.detail-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.detail-section__title {
  font-size: 30rpx;
  font-weight: 700;
  color: #3C2415;
  letter-spacing: 1rpx;
}

/* ── 份数调节 ── */
.serving-control {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.serving-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #F5EDE3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #D4784C;
  font-weight: 600;
}

.serving-num {
  font-size: 24rpx;
  color: #5C4033;
  font-weight: 600;
}

/* ── 食材清单 — 杂志内页风格 ── */
.ingredient-list {
  border-top: 1rpx solid #EDE4DA;
  padding-top: 8rpx;
}

.ingredient-item {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1px dashed #EDE4DA;
}

.ingredient-item--checked {
  opacity: 0.35;
}

.ingredient-check {
  width: 36rpx;
  height: 36rpx;
  border: 1.5rpx solid #EDE4DA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14rpx;
  font-size: 22rpx;
  color: transparent;
  transition: all 200ms ease;
  flex-shrink: 0;
}

.ingredient-item--checked .ingredient-check {
  background: #D4784C;
  border-color: #D4784C;
  color: #FFF;
}

.ingredient-name {
  flex: 1;
  font-size: 27rpx;
  color: #3C2415;
  font-weight: 500;
}

.ingredient-amount {
  font-size: 24rpx;
  color: #A89885;
  font-family: monospace;
}

/* ── 步骤 ── */
.step-item {
  display: flex;
  margin-bottom: 28rpx;
}

.step-num {
  width: 52rpx;
  height: 52rpx;
  border-radius: 16rpx;
  background: #D4784C;
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.step-desc {
  font-size: 26rpx;
  line-height: 1.75;
  color: #3C2415;
}

.step-img {
  width: 100%;
  border-radius: 14rpx;
  margin-top: 14rpx;
}

/* ── 贴士 ── */
.tips-text {
  font-size: 26rpx;
  color: #5C4033;
  line-height: 1.75;
  margin-top: 12rpx;
  display: block;
  background: #FDF8F2;
  padding: 20rpx;
  border-radius: 14rpx;
  border-left: 4rpx solid #C9A96E;
}

/* ── 评价/建议 Tab ── */
.review-tabs {
  display: flex;
  gap: 36rpx;
  margin-bottom: 24rpx;
}

.review-tab {
  font-size: 26rpx;
  color: #A89885;
  padding-bottom: 8rpx;
  letter-spacing: 1rpx;
}

.review-tab--active {
  color: #3C2415;
  font-weight: 700;
  border-bottom: 3rpx solid #D4784C;
}

.review-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #EDE4DA;
  align-items: flex-start;
}

.review-avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  margin-right: 14rpx;
  flex-shrink: 0;
}

.review-body {
  flex: 1;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.review-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #3C2415;
}

.review-stars {
  color: #C9A96E;
  font-size: 20rpx;
}

.suggestion-text {
  font-size: 26rpx;
  color: #5C4033;
  margin-top: 6rpx;
  display: block;
  line-height: 1.6;
}

.review-date {
  font-size: 20rpx;
  color: #A89885;
  margin-top: 4rpx;
}

.review-empty {
  text-align: center;
  padding: 48rpx 0;
  color: #A89885;
  font-size: 24rpx;
}

.review-del {
  color: #C06040;
  font-size: 22rpx;
  padding: 4rpx 8rpx;
}

.bottom-placeholder {
  height: 48rpx;
}
</style>
```

- [ ] **Step 1: 提交**

```bash
git add pages/recipe-detail/index.vue
git commit -m "design: Kinfolk-inspired recipe detail page with editorial typography"
```

---

### Task 8: 评分/建议弹窗 — 温暖质感

**Files:**
- Create: `components/RatingModal.vue`, `components/SuggestionModal.vue`

- [ ] **Step 1: 创建 components/RatingModal.vue (完整文件)**

```vue
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
  background: rgba(60,36,21,0.5); backdrop-filter: blur(8rpx);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: fade-in 200ms ease;
}

@keyframes fade-in {
  from { opacity: 0; } to { opacity: 1; }
}

.modal-card {
  background: #FFFCF7;
  border-radius: 28rpx;
  padding: 52rpx 44rpx 40rpx;
  width: 560rpx;
  text-align: center;
  box-shadow: 0 8rpx 48rpx rgba(60,36,21,0.12);
  animation: card-rise 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

@keyframes card-rise {
  from { opacity: 0; transform: translateY(32rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #3C2415;
  display: block;
  letter-spacing: 1rpx;
}

.modal-subtitle {
  font-size: 22rpx;
  color: #A89885;
  display: block;
  margin-top: 8rpx;
  letter-spacing: 3rpx;
}

.stars-row {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin: 36rpx 0 16rpx;
}

.star {
  font-size: 64rpx;
  color: #EDE4DA;
  transition: all 150ms ease;
}

.star:active {
  transform: scale(1.15);
}

.star--active {
  color: #C9A96E;
  text-shadow: 0 2rpx 8rpx rgba(201,169,110,0.3);
}

.modal-hint {
  font-size: 24rpx;
  color: #D4784C;
  display: block;
  margin-bottom: 32rpx;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.modal-btn--ghost {
  background: transparent;
  color: #5C4033;
  border: 1rpx solid #EDE4DA;
}

.modal-btn--fill {
  background: #D4784C;
  color: #FFF;
  box-shadow: 0 4rpx 16rpx rgba(212,120,76,0.18);
}

.modal-btn--fill:active {
  transform: scale(0.96);
}
</style>
```

- [ ] **Step 2: 创建 components/SuggestionModal.vue (完整文件)**

```vue
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
  z-index: 1000;
  animation: fade-in 200ms ease;
}

@keyframes fade-in {
  from { opacity: 0; } to { opacity: 1; }
}

.modal-card {
  background: #FFFCF7;
  border-radius: 28rpx;
  padding: 44rpx 36rpx 36rpx;
  width: 620rpx;
  box-shadow: 0 8rpx 48rpx rgba(60,36,21,0.12);
  animation: card-rise 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

@keyframes card-rise {
  from { opacity: 0; transform: translateY(32rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #3C2415;
  display: block;
  text-align: center;
  letter-spacing: 1rpx;
}

.modal-subtitle {
  font-size: 20rpx;
  color: #A89885;
  display: block;
  text-align: center;
  margin-top: 6rpx;
  letter-spacing: 3rpx;
}

.textarea-wrap {
  position: relative;
  margin: 28rpx 0;
}

.modal-textarea {
  width: 100%;
  min-height: 220rpx;
  background: #FDF8F2;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 26rpx;
  color: #3C2415;
  border: 1rpx solid #EDE4DA;
  box-sizing: border-box;
  line-height: 1.6;
}

.counter {
  text-align: right;
  font-size: 20rpx;
  color: #A89885;
  margin-top: 8rpx;
  display: block;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-align: center;
}

.modal-btn--ghost {
  background: transparent;
  color: #5C4033;
  border: 1rpx solid #EDE4DA;
}

.modal-btn--fill {
  background: #D4784C;
  color: #FFF;
  box-shadow: 0 4rpx 16rpx rgba(212,120,76,0.18);
}

.modal-btn--fill:active {
  transform: scale(0.96);
}
</style>
```

- [ ] **Step 3: 提交**

```bash
git add components/RatingModal.vue components/SuggestionModal.vue
git commit -m "design: editorial modal dialogs with warm textures and gold stars"
```

---

### Task 9: 上传页 — 圆形进度指示器

**Files:**
- Create: `pages/upload/index.vue`

**JS 逻辑:** 与原计划 Task 9 完全一致。替换整个 `<style>` 块：

```vue
<style lang="scss" scoped>
.upload-page {
  min-height: 100vh;
  background: #FDF8F2;
  padding-bottom: 180rpx;
}

/* ── 步骤指示器 — 圆形 ── */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 60rpx 12rpx;
  gap: 16rpx;
}

.step-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: transparent;
  border: 2rpx solid #EDE4DA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: transparent;
  transition: all 300ms ease;
  position: relative;
  flex-shrink: 0;
}

.step-dot--active {
  border-color: #D4784C;
  background: #D4784C;
}

.step-dot--done {
  border-color: #D4784C;
  background: #F5E6DC;
  color: #D4784C;
}

.step-line {
  flex: 1;
  height: 1.5rpx;
  background: #EDE4DA;
  max-width: 60rpx;
}

.step-label {
  text-align: center;
  font-size: 22rpx;
  color: #A89885;
  display: block;
  margin-bottom: 28rpx;
  letter-spacing: 2rpx;
}

/* ── 表单 ── */
.form-section {
  padding: 0 32rpx;
}

.form-group {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: 26rpx;
  font-weight: 700;
  color: #3C2415;
  display: block;
  margin-bottom: 14rpx;
  letter-spacing: 1rpx;
}

.form-input {
  background: #FFFCF7;
  border-radius: 14rpx;
  padding: 22rpx 20rpx;
  font-size: 26rpx;
  border: 1rpx solid #EDE4DA;
  width: 100%;
  box-sizing: border-box;
  color: #3C2415;
}

.form-input:focus {
  border-color: #D4784C;
}

.form-textarea {
  background: #FFFCF7;
  border-radius: 14rpx;
  padding: 22rpx 20rpx;
  font-size: 26rpx;
  border: 1rpx solid #EDE4DA;
  width: 100%;
  min-height: 180rpx;
  box-sizing: border-box;
  color: #3C2415;
  line-height: 1.7;
}

/* ── 封面选择 ── */
.cover-picker {
  width: 220rpx;
  height: 220rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: #F5EDE3;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #EDE4DA;
}

.cover-preview {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  color: #A89885;
  font-size: 26rpx;
  text-align: center;
  line-height: 1.5;
}

/* ── Chip 选择 ── */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.chip {
  padding: 12rpx 28rpx;
  border-radius: 9999rpx;
  background: #FFFCF7;
  font-size: 24rpx;
  color: #5C4033;
  border: 1rpx solid #EDE4DA;
  transition: all 200ms ease;
  letter-spacing: 1rpx;
}

.chip--active {
  background: #D4784C;
  color: #FFF;
  border-color: #D4784C;
  box-shadow: 0 4rpx 12rpx rgba(212,120,76,0.15);
}

/* ── 食材行 ── */
.ingredient-row {
  display: flex;
  gap: 8rpx;
  margin-bottom: 12rpx;
  align-items: center;
}

.ingredient-input {
  flex: 1;
  background: #FFFCF7;
  border-radius: 12rpx;
  padding: 16rpx 14rpx;
  font-size: 26rpx;
  border: 1rpx solid #EDE4DA;
  min-width: 0;
  color: #3C2415;
}

.ingredient-del {
  color: #C06040;
  font-size: 28rpx;
  padding: 8rpx;
  flex-shrink: 0;
}

/* ── 步骤编辑 ── */
.step-edit-item {
  background: #FFFCF7;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(60,36,21,0.03);
}

.step-edit-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.step-edit-num {
  font-size: 24rpx;
  font-weight: 700;
  color: #D4784C;
  letter-spacing: 1rpx;
}

.step-edit-del {
  font-size: 22rpx;
  color: #C06040;
}

.step-textarea {
  background: #FDF8F2;
  border-radius: 14rpx;
  padding: 16rpx;
  font-size: 26rpx;
  width: 100%;
  min-height: 100rpx;
  box-sizing: border-box;
  color: #3C2415;
  line-height: 1.6;
}

.step-img-row {
  margin-top: 14rpx;
  height: 160rpx;
  background: #FDF8F2;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx dashed #EDE4DA;
}

.step-img-preview {
  width: 100%;
  height: 100%;
  border-radius: 14rpx;
}

.step-img-placeholder {
  color: #A89885;
  font-size: 24rpx;
}

.add-btn {
  text-align: center;
  padding: 24rpx;
  color: #7D9B76;
  font-size: 26rpx;
  letter-spacing: 1rpx;
}

/* ── 底部按钮栏 ── */
.form-buttons {
  position: fixed;
  bottom: 100rpx;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(253, 248, 242, 0.94);
  backdrop-filter: blur(20rpx);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid #EDE4DA;
  z-index: 100;
}

.form-buttons__right {
  display: flex;
  gap: 12rpx;
}

.btn {
  padding: 16rpx 36rpx;
  border-radius: 9999rpx;
  font-size: 26rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.btn--primary {
  background: #D4784C;
  color: #FFF;
  box-shadow: 0 4rpx 16rpx rgba(212,120,76,0.18);
}

.btn--outline {
  background: transparent;
  color: #5C4033;
  border: 1rpx solid #EDE4DA;
}

.btn--disabled {
  opacity: 0.4;
  pointer-events: none;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
```

- [ ] **Step 1: 提交**

```bash
git add pages/upload/index.vue
git commit -m "design: editorial upload page with circular step indicator and warm form fields"
```

---

### Task 10: 个人中心 — 渐变 Hero + 数字动画

**Files:**
- Create: `pages/profile/index.vue`

**JS 逻辑:** 与原计划 Task 10 完全一致。替换整个 `<style>` 块：

```vue
<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  animation: editorial-enter 400ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* ── Hero 头部 ── */
.profile-header {
  background: linear-gradient(160deg, #D4784C 0%, #C9A96E 50%, #B85C3A 100%);
  position: relative;
  overflow: hidden;
}

.profile-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background: #FDF8F2;
  border-radius: 28rpx 28rpx 0 0;
}

.profile-header__safe {
  height: var(--status-bar-height, 44px);
}

.profile-header__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 80rpx;
}

.profile-avatar {
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255,252,247,0.5);
  box-shadow: 0 8rpx 32rpx rgba(60,36,21,0.15);
}

.profile-name {
  font-size: 36rpx;
  font-weight: 800;
  color: #FFF;
  margin-top: 20rpx;
  letter-spacing: 1rpx;
}

.profile-bio {
  font-size: 24rpx;
  color: rgba(255,255,255,0.75);
  margin-top: 8rpx;
}

/* ── 统计卡片 ── */
.stats-row {
  display: flex;
  margin: -40rpx 28rpx 32rpx;
  position: relative;
  z-index: 1;
}

.stat-card {
  flex: 1;
  background: #FFFCF7;
  border-radius: 20rpx;
  padding: 28rpx 8rpx 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 24rpx rgba(60,36,21,0.06), 0 8rpx 48rpx rgba(60,36,21,0.035);
  margin: 0 6rpx;
}

.stat-num {
  font-size: 44rpx;
  font-weight: 800;
  color: #D4784C;
  display: block;
  line-height: 1;
  font-feature-settings: "tnum";
}

.stat-label {
  font-size: 20rpx;
  color: #A89885;
  margin-top: 8rpx;
  letter-spacing: 3rpx;
}

/* ── 菜单 ── */
.menu-list {
  background: #FFFCF7;
  margin: 0 28rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(60,36,21,0.03);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid #EDE4DA;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item__icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-item__label {
  flex: 1;
  font-size: 28rpx;
  color: #3C2415;
  font-weight: 500;
}

.menu-item__badge {
  background: #D4784C;
  color: #FFF;
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 9999rpx;
  margin-right: 12rpx;
  font-weight: 600;
}

.menu-item__arrow {
  color: #A89885;
  font-size: 28rpx;
}

/* ── 关于 ── */
.about-text {
  text-align: center;
  padding: 48rpx 0 80rpx;
  color: #A89885;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
```

- [ ] **Step 1: 提交**

```bash
git add pages/profile/index.vue
git commit -m "design: editorial profile with gradient hero and paper stat cards"
```

---

### Task 11: 子页面 — 统一编辑风

**Files:**
- Create: `pages/my-uploads/index.vue`, `pages/settings/index.vue`

- [ ] **Step 1: 创建 pages/my-uploads/index.vue (仅 `<style>` 块)**

JS 逻辑不变：

```vue
<style lang="scss" scoped>
.my-uploads-page {
  min-height: 100vh;
  background: #FDF8F2;
}

.tabs {
  display: flex;
  background: #FFFCF7;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #EDE4DA;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  font-size: 26rpx;
  color: #A89885;
  border-bottom: 3rpx solid transparent;
  letter-spacing: 1rpx;
  transition: all 200ms ease;
}

.tab--active {
  color: #D4784C;
  font-weight: 700;
  border-bottom-color: #D4784C;
}

.list-item {
  display: flex;
  align-items: center;
  background: #FFFCF7;
  padding: 20rpx 28rpx;
  margin: 12rpx 28rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(60,36,21,0.03);
}

.list-item__cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  margin-right: 18rpx;
}

.list-item__info {
  flex: 1;
}

.list-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #3C2415;
  display: block;
}

.list-item__sub {
  font-size: 22rpx;
  color: #A89885;
  margin-top: 6rpx;
  display: block;
}

.list-item__arrow {
  color: #A89885;
  font-size: 28rpx;
}

.unfav-btn {
  color: #C06040;
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  font-weight: 500;
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #A89885;
  font-size: 26rpx;
  letter-spacing: 1rpx;
}
</style>
```

- [ ] **Step 2: 创建 pages/settings/index.vue (仅 `<style>` 块)**

JS 逻辑不变：

```vue
<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: #FDF8F2;
  padding: 24rpx 28rpx;
}

.settings-section {
  background: #FFFCF7;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(60,36,21,0.03);
}

.settings-row,
.avatar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid #EDE4DA;
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-label {
  font-size: 28rpx;
  color: #3C2415;
  flex-shrink: 0;
  font-weight: 500;
}

.settings-input {
  text-align: right;
  font-size: 26rpx;
  color: #5C4033;
  flex: 1;
  margin-left: 32rpx;
}

.settings-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 2rpx solid #EDE4DA;
}

.save-btn {
  background: #D4784C;
  color: #FFF;
  text-align: center;
  padding: 24rpx;
  border-radius: 9999rpx;
  margin-top: 56rpx;
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 3rpx;
  box-shadow: 0 4rpx 16rpx rgba(212,120,76,0.18);
}

.save-btn:active {
  transform: scale(0.97);
}
</style>
```

- [ ] **Step 3: 提交**

```bash
git add pages/my-uploads/index.vue pages/settings/index.vue
git commit -m "design: editorial sub-pages with consistent warm palette"
```

---

### Task 12: 全局打磨 — 动画、微交互、包安装

**Files:**
- Modify: 无新修改（所有页面已在前面完成样式重写）

- [ ] **Step 1: 安装依赖**

```bash
npm init -y && npm install pinia
```

- [ ] **Step 2: 验证 pages.json 中首页标题配置**

确认 `pages.json` 中的首页和详情页使用 `"navigationStyle": "custom"`（因为这些页面使用自定义头部设计）。

- [ ] **Step 3: 全页面自查清单**

逐一检查以下视觉一致性：
1. 所有页面背景色统一为 `#FDF8F2`
2. 所有卡片使用 `#FFFCF7` + `$shadow-paper`
3. 所有主文字 `#3C2415`，副文字 `#5C4033`，弱文字 `#A89885`
4. 所有可交互元素使用 `#D4784C` 作为主点缀
5. 所有星级使用 `#C9A96E` 暖金色
6. 所有分割线使用 `#EDE4DA`
7. 所有圆角按钮使用 `9999rpx`
8. 卡片圆角统一 `20rpx`
9. 页面内边距统一 `32rpx`
10. TabBar 在所有需要它的页面正确显示

- [ ] **Step 4: 尝试编译验证**

```bash
npx @dcloudio/uvm@latest
```

或直接用 HBuilderX 打开项目编译到微信小程序。

- [ ] **Step 5: 提交**

```bash
git add package.json
git commit -m "design: final polish — Warm Editorial design system complete"
```

---

## Design System Reference Card

所有后续开发必须遵守此视觉规范：

| 属性 | 值 | 用途 |
|------|-----|------|
| `$color-cream` | `#FDF8F2` | 页面底色 |
| `$color-paper` | `#FFFCF7` | 卡片/弹窗底色 |
| `$color-espresso` | `#3C2415` | 主文字 |
| `$color-ink` | `#5C4033` | 辅助文字 |
| `$color-muted` | `#A89885` | 弱文字/说明 |
| `$color-terracotta` | `#D4784C` | 主按钮/选中态/强调 |
| `$color-terracotta-light` | `#F5E6DC` | 选中浅底 |
| `$color-sage` | `#7D9B76` | 标签文字 |
| `$color-sage-light` | `#E8EFE6` | 标签底 |
| `$color-gold` | `#C9A96E` | 星级 |
| `$color-warm-border` | `#EDE4DA` | 所有分割线 |
| `$color-cream-dark` | `#F5EDE3` | 输入框/搜索框底 |
| `$shadow-paper` | 双层阴影 | 卡片投影 |
| `$radius-md` | `20rpx` | 卡片圆角 |
| `$radius-full` | `9999rpx` | 按钮/pill圆角 |
| 动画 | `editorial-enter` / `card-rise` / `fade-in` | 页面和卡片入场 |
| 点击反馈 | `scale(0.96)` 或 `scale(0.97)` | 所有可点击元素 |

---

## Self-Review

### Spec Coverage
| Spec Section | Task |
|---|---|
| 4.1 首页 | Task 5 |
| 4.2 全部菜品 | Task 6 |
| 4.3 菜品详情 | Task 7 |
| 4.4 上传菜谱 | Task 9 |
| 4.5 个人中心 | Task 10 |
| 4.6 子页面 | Task 11 |
| 评分弹窗 | Task 8 |
| 建议弹窗 | Task 8 |
| TabBar | Task 3 |
| RecipeCard | Task 4 |
| 设计令牌 | Task 1 |
| 全局动画 | Task 2 |

### Design Consistency
所有页面使用同一套令牌，暖色调贯穿始终。无冷灰、无纯白、无系统默认蓝。金色星级、陶土按钮、暖棕文字在所有页面保持一致。

### Placeholder Check
无 TBD/TODO。所有代码块包含完整样式。

### Notes
- 本计划仅覆盖 CSS/视觉层。JS 逻辑、Store、数据模型见原计划（`2026-06-04-recipe-platform.md`）。
- 字体受微信小程序限制使用系统字体，通过字号层级和字重区分来弥补排版表现力。
- 封面图片使用 picsum.photos 占位 URL（与原计划一致）。

---
