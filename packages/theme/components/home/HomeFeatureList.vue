<script setup lang="ts">
import { computed } from 'vue'

export interface FeatureGroup {
  title: string
  /** details：折叠起来的补充说明（技术细节），点击「技术细节」展开 */
  items: { name: string; desc: string; details?: string }[]
}

// 分组的功能列表：每组一个小标题，下面是"名称 + 一句话说明"。样式写全，不依赖文档正文样式。
// cells 时每组是一个格子，格子之间是细线（见 home.css 的 .home-lines）。细线网格的每一行要排满：
// 三列时最后一行剩两组各占一半、剩一组占满一行；两列时组数为奇数，最后一组占满一行。
// 默认插槽的内容（如文档链接）放在网格下方的通栏中
const props = withDefaults(defineProps<{ groups: FeatureGroup[]; variant?: 'plain' | 'cells'; columns?: 2 | 3 }>(), {
  variant: 'plain',
  columns: 3,
})

const layout = computed(() => [
  props.variant,
  `cols-${props.columns}`,
  props.columns === 3 && `rest-${props.groups.length % 3}`,
  { odd: props.groups.length % 2 === 1, 'home-lines': props.variant === 'cells' },
])
</script>

<template>
  <div class="feature-list" :class="layout">
    <section v-for="group in groups" :key="group.title" class="feature-group">
      <h3>{{ group.title }}</h3>
      <dl>
        <div v-for="item in group.items" :key="item.name" class="feature-item">
          <dt>{{ item.name }}</dt>
          <dd>
            {{ item.desc }}
            <details v-if="item.details">
              <summary>技术细节</summary>
              <p>{{ item.details }}</p>
            </details>
          </dd>
        </div>
      </dl>
    </section>
  </div>
  <div v-if="$slots.default" class="home-pad line">
    <div class="home-prose home-note">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.feature-list {
  display: grid;
}

.plain {
  gap: 40px 48px;
}

.cells .feature-group {
  padding: 40px var(--home-pad-x);
  background: var(--vp-c-bg);
}

.feature-list .feature-group h3 {
  margin: 0;
  padding: 0;
  border: none;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.feature-list dl {
  margin: 20px 0 0;
}

.feature-item + .feature-item {
  margin-top: 18px;
}

.feature-list .feature-item dt {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.feature-list .feature-item dd {
  margin: 4px 0 0;
  font-size: 15px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.feature-item details {
  margin-top: 6px;
}

.feature-item summary {
  width: fit-content;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  transition: color 0.25s;
}

.feature-item summary:hover {
  color: var(--vp-c-brand-2);
}

.feature-item details p {
  margin: 8px 0 0;
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-divider);
  font-size: 14px;
}

@media (min-width: 768px) {
  .feature-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-list.odd .feature-group:last-child {
    grid-column: 1 / -1;
  }

  .cells .feature-group {
    padding: 48px var(--home-pad-x);
  }

  .feature-list .feature-group h3 {
    font-size: 22px;
  }
}

/* 三列按六等分排：每组占两份，最后一行不满三组时放宽 */
@media (min-width: 1024px) {
  .cols-3 {
    grid-template-columns: repeat(6, 1fr);
  }

  .feature-list.cols-3 .feature-group,
  .feature-list.cols-3.odd .feature-group:last-child {
    grid-column: span 2;
  }

  .feature-list.cols-3.rest-2 .feature-group:nth-last-child(-n + 2) {
    grid-column: span 3;
  }

  .feature-list.cols-3.rest-1 .feature-group:last-child {
    grid-column: 1 / -1;
  }
}
</style>
