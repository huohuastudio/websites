<script setup lang="ts">
export interface SxAction {
  text: string
  link: string
  /** brand 为实心按钮，alt 为描边按钮 */
  theme?: 'brand' | 'alt'
}

export interface SxPlan {
  name: string
  /** 价格，如 ¥0、¥199、订阅制 */
  price: string
  note?: string
  /** 这个版本的要点，一条一行 */
  items: string[]
  action?: SxAction
  /** 主推的版本 */
  featured?: boolean
}

export interface SxPricingRow {
  name: string
  /** 与各版本一一对应：true 包含，false 不包含，文字直接显示 */
  values: (boolean | string)[]
}

// 价格：各版本一张卡片，只列各自的要点；逐项的完整对比放在下面的折叠框中，各列依次对应 plans。
// 默认插槽放卡片下方的补充说明
defineProps<{
  lead?: string
  plans: SxPlan[]
  rows: SxPricingRow[]
}>()
</script>

<template>
  <section id="pricing" class="sx-sec sx-alt">
    <div class="sx-wrap">
      <div class="sx-head">
        <h2 class="sx-title">价格</h2>
        <p v-if="lead" class="sx-lead">{{ lead }}</p>
      </div>
      <div class="plans">
        <div v-for="plan in plans" :key="plan.name" class="plan" :class="{ featured: plan.featured }">
          <h3 class="name">{{ plan.name }}</h3>
          <div class="price">{{ plan.price }}</div>
          <div v-if="plan.note" class="note">{{ plan.note }}</div>
          <ul>
            <li v-for="item in plan.items" :key="item">{{ item }}</li>
          </ul>
          <a
            v-if="plan.action"
            class="sx-btn"
            :class="plan.action.theme === 'alt' ? 'ghost' : 'primary'"
            :href="plan.action.link"
          >{{ plan.action.text }}</a>
        </div>
      </div>
      <details class="compare">
        <summary>查看完整对比</summary>
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">功能</th>
                <th v-for="plan in plans" :key="plan.name" scope="col">{{ plan.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name">
                <th scope="row">{{ row.name }}</th>
                <td v-for="(value, i) in row.values" :key="i" :class="{ yes: value === true, no: value === false }">
                  {{ value === true ? '有' : value === false ? '—' : value }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
      <div v-if="$slots.default" class="after">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 20px;
}

/* 说明区等高、按钮贴底，几张卡片的按钮和分隔线对齐 */
.plan {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px;
  border-radius: 28px;
  background: var(--sx-card);
}

.name {
  font-size: 21px;
  font-weight: 600;
}

.price {
  margin-top: 12px;
  font-size: 56px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.note {
  margin-top: 6px;
  min-height: 1.6em;
  color: var(--sx-text-2);
  font-size: 15px;
}

ul {
  flex: 1;
  align-self: stretch;
  margin: 20px 0 32px;
  padding: 0;
  list-style: none;
  color: var(--sx-text-2);
  font-size: 16px;
}

li {
  padding: 9px 0;
  border-top: 1px solid var(--sx-line);
}

.compare {
  margin-top: 20px;
  border-radius: 20px;
  background: var(--sx-card);
}

.compare summary {
  display: flex;
  justify-content: space-between;
  padding: 20px 28px;
  font-weight: 600;
  list-style: none;
  cursor: pointer;
}

.compare summary::-webkit-details-marker {
  display: none;
}

.compare summary::after {
  content: '+';
  color: var(--sx-text-2);
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
}

.compare[open] summary::after {
  content: '−';
}

.scroll {
  overflow-x: auto;
  padding: 0 28px 18px;
}

table {
  display: table;
  width: 100%;
  min-width: 520px;
  margin: 0;
  border-collapse: collapse;
  font-size: 15px;
}

th,
td {
  padding: 12px 8px;
  border: 0;
  border-top: 1px solid var(--sx-line);
  background: none;
  text-align: left;
  font-weight: 400;
}

thead th {
  font-weight: 600;
}

tr {
  background: none;
}

th:not(:first-child),
td {
  width: 22%;
  text-align: center;
  white-space: nowrap;
  color: var(--sx-text-2);
}

thead th:not(:first-child) {
  color: var(--sx-text);
}

td.yes {
  color: var(--sx-link);
}

.after {
  max-width: 760px;
  margin-top: 24px;
  color: var(--sx-text-3);
  font-size: 14px;
}

.after :deep(p) {
  margin: 0 0 8px;
}

@media (max-width: 760px) {
  .plan {
    padding: 28px 24px;
  }
}
</style>
