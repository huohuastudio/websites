<script setup lang="ts">
export interface SxFaqItem {
  q: string
  /** 回答，允许站内维护的 HTML（如链接） */
  a: string
}

// 常见问题：左边标题和说明（header 插槽），右边每题一个可展开的 details
defineProps<{ items: SxFaqItem[] }>()
</script>

<template>
  <section id="faq" class="sx-sec">
    <div class="sx-wrap faq">
      <div>
        <h2 class="sx-title">常见问题</h2>
        <div v-if="$slots.header" class="header"><slot name="header" /></div>
      </div>
      <div>
        <details v-for="item in items" :key="item.q">
          <summary>{{ item.q }}</summary>
          <p v-html="item.a" />
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 48px;
}

.header {
  margin-top: 16px;
  color: var(--sx-text-2);
}

.header :deep(p) {
  margin: 0 0 8px;
}

details {
  border-top: 1px solid var(--sx-line);
}

details:last-child {
  border-bottom: 1px solid var(--sx-line);
}

summary {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 0;
  font-size: 19px;
  font-weight: 600;
  list-style: none;
  cursor: pointer;
}

summary::-webkit-details-marker {
  display: none;
}

summary::after {
  content: '+';
  color: var(--sx-text-2);
  font-size: 24px;
  font-weight: 400;
  line-height: 1;
}

details[open] summary::after {
  content: '−';
}

p {
  max-width: 680px;
  margin: 0 0 24px;
  color: var(--sx-text-2);
}

@media (max-width: 860px) {
  .faq {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
