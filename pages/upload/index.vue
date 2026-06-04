<script setup>
import { reactive, computed, ref } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import CustomTabBar from '@/components/CustomTabBar.vue'

const recipeStore = useRecipeStore()
const userStore = useUserStore()
const currentStep = ref(0)
const steps = ['基本信息', '食材清单', '制作步骤', '其他补充']

const form = reactive({
  title: '',
  coverImage: '',
  difficulty: '简单',
  duration: '',
  servings: 2,
  crowd: '',
  ingredients: [],
  steps: [],
  category: 'lunch',
  cuisine: '其他',
  tags: [],
  tips: ''
})

const isTitleTouched = ref(false)

const canSubmit = computed(() => {
  const nameTrimmed = form.title.trim()
  const hasName = nameTrimmed.length > 0
  const hasIngredients = form.ingredients.some(i => i.name.trim())
  const hasSteps = form.steps.some(s => s.desc.trim())
  return hasName && hasIngredients && hasSteps
})

function nextStep() { currentStep.value = Math.min(3, currentStep.value + 1) }
function prevStep() { currentStep.value = Math.max(0, currentStep.value - 1) }

function addIngredient() { form.ingredients.push({ name: '', amount: '', unit: '' }) }
function removeIngredient(idx) { form.ingredients.splice(idx, 1) }

function addStep() {
  form.steps.push({ id: Date.now(), desc: '', image: '' })
}
function removeStep(idx) { form.steps.splice(idx, 1) }
function addStepImage(idx) {
  uni.chooseImage({ count: 1, success(res) { form.steps[idx].image = res.tempFilePaths[0] } })
}
function changeCover() {
  uni.chooseImage({ count: 1, success(res) { form.coverImage = res.tempFilePaths[0] } })
}

function toggleTag(tag) {
  const idx = form.tags.indexOf(tag)
  if (idx === -1) form.tags.push(tag)
  else form.tags.splice(idx, 1)
}

function handlePublish() {
  if (!canSubmit.value) {
    isTitleTouched.value = true
    return
  }
  recipeStore.addRecipe({
    id: Date.now().toString(),
    title: form.title.trim(),
    coverImage: form.coverImage || 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 100),
    author: { ...userStore.currentUser },
    rating: 0, ratingCount: 0,
    createdAt: new Date().toISOString(),
    duration: parseInt(form.duration) || 30,
    difficulty: form.difficulty,
    category: form.category,
    cuisine: form.cuisine,
    tags: [...form.tags],
    servings: form.servings,
    ingredients: form.ingredients.filter(i => i.name.trim()).map(i => ({ ...i })),
    steps: form.steps.filter(s => s.desc.trim()).map(s => ({ ...s })),
    tips: form.tips,
    crowd: form.crowd,
    reviews: [],
    suggestions: []
  })
  uni.showToast({ title: '发布成功', icon: 'success' })
  setTimeout(() => uni.switchTab({ url: '/pages/home/index' }), 800)
}
</script>

<template>
  <view class="upload-page">
    <!-- 头部 + 步骤指示器 (对齐参考项目) -->
    <view class="upload-header">
      <view class="upload-header__safe" />
      <text class="upload-title">上传菜谱</text>
      <view class="step-bar">
        <view v-for="(stepName, idx) in steps" :key="idx" class="step-node">
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
          >{{ stepName }}</text>
        </view>
        <!-- 进度条 -->
        <view class="step-progress-track">
          <view class="step-progress-fill" :style="{ width: (currentStep / 3 * 100) + '%' }" />
        </view>
      </view>
    </view>

    <!-- Step 0: 基本信息 -->
    <view v-if="currentStep === 0" class="form-body">
      <view class="form-card">
        <!-- 封面图 (参考项目: 放最上面, 大图区) -->
        <view class="cover-area" @click="changeCover">
          <image
            v-if="form.coverImage"
            :src="form.coverImage"
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
            v-model="form.title"
            class="field-input"
            placeholder="例如：红烧肉、蒜蓉西兰花"
            @blur="isTitleTouched = true"
          />
        </view>

        <view class="field-row">
          <view class="field field--half">
            <text class="field-label">烹饪时长</text>
            <input
              v-model="form.duration"
              class="field-input"
              placeholder="如 30 mins"
            />
          </view>
          <view class="field field--half">
            <text class="field-label">适合人群</text>
            <input
              v-model="form.crowd"
              class="field-input"
              placeholder="如 老少皆宜"
            />
          </view>
        </view>

        <view class="field">
          <text class="field-label">难度</text>
          <view class="difficulty-row">
            <view
              v-for="d in ['简单', '中等', '困难']"
              :key="d"
              class="diff-btn"
              :class="{ 'diff-btn--active': form.difficulty === d }"
              @click="form.difficulty = d"
            >{{ d }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- Step 1: 食材清单 -->
    <view v-if="currentStep === 1" class="form-body">
      <view class="form-card">
        <view class="form-card__head">
          <text class="form-card__title">添加食材</text>
          <text class="form-card__sub">滑动删除</text>
        </view>

        <view v-for="(ing, idx) in form.ingredients" :key="idx" class="ingredient-row">
          <input v-model="ing.name" class="field-input ing-name" placeholder="食材名" />
          <input v-model="ing.amount" class="field-input ing-amount" placeholder="用量" />
          <text v-if="form.ingredients.length > 1" class="ing-del" @click="removeIngredient(idx)">✕</text>
        </view>

        <view class="dashed-add" @click="addIngredient">
          <text>+ 继续添加食材</text>
        </view>
      </view>
    </view>

    <!-- Step 2: 制作步骤 -->
    <view v-if="currentStep === 2" class="form-body">
      <view class="form-card">
        <view class="form-card__head">
          <text class="form-card__title">制作步骤</text>
        </view>

        <view v-for="(step, idx) in form.steps" :key="step.id" class="step-edit-row">
          <view class="step-num-circle">
            <text>{{ idx + 1 }}</text>
          </view>
          <view class="step-edit-body">
            <textarea
              v-model="step.desc"
              class="step-textarea"
              :placeholder="'第 ' + (idx + 1) + ' 步的详细描述...'"
            />
            <view class="step-img-add" @click="addStepImage(idx)">
              <image v-if="step.image" :src="step.image" mode="aspectFill" class="step-img" />
              <view v-else class="step-img-empty">
                <text>📷 添加步骤图(可选)</text>
              </view>
            </view>
          </view>
          <text v-if="form.steps.length > 1" class="step-del" @click="removeStep(idx)">✕</text>
        </view>

        <view class="dashed-add" @click="addStep">
          <text>+ 添加下一步</text>
        </view>
      </view>
    </view>

    <!-- Step 3: 其他补充 -->
    <view v-if="currentStep === 3" class="form-body">
      <view class="form-card">
        <view class="field">
          <text class="field-label">菜品分类</text>
          <view class="cat-grid">
            <view
              v-for="c in [{k:'breakfast',v:'早餐'},{k:'lunch',v:'午餐'},{k:'dinner',v:'晚餐'},{k:'dessert',v:'甜点'}]"
              :key="c.k"
              class="cat-btn"
              :class="{ 'cat-btn--active': form.category === c.k }"
              @click="form.category = c.k"
            >{{ c.v }}</view>
          </view>
        </view>

        <view class="field">
          <text class="field-label">厨神贴士 (选填)</text>
          <textarea
            v-model="form.tips"
            class="tips-textarea"
            placeholder="分享你的独门秘籍，让大家做得更好吃！"
          />
        </view>
      </view>
    </view>

    <!-- 底部按钮 (对齐参考项目: fixed bottom bar) -->
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
  background: #FAFCF9;
  padding-bottom: 200rpx;
}

/* ======== 头部+步骤指示器 ======== */
.upload-header {
  background: #FFF;
  padding-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(44,62,51,0.04);
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
  color: #2C3E33;
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
  background: #F0F2F0;
  color: #8FA89B;
  transition: all 250ms ease;
}
.step-dot--active {
  background: #5DBE9E;
  color: #FFF;
}
.step-dot--done {
  background: #E8F5EF;
  color: #5DBE9E;
}
.step-check { font-size: 20rpx; }
.step-name {
  font-size: 20rpx;
  color: #8FA89B;
}
.step-name--active {
  color: #5DBE9E;
  font-weight: 600;
}

.step-progress-track {
  position: absolute;
  top: 18rpx;
  left: 90rpx;
  right: 90rpx;
  height: 2rpx;
  background: #F0F2F0;
  z-index: 0;
}
.step-progress-fill {
  height: 100%;
  background: #5DBE9E;
  transition: width 300ms ease;
}

/* ======== 表单主体 ======== */
.form-body {
  padding: 20rpx 24rpx;
}

.form-card {
  background: #FFF;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 16rpx rgba(44,62,51,0.03);
}

.form-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.form-card__title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2C3E33;
}
.form-card__sub {
  font-size: 22rpx;
  color: #8FA89B;
}

/* ======== 封面区 ======== */
.cover-area {
  width: 100%;
  height: 340rpx;
  border-radius: 16rpx;
  background: #F5F8F5;
  border: 2rpx dashed #D0DCD3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 28rpx;
}
.cover-img {
  width: 100%;
  height: 100%;
}
.cover-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}
.cover-icon {
  font-size: 52rpx;
}
.cover-hint {
  font-size: 26rpx;
  color: #8FA89B;
}

/* ======== 表单项 ======== */
.field { margin-bottom: 24rpx; }
.field-label {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: #4A6355;
  margin-bottom: 10rpx;
}
.field-input {
  width: 100%;
  height: 96rpx;
  background: #F5F8F5;
  border-radius: 14rpx;
  padding: 0 20rpx;
  font-size: 27rpx;
  color: #2C3E33;
  box-sizing: border-box;
  line-height: 96rpx;
}
.field-input::placeholder {
  color: #BCC8C0;
  line-height: 96rpx;
}

.field-row {
  display: flex;
  gap: 16rpx;
}
.field--half {
  flex: 1;
}

/* 难度按钮 */
.difficulty-row {
  display: flex;
  gap: 12rpx;
}
.diff-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #F5F8F5;
  font-size: 26rpx;
  color: #6B8274;
  font-weight: 500;
  transition: all 200ms ease;
}
.diff-btn--active {
  background: #5DBE9E;
  color: #FFF;
}

/* ======== 食材行 ======== */
.ingredient-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
  margin-bottom: 14rpx;
}
.ing-name {
  flex: 1;
}
.ing-amount {
  width: 180rpx;
  flex-shrink: 0;
}
.ing-del {
  color: #E85D5D;
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
  background: #E8F5EF;
  color: #5DBE9E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 6rpx;
}
.step-edit-body {
  flex: 1;
}
.step-textarea {
  width: 100%;
  height: 180rpx;
  background: #F5F8F5;
  border-radius: 14rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
  color: #2C3E33;
  box-sizing: border-box;
  line-height: 1.6;
}
.step-textarea::placeholder {
  color: #BCC8C0;
}
.step-img-add {
  margin-top: 12rpx;
  height: 140rpx;
  background: #F5F8F5;
  border-radius: 14rpx;
  border: 1rpx dashed #D0DCD3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.step-img {
  width: 100%;
  height: 100%;
}
.step-img-empty {
  font-size: 24rpx;
  color: #8FA89B;
}
.step-del {
  color: #E85D5D;
  font-size: 30rpx;
  padding: 8rpx;
  flex-shrink: 0;
  margin-top: 6rpx;
}

/* ======== 虚线添加按钮 ======== */
.dashed-add {
  border: 2rpx dashed rgba(93,190,158,0.35);
  border-radius: 14rpx;
  padding: 26rpx 0;
  text-align: center;
  color: #5DBE9E;
  font-size: 27rpx;
  font-weight: 500;
}

/* ======== 分类网格 ======== */
.cat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.cat-btn {
  width: calc(50% - 6rpx);
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #F5F8F5;
  font-size: 27rpx;
  color: #6B8274;
  font-weight: 500;
  transition: all 200ms ease;
}
.cat-btn--active {
  background: #5DBE9E;
  color: #FFF;
}

/* 贴士文本框 */
.tips-textarea {
  width: 100%;
  height: 200rpx;
  background: #F5F8F5;
  border-radius: 14rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
  color: #2C3E33;
  box-sizing: border-box;
  line-height: 1.6;
}
.tips-textarea::placeholder {
  color: #BCC8C0;
}

/* ======== 底部按钮栏 (对齐参考项目) ======== */
.bottom-bar {
  position: fixed;
  bottom: 100rpx;
  left: 0;
  right: 0;
  background: #FFF;
  border-top: 1rpx solid #EAEFEB;
  padding: 16rpx 28rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
}
.bottom-bar__right {
  display: flex;
  gap: 12rpx;
  margin-left: auto;
}
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
  background: #5DBE9E;
  color: #FFF;
  box-shadow: 0 8rpx 20rpx rgba(93,190,158,0.22);
}
.btn--primary:active {
  background: #4AA886;
}
.btn--ghost {
  background: #F5F8F5;
  color: #6B8274;
  font-weight: 600;
}
.btn--disabled {
  opacity: 0.4;
  pointer-events: none;
}
.bottom-spacer {
  height: 160rpx;
}
</style>
