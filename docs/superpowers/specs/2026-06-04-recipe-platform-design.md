# 小圈子菜谱共享平台 设计规格说明书

**文档版本**：V1.0
**日期**：2026-06-04
**技术栈**：uni-app + Vue 3 + SCSS + Pinia
**目标平台**：微信小程序

---

## 一、整体架构

```
uni-app (Vue 3 + SCSS + Pinia)
├── 底部自定义 TabBar (4 tabs: 首页/全部菜品/上传/个人中心)
├── 7 个独立 page
│   ├── pages/home/index            ← 首页
│   ├── pages/recipes/index         ← 全部菜品页 (含搜索模式)
│   ├── pages/recipe-detail/index   ← 菜品详情
│   ├── pages/upload/index          ← 上传菜谱 (4步表单)
│   ├── pages/profile/index         ← 个人中心
│   ├── pages/my-uploads/index      ← 我的上传列表
│   └── pages/settings/index        ← 个人设置
├── 弹窗组件
│   ├── components/RatingModal        ← 1-5星评分
│   └── components/SuggestionModal    ← 写建议
└── Pinia Stores
    ├── stores/recipe.ts              ← 菜谱 CRUD + 搜索 + 筛选 + 评分 + 建议
    ├── stores/user.ts                ← 当前用户 + 收藏
    └── stores/upload.ts              ← 上传草稿管理
```

### 页面与弹窗划分

| 独立页面 (7) | 弹窗/子页面 (5) |
|---|---|
| 首页、全部菜品、菜品详情、上传菜谱、个人中心、我的上传列表、个人设置 | 搜索结果（全部菜品页+query参数）、评分弹窗、建议弹窗、收藏列表（个人中心子页）、建议列表（个人中心子页） |

---

## 二、视觉系统 (Fresh Harvest Style)

| 令牌 | 值 | 用途 |
|---|---|---|
| `--color-brand` | `#52C41A` | 品牌主色：按钮、tab选中、星级、强调 |
| `--color-bg` | `#FBF8FD` | 页面底色 |
| `--color-card` | `#FFFFFF` | 卡片背景 |
| `--color-text` | `#1a1a1a` | 主文字 |
| `--color-text-secondary` | `#999999` | 辅助文字 |
| `--radius-base` | `16rpx` | 全局圆角 |
| `--radius-full` | `9999rpx` | 搜索框/浮动按钮全圆角 |
| `--shadow-card` | `0 2rpx 16rpx rgba(0,0,0,0.06)` | 卡片阴影 |

- **字体**：中文系统默认，英文/数字可用 `Plus Jakarta Sans`（小程序不加载外部字体，降级为系统字体）
- **间距**：卡片间距 `24rpx`，内边距 `24rpx`
- **动画**：页面进入 `fade-in-up`（opacity 0→1 + translateY 16rpx→0，300ms），点击 `active: scale(0.95)`
- **图片占位**：使用 unsplash/picsum 食物类图片 URL

---

## 三、数据模型

```typescript
interface User {
  id: string
  name: string
  avatar: string
  bio: string
}

interface Recipe {
  id: string
  title: string
  coverImage: string
  author: User
  rating: number           // 0-5
  ratingCount: number
  createdAt: string        // ISO
  duration: number         // 分钟
  difficulty: '简单' | '中等' | '困难'
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert'
  cuisine: string
  tags: string[]
  servings: number
  ingredients: { name: string; amount: string; unit: string }[]
  steps: { id: number; desc: string; image?: string }[]
  tips: string
  crowd: string
  reviews: Review[]
  suggestions: Suggestion[]
}

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number           // 1-5
  date: string
}

interface Suggestion {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  date: string
}
```

**Mock 数据**：复用 H5 参考项目 `data.ts` 中 6 条菜谱，覆盖 4 分类、3 难度等级。

**枚举数据**：
- 分类：全部、早餐、午餐、晚餐、甜点
- 菜系：川菜、粤菜、鲁菜、苏菜、其他
- 标签：减脂、素食、精选、快手菜

---

## 四、页面详情

### 4.1 首页 (pages/home/index)

**布局**：标题 → 搜索框 → 分类横向滚动标签 → 热门排行榜(3 tab) → 最新上传(双列瀑布流)

**交互**：
- 搜索框聚焦跳转全部菜品页 + 搜索参数
- 排行榜按平均星级降序，前三名大号数字标识
- 瀑布流按上传时间倒序
- 下拉刷新 + 上拉加载更多

### 4.2 全部菜品页 (pages/recipes/index)

**布局**：导航栏 + 返回 → 搜索框 → 一级分类标签(横向) → 二级标签(横向) → 双列瀑布流

**交互**：
- 搜索与筛选可叠加（AND 逻辑）
- 从详情页食材名跳转 → URL 带 query 参数自动搜索
- 点击卡片进入详情
- 下拉刷新 + 上拉加载

### 4.3 菜品详情页 (pages/recipe-detail/index)

**布局**：全屏封面图(含收藏按钮) → 基本信息 → 评分/建议按钮 → 元数据(时长/难度/分类/人群) → 食材清单(份数滑块 + 勾选) → 制作步骤 + 厨神贴士 → 底部评分/建议列表(两tab)

**特殊交互**：
- 食材份数滑块调节比例
- 点击食材名 → 跳转全部菜品页搜索该食材
- 评分弹窗：1-5 星，用户覆盖上次记录
- 建议弹窗：文本输入，覆盖上次记录
- 用户可编辑/删除自己的评分和建议

### 4.4 上传菜谱页 (pages/upload/index)

**4 步表单**：
1. 基础信息（名称、封面图、难度、时长、人数）
2. 食材清单（动态增删，名称+用量+单位）
3. 制作步骤（动态增删，每步可附图，长按拖拽排序）
4. 补充信息（分类、菜系、标签、人群、贴士、营养信息）

**草稿**：每步自动保存到 Pinia + `uni.setStorageSync`，草稿箱在个人中心

### 4.5 个人中心 (pages/profile/index)

**布局**：头像昵称 → 4 统计卡片(上传/评价/建议/收藏) → 功能入口列表 → 关于/退出

### 4.6 子页面

- **我的上传列表**：已发布/审核中/草稿 三 tab
- **收藏列表**：卡片列表，可取消收藏
- **建议列表**：可跳转详情页编辑
- **个人设置**：修改昵称/头像/简介（本地存储）

---

## 五、Pinia Store 设计

### recipeStore
- `recipes: Recipe[]` — 所有菜谱
- `searchQuery: string` — 搜索词
- `activeCategory: string` — 当前分类
- `activeFilters: { cuisine, tags }` — 筛选条件
- `getters`: filteredRecipes, topRanked, latestRecipes, recipeById
- `actions`: addRecipe, updateRecipe, deleteRecipe, rateRecipe, suggestRecipe, searchRecipes

### userStore
- `currentUser: User` — 当前登录用户（mock）
- `favorites: string[]` — 收藏的 recipe id 列表
- `myReviews: { recipeId, rating, date }[]`
- `mySuggestions: { recipeId, content, date }[]`
- `actions`: toggleFavorite, addReview, addSuggestion, updateProfile

### uploadStore
- `drafts: Draft[]` — 草稿列表
- `currentDraft: Draft | null`
- `actions`: saveDraft, loadDraft, deleteDraft, clearCurrentDraft

---

## 六、实现顺序

1. 项目基础配置（pages.json、manifest.json、全局 SCSS、Pinia 初始化）
2. Mock 数据 + Pinia stores
3. 自定义 TabBar 组件
4. 首页
5. 全部菜品页
6. 菜品详情页（含评分/建议弹窗）
7. 上传菜谱页
8. 个人中心页
9. 子页面（我的上传、收藏、建议、设置）
10. 全局动画/交互打磨

---

## 七、约束与假设

- 所有数据本地 mock，不依赖后端
- 图片使用网络占位图 URL
- 微信登录仅保留入口，实际登录逻辑置换为 mock 用户
- 发布为微信小程序，不使用 H5 专属 API
- 样式方案：rpx + SCSS（不使用 Tailwind）
- TabBar：自定义组件
