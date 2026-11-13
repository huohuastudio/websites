<script setup lang="ts">
export interface FeatureGroup {
  title: string
  items: { name: string; desc: string }[]
}

// 分组的功能列表：每组一个小标题，下面是"名称 + 一句话说明"
defineProps<{ groups: FeatureGroup[] }>()
</script>

<template>
  <div class="feature-list">
    <section v-for="group in groups" :key="group.title" class="feature-group">
      <h3>{{ group.title }}</h3>
      <dl>
        <div v-for="item in group.items" :key="item.name" class="feature-item">
          <dt>{{ item.name }}</dt>
          <dd>{{ item.desc }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px 32px;
}

.vp-doc .feature-group h3 {
  margin-top: 24px;
}

.feature-group dl {
  margin: 12px 0 0;
}

.feature-item + .feature-item {
  margin-top: 12px;
}

.feature-item dt {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.feature-item dd {
  margin: 2px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
</style>
