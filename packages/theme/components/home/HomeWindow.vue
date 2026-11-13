<script setup lang="ts">
// 示意图用的浏览器窗口外框：顶部三个圆点和地址栏，内容（示意图或截图）放在默认插槽
defineProps<{ address?: string }>()
</script>

<template>
  <div class="home-card home-window">
    <div class="bar">
      <span class="dots"><i /><i /><i /></span>
      <span v-if="address" class="address">{{ address }}</span>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.home-window {
  overflow: hidden;
}

.bar {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 36px;
  padding: 0 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}

.dots {
  display: flex;
  gap: 6px;
}

.dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--vp-c-gray-2);
}

.address {
  flex: 1;
  max-width: 280px;
  overflow: hidden;
  padding: 2px 12px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 12px;
  line-height: 18px;
  color: var(--vp-c-text-3);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 放截图时图片撑满窗口宽度，按原比例缩放 */
.content :deep(img) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
