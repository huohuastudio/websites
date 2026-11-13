<script setup lang="ts">
import { VPButton } from 'vitepress/theme'
import type { HomeAction } from './HomeActions.vue'

export interface Plan {
  name: string
  /** 价格，如 ¥0、¥199 */
  price: string
  note?: string
  /** 这个版本包含的内容，一条一行 */
  items: string[]
  action?: HomeAction
  /** 主推的版本底部带品牌色光晕 */
  featured?: boolean
}

// 价格：各版本并排成格子，每格列出包含的内容和按钮
defineProps<{ plans: Plan[] }>()
</script>

<template>
  <div class="home-lines home-plans">
    <div v-for="plan in plans" :key="plan.name" class="plan" :class="{ featured: plan.featured }">
      <div class="name">{{ plan.name }}</div>
      <div class="price">{{ plan.price }}</div>
      <div v-if="plan.note" class="note">{{ plan.note }}</div>
      <ul class="items">
        <li v-for="item in plan.items" :key="item">{{ item }}</li>
      </ul>
      <VPButton
        v-if="plan.action"
        class="action"
        size="big"
        :theme="plan.action.theme ?? 'brand'"
        :text="plan.action.text"
        :href="plan.action.link"
      />
    </div>
  </div>
</template>

<style scoped>
.plan {
  display: flex;
  flex-direction: column;
  padding: 40px var(--home-pad-x);
  background: var(--vp-c-bg);
}

.plan.featured {
  background:
    radial-gradient(80% 50% at 50% 100%, var(--vp-c-brand-soft), transparent),
    var(--vp-c-bg);
}

.name {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.featured .name {
  color: var(--vp-c-brand-1);
}

.price {
  margin-top: 16px;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.note {
  margin-top: 8px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.items {
  flex: 1;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.items li {
  position: relative;
  padding-left: 24px;
  font-size: 16px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

.items li + li {
  margin-top: 10px;
}

/* 对勾 */
.items li::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 3px;
  width: 5px;
  height: 10px;
  border-right: 2px solid var(--vp-c-brand-1);
  border-bottom: 2px solid var(--vp-c-brand-1);
  transform: rotate(45deg);
}

.action {
  align-self: flex-start;
  margin-top: 32px;
}

@media (min-width: 768px) {
  .home-plans {
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
  }

  .plan {
    padding: 56px var(--home-pad-x);
  }
}
</style>
