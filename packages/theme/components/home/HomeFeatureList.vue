<script setup lang="ts">
export interface FeatureGroup {
  title: string
  items: { name: string; desc: string }[]
}

// 分组的功能列表：每组一个小标题，下面是"名称 + 一句话说明"。样式写全，不依赖文档正文样式。
// cells 时每组是一个格子，格子之间是细线（见 home.css 的 .home-lines），默认插槽的内容作为最后一格，
// 用来补满最后一行
withDefaults(defineProps<{ groups: FeatureGroup[]; variant?: 'plain' | 'cells'; columns?: 2 | 3 }>(), {
  variant: 'plain',
  columns: 3,
})
</script>

<template>
  <div class="feature-list" :class="[variant, `cols-${columns}`, { 'home-lines': variant === 'cells' }]">
    <section v-for="group in groups" :key="group.title" class="feature-group">
      <h3>{{ group.title }}</h3>
      <dl>
        <div v-for="item in group.items" :key="item.name" class="feature-item">
          <dt>{{ item.name }}</dt>
          <dd>{{ item.desc }}</dd>
        </div>
      </dl>
    </section>
    <div v-if="$slots.default" class="feature-group extra home-prose">
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

.extra {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 15px;
}

.feature-list .feature-group h3 {
  margin: 0;
  padding: 0;
  border: none;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.feature-list dl {
  margin: 16px 0 0;
}

.feature-item + .feature-item {
  margin-top: 14px;
}

.feature-list .feature-item dt {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.feature-list .feature-item dd {
  margin: 2px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

@media (min-width: 768px) {
  .feature-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .cells .feature-group {
    padding: 48px var(--home-pad-x);
  }
}

@media (min-width: 1024px) {
  .cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
