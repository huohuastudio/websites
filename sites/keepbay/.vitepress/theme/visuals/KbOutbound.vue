<script setup lang="ts">
// "数据不经过我们"的示意图：Keepbay 主动联网的清单，和从来不做的几件事（与隐私页的联网表一致，改那边时同步改这里）
const outbound = [
  { name: '检查和安装更新', dest: '授权中心', send: '产品名称、是否接收测试版；安装时加上安装 ID' },
  { name: '激活和续期专业版', dest: '授权中心', send: '授权码、安装 ID、产品名称' },
  { name: '下载本地模型', dest: 'ModelScope、Hugging Face、GitHub', send: '普通的下载请求' },
  { name: '您自己配置的服务', dest: 'AI 厂商、远程存储、外部登录、通知、离线下载等', send: '每种发送什么，见隐私文档' },
]
const never = ['统计', '遥测', '崩溃上报', '第三方脚本、字体、图片']
</script>

<template>
  <div
    class="kb-outbound"
    role="img"
    aria-label="示意图：Keepbay 主动联网只有检查和安装更新、激活和续期专业版、下载本地模型，以及您自己配置的服务；没有统计、遥测、崩溃上报，也不加载第三方脚本、字体和图片"
  >
    <div class="home-card card">
      <div class="title">Keepbay 什么时候联网</div>
      <ul class="list">
        <li v-for="item in outbound" :key="item.name" class="row">
          <span class="name">{{ item.name }}</span>
          <span class="dest">{{ item.dest }}</span>
          <span class="send">{{ item.send }}</span>
        </li>
      </ul>
      <div class="never">
        <span class="never-label">没有</span>
        <span v-for="item in never" :key="item" class="never-item">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  font-size: 13px;
}

.title {
  padding: 14px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.list {
  margin: 0;
  padding: 0 18px;
  list-style: none;
}

.row {
  display: grid;
  grid-template-columns: 8.5em 1fr;
  gap: 0 12px;
  padding: 10px 0;
}

.row + .row {
  border-top: 1px solid var(--vp-c-divider);
}

.name {
  grid-row: span 2;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.dest {
  color: var(--vp-c-text-2);
}

.send {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.never {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid var(--vp-c-divider);
  border-radius: 0 0 12px 12px;
  background: var(--vp-c-bg-alt);
}

.never-label {
  margin-right: 4px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

/* 划掉的标签：表示程序里没有这些 */
.never-item {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  color: var(--vp-c-text-2);
  text-decoration: line-through;
}
</style>
