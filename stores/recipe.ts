import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockRecipes, CATEGORY_MAP } from '@/data/recipes'
import type { Recipe } from '@/data/recipes'
import { hasApiServer, canLoadRemoteContent } from '@/api/request'
import { mapApiRecipeDetail, mapApiRecipeListItem } from '@/api/adapters'
import {
  fetchRecipes,
  fetchRankedRecipes,
  fetchRecipeDetail as fetchRecipeDetailApi,
  createRecipe,
  type PublishRecipePayload,
  type RecipeListQuery,
} from '@/api/recipes'
import { fetchFilterMeta } from '@/api/meta'
import { submitReview, deleteMyReview } from '@/api/reviews'
import { submitSuggestion, deleteMySuggestion } from '@/api/suggestions'
import { uploadImage } from '@/api/upload'
import { toApiMediaPath } from '@/utils/media'
import { useUserStore } from '@/stores/user'

function isLocalTempPath(url: string) {
  return (
    url.startsWith('wxfile://') ||
    url.startsWith('http://tmp/') ||
    url.startsWith('https://tmp/') ||
    url.includes('/tmp/')
  )
}

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>(
    hasApiServer()
      ? []
      : [...mockRecipes.map((r) => ({ ...r, reviews: [...r.reviews], suggestions: [...r.suggestions] }))]
  )
  const rankedRecipes = ref<Recipe[]>([])
  const detailCache = ref<Record<string, Recipe>>({})
  const searchQuery = ref('')
  const activeCategory = ref('全部')
  const activeCuisine = ref('')
  const activeTag = ref('')
  const listPage = ref(1)
  const listHasMore = ref(true)
  const listLoading = ref(false)
  /** 瀑布流排序：首页「热门」用 rating，「最新上传」用 createdAt */
  const listSort = ref<'createdAt' | 'rating'>('rating')
  const filterMeta = ref<{
    cuisines: string[]
    tags: string[]
  } | null>(null)
  /** 列表/排行榜刷新版本号，用于强制 UI 更新 */
  const feedsVersion = ref(0)

  const filteredRecipes = computed(() => {
    if (hasApiServer()) return recipes.value
    let result = recipes.value
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (activeCategory.value !== '全部') {
      result = result.filter((r) => r.category === activeCategory.value)
    }
    if (activeCuisine.value) result = result.filter((r) => r.cuisine === activeCuisine.value)
    if (activeTag.value) result = result.filter((r) => r.tags.includes(activeTag.value))
    return result
  })

  const topRanked = computed(() =>
    hasApiServer() ? rankedRecipes.value : [...recipes.value].filter((r) => r.ratingCount > 0).sort((a, b) => b.rating - a.rating).slice(0, 10)
  )

  const latestRecipes = computed(() => {
    if (hasApiServer()) return recipes.value
    return [...recipes.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  function recipeById(id: string) {
    return detailCache.value[id] || recipes.value.find((r) => r.id === id)
  }

  function upsertInList(recipe: Recipe) {
    const idx = recipes.value.findIndex((r) => r.id === recipe.id)
    if (idx === -1) recipes.value.unshift(recipe)
    else recipes.value[idx] = { ...recipes.value[idx], ...recipe }
    detailCache.value[recipe.id] = recipe
  }

  async function loadFilterMeta() {
    if (!canLoadRemoteContent()) return
    try {
      const meta = await fetchFilterMeta()
      filterMeta.value = {
        cuisines: [...(meta.cuisines || [])],
        tags: [...(meta.tags || [])],
      }
    } catch {
      /* 使用本地默认 */
    }
  }

  async function loadRanked(limit = 10) {
    if (!canLoadRemoteContent()) return
    const list = await fetchRankedRecipes(limit)
    rankedRecipes.value = list.map(mapApiRecipeListItem)
  }

  function resolveCategoryApiKey(label: string): string | undefined {
    if (!label || label === '全部') return undefined
    const fromMap = CATEGORY_MAP[label]
    if (fromMap && fromMap !== 'all') return fromMap
    const fromMeta = filterMeta.value?.categories?.find((c) => c.label === label)
    if (fromMeta?.key && fromMeta.key !== 'all') return fromMeta.key
    return undefined
  }

  function buildListQuery(page: number): RecipeListQuery {
    const query: RecipeListQuery = {
      page,
      pageSize: 10,
      sort: listSort.value,
    }
    const q = searchQuery.value.trim()
    if (q) query.q = q
    const categoryKey = resolveCategoryApiKey(activeCategory.value)
    if (categoryKey) query.category = categoryKey
    if (activeCuisine.value) query.cuisine = activeCuisine.value
    if (activeTag.value) query.tag = activeTag.value
    return query
  }

  async function loadRecipeList(opts?: { reset?: boolean; page?: number; force?: boolean }) {
    if (!canLoadRemoteContent()) return
    if (listLoading.value && !opts?.force) return
    listLoading.value = true
    try {
      const page = opts?.reset ? 1 : opts?.page ?? listPage.value

      const data = await fetchRecipes(buildListQuery(page))

      const items = (data.items || []).map(mapApiRecipeListItem)
      if (opts?.reset || page === 1) recipes.value = items
      else recipes.value.push(...items)

      listPage.value = page
      listHasMore.value = data.hasMore

      const userStore = useUserStore()
      items.forEach((r) => {
        if (r.isFavorite) userStore.syncFavorite(r.id, true)
      })
    } finally {
      listLoading.value = false
    }
  }

  async function initRecipes() {
    if (!canLoadRemoteContent()) return
    await Promise.all([loadFilterMeta(), loadRanked(), loadRecipeList({ reset: true })])
    feedsVersion.value += 1
    uni.$emit('recipe-feeds-changed')
  }

  async function reloadList() {
    listPage.value = 1
    listHasMore.value = true
    try {
      await loadRecipeList({ reset: true, force: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载失败'
      uni.showToast({ title: msg, icon: 'none' })
      throw err
    }
  }

  /** 发现页专用：按最新排序拉列表，不刷新排行榜 */
  async function refreshDiscoverFeeds() {
    if (!canLoadRemoteContent()) return
    listSort.value = 'createdAt'
    if (!filterMeta.value) {
      try {
        await loadFilterMeta()
      } catch {
        /* 使用本地默认筛选项 */
      }
    }
    await reloadList()
    feedsVersion.value += 1
    uni.$emit('recipe-feeds-changed')
  }

  async function setListSort(sort: 'createdAt' | 'rating') {
    listSort.value = sort
    listPage.value = 1
    listHasMore.value = true
    if (!canLoadRemoteContent()) {
      feedsVersion.value += 1
      uni.$emit('recipe-feeds-changed')
      return
    }
    await loadRecipeList({ reset: true, force: true })
    feedsVersion.value += 1
    uni.$emit('recipe-feeds-changed')
  }

  /** 刷新首页/发现所需的列表与排行榜（Tab 切回、发布、评分后调用） */
  async function refreshPublicFeeds(sort?: 'createdAt' | 'rating') {
    if (!canLoadRemoteContent()) return
    if (sort) listSort.value = sort
    await Promise.all([loadRanked(), loadRecipeList({ reset: true, force: true })])
    feedsVersion.value += 1
    uni.$emit('recipe-feeds-changed')
  }

  function markFeedsStale() {
    feedsVersion.value += 1
    uni.$emit('recipe-feeds-changed')
  }

  function patchRecipeInFeeds(recipeId: string, patch: Partial<Recipe>) {
    updateRecipe(recipeId, patch)
    const ri = rankedRecipes.value.findIndex((r) => r.id === recipeId)
    if (ri !== -1) {
      rankedRecipes.value[ri] = { ...rankedRecipes.value[ri], ...patch }
    }
  }

  async function loadMoreList() {
    if (!canLoadRemoteContent() || !listHasMore.value || listLoading.value) return
    await loadRecipeList({ page: listPage.value + 1 })
  }

  async function fetchRecipeDetail(id: string) {
    if (!hasApiServer()) {
      const r = recipes.value.find((x) => x.id === id)
      if (r) detailCache.value[id] = r
      return r
    }
    const data = await fetchRecipeDetailApi(id)
    const recipe = mapApiRecipeDetail(data)
    detailCache.value[id] = recipe
    upsertInList(recipe)
    if (recipe.isFavorite) useUserStore().syncFavorite(id, true)
    return recipe
  }

  async function publishRecipe(form: {
    title: string
    coverImage: string
    duration: number
    difficulty: string
    category: string
    cuisine: string
    tags: string[]
    servings: number
    ingredients: Recipe['ingredients']
    steps: Recipe['steps']
    tips: string
    crowd: string
  }) {
    if (!hasApiServer()) {
      const user = useUserStore().currentUser
      const recipe: Recipe = {
        id: Date.now().toString(),
        title: form.title,
        coverImage: form.coverImage || '',
        author: { ...user },
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        duration: form.duration,
        difficulty: form.difficulty as Recipe['difficulty'],
        category: form.category as Recipe['category'],
        cuisine: form.cuisine,
        tags: form.tags,
        servings: form.servings,
        ingredients: form.ingredients,
        steps: form.steps,
        tips: form.tips,
        crowd: form.crowd,
        reviews: [],
        suggestions: [],
      }
      addRecipe(recipe)
      return recipe
    }

    let cover = form.coverImage
    if (cover && isLocalTempPath(cover)) {
      cover = await uploadImage(cover)
    }

    const steps = await Promise.all(
      form.steps.map(async (s) => {
        let image = s.image || null
        if (image && isLocalTempPath(image)) {
          image = await uploadImage(image)
        }
        return {
          id: null,
          desc: s.desc,
          image: image ? toApiMediaPath(image) || image : null,
        }
      })
    )

    const payload: PublishRecipePayload = {
      title: form.title,
      coverImage: cover ? toApiMediaPath(cover) || cover : null,
      duration: form.duration,
      difficulty: form.difficulty,
      category: form.category,
      cuisine: form.cuisine,
      tags: form.tags,
      servings: form.servings,
      ingredients: form.ingredients.filter((i) => i.name.trim()),
      steps,
      tips: form.tips,
      crowd: form.crowd,
    }

    const created = await createRecipe(payload)
    const recipe = mapApiRecipeDetail(created)
    addRecipe(recipe)
    await refreshPublicFeeds()
    return recipe
  }

  function addRecipe(recipe: Recipe) {
    recipes.value.unshift({ ...recipe, reviews: [...recipe.reviews], suggestions: [...recipe.suggestions] })
    detailCache.value[recipe.id] = recipe
  }

  function updateRecipe(id: string, data: Partial<Recipe>) {
    const idx = recipes.value.findIndex((r) => r.id === id)
    if (idx !== -1) Object.assign(recipes.value[idx], data)
    if (detailCache.value[id]) Object.assign(detailCache.value[id], data)
  }

  function deleteRecipe(id: string) {
    recipes.value = recipes.value.filter((r) => r.id !== id)
    delete detailCache.value[id]
  }

  async function rateRecipe(
    recipeId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    rating: number
  ) {
    if (hasApiServer()) {
      const res = await submitReview(recipeId, rating)
      const recipe = detailCache.value[recipeId] || recipes.value.find((r) => r.id === recipeId)
      if (recipe) {
        const existingIdx = recipe.reviews.findIndex((rv) => rv.userId === userId)
        const review = {
          id: res.review.id,
          userId: res.review.userId,
          userName: res.review.userName,
          userAvatar: res.review.userAvatar,
          rating: res.review.rating,
          date: res.review.date,
        }
        if (existingIdx !== -1) recipe.reviews[existingIdx] = review
        else recipe.reviews.push(review)
        recipe.rating = res.recipeRating
        recipe.ratingCount = res.ratingCount
        recipe.myReview = { id: res.review.id, rating: res.review.rating }
        patchRecipeInFeeds(recipeId, {
          rating: res.recipeRating,
          ratingCount: res.ratingCount,
          reviews: [...recipe.reviews],
          myReview: recipe.myReview,
        })
        detailCache.value[recipeId] = { ...recipe }
      }
      await refreshPublicFeeds()
      return
    }
    const recipe = recipes.value.find((r) => r.id === recipeId)
    if (!recipe) return
    const existingIdx = recipe.reviews.findIndex((rv) => rv.userId === userId)
    const review = {
      id: existingIdx !== -1 ? recipe.reviews[existingIdx].id : Date.now().toString(),
      userId,
      userName,
      userAvatar,
      rating,
      date: new Date().toISOString(),
    }
    if (existingIdx !== -1) recipe.reviews[existingIdx] = review
    else recipe.reviews.push(review)
    recipe.rating =
      Math.round((recipe.reviews.reduce((s, r) => s + r.rating, 0) / recipe.reviews.length) * 10) / 10
    recipe.ratingCount = recipe.reviews.length
  }

  async function deleteReview(recipeId: string, reviewId: string) {
    if (hasApiServer()) {
      const res = await deleteMyReview(recipeId)
      const recipe = detailCache.value[recipeId]
      if (recipe) {
        recipe.reviews = recipe.reviews.filter((rv) => rv.id !== reviewId)
        recipe.rating = res.recipeRating
        recipe.ratingCount = res.ratingCount
        recipe.myReview = undefined
        patchRecipeInFeeds(recipeId, {
          rating: res.recipeRating,
          ratingCount: res.ratingCount,
          reviews: [...recipe.reviews],
          myReview: undefined,
        })
        detailCache.value[recipeId] = { ...recipe }
      }
      await refreshPublicFeeds()
      return
    }
    const recipe = recipes.value.find((r) => r.id === recipeId)
    if (!recipe) return
    recipe.reviews = recipe.reviews.filter((rv) => rv.id !== reviewId)
    recipe.rating =
      recipe.reviews.length > 0
        ? Math.round((recipe.reviews.reduce((s, r) => s + r.rating, 0) / recipe.reviews.length) * 10) / 10
        : 0
    recipe.ratingCount = recipe.reviews.length
  }

  async function suggestRecipe(
    recipeId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    content: string
  ) {
    if (hasApiServer()) {
      const res = await submitSuggestion(recipeId, content)
      const recipe = detailCache.value[recipeId]
      if (recipe) {
        const existingIdx = recipe.suggestions.findIndex((s) => s.userId === userId)
        const suggestion = {
          id: res.id,
          userId: res.userId,
          userName: res.userName,
          userAvatar: res.userAvatar,
          content: res.content,
          date: res.date,
        }
        if (existingIdx !== -1) recipe.suggestions[existingIdx] = suggestion
        else recipe.suggestions.push(suggestion)
        recipe.mySuggestion = { id: res.id, content: res.content }
        upsertInList({ ...recipe })
      }
      return
    }
    const recipe = recipes.value.find((r) => r.id === recipeId)
    if (!recipe) return
    const existingIdx = recipe.suggestions.findIndex((s) => s.userId === userId)
    const suggestion = {
      id: existingIdx !== -1 ? recipe.suggestions[existingIdx].id : Date.now().toString(),
      userId,
      userName,
      userAvatar,
      content,
      date: new Date().toISOString(),
    }
    if (existingIdx !== -1) recipe.suggestions[existingIdx] = suggestion
    else recipe.suggestions.push(suggestion)
  }

  async function deleteSuggestion(recipeId: string, suggestionId: string) {
    if (hasApiServer()) {
      await deleteMySuggestion(recipeId)
      const recipe = detailCache.value[recipeId]
      if (recipe) {
        recipe.suggestions = recipe.suggestions.filter((s) => s.id !== suggestionId)
        recipe.mySuggestion = undefined
        upsertInList({ ...recipe })
      }
      return
    }
    const recipe = recipes.value.find((r) => r.id === recipeId)
    if (!recipe) return
    recipe.suggestions = recipe.suggestions.filter((s) => s.id !== suggestionId)
  }

  async function setSearchQuery(q: string) {
    searchQuery.value = q
    if (canLoadRemoteContent()) await reloadList()
  }

  async function setCategory(c: string) {
    activeCategory.value = c
    activeCuisine.value = ''
    activeTag.value = ''
    if (canLoadRemoteContent()) await reloadList()
  }

  async function setCuisine(c: string) {
    activeCuisine.value = c
    if (canLoadRemoteContent()) await reloadList()
  }

  async function setTag(t: string) {
    activeTag.value = t
    if (canLoadRemoteContent()) await reloadList()
  }

  /** 跳转到 Tab「发现」页（switchTab 不能带 query，用 intent 传递） */
  let recipesTabIntent: {
    focusSearch?: boolean
    query?: string
    clearSearch?: boolean
  } | null = null

  function openRecipesTab(opts?: { focusSearch?: boolean; query?: string }) {
    recipesTabIntent = {
      focusSearch: opts?.focusSearch,
      query: opts?.query,
      clearSearch: !!opts?.focusSearch && opts?.query === undefined,
    }
    uni.switchTab({ url: '/pages/recipes/index' })
  }

  function consumeRecipesTabIntent() {
    const intent = recipesTabIntent
    recipesTabIntent = null
    return intent
  }

  return {
    recipes,
    rankedRecipes,
    searchQuery,
    activeCategory,
    activeCuisine,
    activeTag,
    filteredRecipes,
    topRanked,
    latestRecipes,
    listHasMore,
    listLoading,
    listSort,
    filterMeta,
    feedsVersion,
    recipeById,
    initRecipes,
    reloadList,
    refreshPublicFeeds,
    refreshDiscoverFeeds,
    setListSort,
    markFeedsStale,
    loadMoreList,
    fetchRecipeDetail,
    publishRecipe,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    rateRecipe,
    deleteReview,
    suggestRecipe,
    deleteSuggestion,
    setSearchQuery,
    setCategory,
    setCuisine,
    setTag,
    openRecipesTab,
    consumeRecipesTabIntent,
  }
})
