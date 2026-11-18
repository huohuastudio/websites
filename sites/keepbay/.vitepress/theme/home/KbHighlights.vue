<script setup lang="ts">
import { prefersReducedMotion } from '@huohuastudio/theme/showcase'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import KbShot from '../visuals/KbShot.vue'

// 了解亮点：横向排开的卡片，指示条按时间填满后自动换下一张；离开视口、标签页隐藏或点了暂停时停下。
// 减少动态效果时不自动换，指示条直接填满
const items = [
  { name: 'viewer', title: '查看器。', text: '照片、视频、PDF、Office 文档，直接在网页中预览。', alt: '查看器：显示京都伏见稻荷鸟居的照片' },
  { name: 'music', title: '音乐。', text: '封面和滚动歌词，播完自动播放下一首。', alt: '音乐播放器正在播放，显示封面和滚动的歌词' },
  { name: 'video', title: '视频。', text: '同名的字幕自动加载，电视录制的 TS 视频也能在线播放。', alt: '查看器中播放一段海边的视频' },
  { name: 'slides', title: '在线编辑。', text: '接好 ONLYOFFICE 或 Collabora Online，多人同时编辑。', alt: '在查看器中用 ONLYOFFICE 编辑演示文稿' },
  { name: 'share', title: '分享页面。', text: '对方不需要帐号，打开链接就能浏览和下载。', alt: '打开分享链接看到的相册，照片排成网格，可以下载' },
  { name: 'desk', title: 'AI 桌面。', text: '用聊天的方式查资料，回答附上相关的文件。专业版。', alt: 'AI 桌面：问家里哪些电器还在保修期内，回答列出保修期限和对应的文件' },
] as const

const track = ref<HTMLElement>()
// 按下标存放，v-for 中的数组 ref 不保证顺序
const cards: HTMLElement[] = []
const root = ref<HTMLElement>()
const index = ref(0)
// 每次换卡片加 1，让指示条的填充动画从头开始
const cycle = ref(0)
const userPaused = ref(false)
const visible = ref(false)
const pageHidden = ref(false)
const paused = computed(() => userPaused.value || !visible.value || pageHidden.value)

/** 把第 i 张卡片移到左侧与版心对齐的位置。 */
function position() {
  const list = cards
  if (!track.value || !list.length) return
  track.value.style.setProperty('--hx', `${list[0].offsetLeft - list[index.value].offsetLeft}px`)
}

function show(i: number) {
  index.value = i
  cycle.value++
  nextTick(position)
}

const onVisibility = () => (pageHidden.value = document.hidden)
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (prefersReducedMotion()) userPaused.value = true
  // 观察外层：轨道本身随切换平移，切到后几张时它的边框会移出视口，但当前卡片仍在视口中
  observer = new IntersectionObserver(([entry]) => (visible.value = entry.isIntersecting), { threshold: 0.4 })
  observer.observe(root.value!)
  document.addEventListener('visibilitychange', onVisibility)
  addEventListener('resize', position)
  position()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  removeEventListener('resize', position)
})
</script>

<template>
  <section ref="root" class="sx-alt highlights">
    <div class="sx-wrap sx-head"><h2 class="sx-title">了解亮点</h2></div>
    <div ref="track" class="track">
      <div
        v-for="(item, i) in items"
        :key="item.name"
        :ref="(el) => (cards[i] = el as HTMLElement)"
        class="card"
        :class="{ on: i === index }"
        @click="i !== index && show(i)"
      >
        <div class="cap">{{ item.title }}<span>{{ item.text }}</span></div>
        <div class="img sx-fade-b"><KbShot :name="item.name" size="wide" fit :alt="item.alt" /></div>
      </div>
    </div>
    <div class="ctrl">
      <div class="dots" :class="{ paused }">
        <button
          v-for="(item, i) in items"
          :key="item.name"
          type="button"
          :class="{ on: i === index }"
          :aria-label="`第 ${i + 1} 张：${item.title.slice(0, -1)}`"
          :aria-current="i === index"
          @click="show(i)"
        >
          <i v-if="i === index" :key="cycle" @animationend="show((index + 1) % items.length)" />
        </button>
      </div>
      <button class="play" type="button" @click="userPaused = !userPaused">{{ userPaused ? '播放' : '暂停' }}</button>
    </div>
  </section>
</template>

<style scoped>
.highlights {
  overflow: hidden;
  padding-block: 110px 90px;
}

.track {
  display: flex;
  gap: 24px;
  padding-inline: max(24px, calc((100vw - 1080px) / 2 + 24px));
  transform: translateX(var(--hx, 0px));
  transition: transform 0.9s var(--sx-ease);
}

.card {
  flex: 0 0 min(880px, 84vw);
  overflow: hidden;
  border-radius: 28px;
  background: var(--sx-panel);
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.6s;
}

.card.on {
  opacity: 1;
  cursor: default;
}

.cap {
  padding: 26px 32px 22px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.35;
}

.cap span {
  color: var(--sx-text-2);
  font-weight: 400;
}

/* 截图延伸到卡片底边，最后 32px 渐隐 */
.img {
  aspect-ratio: 16 / 10;
  margin: 0 32px;
  overflow: hidden;
  border-radius: 14px 14px 0 0;
}

.img :deep(img) {
  object-position: top;
}

.ctrl {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 36px;
}

.dots {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 980px;
  background: var(--sx-card);
}

.dots button {
  position: relative;
  overflow: hidden;
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: var(--sx-text-3);
  cursor: pointer;
  transition: width 0.4s var(--sx-ease);
}

.dots button.on {
  width: 48px;
  background: color-mix(in srgb, var(--sx-text-3) 45%, transparent);
}

.dots i {
  position: absolute;
  inset: 0;
  background: var(--sx-text);
  transform-origin: left;
  transform: scaleX(0);
  animation: fill 5s linear forwards;
}

.dots.paused i {
  animation-play-state: paused;
}

@keyframes fill {
  to {
    transform: scaleX(1);
  }
}

.play {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--sx-card);
  color: var(--sx-text);
  font-size: 13px;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .track {
    transition: none;
  }

  .dots i {
    animation: none;
    transform: scaleX(1);
  }
}
</style>
