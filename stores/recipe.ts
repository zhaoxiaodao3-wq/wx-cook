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
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.ingredients.some(i => i.name.toLowerCase().includes(q)) || r.tags.some(t => t.toLowerCase().includes(q)))
    }
    if (activeCategory.value !== '全部') { result = result.filter(r => r.category === activeCategory.value) }
    if (activeCuisine.value) { result = result.filter(r => r.cuisine === activeCuisine.value) }
    if (activeTag.value) { result = result.filter(r => r.tags.includes(activeTag.value)) }
    return result
  })

  const topRanked = computed(() => [...recipes.value].filter(r => r.ratingCount > 0).sort((a, b) => b.rating - a.rating).slice(0, 10))
  const latestRecipes = computed(() => [...recipes.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))

  function recipeById(id: string) { return recipes.value.find(r => r.id === id) }
  function addRecipe(recipe: Recipe) { recipes.value.unshift({ ...recipe, reviews: [...recipe.reviews], suggestions: [...recipe.suggestions] }) }
  function updateRecipe(id: string, data: Partial<Recipe>) { const idx = recipes.value.findIndex(r => r.id === id); if (idx !== -1) Object.assign(recipes.value[idx], data) }
  function deleteRecipe(id: string) { recipes.value = recipes.value.filter(r => r.id !== id) }

  function rateRecipe(recipeId: string, userId: string, userName: string, userAvatar: string, rating: number) {
    const recipe = recipes.value.find(r => r.id === recipeId)
    if (!recipe) return
    const existingIdx = recipe.reviews.findIndex(rv => rv.userId === userId)
    const review = { id: existingIdx !== -1 ? recipe.reviews[existingIdx].id : Date.now().toString(), userId, userName, userAvatar, rating, date: new Date().toISOString() }
    if (existingIdx !== -1) { recipe.reviews[existingIdx] = review } else { recipe.reviews.push(review) }
    recipe.rating = Math.round(recipe.reviews.reduce((s, r) => s + r.rating, 0) / recipe.reviews.length * 10) / 10
    recipe.ratingCount = recipe.reviews.length
  }

  function deleteReview(recipeId: string, reviewId: string) {
    const recipe = recipes.value.find(r => r.id === recipeId)
    if (!recipe) return
    recipe.reviews = recipe.reviews.filter(rv => rv.id !== reviewId)
    recipe.rating = recipe.reviews.length > 0 ? Math.round(recipe.reviews.reduce((s, r) => s + r.rating, 0) / recipe.reviews.length * 10) / 10 : 0
    recipe.ratingCount = recipe.reviews.length
  }

  function suggestRecipe(recipeId: string, userId: string, userName: string, userAvatar: string, content: string) {
    const recipe = recipes.value.find(r => r.id === recipeId)
    if (!recipe) return
    const existingIdx = recipe.suggestions.findIndex(s => s.userId === userId)
    const suggestion = { id: existingIdx !== -1 ? recipe.suggestions[existingIdx].id : Date.now().toString(), userId, userName, userAvatar, content, date: new Date().toISOString() }
    if (existingIdx !== -1) { recipe.suggestions[existingIdx] = suggestion } else { recipe.suggestions.push(suggestion) }
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

  return { recipes, searchQuery, activeCategory, activeCuisine, activeTag, filteredRecipes, topRanked, latestRecipes, recipeById, addRecipe, updateRecipe, deleteRecipe, rateRecipe, deleteReview, suggestRecipe, deleteSuggestion, setSearchQuery, setCategory, setCuisine, setTag }
})
