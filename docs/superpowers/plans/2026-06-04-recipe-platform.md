# 小圈子菜谱共享平台 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 uni-app + Vue 3 + Pinia 的微信小程序菜谱共享平台，包含首页、全部菜品、菜品详情、上传菜谱、个人中心等 7 个页面。

**Architecture:** uni-app Vue 3 单页应用，Pinia 管理状态，SCSS 处理样式。所有数据本地 mock，自定义 TabBar 组件实现底部导航。页面间通过 Pinia store 和 URL query 参数通信。Composition API (`<script setup>`) 统一编码风格。

**Tech Stack:** uni-app (Vue 3 + Composition API) + Pinia + SCSS + 微信小程序

**文件清单:**
```
Create  data/recipes.ts
Create  stores/recipe.ts, stores/user.ts, stores/upload.ts
Create  components/CustomTabBar.vue, components/RecipeCard.vue, components/RatingModal.vue, components/SuggestionModal.vue
Create  pages/home/index.vue, pages/recipes/index.vue, pages/recipe-detail/index.vue, pages/upload/index.vue, pages/profile/index.vue, pages/my-uploads/index.vue, pages/settings/index.vue
Modify  pages.json, main.js, App.vue, manifest.json, uni.scss
Delete  pages/index/index.vue
```

---
### Task 1: 项目基础配置

**Files:**
- Modify: `pages.json`, `manifest.json`, `uni.scss`, `main.js`, `App.vue`
- Delete: `pages/index/index.vue`

- [ ] **Step 1: 配置 pages.json — 注册全部页面 + 自定义 TabBar**

Replace `pages.json`:

```json
{
  "pages": [
    {
      "path": "pages/home/index",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "pages/recipes/index",
      "style": { "navigationBarTitleText": "全部菜品" }
    },
    {
      "path": "pages/recipe-detail/index",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "pages/upload/index",
      "style": { "navigationBarTitleText": "上传菜谱" }
    },
    {
      "path": "pages/profile/index",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "pages/my-uploads/index",
      "style": { "navigationBarTitleText": "我的上传" }
    },
    {
      "path": "pages/settings/index",
      "style": { "navigationBarTitleText": "个人设置" }
    }
  ],
  "tabBar": {
    "custom": true,
    "list": [
      { "pagePath": "pages/home/index", "text": "首页" },
      { "pagePath": "pages/recipes/index", "text": "全部菜品" },
      { "pagePath": "pages/upload/index", "text": "上传" },
      { "pagePath": "pages/profile/index", "text": "我的" }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "菜谱",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#FBF8FD"
  },
  "uniIdRouter": {}
}
```

- [ ] **Step 2: 更新 manifest.json — 修改 name 字段**

Line 2: change `"name": "大"` → `"name": "小圈子菜谱"`

- [ ] **Step 3: 添加设计令牌到 uni.scss**

Append to `uni.scss`:
```scss
/* === 品牌令牌 === */
$color-brand: #52C41A;
$color-bg: #FBF8FD;
$color-card: #FFFFFF;
$color-text: #1a1a1a;
$color-text-secondary: #999999;
$radius-base: 16rpx;
$radius-full: 9999rpx;
$shadow-card: 0 2rpx 16rpx rgba(0,0,0,0.06);

page {
  background-color: $color-bg;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: $color-text;
  font-size: 28rpx;
}
```

- [ ] **Step 4: 在 main.js 中注册 Pinia**

Replace `main.js`:
```js
import App from './App'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app }
}
```

- [ ] **Step 5: 更新 App.vue**

Replace `App.vue`:
```vue
<script setup>
</script>

<template></template>

<style lang="scss">
@import '@/uni.scss';
</style>
```

> CustomTabBar 组件在各 tab 页面内独立引入。

- [ ] **Step 6: 删除模板页面**

```bash
rm pages/index/index.vue
```

- [ ] **Step 7: 提交**

```bash
git add pages.json manifest.json uni.scss main.js App.vue
git rm pages/index/index.vue
git commit -m "feat: configure project foundation with Pinia, design tokens, and page routes"
```

---

### Task 2: Mock 数据与枚举常量

**Files:**
- Create: `data/recipes.ts`

- [ ] **Step 1: 创建 data/recipes.ts — 6 条菜谱 + 枚举常量**

```typescript
// === 枚举常量 ===
export const CATEGORIES = ['全部', '早餐', '午餐', '晚餐', '甜点'] as const
export const CATEGORY_MAP: Record<string, string> = {
  '全部': 'all', '早餐': 'breakfast', '午餐': 'lunch', '晚餐': 'dinner', '甜点': 'dessert'
}
export const CATEGORY_REVERSE_MAP: Record<string, string> = {
  'breakfast': '早餐', 'lunch': '午餐', 'dinner': '晚餐', 'dessert': '甜点'
}

export const CUISINES = ['川菜', '粤菜', '鲁菜', '苏菜', '其他']
export const TAGS = ['减脂', '素食', '精选', '快手菜']
export const DIFFICULTIES = ['简单', '中等', '困难']

// === 类型定义 ===
export interface User {
  id: string
  name: string
  avatar: string
  bio: string
}

export interface Ingredient {
  name: string
  amount: string
  unit: string
}

export interface Step {
  id: number
  desc: string
  image?: string
}

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  date: string
}

export interface Suggestion {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  date: string
}

export interface Recipe {
  id: string
  title: string
  coverImage: string
  author: User
  rating: number
  ratingCount: number
  createdAt: string
  duration: number
  difficulty: '简单' | '中等' | '困难'
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert'
  cuisine: string
  tags: string[]
  servings: number
  ingredients: Ingredient[]
  steps: Step[]
  tips: string
  crowd: string
  reviews: Review[]
  suggestions: Suggestion[]
}

// === Mock 用户 ===
const mockAuthor: User = {
  id: 'user-001',
  name: '小食光',
  avatar: 'https://picsum.photos/200/200?random=1',
  bio: '厨房里的治愈时光'
}

const mockAuthor2: User = {
  id: 'user-002',
  name: '厨厨子',
  avatar: 'https://picsum.photos/200/200?random=2',
  bio: '爱做饭的程序员'
}

const mockAuthor3: User = {
  id: 'user-003',
  name: '慢慢', 
  avatar: 'https://picsum.photos/200/200?random=3',
  bio: '慢工出细活'
}

// === Mock 菜谱 ===
export const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    title: '番茄炒蛋',
    coverImage: 'https://picsum.photos/600/400?random=10',
    author: mockAuthor,
    rating: 4.2,
    ratingCount: 15,
    createdAt: '2026-05-20T10:00:00Z',
    duration: 15,
    difficulty: '简单',
    category: 'lunch',
    cuisine: '川菜',
    tags: ['快手菜', '精选'],
    servings: 2,
    ingredients: [
      { name: '番茄', amount: '2', unit: '个' },
      { name: '鸡蛋', amount: '3', unit: '个' },
      { name: '葱花', amount: '适量', unit: '' },
      { name: '盐', amount: '适量', unit: '' },
    ],
    steps: [
      { id: 1, desc: '番茄切块，鸡蛋打散加少许盐搅匀。' },
      { id: 2, desc: '热锅凉油，倒入蛋液炒至凝固盛出。' },
      { id: 3, desc: '锅中余油炒番茄出汁，倒回鸡蛋翻炒均匀。' },
      { id: 4, desc: '加盐调味，撒葱花出锅。' },
    ],
    tips: '番茄选熟透的更容易出汁，炒蛋油温不要太高。',
    crowd: '家常必备',
    reviews: [
      { id: 'rv1', userId: 'u2', userName: '厨厨子', userAvatar: 'https://picsum.photos/200/200?random=2', rating: 5, date: '2026-05-22T08:00:00Z' },
      { id: 'rv2', userId: 'u3', userName: '慢慢', userAvatar: 'https://picsum.photos/200/200?random=3', rating: 4, date: '2026-05-23T12:00:00Z' },
    ],
    suggestions: [
      { id: 's1', userId: 'u2', userName: '厨厨子', userAvatar: 'https://picsum.photos/200/200?random=2', content: '加点白糖可以提鲜', date: '2026-05-22T08:05:00Z' },
    ],
  },
  {
    id: 'r2',
    title: '日式照烧鸡腿',
    coverImage: 'https://picsum.photos/600/400?random=11',
    author: mockAuthor2,
    rating: 4.7,
    ratingCount: 23,
    createdAt: '2026-05-18T14:00:00Z',
    duration: 30,
    difficulty: '中等',
    category: 'dinner',
    cuisine: '其他',
    tags: ['精选', '减脂'],
    servings: 2,
    ingredients: [
      { name: '鸡腿', amount: '2', unit: '只' },
      { name: '生抽', amount: '2', unit: '勺' },
      { name: '蜂蜜', amount: '1', unit: '勺' },
      { name: '料酒', amount: '1', unit: '勺' },
      { name: '姜片', amount: '3', unit: '片' },
    ],
    steps: [
      { id: 1, desc: '鸡腿去骨，用刀背拍松，牙签扎孔方便入味。' },
      { id: 2, desc: '生抽、蜂蜜、料酒调成照烧汁，腌制鸡腿20分钟。' },
      { id: 3, desc: '平底锅少油，鸡皮面朝下煎至金黄翻面。' },
      { id: 4, desc: '倒入剩余酱汁小火收汁，切片装盘。' },
    ],
    tips: '煎的时候用锅铲压一压鸡腿，让皮更酥脆。',
    crowd: '健身党友好',
    reviews: [
      { id: 'rv3', userId: 'u1', userName: '小食光', userAvatar: 'https://picsum.photos/200/200?random=1', rating: 5, date: '2026-05-20T10:00:00Z' },
    ],
    suggestions: [],
  },
  {
    id: 'r3',
    title: '芒果椰奶西米露',
    coverImage: 'https://picsum.photos/600/400?random=12',
    author: mockAuthor3,
    rating: 4.5,
    ratingCount: 8,
    createdAt: '2026-06-01T09:00:00Z',
    duration: 25,
    difficulty: '简单',
    category: 'dessert',
    cuisine: '粤菜',
    tags: ['素食'],
    servings: 4,
    ingredients: [
      { name: '西米', amount: '100', unit: 'g' },
      { name: '芒果', amount: '2', unit: '个' },
      { name: '椰奶', amount: '200', unit: 'ml' },
      { name: '冰糖', amount: '适量', unit: '' },
    ],
    steps: [
      { id: 1, desc: '水开后下西米，煮至中间剩小白点，关火焖10分钟至全透明。' },
      { id: 2, desc: '西米过冷水沥干。芒果一半切丁，一半打成果泥。' },
      { id: 3, desc: '椰奶加冰糖小火加热至融化，冷却。' },
      { id: 4, desc: '碗底铺西米，倒入椰奶，放芒果泥和芒果丁。' },
    ],
    tips: '西米一定要水开了再下锅，冷水下会糊成一团。',
    crowd: '夏日解暑神器',
    reviews: [],
    suggestions: [],
  },
  {
    id: 'r4',
    title: '水煮牛肉',
    coverImage: 'https://picsum.photos/600/400?random=13',
    author: mockAuthor,
    rating: 4.8,
    ratingCount: 31,
    createdAt: '2026-05-15T16:00:00Z',
    duration: 40,
    difficulty: '困难',
    category: 'dinner',
    cuisine: '川菜',
    tags: ['精选'],
    servings: 3,
    ingredients: [
      { name: '牛里脊', amount: '300', unit: 'g' },
      { name: '豆芽', amount: '200', unit: 'g' },
      { name: '干辣椒', amount: '10', unit: '个' },
      { name: '花椒', amount: '1', unit: '把' },
      { name: '郫县豆瓣酱', amount: '2', unit: '勺' },
      { name: '蒜末', amount: '适量', unit: '' },
    ],
    steps: [
      { id: 1, desc: '牛肉逆纹切薄片，加料酒、淀粉、蛋清腌制15分钟。' },
      { id: 2, desc: '豆芽焯水铺碗底。干辣椒剪段去籽。' },
      { id: 3, desc: '锅中炒香豆瓣酱，加水煮开后滑入牛肉片，变色即捞出。' },
      { id: 4, desc: '牛肉铺在豆芽上，撒蒜末、辣椒段、花椒，浇热油激香。' },
    ],
    tips: '牛肉要逆纹切口感才嫩，焯水时间不超过30秒。',
    crowd: '无辣不欢',
    reviews: [],
    suggestions: [],
  },
  {
    id: 'r5',
    title: '葱油拌面',
    coverImage: 'https://picsum.photos/600/400?random=14',
    author: mockAuthor2,
    rating: 3.9,
    ratingCount: 12,
    createdAt: '2026-05-28T07:00:00Z',
    duration: 20,
    difficulty: '简单',
    category: 'breakfast',
    cuisine: '苏菜',
    tags: ['快手菜', '素食'],
    servings: 1,
    ingredients: [
      { name: '面条', amount: '150', unit: 'g' },
      { name: '小葱', amount: '5', unit: '根' },
      { name: '生抽', amount: '2', unit: '勺' },
      { name: '老抽', amount: '1', unit: '勺' },
      { name: '白糖', amount: '半勺', unit: '' },
      { name: '食用油', amount: '3', unit: '勺' },
    ],
    steps: [
      { id: 1, desc: '小葱切段，葱白和葱绿分开。面条煮熟过凉水。' },
      { id: 2, desc: '小火炸葱白至微黄，加入葱绿炸至焦黄，捞出葱段。' },
      { id: 3, desc: '关火后倒入生抽、老抽、白糖搅匀，葱油即成。' },
      { id: 4, desc: '葱油拌入面条，放上炸葱段即可。' },
    ],
    tips: '炸葱全程小火，火大了葱会苦。葱油可以多做一些冷藏保存。',
    crowd: '懒人早餐首选',
    reviews: [],
    suggestions: [],
  },
  {
    id: 'r6',
    title: '松饼',
    coverImage: 'https://picsum.photos/600/400?random=15',
    author: mockAuthor3,
    rating: 4.0,
    ratingCount: 19,
    createdAt: '2026-06-02T08:00:00Z',
    duration: 30,
    difficulty: '中等',
    category: 'breakfast',
    cuisine: '其他',
    tags: ['精选'],
    servings: 4,
    ingredients: [
      { name: '低筋面粉', amount: '200', unit: 'g' },
      { name: '鸡蛋', amount: '2', unit: '个' },
      { name: '牛奶', amount: '180', unit: 'ml' },
      { name: '泡打粉', amount: '5', unit: 'g' },
      { name: '黄油', amount: '30', unit: 'g' },
      { name: '蜂蜜/枫糖浆', amount: '适量', unit: '' },
    ],
    steps: [
      { id: 1, desc: '面粉和泡打粉过筛混合。黄油融化备用。' },
      { id: 2, desc: '鸡蛋打散，加入牛奶和融化的黄油搅匀。' },
      { id: 3, desc: '液体倒入粉类，z字形搅拌至无干粉（面糊略粗糙即可，不要过度搅拌）。' },
      { id: 4, desc: '不粘锅小火，舀一勺面糊，表面冒泡时翻面，再煎30秒。' },
      { id: 5, desc: '叠放淋蜂蜜或枫糖浆，搭配水果。' },
    ],
    tips: '面糊静置10分钟效果更好。锅温太高会外焦里生，全程一定要小火。',
    crowd: '周末 brunch 必备',
    reviews: [],
    suggestions: [],
  },
]
```

- [ ] **Step 2: 验证 TypeScript 类型检查（可选，uni-app 实际编译时检查）**

```bash
ls data/recipes.ts
```

- [ ] **Step 3: 提交**

```bash
git add data/recipes.ts
git commit -m "feat: add mock recipe data with 6 recipes and enum constants"
```

---

### Task 3: Pinia Stores

**Files:**
- Create: `stores/recipe.ts`, `stores/user.ts`, `stores/upload.ts`

- [ ] **Step 1: 创建 stores/recipe.ts — 菜谱 Store**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockRecipes } from '@/data/recipes'
import type { Recipe } from '@/data/recipes'

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>([...mockRecipes.map(r => ({ ...r, reviews: [...r.reviews], suggestions: [...r.suggestions] }))])
  const searchQuery = ref('')
  const activeCategory = ref('全部')
  const activeCuisine = ref('')
  const activeTag = ref('')

  const filteredRecipes = computed(() => {
    let result = recipes.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q)) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    if (activeCategory.value !== '全部') {
      result = result.filter(r => r.category === activeCategory.value)
    }

    if (activeCuisine.value) {
      result = result.filter(r => r.cuisine === activeCuisine.value)
    }

    if (activeTag.value) {
      result = result.filter(r => r.tags.includes(activeTag.value))
    }

    return result
  })

  const topRanked = computed(() =>
    [...recipes.value]
      .filter(r => r.ratingCount > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
  )

  const latestRecipes = computed(() =>
    [...recipes.value].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  function recipeById(id: string) {
    return recipes.value.find(r => r.id === id)
  }

  function addRecipe(recipe: Recipe) {
    recipes.value.unshift({ ...recipe, reviews: [...recipe.reviews], suggestions: [...recipe.suggestions] })
  }

  function updateRecipe(id: string, data: Partial<Recipe>) {
    const idx = recipes.value.findIndex(r => r.id === id)
    if (idx !== -1) Object.assign(recipes.value[idx], data)
  }

  function deleteRecipe(id: string) {
    recipes.value = recipes.value.filter(r => r.id !== id)
  }

  function rateRecipe(recipeId: string, userId: string, userName: string, userAvatar: string, rating: number) {
    const recipe = recipes.value.find(r => r.id === recipeId)
    if (!recipe) return
    const existingIdx = recipe.reviews.findIndex(rv => rv.userId === userId)
    const review = { id: existingIdx !== -1 ? recipe.reviews[existingIdx].id : Date.now().toString(), userId, userName, userAvatar, rating, date: new Date().toISOString() }
    if (existingIdx !== -1) {
      recipe.reviews[existingIdx] = review
    } else {
      recipe.reviews.push(review)
    }
    recipe.rating = Math.round(recipe.reviews.reduce((s, r) => s + r.rating, 0) / recipe.reviews.length * 10) / 10
    recipe.ratingCount = recipe.reviews.length
  }

  function deleteReview(recipeId: string, reviewId: string) {
    const recipe = recipes.value.find(r => r.id === recipeId)
    if (!recipe) return
    recipe.reviews = recipe.reviews.filter(rv => rv.id !== reviewId)
    recipe.rating = recipe.reviews.length > 0
      ? Math.round(recipe.reviews.reduce((s, r) => s + r.rating, 0) / recipe.reviews.length * 10) / 10
      : 0
    recipe.ratingCount = recipe.reviews.length
  }

  function suggestRecipe(recipeId: string, userId: string, userName: string, userAvatar: string, content: string) {
    const recipe = recipes.value.find(r => r.id === recipeId)
    if (!recipe) return
    const existingIdx = recipe.suggestions.findIndex(s => s.userId === userId)
    const suggestion = { id: existingIdx !== -1 ? recipe.suggestions[existingIdx].id : Date.now().toString(), userId, userName, userAvatar, content, date: new Date().toISOString() }
    if (existingIdx !== -1) {
      recipe.suggestions[existingIdx] = suggestion
    } else {
      recipe.suggestions.push(suggestion)
    }
  }

  function deleteSuggestion(recipeId: string, suggestionId: string) {
    const recipe = recipes.value.find(r => r.id === recipeId)
    if (!recipe) return
    recipe.suggestions = recipe.suggestions.filter(s => s.id !== suggestionId)
  }

  function setSearchQuery(q: string) { searchQuery.value = q }
  function setCategory(c: string) { activeCategory.value = c; activeCuisine.value = ''; activeTag.value = '' }
  function setCuisine(c: string) { activeCuisine.value = c }
  function setTag(t: string) { activeTag.value = t }

  return {
    recipes, searchQuery, activeCategory, activeCuisine, activeTag,
    filteredRecipes, topRanked, latestRecipes,
    recipeById, addRecipe, updateRecipe, deleteRecipe,
    rateRecipe, deleteReview, suggestRecipe, deleteSuggestion,
    setSearchQuery, setCategory, setCuisine, setTag
  }
})
```

- [ ] **Step 2: 创建 stores/user.ts — 用户 Store**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User { id: string; name: string; avatar: string; bio: string }

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User>({
    id: 'user-001',
    name: '美食爱好者',
    avatar: 'https://picsum.photos/200/200?random=100',
    bio: '热爱分享美食'
  })
  const favorites = ref<string[]>([])
  const myReviews = ref<{ recipeId: string; rating: number; date: string }[]>([])
  const mySuggestions = ref<{ recipeId: string; content: string; date: string }[]>([])

  function toggleFavorite(recipeId: string) {
    const idx = favorites.value.indexOf(recipeId)
    if (idx === -1) favorites.value.push(recipeId)
    else favorites.value.splice(idx, 1)
  }

  function isFavorite(recipeId: string) {
    return favorites.value.includes(recipeId)
  }

  function addReview(recipeId: string, rating: number) {
    const existingIdx = myReviews.value.findIndex(r => r.recipeId === recipeId)
    if (existingIdx !== -1) myReviews.value[existingIdx] = { recipeId, rating, date: new Date().toISOString() }
    else myReviews.value.push({ recipeId, rating, date: new Date().toISOString() })
  }

  function addSuggestion(recipeId: string, content: string) {
    const existingIdx = mySuggestions.value.findIndex(s => s.recipeId === recipeId)
    if (existingIdx !== -1) mySuggestions.value[existingIdx] = { recipeId, content, date: new Date().toISOString() }
    else mySuggestions.value.push({ recipeId, content, date: new Date().toISOString() })
  }

  function removeReview(recipeId: string) {
    myReviews.value = myReviews.value.filter(r => r.recipeId !== recipeId)
  }

  function removeSuggestion(recipeId: string) {
    mySuggestions.value = mySuggestions.value.filter(s => s.recipeId !== recipeId)
  }

  function updateProfile(data: Partial<User>) {
    Object.assign(currentUser.value, data)
  }

  return {
    currentUser, favorites, myReviews, mySuggestions,
    toggleFavorite, isFavorite, addReview, addSuggestion,
    removeReview, removeSuggestion, updateProfile
  }
})
```

- [ ] **Step 3: 创建 stores/upload.ts — 上传 Store**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Ingredient { name: string; amount: string; unit: string }
interface Step { id: number; desc: string; image?: string }

interface Draft {
  id: string
  title: string
  step: number
  coverImage: string
  duration: number
  difficulty: string
  servings: number
  ingredients: Ingredient[]
  steps: Step[]
  category: string
  cuisine: string
  tags: string[]
  crowd: string
  tips: string
  savedAt: string
}

function emptyDraft(): Draft {
  return {
    id: Date.now().toString(),
    title: '', step: 1, coverImage: '', duration: 30, difficulty: '中等',
    servings: 2, ingredients: [], steps: [],
    category: 'lunch', cuisine: '其他', tags: [], crowd: '', tips: '',
    savedAt: new Date().toISOString()
  }
}

export const useUploadStore = defineStore('upload', () => {
  const drafts = ref<Draft[]>([])
  const currentDraft = ref<Draft | null>(null)

  function initDraft() {
    currentDraft.value = emptyDraft()
  }

  function saveDraft() {
    if (!currentDraft.value) return
    currentDraft.value.savedAt = new Date().toISOString()
    const idx = drafts.value.findIndex(d => d.id === currentDraft.value!.id)
    if (idx !== -1) drafts.value[idx] = JSON.parse(JSON.stringify(currentDraft.value))
    else drafts.value.unshift(JSON.parse(JSON.stringify(currentDraft.value)))
    uni.setStorageSync('recipe_drafts', JSON.stringify(drafts.value))
  }

  function loadDrafts() {
    try {
      const raw = uni.getStorageSync('recipe_drafts')
      if (raw) drafts.value = JSON.parse(raw)
    } catch (_) { drafts.value = [] }
  }

  function loadDraft(id: string) {
    const draft = drafts.value.find(d => d.id === id)
    if (draft) currentDraft.value = JSON.parse(JSON.stringify(draft))
  }

  function deleteDraft(id: string) {
    drafts.value = drafts.value.filter(d => d.id !== id)
    uni.setStorageSync('recipe_drafts', JSON.stringify(drafts.value))
  }

  function clearCurrentDraft() {
    currentDraft.value = null
  }

  return {
    drafts, currentDraft,
    initDraft, saveDraft, loadDrafts, loadDraft, deleteDraft, clearCurrentDraft
  }
})
```

- [ ] **Step 4: 提交**

```bash
git add stores/recipe.ts stores/user.ts stores/upload.ts
git commit -m "feat: add Pinia stores for recipes, user, and upload management"
```

---

### Task 4: 自定义 TabBar + RecipeCard 组件

**Files:**
- Create: `components/CustomTabBar.vue`, `components/RecipeCard.vue`

- [ ] **Step 1: 创建 components/CustomTabBar.vue**

```vue
<script setup>
import { computed } from 'vue'

const tabs = [
  { path: '/pages/home/index', label: '首页', icon: 'home' },
  { path: '/pages/recipes/index', label: '全部菜品', icon: 'search' },
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
      <view class="tab-bar__icon" :class="'tab-bar__icon--' + tab.icon" />
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
  height: 100rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.04);
  z-index: 999;
}

.tab-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 24rpx;
  transition: transform 0.15s;
}

.tab-bar__item:active {
  transform: scale(0.95);
}

.tab-bar__icon {
  width: 44rpx;
  height: 44rpx;
  margin-bottom: 4rpx;
  background: #999;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.tab-bar__icon--home { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'%3E%3C/path%3E%3Cpolyline points='9 22 9 12 15 12 15 22'%3E%3C/polyline%3E%3C/svg%3E"); }
.tab-bar__icon--search { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E"); }
.tab-bar__icon--plus { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='16'%3E%3C/line%3E%3Cline x1='8' y1='12' x2='16' y2='12'%3E%3C/line%3E%3C/svg%3E"); }
.tab-bar__icon--user { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E"); }

.tab-bar__item--active .tab-bar__icon {
  background: #52C41A;
}

.tab-bar__label {
  font-size: 20rpx;
  color: #999;
  line-height: 1;
}

.tab-bar__item--active .tab-bar__label {
  color: #52C41A;
  font-weight: 600;
}
</style>
```

- [ ] **Step 2: 创建 components/RecipeCard.vue — 瀑布流菜谱卡片**

```vue
<script setup>
const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click', props.recipe.id)
}
</script>

<template>
  <view class="recipe-card" @click="handleClick">
    <image
      class="recipe-card__cover"
      :src="recipe.coverImage"
      mode="widthFix"
      lazy-load
    />
    <view class="recipe-card__body">
      <text class="recipe-card__title">{{ recipe.title }}</text>
      <view class="recipe-card__meta">
        <view class="recipe-card__author">
          <image class="recipe-card__avatar" :src="recipe.author.avatar" mode="aspectFill" />
          <text class="recipe-card__name">{{ recipe.author.name }}</text>
        </view>
        <view class="recipe-card__rating">
          <text class="recipe-card__stars">★</text>
          <text>{{ recipe.rating }}</text>
        </view>
      </view>
      <view class="recipe-card__tags" v-if="recipe.tags && recipe.tags.length">
        <text class="recipe-card__tag" v-for="tag in recipe.tags.slice(0, 2)" :key="tag">{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.recipe-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  margin-bottom: 24rpx;
}

.recipe-card:active {
  transform: scale(0.97);
  transition: transform 0.15s;
}

.recipe-card__cover {
  width: 100%;
  display: block;
}

.recipe-card__body {
  padding: 16rpx;
}

.recipe-card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.recipe-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recipe-card__author {
  display: flex;
  align-items: center;
}

.recipe-card__avatar {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.recipe-card__name {
  font-size: 22rpx;
  color: #999;
}

.recipe-card__rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 22rpx;
  color: #1a1a1a;
}

.recipe-card__stars {
  color: #52C41A;
}

.recipe-card__tags {
  display: flex;
  gap: 8rpx;
  margin-top: 12rpx;
}

.recipe-card__tag {
  font-size: 20rpx;
  color: #52C41A;
  background: rgba(82, 196, 26, 0.1);
  padding: 2rpx 12rpx;
  border-radius: 9999rpx;
}
</style>
```

- [ ] **Step 3: 提交**

```bash
git add components/CustomTabBar.vue components/RecipeCard.vue
git commit -m "feat: add CustomTabBar and RecipeCard components"
```

---

### Task 5: 首页 (pages/home/index)

**Files:**
- Create: `pages/home/index.vue`

- [ ] **Step 1: 创建 pages/home/index.vue**

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import CustomTabBar from '@/components/CustomTabBar.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { CATEGORIES } from '@/data/recipes'

const store = useRecipeStore()
const categories = CATEGORIES
const rankTab = ref('rating') // 'rating' | 'new'
const page = ref(1)
const pageSize = 10

const topRanked = computed(() => store.topRanked)
const latestRecipes = computed(() => store.latestRecipes)
const waterfallList = computed(() => {
  const list = rankTab.value === 'new' ? latestRecipes.value : store.filteredRecipes
  return list.slice(0, page.value * pageSize)
})

onMounted(() => {
  store.setCategory('全部')
  store.setSearchQuery('')
})

function onSearchTap() {
  uni.navigateTo({ url: '/pages/recipes/index?focusSearch=1' })
}

function onCategoryTap(cat) {
  store.setCategory(cat)
  page.value = 1
}

function onRecipeClick(id) {
  uni.navigateTo({ url: '/pages/recipe-detail/index?id=' + id })
}

function loadMore() {
  page.value++
}
</script>

<template>
  <view class="home-page">
    <!-- 头部 -->
    <view class="home-header">
      <view class="home-header__safe" />
      <view class="home-header__bar">
        <text class="home-header__title">菜谱</text>
        <view class="home-header__search" @click="onSearchTap">
          <text class="home-header__search-icon">🔍</text>
          <text class="home-header__search-placeholder">搜索菜谱或食材...</text>
        </view>
      </view>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-bar">
      <view class="category-bar__inner">
        <view
          v-for="cat in categories"
          :key="cat"
          class="category-chip"
          :class="{ 'category-chip--active': store.activeCategory === cat }"
          @click="onCategoryTap(cat)"
        >
          {{ cat }}
        </view>
      </view>
    </scroll-view>

    <!-- 排行榜区域 -->
    <view class="section">
      <view class="section-header">
        <view class="rank-tabs">
          <text
            class="rank-tab"
            :class="{ 'rank-tab--active': rankTab === 'rating' }"
            @click="rankTab = 'rating'"
          >热门排行</text>
          <text
            class="rank-tab"
            :class="{ 'rank-tab--active': rankTab === 'new' }"
            @click="rankTab = 'new'"
          >最新上传</text>
        </view>
      </view>

      <!-- 排行榜列表 (竖向卡片) -->
      <view v-if="rankTab === 'rating'" class="rank-list">
        <view
          v-for="(recipe, idx) in topRanked.slice(0, 3)"
          :key="recipe.id"
          class="rank-item"
          @click="onRecipeClick(recipe.id)"
        >
          <text class="rank-item__num rank-item__num--top">{{ idx + 1 }}</text>
          <image class="rank-item__cover" :src="recipe.coverImage" mode="aspectFill" />
          <view class="rank-item__info">
            <text class="rank-item__title">{{ recipe.title }}</text>
            <view class="rank-item__rating">
              <text class="rank-item__star">★</text> {{ recipe.rating }}
            </view>
          </view>
        </view>
      </view>

      <!-- 双列瀑布流 -->
      <view class="waterfall">
        <view class="waterfall__col">
          <RecipeCard
            v-for="(recipe, idx) in waterfallList.filter((_, i) => i % 2 === 0)"
            :key="recipe.id"
            :recipe="recipe"
            @click="onRecipeClick"
          />
        </view>
        <view class="waterfall__col">
          <RecipeCard
            v-for="(recipe, idx) in waterfallList.filter((_, i) => i % 2 === 1)"
            :key="recipe.id"
            :recipe="recipe"
            @click="onRecipeClick"
          />
        </view>
      </view>

      <view class="load-more" @click="loadMore">
        <text>加载更多</text>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" />
    <CustomTabBar />
  </view>
</template>

<style lang="scss" scoped>
.home-page { min-height: 100vh; padding-bottom: 120rpx; }

.home-header { background: #FFF; }
.home-header__safe { height: var(--status-bar-height, 44px); }
.home-header__bar {
  display: flex; align-items: center; padding: 16rpx 24rpx 20rpx;
}
.home-header__title { font-size: 40rpx; font-weight: 700; margin-right: 24rpx; flex-shrink: 0; }
.home-header__search {
  flex: 1; display: flex; align-items: center;
  background: #F5F5F5; border-radius: 9999rpx; padding: 14rpx 24rpx;
}
.home-header__search-icon { font-size: 28rpx; margin-right: 8rpx; }
.home-header__search-placeholder { color: #999; font-size: 26rpx; }

.category-bar { background: #FFF; padding-bottom: 16rpx; white-space: nowrap; }
.category-bar__inner { display: flex; padding: 0 24rpx; }
.category-chip {
  display: inline-block; padding: 10rpx 28rpx; border-radius: 9999rpx;
  font-size: 26rpx; color: #666; background: #F5F5F5; margin-right: 16rpx;
}
.category-chip--active { background: #52C41A; color: #FFF; font-weight: 600; }

.section { padding: 24rpx; }
.section-header { margin-bottom: 20rpx; }

.rank-tabs { display: flex; gap: 24rpx; }
.rank-tab { font-size: 30rpx; color: #999; font-weight: 600; }
.rank-tab--active { color: #1a1a1a; }

.rank-list { margin-bottom: 24rpx; }
.rank-item {
  display: flex; align-items: center; background: #FFF;
  border-radius: 16rpx; padding: 16rpx; margin-bottom: 16rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
}
.rank-item__num { font-size: 48rpx; font-weight: 800; width: 60rpx; text-align: center; color: #ccc; }
.rank-item__num--top { color: #52C41A; }
.rank-item__cover { width: 100rpx; height: 100rpx; border-radius: 12rpx; margin-right: 16rpx; }
.rank-item__info { flex: 1; }
.rank-item__title { font-size: 28rpx; font-weight: 600; margin-bottom: 8rpx; }
.rank-item__rating { font-size: 24rpx; color: #999; }
.rank-item__star { color: #52C41A; }

.waterfall { display: flex; gap: 16rpx; }
.waterfall__col { flex: 1; }

.load-more { text-align: center; padding: 24rpx; color: #999; font-size: 26rpx; }
.bottom-placeholder { height: 100rpx; }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add pages/home/index.vue
git commit -m "feat: add home page with search, categories, ranking, and waterfall layout"
```

---

### Task 6: 全部菜品页 (pages/recipes/index)

**Files:**
- Create: `pages/recipes/index.vue`

- [ ] **Step 1: 创建 pages/recipes/index.vue**

```vue
<script setup>
import { ref, computed, onLoad } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import CustomTabBar from '@/components/CustomTabBar.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { CATEGORIES, CUISINES, TAGS } from '@/data/recipes'

const store = useRecipeStore()
const categories = CATEGORIES
const cuisines = CUISINES
const tags = TAGS
const page = ref(1)
const pageSize = 10
const searchInput = ref('')

const displayList = computed(() => {
  return store.filteredRecipes.slice(0, page.value * pageSize)
})

onLoad((options) => {
  if (options && options.focusSearch) {
    // 从首页搜索框跳转过来
  }
  if (options && options.query) {
    searchInput.value = options.query
    store.setSearchQuery(options.query)
  }
})

function onSearchInput(e) {
  store.setSearchQuery(e.detail.value)
  page.value = 1
}

function onClearSearch() {
  searchInput.value = ''
  store.setSearchQuery('')
  page.value = 1
}

function onCategoryTap(cat) {
  store.setCategory(cat)
  page.value = 1
}

function onCuisineTap(cuisine) {
  store.setCuisine(store.activeCuisine === cuisine ? '' : cuisine)
  page.value = 1
}

function onTagTap(tag) {
  store.setTag(store.activeTag === tag ? '' : tag)
  page.value = 1
}

function onRecipeClick(id) {
  uni.navigateTo({ url: '/pages/recipe-detail/index?id=' + id })
}

function loadMore() {
  page.value++
}
</script>

<template>
  <view class="recipes-page">
    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-bar__input-wrap">
        <text class="search-bar__icon">🔍</text>
        <input
          class="search-bar__input"
          v-model="searchInput"
          placeholder="搜索菜谱或食材..."
          @input="onSearchInput"
        />
        <text v-if="searchInput" class="search-bar__clear" @click="onClearSearch">✕</text>
      </view>
    </view>

    <!-- 一级分类 -->
    <scroll-view scroll-x class="filter-row">
      <view
        v-for="cat in categories"
        :key="cat"
        class="filter-chip"
        :class="{ 'filter-chip--active': store.activeCategory === cat }"
        @click="onCategoryTap(cat)"
      >{{ cat }}</view>
    </scroll-view>

    <!-- 二级: 菜系 -->
    <scroll-view scroll-x class="filter-row filter-row--sub">
      <view
        v-for="c in cuisines"
        :key="c"
        class="filter-chip filter-chip--sub"
        :class="{ 'filter-chip--active': store.activeCuisine === c }"
        @click="onCuisineTap(c)"
      >{{ c }}</view>
    </scroll-view>

    <!-- 二级: 标签 -->
    <scroll-view scroll-x class="filter-row filter-row--sub">
      <view
        v-for="t in tags"
        :key="t"
        class="filter-chip filter-chip--sub"
        :class="{ 'filter-chip--active': store.activeTag === t }"
        @click="onTagTap(t)"
      >{{ t }}</view>
    </scroll-view>

    <!-- 结果数 -->
    <view class="result-count">
      <text>共 {{ store.filteredRecipes.length }} 个菜谱</text>
    </view>

    <!-- 双列瀑布流 -->
    <view class="waterfall">
      <view class="waterfall__col">
        <RecipeCard
          v-for="(recipe, idx) in displayList.filter((_, i) => i % 2 === 0)"
          :key="recipe.id"
          :recipe="recipe"
          @click="onRecipeClick"
        />
      </view>
      <view class="waterfall__col">
        <RecipeCard
          v-for="(recipe, idx) in displayList.filter((_, i) => i % 2 === 1)"
          :key="recipe.id"
          :recipe="recipe"
          @click="onRecipeClick"
        />
      </view>
    </view>

    <view v-if="displayList.length < store.filteredRecipes.length" class="load-more" @click="loadMore">
      <text>加载更多</text>
    </view>
    <view v-else-if="store.filteredRecipes.length === 0" class="empty">
      <text>没有找到相关菜谱</text>
    </view>

    <view class="bottom-placeholder" />
    <CustomTabBar />
  </view>
</template>

<style lang="scss" scoped>
.recipes-page { min-height: 100vh; padding-bottom: 120rpx; }

.search-bar { padding: 16rpx 24rpx; background: #FFF; }
.search-bar__input-wrap {
  display: flex; align-items: center; background: #F5F5F5;
  border-radius: 9999rpx; padding: 14rpx 24rpx;
}
.search-bar__icon { font-size: 28rpx; margin-right: 8rpx; flex-shrink: 0; }
.search-bar__input { flex: 1; font-size: 26rpx; }
.search-bar__clear { color: #ccc; font-size: 28rpx; padding: 4rpx; }

.filter-row { white-space: nowrap; padding: 12rpx 24rpx; background: #FFF; }
.filter-row--sub { padding-top: 0; }
.filter-chip {
  display: inline-block; padding: 8rpx 24rpx; border-radius: 9999rpx;
  font-size: 24rpx; color: #666; background: #F5F5F5; margin-right: 12rpx;
}
.filter-chip--sub { font-size: 22rpx; padding: 6rpx 20rpx; }
.filter-chip--active { background: #52C41A; color: #FFF; font-weight: 600; }

.result-count { padding: 16rpx 24rpx 8rpx; font-size: 24rpx; color: #999; }

.waterfall { display: flex; gap: 16rpx; padding: 0 24rpx; }
.waterfall__col { flex: 1; }

.load-more { text-align: center; padding: 24rpx; color: #999; font-size: 26rpx; }
.empty { text-align: center; padding: 80rpx 0; color: #999; }
.bottom-placeholder { height: 100rpx; }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add pages/recipes/index.vue
git commit -m "feat: add all recipes page with search and multi-level filters"
```

---

### Task 7: 菜品详情页 (pages/recipe-detail/index)

**Files:**
- Create: `pages/recipe-detail/index.vue`

- [ ] **Step 1: 创建 pages/recipe-detail/index.vue**

```vue
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
const reviewTab = ref('reviews') // 'reviews' | 'suggestions'

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
      <view class="detail-cover__overlay" />
      <view class="detail-cover__top">
        <view class="detail-cover__back" @click="uni.navigateBack()">
          <text>←</text>
        </view>
        <view class="detail-cover__fav" @click="toggleFav">
          <text :style="{ color: isFav ? '#FF4D4F' : '#FFF' }">{{ isFav ? '♥' : '♡' }}</text>
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

      <!-- 评分/建议按钮 -->
      <view class="detail-actions">
        <view class="detail-action" @click="showRating = true">
          <text class="detail-action__icon">⭐</text>
          <text>{{ hasMyReview ? '修改评分' : '评分' }}</text>
        </view>
        <view class="detail-action" @click="showSuggestion = true">
          <text class="detail-action__icon">💡</text>
          <text>{{ hasMySuggestion ? '修改建议' : '写建议' }}</text>
        </view>
      </view>

      <!-- 元数据 -->
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
      <view class="step-list">
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
          <text>暂无评分</text>
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
          <text>暂无建议</text>
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
.detail-page { min-height: 100vh; background: #FBF8FD; padding-bottom: 40rpx; }

.detail-cover { position: relative; width: 100%; height: 500rpx; }
.detail-cover__img { width: 100%; height: 100%; }
.detail-cover__overlay { position: absolute; top: 0; left: 0; right: 0; height: 200rpx; background: linear-gradient(rgba(0,0,0,0.4), transparent); }
.detail-cover__top { position: absolute; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; padding: 60rpx 24rpx 0; }
.detail-cover__back, .detail-cover__fav { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; font-size: 36rpx; color: #FFF; background: rgba(0,0,0,0.3); border-radius: 50%; }

.detail-info { background: #FFF; border-radius: 24rpx 24rpx 0 0; margin-top: -30rpx; position: relative; padding: 32rpx 24rpx; }
.detail-title { font-size: 38rpx; font-weight: 700; }
.detail-author { display: flex; align-items: center; margin-top: 16rpx; }
.detail-author__avatar { width: 48rpx; height: 48rpx; border-radius: 50%; margin-right: 12rpx; }
.detail-author__name { font-size: 26rpx; color: #999; }

.detail-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.detail-action { display: flex; align-items: center; gap: 8rpx; padding: 16rpx 32rpx; background: #F5F5F5; border-radius: 9999rpx; font-size: 26rpx; }
.detail-action__icon { font-size: 28rpx; }

.detail-meta { display: flex; margin-top: 24rpx; gap: 16rpx; }
.detail-meta__item { flex: 1; text-align: center; padding: 16rpx 8rpx; background: #FBF8FD; border-radius: 12rpx; }
.detail-meta__label { font-size: 22rpx; color: #999; display: block; }
.detail-meta__value { font-size: 26rpx; font-weight: 600; margin-top: 4rpx; }

.detail-section { background: #FFF; margin: 16rpx 24rpx; border-radius: 16rpx; padding: 24rpx; }
.detail-section__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.detail-section__title { font-size: 30rpx; font-weight: 700; }

.serving-control { display: flex; align-items: center; gap: 12rpx; }
.serving-btn { width: 48rpx; height: 48rpx; border-radius: 50%; background: #F5F5F5; display: flex; align-items: center; justify-content: center; font-size: 32rpx; color: #52C41A; }
.serving-num { font-size: 26rpx; }

.ingredient-list { border-top: 1rpx solid #F0F0F0; }
.ingredient-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #F5F5F5; }
.ingredient-item--checked { opacity: 0.4; }
.ingredient-check { width: 40rpx; height: 40rpx; border: 2rpx solid #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12rpx; font-size: 24rpx; color: #52C41A; }
.ingredient-item--checked .ingredient-check { background: #52C41A; border-color: #52C41A; color: #FFF; }
.ingredient-name { flex: 1; font-size: 28rpx; color: #52C41A; }
.ingredient-amount { font-size: 26rpx; color: #999; }

.step-list { }
.step-item { display: flex; margin-bottom: 24rpx; }
.step-num { width: 48rpx; height: 48rpx; border-radius: 50%; background: #52C41A; color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 24rpx; font-weight: 700; flex-shrink: 0; margin-right: 16rpx; }
.step-content { flex: 1; }
.step-desc { font-size: 26rpx; line-height: 1.6; }
.step-img { width: 100%; border-radius: 12rpx; margin-top: 12rpx; }

.tips-text { font-size: 26rpx; color: #666; line-height: 1.6; margin-top: 12rpx; display: block; background: #FFFBE6; padding: 16rpx; border-radius: 12rpx; }

.review-tabs { display: flex; gap: 32rpx; margin-bottom: 20rpx; }
.review-tab { font-size: 28rpx; color: #999; padding-bottom: 8rpx; }
.review-tab--active { color: #1a1a1a; font-weight: 600; border-bottom: 4rpx solid #52C41A; }

.review-item { display: flex; padding: 16rpx 0; border-bottom: 1rpx solid #F5F5F5; align-items: flex-start; }
.review-avatar { width: 56rpx; height: 56rpx; border-radius: 50%; margin-right: 12rpx; flex-shrink: 0; }
.review-body { flex: 1; }
.review-header { display: flex; align-items: center; gap: 12rpx; }
.review-name { font-size: 26rpx; font-weight: 600; }
.review-stars { color: #52C41A; font-size: 22rpx; }
.suggestion-text { font-size: 26rpx; color: #666; margin-top: 6rpx; display: block; }
.review-date { font-size: 22rpx; color: #ccc; margin-top: 4rpx; }
.review-empty { text-align: center; padding: 40rpx 0; color: #999; font-size: 26rpx; }
.review-del { color: #FF4D4F; font-size: 24rpx; padding: 4rpx 8rpx; }

.bottom-placeholder { height: 40rpx; }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add pages/recipe-detail/index.vue
git commit -m "feat: add recipe detail page with servings scaling, ingredient checkoff, reviews and suggestions"
```

---

### Task 8: 评分/建议弹窗组件

**Files:**
- Create: `components/RatingModal.vue`, `components/SuggestionModal.vue`

- [ ] **Step 1: 创建 components/RatingModal.vue**

```vue
<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentRating: { type: Number, default: 0 }
})

const emit = defineEmits(['submit', 'close'])
const rating = ref(props.currentRating)
const hoverRating = ref(0)

function selectRating(r) {
  rating.value = r
}

function submit() {
  if (rating.value > 0) {
    emit('submit', rating.value)
  }
}
</script>

<template>
  <view class="modal-mask" @click="emit('close')">
    <view class="modal-card" @click.stop>
      <text class="modal-title">为这道菜评分</text>
      <view class="stars-row">
        <text
          v-for="i in 5"
          :key="i"
          class="star"
          :class="{ 'star--active': i <= (hoverRating || rating) }"
          @click="selectRating(i)"
          @mouseover="hoverRating = i"
          @mouseleave="hoverRating = 0"
        >{{ i <= (hoverRating || rating) ? '★' : '☆' }}</text>
      </view>
      <view class="modal-actions">
        <text class="modal-btn modal-btn--cancel" @click="emit('close')">取消</text>
        <text class="modal-btn modal-btn--confirm" @click="submit">确认</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.modal-card {
  background: #FFF; border-radius: 24rpx; padding: 48rpx 40rpx;
  width: 540rpx; text-align: center;
}
.modal-title { font-size: 32rpx; font-weight: 700; display: block; margin-bottom: 32rpx; }
.stars-row { display: flex; justify-content: center; gap: 16rpx; margin-bottom: 40rpx; }
.star { font-size: 60rpx; color: #E8E8E8; transition: transform 0.15s; }
.star:active { transform: scale(1.2); }
.star--active { color: #FAAD14; }
.modal-actions { display: flex; gap: 24rpx; }
.modal-btn { flex: 1; padding: 20rpx 0; border-radius: 9999rpx; font-size: 28rpx; }
.modal-btn--cancel { background: #F5F5F5; color: #666; }
.modal-btn--confirm { background: #52C41A; color: #FFF; }
</style>
```

- [ ] **Step 2: 创建 components/SuggestionModal.vue**

```vue
<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentContent: { type: String, default: '' }
})

const emit = defineEmits(['submit', 'close'])
const content = ref(props.currentContent)

function submit() {
  const trimmed = content.value.trim()
  if (trimmed) {
    emit('submit', trimmed)
  }
}
</script>

<template>
  <view class="modal-mask" @click="emit('close')">
    <view class="modal-card" @click.stop>
      <text class="modal-title">写建议</text>
      <textarea
        class="modal-textarea"
        v-model="content"
        placeholder="分享你的烹饪建议..."
        :maxlength="500"
        :auto-height="true"
      />
      <text class="modal-counter">{{ content.length }}/500</text>
      <view class="modal-actions">
        <text class="modal-btn modal-btn--cancel" @click="emit('close')">取消</text>
        <text class="modal-btn modal-btn--confirm" @click="submit">提交</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.modal-card {
  background: #FFF; border-radius: 24rpx; padding: 40rpx;
  width: 600rpx;
}
.modal-title { font-size: 32rpx; font-weight: 700; display: block; margin-bottom: 24rpx; text-align: center; }
.modal-textarea {
  width: 100%; min-height: 200rpx; background: #F5F5F5;
  border-radius: 12rpx; padding: 20rpx; font-size: 26rpx; box-sizing: border-box;
}
.modal-counter { text-align: right; font-size: 22rpx; color: #ccc; margin-top: 8rpx; display: block; }
.modal-actions { display: flex; gap: 24rpx; margin-top: 24rpx; }
.modal-btn { flex: 1; padding: 20rpx 0; border-radius: 9999rpx; font-size: 28rpx; text-align: center; }
.modal-btn--cancel { background: #F5F5F5; color: #666; }
.modal-btn--confirm { background: #52C41A; color: #FFF; }
</style>
```

- [ ] **Step 3: 提交**

```bash
git add components/RatingModal.vue components/SuggestionModal.vue
git commit -m "feat: add rating and suggestion modal components"
```

---

### Task 9: 上传菜谱页 (pages/upload/index)

**Files:**
- Create: `pages/upload/index.vue`

- [ ] **Step 1: 创建 pages/upload/index.vue — 4 步表单**

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUploadStore } from '@/stores/upload'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { CATEGORIES, CUISINES, TAGS, DIFFICULTIES, CATEGORY_MAP, CATEGORY_REVERSE_MAP } from '@/data/recipes'

const uploadStore = useUploadStore()
const recipeStore = useRecipeStore()
const userStore = useUserStore()

const draft = computed(() => uploadStore.currentDraft)
const categories = CATEGORIES.filter(c => c !== '全部')
const cuisines = CUISINES
const tags = TAGS
const difficulties = DIFFICULTIES

onMounted(() => {
  uploadStore.loadDrafts()
  if (!uploadStore.currentDraft) {
    uploadStore.initDraft()
  }
})

function nextStep() {
  if (draft.value) draft.value.step = Math.min(4, draft.value.step + 1)
}

function prevStep() {
  if (draft.value) draft.value.step = Math.max(1, draft.value.step - 1)
}

function addIngredient() {
  draft.value.ingredients.push({ name: '', amount: '', unit: '' })
}

function removeIngredient(idx) {
  draft.value.ingredients.splice(idx, 1)
}

function addStep() {
  const id = draft.value.steps.length > 0 ? Math.max(...draft.value.steps.map(s => s.id)) + 1 : 1
  draft.value.steps.push({ id, desc: '', image: '' })
}

function removeStep(idx) {
  draft.value.steps.splice(idx, 1)
}

function toggleTag(tag) {
  const idx = draft.value.tags.indexOf(tag)
  if (idx === -1) draft.value.tags.push(tag)
  else draft.value.tags.splice(idx, 1)
}

function changeCover() {
  // uni-app 小程序端图片选择
  uni.chooseImage({
    count: 1,
    success(res) {
      draft.value.coverImage = res.tempFilePaths[0]
    }
  })
}

function addStepImage(idx) {
  uni.chooseImage({
    count: 1,
    success(res) {
      draft.value.steps[idx].image = res.tempFilePaths[0]
    }
  })
}

const canSubmit = computed(() => {
  if (!draft.value) return false
  return draft.value.title.trim()
    && draft.value.ingredients.length > 0
    && draft.value.steps.length > 0
})

function submitRecipe() {
  if (!canSubmit.value) return
  const d = draft.value
  const recipe = {
    id: Date.now().toString(),
    title: d.title,
    coverImage: d.coverImage || 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 100),
    author: { ...userStore.currentUser },
    rating: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
    duration: d.duration,
    difficulty: d.difficulty,
    category: d.category,
    cuisine: d.cuisine,
    tags: [...d.tags],
    servings: d.servings,
    ingredients: d.ingredients.filter(i => i.name).map(i => ({ ...i })),
    steps: d.steps.filter(s => s.desc).map(s => ({ ...s })),
    tips: d.tips,
    crowd: d.crowd,
    reviews: [],
    suggestions: [],
  }
  recipeStore.addRecipe(recipe)
  uploadStore.clearCurrentDraft()
  uni.showToast({ title: '发布成功', icon: 'success' })
  setTimeout(() => uni.switchTab({ url: '/pages/home/index' }), 800)
}

function saveCurrentDraft() {
  uploadStore.saveDraft()
  uni.showToast({ title: '已保存草稿', icon: 'none' })
}
</script>

<template>
  <view class="upload-page" v-if="draft">
    <!-- 步骤指示器 -->
    <view class="step-indicator">
      <view
        v-for="s in 4" :key="s"
        class="step-dot"
        :class="{ 'step-dot--active': s <= draft.step, 'step-dot--done': s < draft.step }"
      />
      <view class="step-line">
        <view class="step-line__inner" :style="{ width: ((draft.step - 1) / 3 * 100) + '%' }" />
      </view>
    </view>
    <text class="step-label">第 {{ draft.step }} 步 / 共 4 步</text>

    <!-- Step 1: 基础信息 -->
    <view v-if="draft.step === 1" class="form-section">
      <view class="form-group">
        <text class="form-label">菜谱名称 *</text>
        <input class="form-input" v-model="draft.title" placeholder="例如：番茄炒蛋" />
      </view>
      <view class="form-group">
        <text class="form-label">封面图</text>
        <view class="cover-picker" @click="changeCover">
          <image v-if="draft.coverImage" :src="draft.coverImage" mode="aspectFill" class="cover-preview" />
          <text v-else class="cover-placeholder">+ 选择图片</text>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">难度</text>
        <view class="chip-row">
          <view
            v-for="d in difficulties" :key="d"
            class="chip"
            :class="{ 'chip--active': draft.difficulty === d }"
            @click="draft.difficulty = d"
          >{{ d }}</view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">烹饪时长 (分钟)</text>
        <input class="form-input" v-model.number="draft.duration" type="number" />
      </view>
      <view class="form-group">
        <text class="form-label">用餐人数</text>
        <input class="form-input" v-model.number="draft.servings" type="number" />
      </view>
    </view>

    <!-- Step 2: 食材清单 -->
    <view v-if="draft.step === 2" class="form-section">
      <view v-for="(ing, idx) in draft.ingredients" :key="idx" class="ingredient-row">
        <input class="ingredient-input ingredient-name" v-model="ing.name" placeholder="食材名" />
        <input class="ingredient-input ingredient-amount" v-model="ing.amount" placeholder="用量" />
        <input class="ingredient-input ingredient-unit" v-model="ing.unit" placeholder="单位" />
        <text class="ingredient-del" @click="removeIngredient(idx)">✕</text>
      </view>
      <view class="add-btn" @click="addIngredient">
        <text>+ 添加食材</text>
      </view>
    </view>

    <!-- Step 3: 制作步骤 -->
    <view v-if="draft.step === 3" class="form-section">
      <view v-for="(step, idx) in draft.steps" :key="step.id" class="step-edit-item">
        <view class="step-edit-header">
          <text class="step-edit-num">步骤 {{ idx + 1 }}</text>
          <text class="step-edit-del" @click="removeStep(idx)">删除</text>
        </view>
        <textarea
          class="step-textarea"
          v-model="step.desc"
          placeholder="描述这一步..."
          :auto-height="true"
        />
        <view class="step-img-row" @click="addStepImage(idx)">
          <image v-if="step.image" :src="step.image" mode="aspectFill" class="step-img-preview" />
          <text v-else class="step-img-placeholder">+ 添加图片</text>
        </view>
      </view>
      <view class="add-btn" @click="addStep">
        <text>+ 添加步骤</text>
      </view>
    </view>

    <!-- Step 4: 补充信息 -->
    <view v-if="draft.step === 4" class="form-section">
      <view class="form-group">
        <text class="form-label">分类</text>
        <view class="chip-row">
          <view
            v-for="c in categories" :key="c"
            class="chip" :class="{ 'chip--active': draft.category === (CATEGORY_MAP[c] || c) }"
            @click="draft.category = CATEGORY_MAP[c] || c"
          >{{ c }}</view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">菜系</text>
        <view class="chip-row">
          <view
            v-for="c in cuisines" :key="c"
            class="chip" :class="{ 'chip--active': draft.cuisine === c }"
            @click="draft.cuisine = c"
          >{{ c }}</view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">标签</text>
        <view class="chip-row">
          <view
            v-for="t in tags" :key="t"
            class="chip" :class="{ 'chip--active': draft.tags.includes(t) }"
            @click="toggleTag(t)"
          >{{ t }}</view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">适用人群</text>
        <input class="form-input" v-model="draft.crowd" placeholder="例如：健身党友好" />
      </view>
      <view class="form-group">
        <text class="form-label">厨神贴士</text>
        <textarea
          class="form-textarea"
          v-model="draft.tips"
          placeholder="分享你的独门技巧..."
          :auto-height="true"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="form-buttons">
      <view class="form-buttons__left">
        <text class="btn btn--outline" @click="saveCurrentDraft">保存草稿</text>
      </view>
      <view class="form-buttons__right">
        <text v-if="draft.step > 1" class="btn btn--outline" @click="prevStep">上一步</text>
        <text v-if="draft.step < 4" class="btn btn--primary" @click="nextStep">下一步</text>
        <text v-else class="btn btn--primary" :class="{ 'btn--disabled': !canSubmit }" @click="submitRecipe">发布</text>
      </view>
    </view>

    <view class="bottom-placeholder" />
    <CustomTabBar />
  </view>
</template>

<style lang="scss" scoped>
.upload-page { min-height: 100vh; background: #FBF8FD; padding-bottom: 160rpx; }

.step-indicator { display: flex; align-items: center; justify-content: center; padding: 40rpx 80rpx 16rpx; position: relative; }
.step-dot { width: 24rpx; height: 24rpx; border-radius: 50%; background: #E8E8E8; z-index: 1; margin: 0 40rpx; }
.step-dot--active, .step-dot--done { background: #52C41A; }
.step-line { position: absolute; top: 50%; left: 80rpx; right: 80rpx; height: 4rpx; background: #E8E8E8; transform: translateY(-50%); }
.step-line__inner { height: 100%; background: #52C41A; transition: width 0.3s; }
.step-label { text-align: center; font-size: 24rpx; color: #999; display: block; margin-bottom: 24rpx; }

.form-section { padding: 0 24rpx; }
.form-group { margin-bottom: 24rpx; }
.form-label { font-size: 28rpx; font-weight: 600; display: block; margin-bottom: 12rpx; }
.form-input {
  background: #FFF; border-radius: 12rpx; padding: 20rpx; font-size: 26rpx;
  border: 1rpx solid #F0F0F0; width: 100%; box-sizing: border-box;
}
.form-textarea {
  background: #FFF; border-radius: 12rpx; padding: 20rpx; font-size: 26rpx;
  border: 1rpx solid #F0F0F0; width: 100%; min-height: 160rpx; box-sizing: border-box;
}

.cover-picker { width: 200rpx; height: 200rpx; border-radius: 12rpx; overflow: hidden; background: #F5F5F5; display: flex; align-items: center; justify-content: center; }
.cover-preview { width: 100%; height: 100%; }
.cover-placeholder { color: #999; font-size: 26rpx; }

.chip-row { display: flex; flex-wrap: wrap; gap: 12rpx; }
.chip { padding: 12rpx 28rpx; border-radius: 9999rpx; background: #FFF; font-size: 26rpx; color: #666; border: 1rpx solid #F0F0F0; }
.chip--active { background: #52C41A; color: #FFF; border-color: #52C41A; }

.ingredient-row { display: flex; gap: 8rpx; margin-bottom: 12rpx; align-items: center; }
.ingredient-input { flex: 1; background: #FFF; border-radius: 12rpx; padding: 16rpx; font-size: 26rpx; border: 1rpx solid #F0F0F0; min-width: 0; }
.ingredient-del { color: #FF4D4F; font-size: 28rpx; padding: 8rpx; flex-shrink: 0; }

.step-edit-item { background: #FFF; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx; }
.step-edit-header { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.step-edit-num { font-size: 26rpx; font-weight: 600; }
.step-edit-del { font-size: 24rpx; color: #FF4D4F; }
.step-textarea { background: #F5F5F5; border-radius: 12rpx; padding: 16rpx; font-size: 26rpx; width: 100%; min-height: 100rpx; box-sizing: border-box; }
.step-img-row { margin-top: 12rpx; height: 160rpx; background: #F5F5F5; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; }
.step-img-preview { width: 100%; height: 100%; border-radius: 12rpx; }
.step-img-placeholder { color: #999; font-size: 26rpx; }

.add-btn { text-align: center; padding: 24rpx; color: #52C41A; font-size: 26rpx; }

.form-buttons { position: fixed; bottom: 100rpx; left: 0; right: 0; padding: 20rpx 24rpx; background: #FFF; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.04); z-index: 100; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); }
.form-buttons__right { display: flex; gap: 16rpx; }
.btn { padding: 16rpx 32rpx; border-radius: 9999rpx; font-size: 26rpx; }
.btn--primary { background: #52C41A; color: #FFF; }
.btn--outline { background: #FFF; color: #666; border: 1rpx solid #E8E8E8; }
.btn--disabled { opacity: 0.5; pointer-events: none; }

.bottom-placeholder { height: 100rpx; }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add pages/upload/index.vue
git commit -m "feat: add recipe upload page with 4-step form and draft saving"
```

---

### Task 10: 个人中心 (pages/profile/index)

**Files:**
- Create: `pages/profile/index.vue`

- [ ] **Step 1: 创建 pages/profile/index.vue**

```vue
<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRecipeStore } from '@/stores/recipe'
import CustomTabBar from '@/components/CustomTabBar.vue'

const userStore = useUserStore()
const recipeStore = useRecipeStore()

const user = computed(() => userStore.currentUser)
const myRecipes = computed(() => recipeStore.recipes.filter(r => r.author.id === userStore.currentUser.id))
const stats = computed(() => ({
  uploads: myRecipes.value.length,
  reviews: userStore.myReviews.length,
  suggestions: userStore.mySuggestions.length,
  favorites: userStore.favorites.length
}))

const favRecipes = computed(() =>
  recipeStore.recipes.filter(r => userStore.favorites.includes(r.id))
)

const menuItems = [
  { label: '我的上传', icon: '📋', url: '/pages/my-uploads/index' },
  { label: '我的收藏', icon: '❤️', badge: stats.value.favorites },
  { label: '我的评价', icon: '⭐', badge: stats.value.reviews },
  { label: '个人设置', icon: '⚙️', url: '/pages/settings/index' },
]

function onMenuTap(item) {
  if (item.url) {
    uni.navigateTo({ url: item.url })
  } else if (item.label === '我的收藏') {
    uni.navigateTo({ url: '/pages/my-uploads/index?tab=favorites' })
  } else if (item.label === '我的评价') {
    uni.navigateTo({ url: '/pages/my-uploads/index?tab=reviews' })
  }
}
</script>

<template>
  <view class="profile-page">
    <!-- 头部 -->
    <view class="profile-header">
      <view class="profile-header__safe" />
      <view class="profile-header__info">
        <image class="profile-avatar" :src="user.avatar" mode="aspectFill" />
        <text class="profile-name">{{ user.name }}</text>
        <text class="profile-bio">{{ user.bio }}</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-num">{{ stats.uploads }}</text>
        <text class="stat-label">上传</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ stats.reviews }}</text>
        <text class="stat-label">评价</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ stats.suggestions }}</text>
        <text class="stat-label">建议</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ stats.favorites }}</text>
        <text class="stat-label">收藏</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view v-for="item in menuItems" :key="item.label" class="menu-item" @click="onMenuTap(item)">
        <text class="menu-item__icon">{{ item.icon }}</text>
        <text class="menu-item__label">{{ item.label }}</text>
        <text v-if="item.badge && item.badge > 0" class="menu-item__badge">{{ item.badge }}</text>
        <text class="menu-item__arrow">→</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="about-text">
      <text>小圈子菜谱 v1.0.0</text>
    </view>

    <view class="bottom-placeholder" />
    <CustomTabBar />
  </view>
</template>

<style lang="scss" scoped>
.profile-page { min-height: 100vh; padding-bottom: 120rpx; }

.profile-header { background: linear-gradient(135deg, #52C41A, #73D13D); }
.profile-header__safe { height: var(--status-bar-height, 44px); }
.profile-header__info { display: flex; flex-direction: column; align-items: center; padding: 40rpx 0; }
.profile-avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.6); }
.profile-name { font-size: 36rpx; font-weight: 700; color: #FFF; margin-top: 16rpx; }
.profile-bio { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 8rpx; }

.stats-row { display: flex; margin: -30rpx 24rpx 24rpx; }
.stat-card {
  flex: 1; background: #FFF; border-radius: 16rpx; padding: 24rpx 8rpx;
  text-align: center; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); margin: 0 6rpx;
}
.stat-num { font-size: 40rpx; font-weight: 700; color: #52C41A; display: block; }
.stat-label { font-size: 22rpx; color: #999; margin-top: 4rpx; }

.menu-list { background: #FFF; margin: 0 24rpx; border-radius: 16rpx; overflow: hidden; }
.menu-item {
  display: flex; align-items: center; padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
}
.menu-item:last-child { border-bottom: none; }
.menu-item__icon { font-size: 36rpx; margin-right: 16rpx; }
.menu-item__label { flex: 1; font-size: 28rpx; }
.menu-item__badge { background: #FF4D4F; color: #FFF; font-size: 20rpx; padding: 2rpx 12rpx; border-radius: 9999rpx; margin-right: 12rpx; }
.menu-item__arrow { color: #ccc; font-size: 28rpx; }

.about-text { text-align: center; padding: 40rpx; color: #ccc; font-size: 24rpx; }
.bottom-placeholder { height: 100rpx; }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add pages/profile/index.vue
git commit -m "feat: add profile page with stats and menu navigation"
```

---

### Task 11: 子页面 (我的上传 + 个人设置)

**Files:**
- Create: `pages/my-uploads/index.vue`, `pages/settings/index.vue`

- [ ] **Step 1: 创建 pages/my-uploads/index.vue — 我的上传/收藏/评价列表**

```vue
<script setup>
import { ref, computed, onLoad } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'

const recipeStore = useRecipeStore()
const userStore = useUserStore()

const tabs = ['已发布', '收藏', '评价']
const activeTab = ref(0)

const myRecipes = computed(() =>
  recipeStore.recipes.filter(r => r.author.id === userStore.currentUser.id)
)

const favRecipes = computed(() =>
  recipeStore.recipes.filter(r => userStore.favorites.includes(r.id))
)

const reviewedRecipes = computed(() =>
  userStore.myReviews.map(rv => {
    const recipe = recipeStore.recipeById(rv.recipeId)
    return { ...rv, recipe }
  }).filter(r => r.recipe)
)

onLoad((options) => {
  if (options && options.tab === 'favorites') activeTab.value = 1
  if (options && options.tab === 'reviews') activeTab.value = 2
})

function onRecipeClick(id) {
  uni.navigateTo({ url: '/pages/recipe-detail/index?id=' + id })
}

function removeFavorite(id) {
  userStore.toggleFavorite(id)
}
</script>

<template>
  <view class="my-uploads-page">
    <!-- Tab 切换 -->
    <view class="tabs">
      <text
        v-for="(tab, idx) in tabs"
        :key="tab"
        class="tab"
        :class="{ 'tab--active': activeTab === idx }"
        @click="activeTab = idx"
      >{{ tab }}</text>
    </view>

    <!-- 已发布 -->
    <view v-if="activeTab === 0">
      <view v-for="recipe in myRecipes" :key="recipe.id" class="list-item" @click="onRecipeClick(recipe.id)">
        <image :src="recipe.coverImage" mode="aspectFill" class="list-item__cover" />
        <view class="list-item__info">
          <text class="list-item__title">{{ recipe.title }}</text>
          <text class="list-item__sub">
            ★ {{ recipe.rating }} · {{ recipe.reviews.length }}评
          </text>
        </view>
        <text class="list-item__arrow">→</text>
      </view>
      <view v-if="myRecipes.length === 0" class="empty">暂无已发布的菜谱</view>
    </view>

    <!-- 收藏 -->
    <view v-if="activeTab === 1">
      <view v-for="recipe in favRecipes" :key="recipe.id" class="list-item" @click="onRecipeClick(recipe.id)">
        <image :src="recipe.coverImage" mode="aspectFill" class="list-item__cover" />
        <view class="list-item__info">
          <text class="list-item__title">{{ recipe.title }}</text>
          <text class="list-item__sub">{{ recipe.author.name }}</text>
        </view>
        <text class="unfav-btn" @click.stop="removeFavorite(recipe.id)">取消</text>
      </view>
      <view v-if="favRecipes.length === 0" class="empty">暂无收藏</view>
    </view>

    <!-- 评价 -->
    <view v-if="activeTab === 2">
      <view v-for="item in reviewedRecipes" :key="item.recipeId" class="list-item" @click="onRecipeClick(item.recipe.id)">
        <image :src="item.recipe.coverImage" mode="aspectFill" class="list-item__cover" />
        <view class="list-item__info">
          <text class="list-item__title">{{ item.recipe.title }}</text>
          <text class="list-item__sub">{{ '★'.repeat(item.rating) }}{{ '☆'.repeat(5 - item.rating) }}</text>
        </view>
        <text class="list-item__arrow">→</text>
      </view>
      <view v-if="reviewedRecipes.length === 0" class="empty">暂无评价</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.my-uploads-page { min-height: 100vh; background: #FBF8FD; }

.tabs { display: flex; background: #FFF; padding: 0 24rpx; }
.tab { flex: 1; text-align: center; padding: 28rpx 0; font-size: 28rpx; color: #999; border-bottom: 4rpx solid transparent; }
.tab--active { color: #52C41A; font-weight: 600; border-bottom-color: #52C41A; }

.list-item { display: flex; align-items: center; background: #FFF; padding: 20rpx 24rpx; margin: 12rpx 24rpx; border-radius: 16rpx; }
.list-item__cover { width: 100rpx; height: 100rpx; border-radius: 12rpx; margin-right: 16rpx; }
.list-item__info { flex: 1; }
.list-item__title { font-size: 28rpx; font-weight: 600; display: block; }
.list-item__sub { font-size: 24rpx; color: #999; margin-top: 4rpx; display: block; }
.list-item__arrow { color: #ccc; font-size: 28rpx; }
.unfav-btn { color: #FF4D4F; font-size: 24rpx; padding: 8rpx 16rpx; }

.empty { text-align: center; padding: 80rpx 0; color: #999; font-size: 26rpx; }
</style>
```

- [ ] **Step 2: 创建 pages/settings/index.vue — 个人设置**

```vue
<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const name = ref(userStore.currentUser.name)
const bio = ref(userStore.currentUser.bio)
const avatar = ref(userStore.currentUser.avatar)

function changeAvatar() {
  uni.chooseImage({
    count: 1,
    success(res) {
      avatar.value = res.tempFilePaths[0]
    }
  })
}

function saveProfile() {
  userStore.updateProfile({
    name: name.value.trim() || userStore.currentUser.name,
    avatar: avatar.value,
    bio: bio.value.trim()
  })
  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<template>
  <view class="settings-page">
    <view class="settings-section">
      <view class="avatar-row" @click="changeAvatar">
        <text class="settings-label">头像</text>
        <image class="settings-avatar" :src="avatar" mode="aspectFill" />
      </view>
      <view class="settings-row">
        <text class="settings-label">昵称</text>
        <input class="settings-input" v-model="name" placeholder="输入昵称" />
      </view>
      <view class="settings-row">
        <text class="settings-label">简介</text>
        <input class="settings-input" v-model="bio" placeholder="一句话介绍自己" />
      </view>
    </view>

    <view class="save-btn" @click="saveProfile">
      <text>保存</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.settings-page { min-height: 100vh; background: #FBF8FD; padding: 24rpx; }

.settings-section { background: #FFF; border-radius: 16rpx; overflow: hidden; }
.settings-row, .avatar-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28rpx 24rpx; border-bottom: 1rpx solid #F5F5F5;
}
.avatar-row:last-child, .settings-row:last-child { border-bottom: none; }
.settings-label { font-size: 28rpx; flex-shrink: 0; }
.settings-input { text-align: right; font-size: 26rpx; color: #666; flex: 1; margin-left: 24rpx; }
.settings-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; }

.save-btn { background: #52C41A; color: #FFF; text-align: center; padding: 24rpx; border-radius: 9999rpx; margin-top: 48rpx; font-size: 30rpx; }
</style>
```

- [ ] **Step 3: 提交**

```bash
git add pages/my-uploads/index.vue pages/settings/index.vue
git commit -m "feat: add my-uploads and settings sub-pages"
```

---

### Task 12: 全局动画与交互打磨

**Files:**
- Modify: `App.vue`, `pages/home/index.vue`

- [ ] **Step 1: 添加全局页面过渡动画到 App.vue**

Replace `App.vue`:
```vue
<script setup>
</script>

<template></template>

<style lang="scss">
@import '@/uni.scss';

/* 页面进入动画 */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in-up {
  animation: fade-in-up 300ms ease-out;
}

/* 通用按钮点击反馈 */
.btn-scale:active {
  transform: scale(0.95);
  transition: transform 0.15s;
}
</style>
```

- [ ] **Step 2: 添加首页缺失的 computed 导入**

打开 `pages/home/index.vue`，确保第一行导入包含 `computed`:
```vue
import { ref, computed, onMounted } from 'vue'
```

(已在 Task 5 中包含，此处做验证)

- [ ] **Step 3: 安装依赖并验证编译**

```bash
npm install
```

Run: `npx uni-app-cli build --platform mp-weixin` (或使用 HBuilderX)

- [ ] **Step 4: 提交**

```bash
git add App.vue
git commit -m "feat: add global page transition animation and polish interactions"
```

---

---

## Self-Review

### 1. Spec Coverage Check

| Spec Section | Covered By |
|---|---|
| 4.1 首页（标题→搜索→分类→排行榜→瀑布流） | Task 5 |
| 4.2 全部菜品（搜索+一级分类+二级筛选+瀑布流） | Task 6 |
| 4.3 菜品详情（封面→信息→食材滑块→步骤→评分/建议列表） | Task 7 |
| 4.4 上传菜谱 4步表单+草稿 | Task 9 |
| 4.5 个人中心（头像→统计→菜单→关于） | Task 10 |
| 4.6 子页面（我的上传/收藏/评价/设置） | Task 11 |
| 评分弹窗 1-5星 | Task 8 (RatingModal) |
| 建议弹窗 文本输入 | Task 8 (SuggestionModal) |
| Pinia Stores (recipe/user/upload) | Task 3 |
| Mock 数据 6条菜谱 | Task 2 |
| 自定义 TabBar | Task 4 (CustomTabBar) |
| 全局视觉令牌 | Task 1 (uni.scss) |
| 全局动画 | Task 12 |
| 菜谱类型定义 | Task 2 (data/recipes.ts) |

### 2. Placeholder Scan

- No "TBD", "TODO", or "implement later" found
- All steps contain actual code or exact commands
- No "add appropriate error handling" without specifics
- No "similar to Task N" references without code

### 3. Type Consistency

- `Recipe`, `Review`, `Suggestion`, `User`, `Ingredient`, `Step` defined in `data/recipes.ts` (Task 2) — used consistently across all stores and pages
- `useRecipeStore` exposes `rateRecipe`, `suggestRecipe`, `deleteReview`, `deleteSuggestion` — called from detail page (Task 7) with matching signatures
- `useUserStore` exposes `toggleFavorite`, `isFavorite`, `addReview`, `addSuggestion`, `removeReview`, `removeSuggestion` — used in detail page and my-uploads page
- `useUploadStore` exposes `initDraft`, `saveDraft`, `loadDrafts`, `clearCurrentDraft` — used in upload page (Task 9)
- Pinia setup syntax (`defineStore('name', () => { ... })`) used consistently
- `CATEGORIES`, `CUISINES`, `TAGS`, `DIFFICULTIES`, `CATEGORY_MAP` exported from data/recipes.ts and imported where needed

### Pre-requisites

The project uses uni-app with Vue 3. If using CLI (not HBuilderX), ensure dependencies are installed:

```bash
npm init -y
npm install pinia
```

---

**Plan complete.** Two execution options:

1. **Subagent-Driven (recommended)** — 每个 Task 独立子代理执行，任务间 review
2. **Inline Execution** — 当前会话按顺序执行，批量提交
