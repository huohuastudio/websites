<script setup lang="ts">
import { VPButton } from 'vitepress/theme'
import type { HomeAction } from './HomeActions.vue'

export interface PricingPlan {
  name: string
  /** 价格，如 ¥0、按年订阅；表格放在价格卡片下方时可以省略 */
  price?: string
  note?: string
  action?: HomeAction
}

export interface PricingRow {
  name: string
  /** 与 plans 一一对应：true 包含，false 不包含，文字直接显示 */
  values: (boolean | string)[]
}

// 版本对比的价格表：表头是各版本的价格和按钮，下面逐行对比功能
defineProps<{ plans: PricingPlan[]; rows: PricingRow[] }>()
</script>

<template>
  <div class="pricing">
    <table>
      <thead>
        <tr>
          <td></td>
          <th v-for="plan in plans" :key="plan.name" scope="col">
            <div class="plan-name">{{ plan.name }}</div>
            <div v-if="plan.price" class="plan-price">{{ plan.price }}</div>
            <div v-if="plan.note" class="plan-note">{{ plan.note }}</div>
            <VPButton
              v-if="plan.action"
              class="plan-action"
              size="medium"
              :theme="plan.action.theme ?? 'brand'"
              :text="plan.action.text"
              :href="plan.action.link"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name">
          <th scope="row">{{ row.name }}</th>
          <td v-for="(value, i) in row.values" :key="i">
            <span v-if="value === true" class="yes" role="img" aria-label="包含">✓</span>
            <span v-else-if="value === false" class="no" role="img" aria-label="不包含">—</span>
            <template v-else>{{ value }}</template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* 表格样式写全，不依赖文档正文样式（首页不套 .vp-doc 时也能显示）；scoped 属性让这些选择器的优先级高于 .vp-doc table */
.pricing table {
  display: table;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  font-size: 14px;
  line-height: 1.6;
}

.pricing tr {
  background: transparent;
  border-top: 1px solid var(--vp-c-divider);
}

.pricing tbody tr:nth-child(2n) {
  background: var(--vp-c-bg-soft);
}

.pricing th,
.pricing td {
  padding: 10px 16px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
  color: var(--vp-c-text-2);
}

.pricing tbody th {
  font-weight: 400;
  text-align: left;
  color: var(--vp-c-text-1);
}

.pricing thead th {
  padding: 20px 12px;
  vertical-align: top;
  background: var(--vp-c-bg);
}

.plan-name {
  font-size: 16px;
  color: var(--vp-c-text-1);
}

.plan-price {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.plan-note {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 400;
  color: var(--vp-c-text-2);
}

.plan-action {
  margin-top: 16px;
}

.yes {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.no {
  color: var(--vp-c-text-3);
}

/* 窄屏时整张表横向滚动 */
@media (max-width: 640px) {
  .pricing {
    overflow-x: auto;
  }

  .pricing table {
    min-width: 480px;
  }
}
</style>
