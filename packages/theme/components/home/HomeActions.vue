<script setup lang="ts">
import { VPButton } from 'vitepress/theme'

export interface HomeAction {
  text: string
  link: string
  theme?: 'brand' | 'alt'
}

// 首页末尾的行动按钮，居中排列；按钮下方的插槽放补充说明或小字链接
defineProps<{ actions: HomeAction[] }>()
</script>

<template>
  <div class="home-actions">
    <div class="buttons">
      <VPButton
        v-for="action in actions"
        :key="action.link"
        size="medium"
        :theme="action.theme ?? 'brand'"
        :text="action.text"
        :href="action.link"
      />
    </div>
    <div v-if="$slots.default" class="extra">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.home-actions {
  margin-top: 24px;
  text-align: center;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.extra {
  margin-top: 32px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.home-actions .extra :deep(p) {
  margin: 0;
}

.home-actions .extra :deep(a) {
  color: var(--vp-c-text-2);
  font-weight: 400;
}
</style>
