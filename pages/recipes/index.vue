<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
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
      <text>— 加载更多 —</text>
    </view>
    <view v-else-if="store.filteredRecipes.length === 0" class="empty">
      <text>没有找到相关菜谱</text>
    </view>

    <view class="bottom-placeholder" />
    <CustomTabBar />
  </view>
</template>

<style lang="scss" scoped>
.recipes-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  animation: editorial-enter 400ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.search-bar { padding: 20rpx 32rpx; background: #FFFCF7; border-bottom: 1rpx solid #EDE4DA; }
.search-bar__input-wrap {
  display: flex; align-items: center; background: #F5EDE3;
  border-radius: 9999rpx; padding: 18rpx 28rpx; border: 1rpx solid #EDE4DA;
}
.search-bar__icon { font-size: 28rpx; margin-right: 12rpx; opacity: 0.5; flex-shrink: 0; }
.search-bar__input { flex: 1; font-size: 26rpx; color: #3C2415; }
.search-bar__clear { color: #A89885; font-size: 28rpx; padding: 4rpx; flex-shrink: 0; }

.filter-row { white-space: nowrap; padding: 16rpx 32rpx; background: #FFFCF7; border-bottom: 1rpx solid rgba(237,228,218,0.5); }
.filter-row--sub { padding-top: 0; border-bottom: none; }
.filter-chip {
  display: inline-block; padding: 10rpx 26rpx; border-radius: 9999rpx;
  font-size: 24rpx; color: #5C4033; background: transparent; margin-right: 12rpx;
  border: 1rpx solid #EDE4DA; letter-spacing: 1rpx; transition: all 200ms ease;
}
.filter-chip--sub { font-size: 22rpx; padding: 8rpx 22rpx; }
.filter-chip--active {
  background: #D4784C; color: #FFF; border-color: #D4784C;
  box-shadow: 0 4rpx 12rpx rgba(212,120,76,0.15);
}

.result-count { padding: 20rpx 32rpx 8rpx; font-size: 22rpx; color: #A89885; letter-spacing: 1rpx; }

.waterfall { display: flex; gap: 20rpx; padding: 0 32rpx; }
.waterfall__col { flex: 1; }

.load-more { text-align: center; padding: 24rpx; color: #A89885; font-size: 24rpx; letter-spacing: 2rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #A89885; font-size: 26rpx; }

.bottom-placeholder { height: 120rpx; }
</style>
