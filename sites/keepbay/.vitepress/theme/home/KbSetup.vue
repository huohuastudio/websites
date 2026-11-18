<script setup lang="ts">
import { seg, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'

// 安装：右侧的命令随滚动逐行亮起。减少动态效果时全部显示
const lines = [
  { text: '# 解压到 /opt/keepbay/versions（完整步骤见安装文档）', kind: 'comment' },
  { text: 'sudo tar -xzf keepbay_<版本>_linux_amd64.tar.gz -C /opt/keepbay/versions' },
  { text: '# 建一个专用用户，只用来运行 Keepbay', kind: 'comment' },
  { text: 'sudo useradd --system --home-dir /var/lib/keepbay --shell /usr/sbin/nologin keepbay' },
  { text: '# 首次设置：数据目录、端口、所有者帐号，安装为系统服务', kind: 'comment' },
  { text: 'sudo /opt/keepbay/keepbay setup --user keepbay' },
  { text: '# 给已有的文件夹授权', kind: 'comment' },
  { text: 'sudo /opt/keepbay/keepbay mount:grant /srv/nas' },
  { text: '# 检查环境', kind: 'comment' },
  { text: 'sudo -u keepbay /opt/keepbay/keepbay doctor' },
  { text: '在浏览器中打开 http://<服务器地址>:8899', kind: 'ok' },
]

const term = ref<HTMLElement>()
const shown = ref(lines.length)

useScrollFrame((still) => {
  const p = still ? 1 : seg(viewProgress(term.value!, innerHeight * 0.9, innerHeight * 0.25), 0, 1)
  shown.value = Math.ceil(p * lines.length)
})
</script>

<template>
  <section class="sx-sec sx-alt">
    <div class="sx-wrap grid">
      <div>
        <h2 class="sx-title">十分钟完成安装</h2>
        <p class="sx-lead">一个程序加一个 lib/ 目录，不用另装数据库、Web 服务器或运行环境。</p>
        <p class="sx-muted">
          需要一台 Linux 服务器、NAS 或小主机：x86_64 或 arm64，glibc 2.28 及以上。安装步骤见<a href="./docs/install">普通安装</a>，也可以<a href="./docs/docker">用 Docker 安装</a>。Keepbay 还在内测，存放重要资料前，请先做好备份。
        </p>
      </div>
      <pre ref="term" class="term"><div v-for="(line, i) in lines" :key="i" :class="[line.kind, { on: i < shown }]">{{ line.text }}</div></pre>
    </div>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 56px;
  align-items: center;
}

.sx-lead {
  margin-top: 18px;
}

.sx-muted {
  margin: 14px 0 0;
}

.term {
  min-width: 0;
  margin: 0;
  padding: 24px 28px;
  overflow-x: auto;
  border-radius: 18px;
  background: #1d1d1f;
  color: #f5f5f7;
  font: 13px/1.9 var(--vp-font-family-mono);
}

.dark .term {
  background: var(--sx-tile);
}

.term div {
  white-space: pre-wrap;
  opacity: 0.12;
  transition: opacity 0.4s;
}

.term div.on {
  opacity: 1;
}

.term .comment {
  color: #86868b;
}

.term .ok {
  color: #6cc5bc;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .term div {
    opacity: 1;
    transition: none;
  }
}
</style>
