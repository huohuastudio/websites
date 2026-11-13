<script setup lang="ts">
export interface FaqItem {
  q: string
  /** 回答，允许站内维护的 HTML（如链接） */
  a: string
}

// 常见问题：每题一个可展开的 details
defineProps<{ items: FaqItem[] }>()
</script>

<template>
  <div class="faq">
    <details v-for="item in items" :key="item.q" class="faq-item">
      <summary>{{ item.q }}</summary>
      <p v-html="item.a" />
    </details>
  </div>
</template>

<style scoped>
.faq {
  border-top: 1px solid var(--vp-c-divider);
}

.faq-item {
  border-bottom: 1px solid var(--vp-c-divider);
}

.faq-item summary {
  position: relative;
  padding: 16px 32px 16px 0;
  font-weight: 500;
  color: var(--vp-c-text-1);
  cursor: pointer;
  list-style: none;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

/* 右侧的加号，展开后转成叉 */
.faq-item summary::after {
  content: '+';
  position: absolute;
  top: 50%;
  right: 4px;
  font-size: 20px;
  font-weight: 400;
  line-height: 1;
  color: var(--vp-c-text-2);
  transform: translateY(-50%);
  transition: transform 0.2s;
}

.faq-item[open] summary::after {
  transform: translateY(-50%) rotate(45deg);
}

.vp-doc .faq-item p {
  margin: 0 0 16px;
  color: var(--vp-c-text-2);
}

@media (prefers-reduced-motion: reduce) {
  .faq-item summary::after {
    transition: none;
  }
}
</style>
