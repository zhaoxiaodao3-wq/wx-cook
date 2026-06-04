<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUploadStore } from '@/stores/upload'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { CATEGORIES, CUISINES, TAGS, DIFFICULTIES, CATEGORY_MAP } from '@/data/recipes'

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
  uni.chooseImage({ count: 1, success(res) { draft.value.coverImage = res.tempFilePaths[0] } })
}

function addStepImage(idx) {
  uni.chooseImage({ count: 1, success(res) { draft.value.steps[idx].image = res.tempFilePaths[0] } })
}

const canSubmit = computed(() => {
  if (!draft.value) return false
  return draft.value.title.trim() && draft.value.ingredients.length > 0 && draft.value.steps.length > 0
})

function submitRecipe() {
  if (!canSubmit.value) return
  const d = draft.value
  const recipe = {
    id: Date.now().toString(),
    title: d.title,
    coverImage: d.coverImage || 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 100),
    author: { ...userStore.currentUser },
    rating: 0, ratingCount: 0,
    createdAt: new Date().toISOString(),
    duration: d.duration, difficulty: d.difficulty,
    category: d.category, cuisine: d.cuisine,
    tags: [...d.tags], servings: d.servings,
    ingredients: d.ingredients.filter(i => i.name).map(i => ({ ...i })),
    steps: d.steps.filter(s => s.desc).map(s => ({ ...s })),
    tips: d.tips, crowd: d.crowd,
    reviews: [], suggestions: [],
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
    <!-- 圆形步骤指示器 -->
    <view class="step-indicator">
      <view v-for="s in 4" :key="s" class="step-dot" :class="{ 'step-dot--active': s <= draft.step, 'step-dot--done': s < draft.step }">
        <text v-if="s < draft.step">✓</text>
      </view>
      <view v-for="s in 3" :key="'line' + s" class="step-line" />
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
          <view v-for="d in difficulties" :key="d" class="chip" :class="{ 'chip--active': draft.difficulty === d }" @click="draft.difficulty = d">{{ d }}</view>
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
      <view class="add-btn" @click="addIngredient"><text>+ 添加食材</text></view>
    </view>

    <!-- Step 3: 制作步骤 -->
    <view v-if="draft.step === 3" class="form-section">
      <view v-for="(step, idx) in draft.steps" :key="step.id" class="step-edit-item">
        <view class="step-edit-header">
          <text class="step-edit-num">步骤 {{ idx + 1 }}</text>
          <text class="step-edit-del" @click="removeStep(idx)">删除</text>
        </view>
        <textarea class="step-textarea" v-model="step.desc" placeholder="描述这一步..." :auto-height="true" />
        <view class="step-img-row" @click="addStepImage(idx)">
          <image v-if="step.image" :src="step.image" mode="aspectFill" class="step-img-preview" />
          <text v-else class="step-img-placeholder">+ 添加图片</text>
        </view>
      </view>
      <view class="add-btn" @click="addStep"><text>+ 添加步骤</text></view>
    </view>

    <!-- Step 4: 补充信息 -->
    <view v-if="draft.step === 4" class="form-section">
      <view class="form-group">
        <text class="form-label">分类</text>
        <view class="chip-row">
          <view v-for="c in categories" :key="c" class="chip" :class="{ 'chip--active': draft.category === (CATEGORY_MAP[c] || c) }" @click="draft.category = CATEGORY_MAP[c] || c">{{ c }}</view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">菜系</text>
        <view class="chip-row">
          <view v-for="c in cuisines" :key="c" class="chip" :class="{ 'chip--active': draft.cuisine === c }" @click="draft.cuisine = c">{{ c }}</view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">标签</text>
        <view class="chip-row">
          <view v-for="t in tags" :key="t" class="chip" :class="{ 'chip--active': draft.tags.includes(t) }" @click="toggleTag(t)">{{ t }}</view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">适用人群</text>
        <input class="form-input" v-model="draft.crowd" placeholder="例如：健身党友好" />
      </view>
      <view class="form-group">
        <text class="form-label">厨神贴士</text>
        <textarea class="form-textarea" v-model="draft.tips" placeholder="分享你的独门技巧..." :auto-height="true" />
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
.upload-page { min-height: 100vh; background: #FDF8F2; padding-bottom: 180rpx; }

.step-indicator { display: flex; align-items: center; justify-content: center; padding: 40rpx 60rpx 12rpx; gap: 0; }
.step-dot {
  width: 32rpx; height: 32rpx; border-radius: 50%; background: transparent;
  border: 2rpx solid #EDE4DA; display: flex; align-items: center; justify-content: center;
  font-size: 20rpx; color: transparent; transition: all 300ms ease; flex-shrink: 0;
}
.step-dot--active { border-color: #D4784C; background: #D4784C; }
.step-dot--done { border-color: #D4784C; background: #F5E6DC; color: #D4784C; }
.step-line { flex: 1; height: 1.5rpx; background: #EDE4DA; max-width: 60rpx; }
.step-label { text-align: center; font-size: 22rpx; color: #A89885; display: block; margin-bottom: 28rpx; letter-spacing: 2rpx; }

.form-section { padding: 0 32rpx; }
.form-group { margin-bottom: 28rpx; }
.form-label { font-size: 26rpx; font-weight: 700; color: #3C2415; display: block; margin-bottom: 14rpx; letter-spacing: 1rpx; }
.form-input { background: #FFFCF7; border-radius: 14rpx; padding: 22rpx 20rpx; font-size: 26rpx; border: 1rpx solid #EDE4DA; width: 100%; box-sizing: border-box; color: #3C2415; }
.form-textarea { background: #FFFCF7; border-radius: 14rpx; padding: 22rpx 20rpx; font-size: 26rpx; border: 1rpx solid #EDE4DA; width: 100%; min-height: 180rpx; box-sizing: border-box; color: #3C2415; line-height: 1.7; }

.cover-picker { width: 220rpx; height: 220rpx; border-radius: 20rpx; overflow: hidden; background: #F5EDE3; display: flex; align-items: center; justify-content: center; border: 2rpx dashed #EDE4DA; }
.cover-preview { width: 100%; height: 100%; }
.cover-placeholder { color: #A89885; font-size: 26rpx; text-align: center; line-height: 1.5; }

.chip-row { display: flex; flex-wrap: wrap; gap: 10rpx; }
.chip { padding: 12rpx 28rpx; border-radius: 9999rpx; background: #FFFCF7; font-size: 24rpx; color: #5C4033; border: 1rpx solid #EDE4DA; transition: all 200ms ease; letter-spacing: 1rpx; }
.chip--active { background: #D4784C; color: #FFF; border-color: #D4784C; box-shadow: 0 4rpx 12rpx rgba(212,120,76,0.15); }

.ingredient-row { display: flex; gap: 8rpx; margin-bottom: 12rpx; align-items: center; }
.ingredient-input { flex: 1; background: #FFFCF7; border-radius: 12rpx; padding: 16rpx 14rpx; font-size: 26rpx; border: 1rpx solid #EDE4DA; min-width: 0; color: #3C2415; }
.ingredient-del { color: #C06040; font-size: 28rpx; padding: 8rpx; flex-shrink: 0; }

.step-edit-item { background: #FFFCF7; border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 12rpx rgba(60,36,21,0.03); }
.step-edit-header { display: flex; justify-content: space-between; margin-bottom: 14rpx; }
.step-edit-num { font-size: 24rpx; font-weight: 700; color: #D4784C; letter-spacing: 1rpx; }
.step-edit-del { font-size: 22rpx; color: #C06040; }
.step-textarea { background: #FDF8F2; border-radius: 14rpx; padding: 16rpx; font-size: 26rpx; width: 100%; min-height: 100rpx; box-sizing: border-box; color: #3C2415; line-height: 1.6; }
.step-img-row { margin-top: 14rpx; height: 160rpx; background: #FDF8F2; border-radius: 14rpx; display: flex; align-items: center; justify-content: center; border: 1rpx dashed #EDE4DA; }
.step-img-preview { width: 100%; height: 100%; border-radius: 14rpx; }
.step-img-placeholder { color: #A89885; font-size: 24rpx; }

.add-btn { text-align: center; padding: 24rpx; color: #7D9B76; font-size: 26rpx; letter-spacing: 1rpx; }

.form-buttons {
  position: fixed; bottom: 100rpx; left: 0; right: 0;
  padding: 20rpx 32rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(253, 248, 242, 0.94); backdrop-filter: blur(20rpx);
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1rpx solid #EDE4DA; z-index: 100;
}
.form-buttons__right { display: flex; gap: 12rpx; }
.btn { padding: 16rpx 36rpx; border-radius: 9999rpx; font-size: 26rpx; font-weight: 600; letter-spacing: 2rpx; }
.btn--primary { background: #D4784C; color: #FFF; box-shadow: 0 4rpx 16rpx rgba(212,120,76,0.18); }
.btn--outline { background: transparent; color: #5C4033; border: 1rpx solid #EDE4DA; }
.btn--disabled { opacity: 0.4; pointer-events: none; }

.bottom-placeholder { height: 120rpx; }
</style>
