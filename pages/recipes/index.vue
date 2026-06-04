<script setup>
import { ref, computed, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useRecipeStore } from '@/stores/recipe'
import CustomTabBar from '@/components/CustomTabBar.vue'
import PageShell from '@/components/PageShell.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { CATEGORIES, CUISINES, TAGS } from '@/data/recipes'
import { hasApiServer } from '@/api/request'

const store = useRecipeStore()
const categoryList = [...CATEGORIES]

function normalizeStringList(list, fallback) {
  if (!Array.isArray(list)) return fallback
  const items = list.filter((item) => typeof item === 'string' && item.trim())
  return items.length ? items : fallback
}

const cuisineList = computed(() =>
  normalizeStringList(store.filterMeta?.cuisines, CUISINES)
)
const tagList = computed(() => normalizeStringList(store.filterMeta?.tags, TAGS))

const page = ref(1)
const pageSize = 10
const searchInput = ref('')
const searchFocused = ref(false)
const listKey = ref(0)

const displayList = computed(() => {
  if (hasApiServer()) return store.filteredRecipes
  return store.filteredRecipes.slice(0, page.value * pageSize)
})

const leftColumn = computed(() => displayList.value.filter((_, i) => i % 2 === 0))
const rightColumn = computed(() => displayList.value.filter((_, i) => i % 2 === 1))

function bumpListKey() {
  listKey.value = store.feedsVersion
}

onLoad((options) => {
  if (options && options.query) {
    searchInput.value = options.query
    store.setSearchQuery(options.query).then(bumpListKey).catch(() => {})
  }
})

onShow(() => {
  const intent = store.consumeRecipesTabIntent()
  if (intent?.query !== undefined) {
    searchInput.value = intent.query
    store.setSearchQuery(intent.query).then(bumpListKey).catch(() => {})
  } else if (intent?.clearSearch) {
    searchInput.value = ''
    store.setSearchQuery('').then(bumpListKey).catch(() => {})
  } else {
    searchInput.value = store.searchQuery
    if (hasApiServer()) {
      store.refreshDiscoverFeeds().then(bumpListKey).catch(() => {})
    }
  }
  if (intent?.focusSearch) {
    nextTick(() => {
      searchFocused.value = false
      nextTick(() => {
        searchFocused.value = true
      })
    })
  }
})

function onSearchInput(e) {
  searchInput.value = e.detail?.value ?? ''
}

async function commitSearch() {
  const q = searchInput.value.trim()
  searchFocused.value = false
  try {
    await store.setSearchQuery(q)
    page.value = 1
    bumpListKey()
  } catch {
    /* toast 已在 store */
  }
}

function onClearSearch() {
  searchInput.value = ''
  store.setSearchQuery('').then(bumpListKey).catch(() => {})
  page.value = 1
}

async function onCategoryTap(cat) {
  page.value = 1
  try {
    await store.setCategory(cat)
    bumpListKey()
  } catch {
    /* toast 已在 store */
  }
}

async function onCuisineTap(cuisine) {
  const next = store.activeCuisine === cuisine ? '' : cuisine
  page.value = 1
  try {
    await store.setCuisine(next)
    bumpListKey()
  } catch {
    /* toast 已在 store */
  }
}

async function onTagTap(tag) {
  const next = store.activeTag === tag ? '' : tag
  page.value = 1
  try {
    await store.setTag(next)
    bumpListKey()
  } catch {
    /* toast 已在 store */
  }
}

function onRecipeClick(id) {
  uni.navigateTo({ url: '/pages/recipe-detail/index?id=' + id })
}

async function loadMore() {
  if (hasApiServer()) {
    await store.loadMoreList()
    bumpListKey()
    return
  }
  page.value++
}
</script>

<template>
  <PageShell>
  <view class="recipes-page">
    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-bar__input-wrap">
        <text class="search-bar__icon" @tap="commitSearch">搜</text>
        <input
          class="search-bar__input"
          :value="searchInput"
          placeholder="搜索菜谱或食材..."
          :focus="searchFocused"
          confirm-type="search"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @input="onSearchInput"
          @confirm="commitSearch"
        />
        <text v-if="searchInput" class="search-bar__clear" @tap="onClearSearch">×</text>
      </view>
    </view>

    <!-- 一级分类 -->
    <scroll-view scroll-x enable-flex class="filter-scroll">
      <view class="filter-row">
        <view
          v-for="cat in categoryList"
          :key="cat"
          class="filter-chip"
          :class="{ 'filter-chip--active': store.activeCategory === cat }"
          @tap="onCategoryTap(cat)"
        >
          <text>{{ cat }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 二级: 菜系 -->
    <scroll-view scroll-x enable-flex class="filter-scroll filter-scroll--sub">
      <view class="filter-row">
        <view
          v-for="c in cuisineList"
          :key="'c-' + c"
          class="filter-chip filter-chip--sub"
          :class="{ 'filter-chip--active': store.activeCuisine === c }"
          @tap="onCuisineTap(c)"
        >
          <text>{{ c }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 二级: 标签 -->
    <scroll-view scroll-x enable-flex class="filter-scroll filter-scroll--sub">
      <view class="filter-row">
        <view
          v-for="t in tagList"
          :key="'t-' + t"
          class="filter-chip filter-chip--sub"
          :class="{ 'filter-chip--active': store.activeTag === t }"
          @tap="onTagTap(t)"
        >
          <text>{{ t }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 结果数 -->
    <view class="result-count">
      <text>共 {{ store.filteredRecipes.length }} 个菜谱</text>
    </view>

    <!-- 双列瀑布流 -->
    <view class="waterfall" :key="'discover-' + listKey">
      <view class="waterfall__col">
        <RecipeCard
          v-for="recipe in leftColumn"
          :key="recipe.id + '-' + listKey"
          :recipe="recipe"
          @click="onRecipeClick"
        />
      </view>
      <view class="waterfall__col">
        <RecipeCard
          v-for="recipe in rightColumn"
          :key="recipe.id + '-' + listKey"
          :recipe="recipe"
          @click="onRecipeClick"
        />
      </view>
    </view>

    <view v-if="displayList.length < store.filteredRecipes.length" class="load-more" @tap="loadMore">
      <text>加载更多</text>
    </view>
    <view v-else-if="store.filteredRecipes.length === 0" class="empty">
      <text>没有找到相关菜谱</text>
    </view>

    <view class="bottom-placeholder" />
    <CustomTabBar />
  </view>
  </PageShell>
</template>

<style lang="scss" scoped>
.recipes-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
}

.search-bar { padding: 20rpx 32rpx; background: #FFFFFF; border-bottom: 1rpx solid #F0F0F0; }
.search-bar__input-wrap {
  display: flex; align-items: center; background: #F8F6FA;
  border-radius: 9999rpx; padding: 18rpx 28rpx; border: 1rpx solid #F0F0F0;
}
.search-bar__icon {
  font-size: 24rpx; margin-right: 12rpx; color: #52C41A; font-weight: 700; flex-shrink: 0;
  padding: 8rpx 4rpx;
}
.search-bar__input { flex: 1; font-size: 26rpx; color: #1a1a1a; }
.search-bar__clear { color: #777777; font-size: 32rpx; padding: 4rpx; flex-shrink: 0; line-height: 1; }

.filter-scroll {
  width: 100%;
  background: #FFFFFF;
  border-bottom: 1rpx solid rgba(237, 228, 218, 0.5);
}
.filter-scroll--sub { border-bottom: none; }
.filter-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: 16rpx 32rpx;
}
.filter-chip {
  flex-shrink: 0;
  padding: 10rpx 26rpx;
  border-radius: 9999rpx;
  font-size: 24rpx;
  color: #777777;
  background: transparent;
  margin-right: 12rpx;
  border: 1rpx solid #F0F0F0;
}
.filter-chip--sub { font-size: 22rpx; padding: 8rpx 22rpx; }
.filter-chip--active {
  background: #52C41A; color: #FFF; border-color: #52C41A;
}
.filter-chip--active text { color: #FFF; }

.result-count { padding: 20rpx 32rpx 8rpx; font-size: 22rpx; color: #777777; }

.waterfall { display: flex; gap: 20rpx; padding: 0 32rpx; }
.waterfall__col { flex: 1; min-width: 0; }

.load-more { text-align: center; padding: 24rpx; color: #777777; font-size: 24rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #777777; font-size: 26rpx; }

.bottom-placeholder { height: 120rpx; }
</style>
