<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import KbShot from '../visuals/KbShot.vue'
import { detailBox, focus } from './zoom'

// AI：三张截图，每张先完整显示，再推近到关键处，停一会儿，然后横向换到下一张；上方的分段标签和下方的说明随之切换。
// 舞台不固定时三张竖排，不推近。推近的区域（关键处）和高清图由截图脚本生成
const slides = [
  {
    name: 'desk',
    tab: 'AI 桌面',
    alt: 'AI 桌面：问家里哪些电器还在保修期内，回答列出四件电器的保修期限和对应的文件',
    captions: ['用聊天的方式查资料，回答附上相关的文件', '回答列出四件电器的保修期限，每一项都附上对应的文件'],
  },
  {
    name: 'reminders',
    tab: '日期提醒',
    alt: '日期提醒：从发票、保单、保修卡中找出的到期日，每条附原文摘录',
    captions: ['从证件、合同、保修卡中找出到期日', '每条提醒附原文摘录，经您确认后按时提醒'],
  },
  {
    name: 'ai-calls',
    tab: '调用记录',
    alt: 'AI 调用记录：语义搜索和按画面搜图都在本地处理，未发送到云端',
    captions: ['每一次 AI 调用都有记录', '本地处理的调用标明"未发送到云端"'],
  },
] as const
const boxes = slides.map((s) => detailBox(s.name))

const root = ref<HTMLElement>()
const row = ref<HTMLElement>()
const zooms: HTMLElement[] = []
const current = ref(0)
const caption = ref('')

useScrollFrame((still) => {
  if (still || isFlat()) {
    zooms.forEach((z) => focus(z, [0, 0, 100, 100], 0))
    caption.value = ''
    return
  }
  const p = seg(pinProgress(root.value!), 0.04, 0.96) * slides.length
  const i = Math.min(slides.length - 1, Math.floor(p))
  const f = p - i
  // 每张占一段：0–0.15 完整显示，0.15–0.5 推近，0.5–0.8 停留，0.8–1 滑到下一张（最后一张不滑）
  zooms.forEach((z, j) => focus(z, boxes[j], j === i ? smooth(seg(f, 0.15, 0.5)) : j < i ? 1 : 0))
  const slide = i < slides.length - 1 ? smooth(seg(f, 0.8, 1)) : 0
  row.value!.style.setProperty('--x', `${-(i + slide) * 100}%`)
  const cur = Math.round(i + slide)
  current.value = cur
  caption.value = slides[cur].captions[cur === i && f > 0.32 ? 1 : 0]
}, root)
</script>

<template>
  <section ref="root" class="sx-pin sx-alt ai">
    <div class="sx-stage sx-stage-top">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title">AI 在您的设备上运行<span class="sx-badge">专业版</span></h2>
        <p class="sx-lead">语义搜索、按画面搜图、识别图片中的文字都有本地模型，照片不会发送到云端。</p>
      </div>
      <div class="tabs" aria-hidden="true">
        <span v-for="(s, i) in slides" :key="s.name" :class="{ on: i === current }">{{ s.tab }}</span>
      </div>
      <div class="frame">
        <div ref="row" class="row">
          <div v-for="(s, i) in slides" :key="s.name" class="slot">
            <div :ref="(el) => (zooms[i] = el as HTMLElement)" class="zoom">
              <KbShot :name="s.name" fit detail :alt="s.alt" />
            </div>
          </div>
        </div>
      </div>
      <p class="caption">{{ caption }}</p>
    </div>
  </section>
</template>

<style scoped>
.ai {
  --sx-run: 320vh;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  width: max-content;
  margin: 0 auto 28px;
  padding: 4px;
  border-radius: 980px;
  background: var(--sx-card);
}

.tabs span {
  padding: 6px 18px;
  border-radius: 980px;
  color: var(--sx-text-2);
  font-size: 14px;
  transition: color 0.3s, background-color 0.3s;
}

.tabs span.on {
  background: var(--sx-text);
  color: var(--sx-bg);
}

/* 宽度受舞台高度限制，见 KbWipe 中的说明 */
.frame {
  --chrome: calc(272px + var(--sx-stage-pad) + var(--sx-stage-gap));
  position: relative;
  width: min(1200px, 88vw, calc((var(--sx-vh) - var(--chrome)) * 1.6));
  aspect-ratio: 16 / 10;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 18px;
}

.row {
  position: absolute;
  inset: 0;
  display: flex;
  transform: translateX(var(--x, 0%));
}

.slot {
  position: relative;
  flex: 0 0 100%;
  overflow: hidden;
}

.zoom {
  position: absolute;
  inset: 0;
  transform-origin: 0 0;
  transform: scale(var(--zs, 1)) translate(var(--zx, 0%), var(--zy, 0%));
}

.caption {
  min-height: 1.6em;
  margin: 24px 0 0;
  padding-inline: 24px;
  text-align: center;
  color: var(--sx-text-2);
}

@media (max-height: 832px) and (min-width: 761px) {
  .frame {
    --chrome: calc(208px + var(--sx-stage-pad) + var(--sx-stage-gap));
  }

  .tabs {
    margin-bottom: 16px;
  }

  .caption {
    margin-top: 14px;
  }
}

/* 舞台不固定：三张竖排，不要分段标签 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .tabs {
    display: none;
  }

  .frame {
    width: min(1200px, calc(100vw - 48px));
    aspect-ratio: auto;
    overflow: visible;
  }

  .row {
    position: static;
    flex-direction: column;
    transform: none;
  }

  .slot {
    aspect-ratio: 16 / 10;
    margin-bottom: 20px;
    border-radius: 18px;
  }

  .zoom {
    transform: none;
  }
}

/* 手机：换用手机截图，与其他版块一样铺满内容宽度 */
@media (max-width: 760px) {
  .slot {
    width: 100%;
    margin: 0 0 16px;
    aspect-ratio: 1170 / 2100;
    border-radius: 28px;
  }
}
</style>
