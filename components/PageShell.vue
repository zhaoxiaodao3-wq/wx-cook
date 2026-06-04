<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import LoginGate from '@/components/LoginGate.vue'

const { isLoggedIn, isReady } = storeToRefs(useAuthStore())
const showLoginGate = computed(() => isReady.value && !isLoggedIn.value)
</script>

<template>
  <view class="page-shell">
    <slot />
    <LoginGate v-if="showLoginGate" />
  </view>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  position: relative;
}
</style>
