<script setup lang="ts">
import { data } from './market.data'

const TYPES: Record<string, string> = {
  payment: '支付',
  oauth: '登录',
  sms: '短信',
  notify: '通知',
  captcha: '验证',
  extension: '扩展',
  supplier: '转售',
}

// 插件和主题的卡片列表；版块标题和说明在首页 markdown 中，两类都为空时首页不显示这一块。
// 样式写全，不依赖文档正文样式
const groups = [
  { title: '插件', items: data.plugins },
  { title: '主题', items: data.themes },
].filter((group) => group.items.length > 0)
</script>

<template>
  <template v-for="group in groups" :key="group.title">
    <h3 class="market-title">{{ group.title }}</h3>
    <div class="market-grid">
      <div v-for="item in group.items" :key="item.id" class="market-item">
        <div class="market-head">
          <span class="market-name">{{ item.name }}</span>
          <span v-if="item.type" class="market-type">{{ TYPES[item.type] ?? item.type }}</span>
        </div>
        <p class="market-desc">{{ item.description }}</p>
        <div class="market-meta">{{ item.author.name }} · v{{ item.version }}</div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.market-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.market-grid + .market-title {
  margin-top: 40px;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.market-item {
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.market-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.market-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.market-type {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.market-desc {
  flex: 1;
  margin: 8px 0 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.market-meta {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
