<script setup lang="ts">
import { isFlat, pinProgress, seg, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import KbShot from '../visuals/KbShot.vue'

// 搜索：随滚动逐字输入，先输入拼音首字母 ht 找到合同，再输入"京都的寺庙"按画面搜照片；左侧的搜索方式清单随之高亮。
// 舞台不固定时直接显示第二步的结果
const kinds = [
  { text: '文件名，支持拼音', plan: '免费版', phase: 0 },
  { text: '文档全文：Word、Excel、PowerPoint、PDF', plan: '免费版', phase: 0 },
  { text: '标签和智能文件夹', plan: '免费版' },
  { text: '按意思搜文档', plan: '专业版' },
  { text: '按画面搜照片', plan: '专业版', phase: 1 },
  { text: '搜照片里的文字', plan: '专业版' },
]
const q1 = 'ht'
const q2 = '京都的寺庙'

const root = ref<HTMLElement>()
const query = ref(q2)
const phase = ref(1)

useScrollFrame((still) => {
  if (still || isFlat()) {
    query.value = q2
    phase.value = 1
    return
  }
  const p = pinProgress(root.value!)
  if (p < 0.45) {
    query.value = q1.slice(0, Math.round(seg(p, 0.05, 0.2) * q1.length))
    phase.value = 0
  } else {
    query.value = q2.slice(0, Math.round(seg(p, 0.5, 0.75) * q2.length))
    phase.value = 1
  }
})
</script>

<template>
  <section ref="root" class="sx-pin find">
    <div class="sx-stage">
      <div>
        <div class="steps">
          <div class="s" :class="{ on: phase === 0 }">
            <h2 class="sx-title">输入拼音首字母</h2>
            <p>文件名支持拼音，全拼和首字母都可以。输入 ht 就能找到"合同"，匹配的汉字会标出来。有文字层的文档还可以搜全文。</p>
          </div>
          <div class="s" :class="{ on: phase === 1 }">
            <h2 class="sx-title">按画面搜照片<span class="sx-badge">专业版</span></h2>
            <p>描述照片里有什么，就能找到对应的照片。模型在您的设备上运行，照片不会发送到云端。</p>
          </div>
        </div>
        <ul class="kinds">
          <li v-for="k in kinds" :key="k.text" :class="{ on: k.phase === phase }">{{ k.text }}<small>{{ k.plan }}</small></li>
        </ul>
      </div>
      <div class="box">
        <div class="field">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="6" />
            <path d="M13 13l5 5" />
          </svg>
          <span class="q">{{ query }}</span>
        </div>
        <div class="results">
          <div :class="{ on: phase === 0 && query === q1 }">
            <div class="hit"><span>劳动<mark>合同</mark>.pdf</span><small>林海的工作/合同</small></div>
            <div class="hit"><span>房屋租赁<mark>合同</mark>.docx</span><small>家庭文档/房屋</small></div>
          </div>
          <div :class="{ on: phase === 1 && query === q2 }">
            <KbShot name="search" alt="搜索“京都的寺庙”，只看图片，找到京都相册中的照片，每项标明画面相符" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.find {
  height: 210vh;
}

.sx-stage {
  display: grid;
  grid-template-columns: 5fr 6fr;
  gap: 64px;
  align-items: center;
  padding-inline: max(24px, calc((100vw - 1080px) / 2 + 24px));
}

.steps {
  position: relative;
  min-height: 230px;
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

.s p {
  margin: 16px 0 0;
  color: var(--sx-text-2);
}

.kinds {
  margin: 32px 0 0;
  padding: 0;
  border-top: 1px solid var(--sx-line);
  list-style: none;
}

.kinds li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--sx-line);
  color: var(--sx-text-3);
  transition: color 0.4s;
}

.kinds li.on {
  color: var(--sx-text);
}

.kinds small {
  flex: none;
  font-size: 13px;
}

.box {
  display: flex;
  flex-direction: column;
  height: min(520px, calc(var(--sx-vh) - 108px));
  padding: 24px;
  border-radius: 28px;
  background: var(--sx-alt);
}

.field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 14px 20px;
  border-radius: 14px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  font-size: 20px;
}

.field svg {
  flex: none;
  color: var(--sx-text-3);
}

/* 输入光标 */
.q::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1.1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: var(--sx-link);
  animation: caret 1s steps(1) infinite;
}

@keyframes caret {
  50% {
    opacity: 0;
  }
}

.results {
  position: relative;
  flex: 1;
  margin-top: 16px;
}

.results > div {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s;
}

.results > div.on {
  opacity: 1;
}

.hit {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 6px;
  border-bottom: 1px solid var(--sx-line);
  font-size: 17px;
}

.hit small {
  color: var(--sx-text-3);
  font-size: 14px;
}

.hit mark {
  padding: 0 1px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--sx-link) 22%, transparent);
  color: inherit;
}

.results :deep(img) {
  height: 100%;
  object-fit: contain;
  border-radius: 14px;
  background: var(--sx-panel);
}

/* 舞台不固定：两步的说明都显示 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .find {
    height: auto;
  }

  .steps {
    min-height: 0;
  }

  .s {
    position: static;
    margin-bottom: 20px;
    opacity: 1;
    transform: none;
  }

  .box {
    height: 520px;
  }
}

@media (max-width: 760px) {
  .sx-stage {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .q::after {
    animation: none;
  }
}
</style>
