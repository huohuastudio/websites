<script setup lang="ts">
import { data } from '../market.data'

// 插件市场和主题市场中的实际列表，构建时从 novaix-releases 仓库读取（market.data.ts）。
// 两类都为空时整块不显示；只有一类为空时只隐藏那一类

/** 插件类型的名称和排列顺序，与上面的插件类型一致；供应商插件排在最后 */
const TYPES: Record<string, string> = {
  payment: '支付',
  captcha: '人机验证',
  oauth: '社会化登录',
  kyc: '身份认证',
  sms: '短信',
  mail: '邮件',
  notify: '通知',
  extension: '扩展',
  supplier: '供应商',
}
const ORDER = Object.keys(TYPES)
const rank = (type?: string) => {
  const i = type ? ORDER.indexOf(type) : -1
  return i < 0 ? ORDER.length - 1 : i
}

const groups = [
  { title: '市场中的插件', items: [...data.plugins].sort((a, b) => rank(a.type) - rank(b.type)) },
  { title: '市场中的主题', items: data.themes },
].filter((group) => group.items.length > 0)
</script>

<template>
  <div v-if="groups.length" class="market">
    <p class="intro">
      开发者可以向 <a href="https://github.com/huohuastudio/novaix-releases" target="_blank" rel="noreferrer">novaix-releases</a> 仓库提交自己的插件和主题。
    </p>
    <div v-for="group in groups" :key="group.title" class="group">
      <h3>{{ group.title }}</h3>
      <div class="list">
        <div v-for="item in group.items" :key="item.id" class="item">
          <div class="head">
            <b>{{ item.name }}</b>
            <span v-if="item.type" class="type">{{ TYPES[item.type] ?? item.type }}</span>
          </div>
          <p>{{ item.description }}</p>
          <div class="meta"><span>{{ item.author.name }}</span><span>v{{ item.version }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.market {
  margin-top: 56px;
}

.intro {
  margin: 0;
  color: var(--sx-text-2);
  font-size: 16px;
}

.group {
  margin-top: 32px;
}

.group h3 {
  margin: 0 0 6px;
  font-size: 19px;
  font-weight: 600;
}

/* 与功能列表相同的写法：每项上方一条细线，不加卡片底色 */
.list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 32px;
}

.item {
  display: flex;
  flex-direction: column;
  padding: 14px 0 16px;
  border-top: 1px solid var(--sx-line);
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.head b {
  font-size: 16px;
  font-weight: 600;
}

.type {
  flex: none;
  color: var(--sx-text-2);
  font-size: 13px;
}

.item p {
  flex: 1;
  margin: 4px 0 8px;
  color: var(--sx-text-2);
  font-size: 14px;
  line-height: 1.5;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.meta {
  display: flex;
  gap: 12px;
  color: var(--sx-text-2);
  font-size: 13px;
}

@media (max-width: 900px) {
  .list {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .list {
    grid-template-columns: 1fr;
  }
}
</style>
