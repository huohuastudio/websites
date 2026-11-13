<script setup lang="ts">
import KbPhoto from './KbPhoto.vue'

// "AI 默认在本地"的示意图：用一句话按画面搜照片，结果旁标明用的是本地模型
const results = [
  { name: 'IMG_2042.HEIC', path: '照片/2024/七月海边', tone: 'dusk' },
  { name: 'IMG_0716.JPG', path: '手机相册/2023', tone: 'dusk' },
  { name: 'DSC_0391.ARW', path: '照片/2022/青岛', tone: 'sea' },
] as const
</script>

<template>
  <div
    class="kb-search"
    role="img"
    aria-label="示意图：搜索框中输入“海边的日落”，按画面找到三张照片，标明使用本地模型"
  >
    <HomeWindow>
      <div class="body">
        <div class="query">
          <span class="glass" />
          <span class="text">海边的日落</span>
        </div>
        <div class="meta">
          <span>按画面搜索</span>
          <span class="local">本地模型</span>
        </div>
        <ul class="results">
          <li v-for="item in results" :key="item.name" class="result">
            <KbPhoto class="thumb" :tone="item.tone" />
            <span class="info">
              <span class="name">{{ item.name }}</span>
              <span class="path">{{ item.path }}</span>
            </span>
          </li>
        </ul>
      </div>
    </HomeWindow>
  </div>
</template>

<style scoped>
.body {
  padding: 18px;
  font-size: 13px;
}

.query {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 8px;
}

/* 放大镜 */
.glass {
  position: relative;
  flex: none;
  width: 11px;
  height: 11px;
  border: 1.5px solid var(--vp-c-text-3);
  border-radius: 50%;
}

.glass::after {
  content: '';
  position: absolute;
  right: -5px;
  bottom: -4px;
  width: 6px;
  border-top: 1.5px solid var(--vp-c-text-3);
  transform: rotate(45deg);
}

.text {
  font-size: 15px;
  color: var(--vp-c-text-1);
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 2px 10px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.local {
  padding: 1px 8px;
  border-radius: 10px;
  background: var(--vp-c-brand-soft);
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.results {
  margin: 0;
  padding: 0;
  list-style: none;
}

.result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 2px;
  border-top: 1px solid var(--vp-c-divider);
}

.thumb {
  flex: none;
  width: 56px;
}

.info {
  min-width: 0;
}

.name {
  display: block;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.path {
  display: block;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
</style>
