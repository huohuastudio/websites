<script setup lang="ts">
// "文件留在原处"的示意图：磁盘上的文件夹是主体，Keepbay 和其他程序都连到这同一份文件；
// Keepbay 用品牌色的实线和面板突出，其他程序做成陪衬
const others = [
  { name: 'SMB 共享', desc: '在电脑上直接打开' },
  { name: 'Jellyfin', desc: '在电视上看视频' },
  { name: 'Syncthing', desc: '同步手机相册' },
]
</script>

<template>
  <div
    class="kb-folders"
    role="img"
    aria-label="示意图：磁盘上的照片文件夹保持原来的目录结构，Keepbay 只读取文件、建立索引，SMB 共享、Jellyfin、Syncthing 同时使用这同一份文件"
  >
    <div class="layout">
      <div class="home-card disk">
        <div class="disk-head">
          <span class="disk-label">磁盘上的文件夹</span>
          <span class="disk-path">/srv/nas/照片</span>
        </div>
        <pre class="tree">├── 2023
├── 2024
│   ├── 春节
│   └── 七月海边
└── 手机相册</pre>
      </div>
      <div class="users">
        <div class="user keepbay">
          <span class="name">Keepbay</span>
          <span class="desc">读取文件，建立索引，不移动文件</span>
        </div>
        <div v-for="app in others" :key="app.name" class="user">
          <span class="name">{{ app.name }}</span>
          <span class="desc">{{ app.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kb-folders {
  container-type: inline-size;
}

.layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
  align-items: center;
}

.disk {
  overflow: hidden;
}

.disk-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}

.disk-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.disk-path {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tree {
  margin: 0;
  padding: 14px 18px 16px;
  overflow-x: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.85;
  color: var(--vp-c-text-2);
  white-space: pre;
}

.users {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.user {
  position: relative;
  padding: 4px 0 4px 14px;
  border-left: 2px solid var(--vp-c-border);
  font-size: 13px;
  line-height: 1.5;
}

/* 每个程序都连到左边的文件夹 */
.user::before {
  content: '';
  position: absolute;
  top: 50%;
  right: calc(100% + 2px);
  width: 40px;
  border-top: 1px dashed var(--vp-c-border);
}

.name {
  display: block;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.desc {
  color: var(--vp-c-text-2);
}

/* Keepbay：品牌色面板和实线 */
.keepbay {
  margin-bottom: 6px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 10px;
  background: var(--vp-c-bg);
  box-shadow: 0 8px 24px var(--vp-c-brand-soft);
}

.keepbay::before {
  right: 100%;
  border-top: 2px solid var(--vp-c-brand-1);
}

.keepbay .name {
  font-size: 16px;
  color: var(--vp-c-brand-1);
}

/* 窄的时候上下排，去掉连线 */
@container (max-width: 360px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .users {
    gap: 10px;
    padding-left: 4px;
  }

  .user::before {
    display: none;
  }
}
</style>
