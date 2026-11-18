<script setup lang="ts">
import { seg, smooth, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { withBase } from 'vitepress'
import { ref } from 'vue'

// 远程存储也是文件夹：四种存储随滚动各画出一条线，汇入 Keepbay，下面列出添加后的文件夹。
// 线上的小圆点循环流动（SVG 动画），减少动态效果时不显示
const nodes = [
  { name: '本机磁盘', text: '硬盘、NAS 的共享、挂载的网络盘' },
  { name: 'S3 兼容存储', text: 'Amazon S3、Cloudflare R2、阿里云 OSS、腾讯云 COS、MinIO' },
  { name: 'WebDAV', text: '坚果云、Nextcloud、群晖 NAS、OpenList' },
  { name: 'SFTP', text: 'NAS、VPS 等能用 SSH 登录的服务器' },
]
const paths = ['M125 0 C125 110 500 70 500 180', 'M375 0 C375 100 500 90 500 180', 'M625 0 C625 100 500 90 500 180', 'M875 0 C875 110 500 70 500 180']
const folders = [
  ['家庭相册', '本机磁盘'],
  ['家庭文档', '本机磁盘'],
  ['照片备份', 'Cloudflare R2'],
  ['工作资料', '坚果云'],
  ['网站备份', 'VPS（SFTP）'],
]

const root = ref<HTMLElement>()
const net = ref<HTMLElement>()

useScrollFrame((still) => {
  const d = still ? 1 : smooth(seg(viewProgress(net.value!, innerHeight * 0.95, innerHeight * 0.1), 0, 0.6))
  net.value!.style.setProperty('--d', String(d))
}, root)
</script>

<template>
  <section ref="root" class="sx-sec sx-alt">
    <div class="sx-wrap">
      <div class="sx-head center">
        <h2 class="sx-title">远程存储也是文件夹<span class="sx-badge">专业版</span></h2>
        <p class="sx-lead">对象存储、WebDAV、能用 SSH 登录的服务器，添加后和本机的文件夹一样浏览、预览、搜索和分享。</p>
      </div>
      <div ref="net" class="net">
        <div class="nodes">
          <div v-for="n in nodes" :key="n.name" class="node">
            <h4>{{ n.name }}</h4>
            <p>{{ n.text }}</p>
          </div>
        </div>
        <svg viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true">
          <path v-for="(d, i) in paths" :id="`kb-remote-path-${i}`" :key="i" pathLength="1" :d="d" />
          <circle v-for="(d, i) in paths" :key="i" r="4">
            <animateMotion dur="2.4s" :begin="`${i * 0.6}s`" repeatCount="indefinite">
              <mpath :href="`#kb-remote-path-${i}`" />
            </animateMotion>
          </circle>
        </svg>
        <div class="hub"><img :src="withBase('/logo.svg')" alt="" width="32" height="32" />Keepbay</div>
        <div class="tree">
          <div v-for="[name, where] in folders" :key="name">{{ name }}<small>{{ where }}</small></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.net {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
}

.nodes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  text-align: center;
}

.node {
  padding: 20px 14px;
  border-radius: 20px;
  background: var(--sx-tile);
}

h4 {
  font-size: 19px;
  font-weight: 600;
  line-height: 1.4;
}

.node p {
  margin: 6px 0 0;
  color: var(--sx-text-2);
  font-size: 13px;
  line-height: 1.5;
}

svg {
  display: block;
  width: 100%;
  height: 180px;
  overflow: visible;
}

path {
  fill: none;
  stroke: var(--sx-text-3);
  stroke-width: 1.5;
  stroke-dasharray: 1;
  stroke-dashoffset: calc(1 - var(--d, 0));
}

circle {
  fill: var(--sx-link);
  opacity: calc(var(--d, 0) * var(--d, 0));
}

.hub {
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  margin: 0 auto;
  padding: 16px 28px;
  border-radius: 22px;
  background: var(--sx-tile);
  font-size: 21px;
  font-weight: 600;
  transform: scale(calc(0.9 + var(--d, 0) * 0.1));
}

.hub img {
  width: 32px;
  height: 32px;
}

.tree {
  max-width: 520px;
  margin: 28px auto 0;
  padding: 10px 22px;
  border-radius: 20px;
  background: var(--sx-tile);
  font-size: 16px;
}

.tree div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--sx-line);
  opacity: var(--d, 0);
}

.tree div:last-child {
  border: 0;
}

.tree small {
  color: var(--sx-text-3);
}

@media (max-width: 760px) {
  .nodes {
    grid-template-columns: 1fr 1fr;
  }

  svg {
    display: none;
  }

  .hub {
    margin-top: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  path {
    stroke-dashoffset: 0;
  }

  circle {
    display: none;
  }
}
</style>
