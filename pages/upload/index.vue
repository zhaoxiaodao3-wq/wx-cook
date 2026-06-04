<script setup>
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import CustomTabBar from '@/components/CustomTabBar.vue'

const recipeStore = useRecipeStore()
const userStore = useUserStore()

const currentStep = ref(0)
const stepLabels = ['基本信息', '食材清单', '制作步骤', '其他补充']

const title = ref('')
const coverImage = ref('')
const difficulty = ref('简单')
const duration = ref('')
const servings = ref(2)
const crowd = ref('')
const ingredients = ref([{ name: '', amount: '', unit: '' }])
const cookSteps = ref([{ id: Date.now(), desc: '', image: '' }])
const category = ref('lunch')
const cuisine = ref('其他')
const tags = ref([])
const tips = ref('')

const isTitleTouched = ref(false)

const canSubmit = computed(() => {
  const hasName = title.value.trim().length > 0
  const hasIngredients = ingredients.value.some(i => i.name.trim().length > 0)
  const hasSteps = cookSteps.value.some(s => s.desc.trim().length > 0)

  return hasName && hasIngredients && hasSteps
})

function validateStep(step) {
  if (step === 0) return title.value.trim().length > 0
  if (step === 1) return ingredients.value.some(i => i.name.trim().length > 0)
  if (step === 2) return cookSteps.value.some(s => s.desc.trim().length > 0)
  return true
}

function nextStep() {
  if (!validateStep(currentStep.value)) {
    const hints = ['请填写菜品名称', '请至少添加一项食材', '请至少填写一个制作步骤']
    uni.showToast({ title: hints[currentStep.value], icon: 'none' })
    return
  }
  currentStep.value = Math.min(3, currentStep.value + 1)
}
function prevStep() { currentStep.value = Math.max(0, currentStep.value - 1) }

function addIngredient() { ingredients.value.push({ name: '', amount: '', unit: '' }) }
function removeIngredient(idx) { ingredients.value.splice(idx, 1) }

function addCookStep() { cookSteps.value.push({ id: Date.now(), desc: '', image: '' }) }
function removeCookStep(idx) { cookSteps.value.splice(idx, 1) }
function addStepImage(idx) {
  uni.chooseImage({ count: 1, success(res) { cookSteps.value[idx].image = res.tempFilePaths[0] } })
}
function changeCover() {
  uni.chooseImage({ count: 1, success(res) { coverImage.value = res.tempFilePaths[0] } })
}

function toggleTag(tag) {
  const i = tags.value.indexOf(tag)
  if (i === -1) tags.value.push(tag)
  else tags.value.splice(i, 1)
}

function handlePublish() {
  
  if (!canSubmit.value) {
    isTitleTouched.value = true
    const hints = []
    if (!title.value.trim()) hints.push('菜品名称')
    if (!ingredients.value.some(i => i.name.trim())) hints.push('食材')
    if (!cookSteps.value.some(s => s.desc.trim())) hints.push('制作步骤')
    uni.showToast({ title: `请完善：${hints.join('、')}`, icon: 'none' })
    return
  }
  recipeStore.addRecipe({
    id: Date.now().toString(),
    title: title.value.trim(),
    coverImage: coverImage.value || 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 100),
    author: { ...userStore.currentUser },
    rating: 0, ratingCount: 0,
    createdAt: new Date().toISOString(),
    duration: parseInt(duration.value) || 30,
    difficulty: difficulty.value,
    category: category.value,
    cuisine: cuisine.value,
    tags: [...tags.value],
    servings: servings.value,
    ingredients: ingredients.value.filter(i => i.name.trim()).map(i => ({ ...i })),
    steps: cookSteps.value.filter(s => s.desc.trim()).map(s => ({ ...s })),
    tips: tips.value,
    crowd: crowd.value,
    reviews: [],
    suggestions: []
  })
  uni.showToast({ title: '发布成功', icon: 'success' })
  setTimeout(() => uni.switchTab({ url: '/pages/home/index' }), 800)
}
</script>

<template>
  <view class="upload-page">
    <!-- 头部 + 步骤指示器 -->
    <view class="upload-header">
      <view class="upload-header__safe" />
      <text class="upload-title">上传菜谱</text>
      <view class="step-bar">
        <view v-for="(label, idx) in stepLabels" :key="idx" class="step-node">
          <view
            class="step-dot"
            :class="{
              'step-dot--active': idx === currentStep,
              'step-dot--done': idx < currentStep
            }"
          >
            <text v-if="idx < currentStep" class="step-check">✓</text>
            <text v-else>{{ idx + 1 }}</text>
          </view>
          <text
            class="step-name"
            :class="{ 'step-name--active': idx === currentStep }"
          >{{ label }}</text>
        </view>
        <view class="step-progress-track">
          <view class="step-progress-fill" :style="{ width: (currentStep / 3 * 100) + '%' }" />
        </view>
      </view>
    </view>

    <!-- Step 0: 基本信息（v-show 避免 v-if 卸载导致小程序 input 未同步到 ref） -->
    <view v-show="currentStep === 0" class="form-body">
      <view class="form-card">
        <view class="cover-area" @click="changeCover">
          <image
            v-if="coverImage"
            :src="coverImage"
            mode="aspectFill"
            class="cover-img"
          />
          <view v-else class="cover-empty">
            <text class="cover-icon">📷</text>
            <text class="cover-hint">点击上传成品图</text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">菜品名称</text>
          <input
            v-model="title"
            class="field-input"
            placeholder="例如：红烧肉、蒜蓉西兰花"
            @blur="isTitleTouched = true"
          />
        </view>

        <view class="field-row">
          <view class="field field--half">
            <text class="field-label">烹饪时长</text>
            <input v-model="duration" class="field-input" placeholder="如 30 mins" />
          </view>
          <view class="field field--half">
            <text class="field-label">适合人群</text>
            <input v-model="crowd" class="field-input" placeholder="如 老少皆宜" />
          </view>
        </view>

        <view class="field">
          <text class="field-label">难度</text>
          <view class="difficulty-row">
            <view
              v-for="d in ['简单', '中等', '困难']" :key="d"
              class="diff-btn"
              :class="{ 'diff-btn--active': difficulty === d }"
              @click="difficulty = d"
            >{{ d }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- Step 1: 食材清单 -->
    <view v-show="currentStep === 1" class="form-body">
      <view class="form-card">
        <view class="form-card__head">
          <text class="form-card__title">添加食材</text>
          <text class="form-card__sub">滑动删除</text>
        </view>

        <view v-for="(ing, idx) in ingredients" :key="idx" class="ingredient-row">
          <input v-model="ing.name" class="field-input ing-name" placeholder="食材名" />
          <input v-model="ing.amount" class="field-input ing-amount" placeholder="用量" />
          <text v-if="ingredients.length > 1" class="ing-del" @click="removeIngredient(idx)">✕</text>
        </view>

        <view class="dashed-add" @click="addIngredient">
          <text>+ 继续添加食材</text>
        </view>
      </view>
    </view>

    <!-- Step 2: 制作步骤 -->
    <view v-show="currentStep === 2" class="form-body">
      <view class="form-card">
        <view class="form-card__head">
          <text class="form-card__title">制作步骤</text>
        </view>

        <view v-for="(st, idx) in cookSteps" :key="st.id" class="step-edit-row">
          <view class="step-num-circle">
            <text>{{ idx + 1 }}</text>
          </view>
          <view class="step-edit-body">
            <textarea
              v-model="st.desc"
              class="step-textarea"
              :placeholder="'第 ' + (idx + 1) + ' 步的详细描述...'"
            />
            <view class="step-img-add" @click="addStepImage(idx)">
              <image v-if="st.image" :src="st.image" mode="aspectFill" class="step-img" />
              <view v-else class="step-img-empty">
                <text>📷 添加步骤图(可选)</text>
              </view>
            </view>
          </view>
          <text v-if="cookSteps.length > 1" class="step-del" @click="removeCookStep(idx)">✕</text>
        </view>

        <view class="dashed-add" @click="addCookStep">
          <text>+ 添加下一步</text>
        </view>
      </view>
    </view>

    <!-- Step 3: 其他补充 -->
    <view v-show="currentStep === 3" class="form-body">
      <view class="form-card">
        <view class="field">
          <text class="field-label">菜品分类</text>
          <view class="cat-grid">
            <view
              v-for="c in [{k:'breakfast',v:'早餐'},{k:'lunch',v:'午餐'},{k:'dinner',v:'晚餐'},{k:'dessert',v:'甜点'}]"
              :key="c.k"
              class="cat-btn"
              :class="{ 'cat-btn--active': category === c.k }"
              @click="category = c.k"
            >{{ c.v }}</view>
          </view>
        </view>

        <view class="field">
          <text class="field-label">厨神贴士 (选填)</text>
          <textarea
            v-model="tips"
            class="tips-textarea"
            placeholder="分享你的独门秘籍，让大家做得更好吃！"
          />
        </view>
      </view>
    </view>

    <!-- 底部按钮栏 -->
    <view class="bottom-bar">
      <view class="bottom-bar__left">
        <text v-if="currentStep > 0" class="btn btn--ghost" @click="prevStep">上一步</text>
      </view>
      <view class="bottom-bar__right">
        <text v-if="currentStep < 3" class="btn btn--primary" @click="nextStep">下一步</text>
        <text
          v-else
          class="btn btn--primary"
          :class="{ 'btn--disabled': !canSubmit }"
          @click="handlePublish"
        >发布菜谱</text>
      </view>
    </view>

    <view class="bottom-spacer" />
    <CustomTabBar />
  </view>
</template>

<style lang="scss" scoped>
/* ======== 页面 ======== */
.upload-page {
  min-height: 100vh;
  background: #FBF8FD;
  padding-bottom: 200rpx;
}

/* ======== 头部+步骤指示器 ======== */
.upload-header {
  background: #FFF;
  padding-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}
.upload-header__safe { height: var(--status-bar-height, 44px); }
.upload-title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
  padding: 16rpx 0 28rpx;
}

.step-bar {
  display: flex;
  justify-content: space-between;
  padding: 0 48rpx;
  position: relative;
}
.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  z-index: 1;
}
.step-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  background: #F0F0F0;
  color: #999999;
  transition: all 250ms ease;
}
.step-dot--active { background: #52C41A; color: #FFF; }
.step-dot--done { background: #F0FAF0; color: #52C41A; }
.step-check { font-size: 20rpx; }
.step-name { font-size: 20rpx; color: #999999; }
.step-name--active { color: #52C41A; font-weight: 600; }

.step-progress-track {
  position: absolute;
  top: 18rpx;
  left: 90rpx;
  right: 90rpx;
  height: 2rpx;
  background: #F0F0F0;
  z-index: 0;
}
.step-progress-fill {
  height: 100%;
  background: #52C41A;
  transition: width 300ms ease;
}

/* ======== 表单主体 ======== */
.form-body { padding: 20rpx 24rpx; }

.form-card {
  background: #FFF;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03);
}

.form-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.form-card__title { font-size: 28rpx; font-weight: 700; color: #1a1a1a; }
.form-card__sub { font-size: 22rpx; color: #999999; }

/* ======== 封面区 ======== */
.cover-area {
  width: 100%;
  height: 340rpx;
  border-radius: 16rpx;
  background: #F8F6FA;
  border: 2rpx dashed #D4D4D4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 28rpx;
}
.cover-img { width: 100%; height: 100%; }
.cover-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}
.cover-icon { font-size: 52rpx; }
.cover-hint { font-size: 26rpx; color: #999999; }

/* ======== 表单项 ======== */
.field { margin-bottom: 24rpx; }
.field-label {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10rpx;
}
.field-input {
  width: 100%;
  height: 96rpx;
  background: #F8F6FA;
  border-radius: 14rpx;
  padding: 0 20rpx;
  font-size: 27rpx;
  color: #1a1a1a;
  box-sizing: border-box;
  line-height: 96rpx;
}
.field-input::placeholder {
  color: #BFBFBF;
  line-height: 96rpx;
}

.field-row { display: flex; gap: 16rpx; }
.field--half { flex: 1; }

/* 难度按钮 */
.difficulty-row { display: flex; gap: 12rpx; }
.diff-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #F8F6FA;
  font-size: 26rpx;
  color: #999999;
  font-weight: 500;
  transition: all 200ms ease;
}
.diff-btn--active { background: #52C41A; color: #FFF; }

/* ======== 食材行 ======== */
.ingredient-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
  margin-bottom: 14rpx;
}
.ing-name { flex: 1; }
.ing-amount { width: 180rpx; flex-shrink: 0; }
.ing-del {
  color: #FF4D4F;
  font-size: 30rpx;
  padding: 8rpx;
  flex-shrink: 0;
}

/* ======== 步骤编辑行 ======== */
.step-edit-row {
  display: flex;
  gap: 14rpx;
  margin-bottom: 24rpx;
}
.step-num-circle {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #F0FAF0;
  color: #52C41A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 6rpx;
}
.step-edit-body { flex: 1; }
.step-textarea {
  width: 100%;
  height: 180rpx;
  background: #F8F6FA;
  border-radius: 14rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
  color: #1a1a1a;
  box-sizing: border-box;
  line-height: 1.6;
}
.step-textarea::placeholder { color: #BFBFBF; }
.step-img-add {
  margin-top: 12rpx;
  height: 140rpx;
  background: #F8F6FA;
  border-radius: 14rpx;
  border: 1rpx dashed #D4D4D4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.step-img { width: 100%; height: 100%; }
.step-img-empty { font-size: 24rpx; color: #999999; }
.step-del {
  color: #FF4D4F;
  font-size: 30rpx;
  padding: 8rpx;
  flex-shrink: 0;
  margin-top: 6rpx;
}

/* ======== 虚线添加按钮 ======== */
.dashed-add {
  border: 2rpx dashed rgba(82,196,26,0.35);
  border-radius: 14rpx;
  padding: 26rpx 0;
  text-align: center;
  color: #52C41A;
  font-size: 27rpx;
  font-weight: 500;
}

/* ======== 分类网格 ======== */
.cat-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
.cat-btn {
  width: calc(50% - 6rpx);
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #F8F6FA;
  font-size: 27rpx;
  color: #999999;
  font-weight: 500;
  transition: all 200ms ease;
}
.cat-btn--active { background: #52C41A; color: #FFF; }

/* 贴士文本框 */
.tips-textarea {
  width: 100%;
  height: 200rpx;
  background: #F8F6FA;
  border-radius: 14rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
  color: #1a1a1a;
  box-sizing: border-box;
  line-height: 1.6;
}
.tips-textarea::placeholder { color: #BFBFBF; }

/* ======== 底部按钮栏 ======== */
.bottom-bar {
  position: fixed;
  bottom: 100rpx;
  left: 0;
  right: 0;
  background: #FFF;
  border-top: 1rpx solid #F0F0F0;
  padding: 16rpx 28rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
}
.bottom-bar__right { display: flex; gap: 12rpx; margin-left: auto; }
.btn {
  padding: 24rpx 48rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn--primary {
  background: #52C41A;
  color: #FFF;
  box-shadow: 0 8rpx 20rpx rgba(82,196,26,0.22);
}
.btn--primary:active { background: #45A616; }
.btn--ghost { background: #F8F6FA; color: #999999; font-weight: 600; }
.btn--disabled { opacity: 0.4; }
.bottom-spacer { height: 160rpx; }
</style>
