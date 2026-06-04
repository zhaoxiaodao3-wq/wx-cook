import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/data/recipes'
import { getSession, setSession, getWechatProfile } from '@/utils/session'
import { hasApiServer } from '@/api/request'
import { patchCurrentUser, uploadUserAvatar, fetchCurrentUser } from '@/api/user'
import { addFavorite, removeFavorite } from '@/api/favorite'
import { resolveMediaUrl } from '@/utils/media'
import { hasValidToken } from '@/utils/token'

const emptyUser = (): User => ({
  id: '',
  name: '',
  avatar: '',
  bio: '',
})

function isLocalTempPath(url: string) {
  return (
    url.startsWith('wxfile://') ||
    url.startsWith('http://tmp/') ||
    url.startsWith('https://tmp/') ||
    url.includes('/tmp/')
  )
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User>(emptyUser())
  const favorites = ref<string[]>([])
  const myReviews = ref<{ recipeId: string; rating: number; date: string }[]>([])
  const mySuggestions = ref<{ recipeId: string; content: string; date: string }[]>([])
  const userStats = ref({
    uploads: 0,
    reviews: 0,
    suggestions: 0,
    favorites: 0,
  })

  function setUser(user: User) {
    currentUser.value = { ...user }
  }

  function clearUser() {
    currentUser.value = emptyUser()
    favorites.value = []
    myReviews.value = []
    mySuggestions.value = []
    userStats.value = { uploads: 0, reviews: 0, suggestions: 0, favorites: 0 }
  }

  function persistLocal(user: User) {
    const session = getSession()
    if (session) {
      setSession({ ...session, user: { ...user } })
    }
  }

  function syncFavorite(recipeId: string, favorited: boolean) {
    const idx = favorites.value.indexOf(recipeId)
    if (favorited && idx === -1) favorites.value.push(recipeId)
    if (!favorited && idx !== -1) favorites.value.splice(idx, 1)
  }

  async function refreshFromServer() {
    if (!hasApiServer() || !hasValidToken()) return
    try {
      const me = await fetchCurrentUser()
      const user: User = {
        id: me.id,
        name: me.name,
        avatar: resolveMediaUrl(me.avatar),
        bio: me.bio || '',
      }
      currentUser.value = user
      persistLocal(user)
      if (me.stats) {
        userStats.value = { ...me.stats }
      }
    } catch {
      /* 保持本地 session */
    }
  }

  async function updateProfile(
    data: Partial<User>,
    options?: { saveWechatSnapshot?: boolean }
  ) {
    let next = { ...currentUser.value, ...data }

    if (hasApiServer()) {
      if (next.avatar && isLocalTempPath(next.avatar)) {
        next.avatar = await uploadUserAvatar(next.avatar)
      }

      const patch: Partial<Pick<User, 'name' | 'bio'>> = {}
      if (data.name !== undefined) patch.name = next.name
      if (data.bio !== undefined) patch.bio = next.bio

      if (Object.keys(patch).length > 0) {
        const updated = await patchCurrentUser(patch)
        next = {
          ...next,
          name: updated.name,
          bio: updated.bio ?? next.bio,
          avatar: resolveMediaUrl(updated.avatar) || next.avatar,
        }
      }
    }

    currentUser.value = next
    persistLocal(next)

    if (options?.saveWechatSnapshot) {
      const session = getSession()
      if (session) {
        setSession({
          ...session,
          user: { ...next },
          wechatProfile: { name: next.name, avatar: next.avatar },
        })
      }
    }
  }

  async function restoreWechatProfile() {
    const wx = getWechatProfile()
    if (!wx) return false
    await updateProfile({ name: wx.name, avatar: wx.avatar })
    return true
  }

  function hasWechatProfile() {
    return !!getWechatProfile()
  }

  async function toggleFavorite(recipeId: string) {
    const idx = favorites.value.indexOf(recipeId)
    const isFav = idx !== -1

    if (hasApiServer()) {
      if (isFav) await removeFavorite(recipeId)
      else await addFavorite(recipeId)
    }

    if (isFav) favorites.value.splice(idx, 1)
    else favorites.value.push(recipeId)
  }

  function isFavorite(recipeId: string) {
    return favorites.value.includes(recipeId)
  }

  function addReview(recipeId: string, rating: number) {
    const existingIdx = myReviews.value.findIndex((r) => r.recipeId === recipeId)
    const row = { recipeId, rating, date: new Date().toISOString() }
    if (existingIdx !== -1) myReviews.value[existingIdx] = row
    else myReviews.value.push(row)
  }

  function addSuggestion(recipeId: string, content: string) {
    const existingIdx = mySuggestions.value.findIndex((s) => s.recipeId === recipeId)
    const row = { recipeId, content, date: new Date().toISOString() }
    if (existingIdx !== -1) mySuggestions.value[existingIdx] = row
    else mySuggestions.value.push(row)
  }

  function removeReview(recipeId: string) {
    myReviews.value = myReviews.value.filter((r) => r.recipeId !== recipeId)
  }

  function removeSuggestion(recipeId: string) {
    mySuggestions.value = mySuggestions.value.filter((s) => s.recipeId !== recipeId)
  }

  return {
    currentUser,
    favorites,
    myReviews,
    mySuggestions,
    userStats,
    setUser,
    clearUser,
    updateProfile,
    restoreWechatProfile,
    hasWechatProfile,
    getWechatProfile,
    refreshFromServer,
    syncFavorite,
    toggleFavorite,
    isFavorite,
    addReview,
    addSuggestion,
    removeReview,
    removeSuggestion,
  }
})
