<script setup lang="ts">
import { data } from './themes.data'
</script>

<template>
  <div v-if="data.length" class="theme-grid">
    <div v-for="theme in data" :key="theme.id" class="theme-item">
      <img class="theme-shot no-zoom" :src="theme.screenshot" :alt="theme.name" loading="lazy" decoding="async" />
      <div class="theme-body">
        <div class="theme-name">{{ theme.name }}</div>
        <p class="theme-desc">{{ theme.description }}</p>
        <div v-if="theme.tags.length" class="theme-tags">
          <span v-for="tag in theme.tags" :key="tag" class="theme-tag">{{ tag }}</span>
        </div>
        <div class="theme-meta">
          <span>{{ theme.author }}</span>
          <a v-if="theme.repo" :href="theme.repo" target="_blank" rel="noreferrer">仓库</a>
        </div>
      </div>
    </div>
  </div>
  <p v-else>主题仓库暂时还没有收录主题。</p>
</template>

<style scoped>
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.theme-item {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.vp-doc .theme-shot {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  background: var(--vp-c-default-soft);
}

.theme-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px 20px;
}

.theme-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.vp-doc .theme-desc {
  flex: 1;
  margin: 8px 0 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.theme-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.theme-tag {
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}

.theme-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
