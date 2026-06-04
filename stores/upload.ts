import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Ingredient { name: string; amount: string; unit: string }
interface Step { id: number; desc: string; image?: string }
interface Draft {
  id: string; title: string; step: number; coverImage: string; duration: number; difficulty: string;
  servings: number; ingredients: Ingredient[]; steps: Step[]; category: string; cuisine: string;
  tags: string[]; crowd: string; tips: string; savedAt: string
}

function emptyDraft(): Draft {
  return { id: Date.now().toString(), title: '', step: 1, coverImage: '', duration: 30, difficulty: '中等', servings: 2, ingredients: [], steps: [], category: 'lunch', cuisine: '其他', tags: [], crowd: '', tips: '', savedAt: new Date().toISOString() }
}

export const useUploadStore = defineStore('upload', () => {
  const drafts = ref<Draft[]>([])
  const currentDraft = ref<Draft | null>(null)

  function initDraft() { currentDraft.value = emptyDraft() }
  function saveDraft() {
    if (!currentDraft.value) return
    currentDraft.value.savedAt = new Date().toISOString()
    const idx = drafts.value.findIndex(d => d.id === currentDraft.value!.id)
    if (idx !== -1) drafts.value[idx] = JSON.parse(JSON.stringify(currentDraft.value))
    else drafts.value.unshift(JSON.parse(JSON.stringify(currentDraft.value)))
    uni.setStorageSync('recipe_drafts', JSON.stringify(drafts.value))
  }
  function loadDrafts() { try { const raw = uni.getStorageSync('recipe_drafts'); if (raw) drafts.value = JSON.parse(raw) } catch (_) { drafts.value = [] } }
  function loadDraft(id: string) { const draft = drafts.value.find(d => d.id === id); if (draft) currentDraft.value = JSON.parse(JSON.stringify(draft)) }
  function deleteDraft(id: string) { drafts.value = drafts.value.filter(d => d.id !== id); uni.setStorageSync('recipe_drafts', JSON.stringify(drafts.value)) }
  function clearCurrentDraft() { currentDraft.value = null }

  return { drafts, currentDraft, initDraft, saveDraft, loadDrafts, loadDraft, deleteDraft, clearCurrentDraft }
})
