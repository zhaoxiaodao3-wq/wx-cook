import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User { id: string; name: string; avatar: string; bio: string }

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User>({ id: 'user-001', name: '美食爱好者', avatar: 'https://picsum.photos/200/200?random=100', bio: '热爱分享美食' })
  const favorites = ref<string[]>([])
  const myReviews = ref<{ recipeId: string; rating: number; date: string }[]>([])
  const mySuggestions = ref<{ recipeId: string; content: string; date: string }[]>([])

  function toggleFavorite(recipeId: string) { const idx = favorites.value.indexOf(recipeId); if (idx === -1) favorites.value.push(recipeId); else favorites.value.splice(idx, 1) }
  function isFavorite(recipeId: string) { return favorites.value.includes(recipeId) }
  function addReview(recipeId: string, rating: number) { const existingIdx = myReviews.value.findIndex(r => r.recipeId === recipeId); if (existingIdx !== -1) myReviews.value[existingIdx] = { recipeId, rating, date: new Date().toISOString() }; else myReviews.value.push({ recipeId, rating, date: new Date().toISOString() }) }
  function addSuggestion(recipeId: string, content: string) { const existingIdx = mySuggestions.value.findIndex(s => s.recipeId === recipeId); if (existingIdx !== -1) mySuggestions.value[existingIdx] = { recipeId, content, date: new Date().toISOString() }; else mySuggestions.value.push({ recipeId, content, date: new Date().toISOString() }) }
  function removeReview(recipeId: string) { myReviews.value = myReviews.value.filter(r => r.recipeId !== recipeId) }
  function removeSuggestion(recipeId: string) { mySuggestions.value = mySuggestions.value.filter(s => s.recipeId !== recipeId) }
  function updateProfile(data: Partial<User>) { Object.assign(currentUser.value, data) }

  return { currentUser, favorites, myReviews, mySuggestions, toggleFavorite, isFavorite, addReview, addSuggestion, removeReview, removeSuggestion, updateProfile }
})
