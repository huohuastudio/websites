<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KbShot from './KbShot.vue'

// 首屏：几张演示站的截图在窗口框中轮流淡入淡出，窗口上方一排名称（title）显示当前是哪张、点击切换，
// 底部一行说明随截图切换（文件页面标出这个文件夹在磁盘上的位置）。
// 每张停留 INTERVAL；标签页不可见、首屏离开视口、鼠标停在上面或键盘焦点在里面时暂停；点了名称就不再自动切换；
// 系统开了"减少动态效果"时不自动切换，切换也不带过渡。没轮到的截图先不下载，轮到前一张时再加载
const slides = [
  {
    name: 'files',
    title: '文件',
    alt: 'Keepbay 的文件页面：日常相册中的照片按原比例排成网格',
    label: '磁盘上的位置',
    path: '/srv/nas/家庭相册/2025/日常',
  },
  {
    name: 'viewer',
    title: '查看器',
    alt: 'Keepbay 的查看器：显示京都伏见稻荷鸟居的照片',
    label: '查看器',
    text: '照片、视频、PDF、Office 文档直接在网页中预览',
  },
  {
    name: 'desk',
    title: 'AI 桌面',
    alt: 'Keepbay 的 AI 桌面：问“家里哪些电器还在保修期内”，回答列出四件电器的保修期限和对应的文件，注明在本地处理',
    label: 'AI 桌面',
    text: '用聊天的方式查资料，回答附上相关的文件',
  },
  {
    name: 'reminders',
    title: '日期提醒',
    alt: 'Keepbay 的提醒页面：从发票、保单、保修卡中找出的到期日，每条附原文摘录，等待确认',
    label: '日期提醒',
    text: '从证件、合同、保修卡中找出到期日，确认后按时提醒',
  },
] as const

const INTERVAL = 5000

const active = ref(0)
const loaded = ref(slides.map((_, i) => i === 0))
const root = ref<HTMLElement>()

let timer: ReturnType<typeof setTimeout> | undefined
let reduced = false
let stopped = false
let inView = true
let hovering = false
let focused = false
let observer: IntersectionObserver | undefined
let motion: MediaQueryList | undefined

/** 按当前状态重新计时：满足条件时 INTERVAL 后切到下一张。 */
function schedule() {
  clearTimeout(timer)
  if (reduced || stopped || !inView || hovering || focused || document.hidden) return
  timer = setTimeout(() => show((active.value + 1) % slides.length), INTERVAL)
}

/** 先加载下一张（自动切换时才需要）。 */
function loadNext() {
  if (!reduced) loaded.value[(active.value + 1) % slides.length] = true
}

/** 切到第 i 张，并先加载下一张。 */
function show(i: number) {
  active.value = i
  loaded.value[i] = true
  loadNext()
  schedule()
}

function pick(i: number) {
  stopped = true
  show(i)
}

function setHovering(value: boolean) {
  hovering = value
  schedule()
}

function onFocusIn() {
  focused = true
  schedule()
}

function onFocusOut(event: FocusEvent) {
  if (root.value?.contains(event.relatedTarget as Node | null)) return
  focused = false
  schedule()
}

/** 打开页面后才改了"减少动态效果"：关掉时先加载下一张再开始计时。 */
function onMotionChange() {
  reduced = motion!.matches
  loadNext()
  schedule()
}

onMounted(() => {
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  reduced = motion.matches
  motion.addEventListener('change', onMotionChange)
  observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    schedule()
  })
  observer.observe(root.value!)
  document.addEventListener('visibilitychange', schedule)
  // 第二张等首屏的其他资源下载完再加载
  if (document.readyState === 'complete') loadNext()
  else addEventListener('load', loadNext, { once: true })
  schedule()
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  observer?.disconnect()
  motion?.removeEventListener('change', onMotionChange)
  removeEventListener('load', loadNext)
  document.removeEventListener('visibilitychange', schedule)
})
</script>

<template>
  <div
    ref="root"
    class="kb-hero"
    @mouseenter="setHovering(true)"
    @mouseleave="setHovering(false)"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div class="tabs" role="group" aria-label="切换截图">
      <button
        v-for="(s, i) in slides"
        :key="s.name"
        type="button"
        class="tab"
        :aria-current="i === active"
        @click="pick(i)"
      >
        {{ s.title }}
      </button>
    </div>
    <HomeWindow address="nas.local:8899">
      <div class="stack">
        <div v-for="(s, i) in slides" :key="s.name" class="slide" :class="{ active: i === active }" :aria-hidden="i !== active">
          <KbShot :name="s.name" :alt="s.alt" :defer="!loaded[i]" />
        </div>
      </div>
      <div class="caption stack">
        <p v-for="(s, i) in slides" :key="s.name" class="slide line" :class="{ active: i === active }" :aria-hidden="i !== active">
          <span class="label">{{ s.label }}</span>
          <code v-if="'path' in s">{{ s.path }}</code>
          <span v-else>{{ s.text }}</span>
        </p>
      </div>
    </HomeWindow>
  </div>
</template>

<style scoped>
/* 所有截图（说明）叠在同一格，高度取最高的一张，切换时窗口不跳动 */
.stack {
  display: grid;
}

.slide {
  grid-area: 1 / 1;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.6s ease,
    visibility 0s 0.6s;
}

.slide.active {
  z-index: 1;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.6s ease;
}

.caption {
  padding: 10px 16px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-brand-soft);
  font-size: 12px;
}

.line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin: 0;
  color: var(--vp-c-text-1);
}

.label {
  color: var(--vp-c-text-2);
}

.line code {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.tab {
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 14px;
  line-height: 24px;
  color: var(--vp-c-text-2);
  transition:
    color 0.2s,
    background-color 0.2s;
}

.tab:hover {
  color: var(--vp-c-text-1);
}

.tab[aria-current='true'] {
  background: var(--vp-c-brand-soft);
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

@media (prefers-reduced-motion: reduce) {
  .slide,
  .slide.active {
    transition: none;
  }
}
</style>
