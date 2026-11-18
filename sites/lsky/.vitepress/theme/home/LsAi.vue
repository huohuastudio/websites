<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import LsScene from './LsScene.vue'
import { scenes } from './scenes'
import { typed } from './util'

// AI：标签逐个出现，描述逐字写出，按文字要求润色图片

const tags = ['海边', '小岛', '傍晚', '风景', '户外']
const DESC = '傍晚的海面上有一座小岛，太阳低垂在海平线附近，水面映出光带。'
const PROMPT = '将背景替换为蓝天白云'
const statuses = ['等待中', '处理中', '已完成']

const sec = ref<HTMLElement>()
const pic = ref<HTMLElement>()
const tagCount = ref(0)
const desc = ref('')
const prompt = ref('')
const status = ref(0)
/** 当前的字段；-1 表示全部高亮（不固定舞台或减少动态效果时） */
const field = ref(0)

useScrollFrame((still) => {
  const done = still || isFlat()
  const p = done ? 1 : pinProgress(sec.value!)
  tagCount.value = Math.round(seg(p, 0.05, 0.3) * tags.length)
  desc.value = typed(DESC, seg(p, 0.34, 0.54))
  prompt.value = typed(PROMPT, seg(p, 0.6, 0.72))
  status.value = p < 0.74 ? 0 : p < 0.86 ? 1 : 2
  pic.value!.style.setProperty('--sky', String(smooth(seg(p, 0.78, 0.9))))
  field.value = done ? -1 : p < 0.32 ? 0 : p < 0.57 ? 1 : 2
})

const on = (i: number) => field.value < 0 || field.value === i
</script>

<template>
  <section id="ai" ref="sec" class="sx-pin ai">
    <div class="sx-stage">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title"><span>AI 生成标签和描述</span><span>按文字润色图片</span></h2>
        <p class="sx-lead">可以手动提交，也可以在上传后自动生成。管理员通过角色组控制哪些用户可以使用、可以用多少次。</p>
      </div>
      <div class="card">
        <div ref="pic" class="pic" aria-hidden="true">
          <div class="img">
            <LsScene :scene="scenes.dusk" />
            <LsScene class="after" :scene="scenes.blue" />
          </div>
        </div>
        <div class="fields">
          <div class="f" :class="{ on: on(0) }">
            <div class="label">标签</div>
            <div class="tags"><span v-for="(t, i) in tags" :key="t" :class="{ on: i < tagCount }">{{ t }}</span></div>
          </div>
          <div class="f" :class="{ on: on(1) }">
            <div class="label">简介</div>
            <p class="desc">{{ desc }}</p>
          </div>
          <div class="f" :class="{ on: on(2) }">
            <div class="label">图片润色</div>
            <p class="prompt"><span>{{ prompt }}</span></p>
            <div class="opt">
              <span>不替换原图时，保存为一张新图片</span>
              <span class="status" :class="{ done: status === 2 }">{{ statuses[status] }}</span>
            </div>
          </div>
        </div>
      </div>
      <p class="note">生成标签和描述：19 家服务商都支持，如 OpenAI、Google Gemini、通义千问、豆包、Kimi，也可以用 Ollama 调用自己部署的模型。图片润色：OpenAI、Google Gemini、豆包和自定义 OpenAI 兼容接口。</p>
    </div>
  </section>
</template>

<style scoped>
.ai {
  height: 250vh;
}

.sx-stage {
  padding-top: 36px;
}

.sx-head {
  margin-bottom: 32px;
}

.sx-title {
  font-size: clamp(32px, 4vw, 50px);
}

.sx-title span {
  display: block;
}

.card {
  --ch: clamp(280px, calc(var(--sx-vh) - 328px), 470px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  width: min(1032px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 14px;
  border-radius: 30px;
  background: var(--sx-alt);
}

/* 左边的图片：润色后换成蓝天白云 */
.pic {
  position: relative;
  display: grid;
  place-items: center;
  height: var(--ch);
  border-radius: 18px;
  background: var(--ls-panel-soft);
}

.img {
  position: relative;
  width: min(84%, calc((var(--ch) - 60px) * 4 / 3));
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 6px;
}

.img svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.img .after {
  opacity: var(--sky, 0);
}

/* 右边的字段 */
.fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  padding: 22px 22px 10px;
}

.label {
  margin-bottom: 8px;
  color: var(--sx-text-3);
  font-size: 13px;
  font-weight: 600;
  transition: color 0.3s;
}

.f.on .label {
  color: var(--sx-text);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 34px;
}

.tags span {
  padding: 5px 13px;
  border-radius: 980px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  font-size: 15px;
  opacity: 0;
  transform: translateY(8px) scale(0.92);
  transition: opacity 0.35s, transform 0.35s var(--sx-ease);
}

.tags span.on {
  opacity: 1;
  transform: none;
}

.desc,
.prompt {
  min-height: 4.5em;
  margin: 0;
  padding: 11px 14px;
  border-radius: 12px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  font-size: 15px;
  line-height: 1.55;
}

.prompt {
  min-height: 0;
}

.prompt span:empty::before {
  content: '描述要怎样修改图片';
  color: var(--sx-text-3);
}

.opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  color: var(--sx-text-2);
  font-size: 14px;
}

.status {
  padding: 3px 11px;
  border-radius: 980px;
  box-shadow: inset 0 0 0 1px var(--sx-line);
  color: var(--sx-text-3);
  font-size: 13px;
}

.status.done {
  box-shadow: inset 0 0 0 1px currentColor;
  color: var(--ls-ok);
}

.note {
  width: min(1032px, calc(100vw - 48px));
  margin: 18px auto 0;
  color: var(--sx-text-3);
  font-size: 14px;
  text-align: center;
}

/* 矮视口：标题区和字段收紧 */
@media (max-height: 820px) and (min-width: 761px) {
  .sx-stage {
    padding-top: 16px;
  }

  .sx-head {
    margin-bottom: 18px;
  }

  .sx-title {
    font-size: clamp(28px, 4.4vh, 36px);
  }

  .sx-head .sx-lead {
    margin-top: 8px;
    font-size: 16px;
  }

  .fields {
    gap: 14px;
    padding: 16px 16px 8px;
  }
}

@media (max-width: 760px), (max-height: 640px) {
  .ai {
    height: auto;
  }

  .sx-stage {
    padding-top: 72px;
  }

  .card {
    --ch: min(360px, calc((100vw - 76px) * 0.75 + 50px));
  }
}

@media (max-width: 760px) {
  .card {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai {
    height: auto;
  }

  .sx-stage {
    padding-top: 96px;
  }

  .tags span {
    transition: none;
  }
}
</style>
