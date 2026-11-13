<script setup lang="ts">
import { VPButton } from 'vitepress/theme'
import type { HomeAction } from './HomeActions.vue'

export interface PricingPlan {
  name: string
  /** 价格，如 ¥0、按年订阅 */
  price: string
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
            <div class="plan-price">{{ plan.price }}</div>
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
.vp-doc .pricing table {
  display: table;
  width: 100%;
  margin: 0;
}

.vp-doc .pricing th,
.vp-doc .pricing td {
  text-align: center;
}

.vp-doc .pricing tbody th {
  font-weight: 400;
  text-align: left;
}

.vp-doc .pricing thead th {
  padding: 20px 12px;
  vertical-align: top;
}

.plan-name {
  font-size: 16px;
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

  .vp-doc .pricing table {
    min-width: 480px;
  }
}
</style>
