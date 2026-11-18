<script setup lang="ts">
import { prefersReducedMotion } from '@huohuastudio/theme/showcase'
import { withBase } from 'vitepress'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 通知：两行通知卡片反向循环滚动（内容取自文档中的通知种类，每行复制一份用于无缝循环），下面的渠道名依次高亮。
// 减少动态效果时卡片换行排列，渠道名全部高亮
const notes = [
  ['收到上传的文件', '周晴通过收集链接上传了 12 个文件', 'Bark'],
  ['重要日期提醒', '笔记本电脑保修将于 2027 年 8 月 10 日到期', '企业微信'],
  ['帐号安全', '您的帐号在新设备上登录', '邮件'],
  ['磁盘与文件夹', '磁盘已恢复在线', 'Telegram'],
  ['新版本', '发现新版本，可以在维护页安装', '钉钉'],
  ['后台任务完成', '复制 2,341 个文件已完成', '飞书'],
  ['收件箱', '有 3 个文件的整理建议待您处理', 'Bark'],
  ['分享链接被访问', '「2024-10 京都」的分享链接被打开', '邮件'],
  ['数据库备份失败', '今天的自动备份没有成功', '企业微信'],
  ['AI 花费', '本月云端 AI 花费已达到上限的 80%', 'Telegram'],
]
const lines = [notes.slice(0, 5), notes.slice(5)]
const channels = ['Bark', '邮件', '企业微信', '钉钉', '飞书', 'Telegram']

// 高亮的渠道：-1 表示没有，-2 表示全部
const active = ref(-1)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (prefersReducedMotion()) {
    active.value = -2
    return
  }
  let i = 0
  timer = setInterval(() => {
    active.value = i
    i = (i + 1) % channels.length
  }, 1400)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="sx-sec notify">
    <div class="sx-wrap sx-head center">
      <h2 class="sx-title">需要您知道的事，及时通知</h2>
      <p class="sx-lead">新版本、备份失败、磁盘离线、日期提醒、收到上传的文件，可以按种类打开或关闭。</p>
    </div>
    <div v-for="(line, i) in lines" :key="i" class="marquee" :class="{ rev: i === 1 }">
      <div v-for="copy in [0, 1]" :key="copy" :class="{ dup: copy === 1 }" :aria-hidden="copy === 1 || undefined">
        <div v-for="[title, text, channel] in line" :key="title" class="nt">
          <img :src="withBase('/logo.svg')" alt="" width="38" height="38" />
          <div class="h">{{ title }}<small>{{ channel }}</small></div>
          <p>{{ text }}</p>
        </div>
      </div>
    </div>
    <div class="channels">
      <span v-for="(c, i) in channels" :key="c" :class="{ on: active === -2 || active === i }">{{ c }}</span>
    </div>
  </section>
</template>

<style scoped>
.notify {
  overflow: hidden;
}

.marquee {
  display: flex;
  width: max-content;
  gap: 16px;
  animation: marquee 60s linear infinite;
}

.marquee > div {
  display: contents;
}

.marquee.rev {
  margin-top: 16px;
  animation-direction: reverse;
}

.marquee:hover {
  animation-play-state: paused;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

.nt {
  display: grid;
  flex: none;
  grid-template-columns: 38px 1fr;
  gap: 4px 12px;
  width: 360px;
  padding: 14px 16px;
  border-radius: 20px;
  background: var(--sx-alt);
  font-size: 15px;
  line-height: 1.4;
}

.nt img {
  grid-row: span 2;
  width: 38px;
  height: 38px;
}

.h {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-weight: 600;
}

.h small {
  color: var(--sx-text-3);
  font-size: 13px;
  font-weight: 400;
}

.nt p {
  margin: 0;
  color: var(--sx-text-2);
}

.channels {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 34px;
  margin-top: 56px;
  padding-inline: 24px;
  color: var(--sx-text-3);
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.channels span {
  transition: color 0.3s;
}

.channels span.on {
  color: var(--sx-text);
}

@media (prefers-reduced-motion: reduce) {
  .marquee {
    flex-wrap: wrap;
    justify-content: center;
    width: auto;
    padding-inline: 24px;
    animation: none;
  }

  .marquee .dup {
    display: none;
  }

  .nt {
    width: min(360px, 100%);
  }
}
</style>
