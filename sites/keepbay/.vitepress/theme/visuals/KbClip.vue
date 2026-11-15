<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import manifest from '../recordings.json'

// 首页的短录屏（public/recordings/ 中由 scripts/recordings.mjs 生成，宽高见 recordings.json），放在窗口框中，最宽按原大（CSS 像素）显示：浅色、深色各一段，按网站当前的主题显示其中一段。
// 每段下面垫一张首帧（懒加载的图片，不显示的那张不下载），视频还没有画面时透出首帧。
// 只播放显示的那一段：进入视口才开始下载和播放，离开视口、标签页不可见时暂停；另一段切换主题后才下载。
// 不用 autoplay 属性：带了它浏览器会立即下载，两段都会下载。系统开了"减少动态效果"时不播放，只显示首帧
const props = defineProps<{ name: keyof typeof manifest; alt: string }>()

const [width, height] = manifest[props.name]

const schemes = ['light', 'dark'] as const
const root = ref<HTMLElement>()

let inView = false
let observer: IntersectionObserver | undefined
let theme: MutationObserver | undefined
let motion: MediaQueryList | undefined

const videos = () => root.value!.querySelectorAll('video')

function update() {
  const dark = document.documentElement.classList.contains('dark')
  const playing = inView && !motion!.matches && !document.hidden
  for (const video of videos()) {
    if (playing && video.dataset.scheme === (dark ? 'dark' : 'light')) {
      // 播放前就被暂停时 play() 会报错，不用处理
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }
}

/** 打开页面后才开了"减少动态效果"：停下并回到首帧。 */
function onMotionChange() {
  if (motion!.matches) videos().forEach((video) => (video.currentTime = 0))
  update()
}

onMounted(() => {
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', onMotionChange)
  // 切换主题时换成另一段
  theme = new MutationObserver(update)
  theme.observe(document.documentElement, { attributeFilter: ['class'] })
  observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    update()
  })
  observer.observe(root.value!)
  document.addEventListener('visibilitychange', update)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  theme?.disconnect()
  motion?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', update)
})
</script>

<template>
  <div ref="root" class="kb-clip">
    <HomeWindow>
      <div v-for="scheme in schemes" :key="scheme" :class="['kb-clip-layer', `kb-clip-${scheme}`]">
        <img
          class="no-zoom"
          :src="withBase(`/recordings/${name}-${scheme}.webp`)"
          :alt="alt"
          :width="width"
          :height="height"
          loading="lazy"
        />
        <video :data-scheme="scheme" :width="width" :height="height" preload="none" muted loop playsinline disablepictureinpicture aria-hidden="true">
          <source :src="withBase(`/recordings/${name}-${scheme}.webm`)" type="video/webm" />
          <source :src="withBase(`/recordings/${name}-${scheme}.mp4`)" type="video/mp4" />
        </video>
      </div>
    </HomeWindow>
  </div>
</template>

<style>
/* 不用 scoped：要按 <html> 上的 dark 类选择。宽度限制在窗口框上：外层的宽度由宽格子的示意图样式决定 */
.kb-clip .home-window {
  max-width: 480px;
  margin-inline: auto;
}

.kb-clip-layer {
  display: grid;
}

.kb-clip-layer > * {
  grid-area: 1 / 1;
  display: block;
  width: 100%;
  height: auto;
}

:root.dark .kb-clip-light,
:root:not(.dark) .kb-clip-dark {
  display: none;
}
</style>
