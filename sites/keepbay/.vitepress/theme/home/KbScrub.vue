<script setup lang="ts">
import { isFlat, pinProgress, prefersReducedMotion, seg, useScrollFrame } from '@huohuastudio/theme/showcase'
import { useData, withBase } from 'vitepress'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import manifest from '../recordings.json'

// 录屏随滚动播放：在终端中移动三张照片（终端随后移出画面），Keepbay 发现变化，照片出现在页面中。左侧三段说明随进度切换。
// 录屏由 scripts/recordings.mjs 生成：folders-<主题>-scrub.webm（VP9）和 .mp4（H.264），每 6 帧一个关键帧，拖动时跳得快；
// 浅色、深色随网站的主题切换。舞台不固定时循环播放；减少动态效果时只显示照片出现后的结果帧
const { isDark } = useData()
const [width, height] = manifest.folders.size

// 滚动进度和录屏时间（秒）的对应关系：0.34 时刚回车，0.62 时照片即将出现，之后停在结果画面（照片出现 1.5 秒后录屏淡回首帧，不播淡出）。
// 回车和照片出现的时间由录屏脚本记下，浅色、深色各一组
const keys = Object.fromEntries(
  (['light', 'dark'] as const).map((scheme) => {
    const { enter, appear } = manifest.folders[scheme]
    return [scheme, [[0, 0], [0.34, enter + 0.1], [0.62, appear - 0.1], [0.8, appear + 0.3], [1, appear + 0.7]]]
  }),
) as Record<'light' | 'dark', number[][]>

const steps = [
  { title: '在终端中移动三张照片', text: 'NAS 的共享、Syncthing 或其他程序对文件夹做的改动，同样会被发现。' },
  { title: 'Keepbay 发现了变化', text: '等目录 3 秒没有新的变化，确认文件已经写完，再更新索引。' },
  { title: '照片出现在页面中', text: '不用刷新页面，也不用手动扫描。' },
]

const root = ref<HTMLElement>()
const bar = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const step = ref(0)

const scheme = () => (isDark.value ? 'dark' : 'light')

function toTime(p: number) {
  const k = keys[scheme()]
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) return k[i - 1][1] + ((p - k[i - 1][0]) / (k[i][0] - k[i - 1][0])) * (k[i][1] - k[i - 1][1])
  }
  return k[k.length - 1][1]
}

let still = false
// 接近视口时才加载录屏
let near = false
let visible = false
// 最近一次的滚动进度：切换浅色、深色时按新录屏的时间点重新计算目标时间
let progress = 0
let want = 0
let seeking = false

function load() {
  const v = video.value!
  if (still) {
    v.poster = withBase(`/recordings/folders-${scheme()}-end.webp`)
    return
  }
  v.poster = withBase(`/recordings/folders-${scheme()}.webp`)
  if (!near) return
  // mp4 更小（约 1.5 MB，webm 约 2.3 MB），能播 H.264 的浏览器都用它
  const type = v.canPlayType('video/mp4; codecs="avc1.64001f"') ? 'mp4' : 'webm'
  seeking = false
  want = toTime(progress)
  v.src = withBase(`/recordings/folders-${scheme()}-scrub.${type}`)
  play()
}

/** 跳到 want；上一次跳转完成前不再跳，完成后按最新的 want 再跳。 */
function seek() {
  const v = video.value!
  if (seeking || !v.duration || Math.abs(v.currentTime - want) < 1 / 30) return
  seeking = true
  v.currentTime = want
}

function onReady() {
  seeking = false
  // 舞台不固定时循环播放，不再追踪滚动对应的时间
  if (!isFlat()) seek()
}

let nearObserver: IntersectionObserver | undefined
let visibleObserver: IntersectionObserver | undefined

onMounted(() => {
  still = prefersReducedMotion()
  load()
  if (still) return
  nearObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || near) return
      near = true
      nearObserver?.disconnect()
      load()
    },
    { rootMargin: '100% 0px' },
  )
  nearObserver.observe(root.value!)
  visibleObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    play()
  })
  visibleObserver.observe(video.value!)
})

onBeforeUnmount(() => {
  nearObserver?.disconnect()
  visibleObserver?.disconnect()
})

watch(isDark, () => load())

/** 舞台不固定时：在视口中循环播放，离开视口暂停。 */
function play() {
  const v = video.value!
  if (still || !isFlat()) return
  v.loop = true
  if (visible && v.paused && v.src) v.play().catch(() => {})
  else if (!visible && !v.paused) v.pause()
}

useScrollFrame((frameStill) => {
  if (frameStill) return
  if (isFlat()) return play()
  const v = video.value!
  if (!v.paused) v.pause()
  v.loop = false
  const p = seg(pinProgress(root.value!), 0.04, 0.94)
  progress = p
  want = toTime(p)
  seek()
  bar.value!.style.setProperty('--t', String(p))
  step.value = p < 0.34 ? 0 : p < 0.66 ? 1 : 2
}, root)
</script>

<template>
  <section ref="root" class="sx-pin scrub">
    <div class="sx-stage">
      <div>
        <div class="steps">
          <div v-for="(s, i) in steps" :key="s.title" class="s" :class="{ on: i === step }">
            <h2 class="sx-title">{{ s.title }}</h2>
            <p>{{ s.text }}</p>
          </div>
        </div>
        <div ref="bar" class="bar"><i /></div>
      </div>
      <div class="sx-win">
        <video
          ref="video"
          :style="{ aspectRatio: `${width} / ${height}` }"
          muted
          playsinline
          preload="auto"
          aria-label="录屏：在终端中执行 mv ~/手机相册/*.jpg .，把三张照片移进家庭相册的「2025-07 海边」文件夹，几秒后 Keepbay 的文件页面中出现这三张照片，没有刷新页面"
          @loadedmetadata="onReady"
          @seeked="onReady"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrub {
  --sx-run: 240vh;
}

.sx-stage {
  display: grid;
  grid-template-columns: 4fr 7fr;
  gap: 64px;
  align-items: center;
  padding-inline: max(24px, calc((100vw - 1080px) / 2 + 24px));
}

.steps {
  position: relative;
  min-height: 200px;
}

.s {
  position: absolute;
  inset: 0 0 auto;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.5s, transform 0.5s var(--sx-ease);
}

.s.on {
  opacity: 1;
  transform: none;
}

.steps .s .sx-title {
  font-size: clamp(30px, 3.2vw, 44px);
}

.s p {
  margin: 16px 0 0;
  color: var(--sx-text-2);
}

.bar {
  max-width: 280px;
  height: 3px;
  margin-top: 40px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--sx-line);
}

.bar i {
  display: block;
  width: calc(var(--t, 0) * 100%);
  height: 100%;
  background: var(--sx-text);
}

.sx-win video {
  max-height: calc(var(--sx-vh) * 0.8);
  object-fit: contain;
  background: var(--sx-alt);
}

/* 舞台不固定：三段说明都显示，不要进度条 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .steps {
    min-height: 0;
  }

  .s {
    position: static;
    margin-bottom: 24px;
    opacity: 1;
    transform: none;
  }

  .bar {
    display: none;
  }

  .sx-win video {
    max-height: none;
  }
}

@media (max-width: 760px) {
  .sx-stage {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
