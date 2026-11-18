<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import LsScene from './LsScene.vue'
import { scenes } from './scenes'
import { typed } from './util'

// 云处理：网址中的参数逐字输入，输出随参数变化，原图不变

// 参数取自云处理文档的处理规则表，p 为预设版本
const params = [
  ['p', '预设'], ['or', '方向'], ['flip', '翻转'], ['crop', '裁剪'], ['w', '宽度'], ['h', '高度'], ['fit', '适配'],
  ['dpr', '像素比'], ['bri', '亮度'], ['con', '对比度'], ['gam', '伽马'], ['sharp', '锐化'], ['blur', '模糊'],
  ['pixel', '像素化'], ['filt', '滤镜'], ['bg', '背景色'], ['border', '边框'], ['q', '质量'], ['fm', '格式'],
]
// 网址的输入过程：逐段输入（开始的进度、涉及的参数），模糊这一段输入后再删掉，最后停在清晰的裁切加复古色
const parts = [
  { str: '?w=640', at: 0.04, keys: ['w'] },
  { str: '&h=640&fit=crop', at: 0.17, keys: ['h', 'fit'] },
  { str: '&blur=5', at: 0.3, keys: ['blur'] },
  { str: '&filt=sepia', at: 0.52, keys: ['filt'] },
  { str: '&fm=webp', at: 0.65, keys: ['fm'] },
]
/** 模糊参数被逐字删除的进度区间 */
const BLUR_DEL = [0.43, 0.48]
const PRESET = '?p=card'
const FINAL = '?w=640&h=640&fit=crop&filt=sepia&fm=webp'
const notes = [
  '原图保持不变。同一张图片可以按不同参数生成多个版本，所有储存都可以使用。',
  '常用的参数可以保存为预设版本，网址中只写 ?p=card。建议只使用预设版本：开放的参数可能被他人用大量随机参数请求，占用服务器资源。',
]

const sec = ref<HTMLElement>()
const out = ref<HTMLElement>()
const query = ref('')
const used = ref<string[]>([])
const odim = ref('1600 × 1200')
const ofmt = ref('JPEG')
const note = ref(notes[0])

useScrollFrame((still) => {
  const done = still || isFlat()
  const p = done ? 1 : pinProgress(sec.value!)
  let q = ''
  let keys: string[] = []
  // 每段参数输入完成后，输出图在随后一小段进度中过渡到新效果
  const k: number[] = []
  parts.forEach(({ str, at, keys: ks }, i) => {
    let t = seg(p, at, at + 0.06)
    let fx = smooth(seg(p, at + 0.06, at + 0.1))
    // 模糊：输入后逐字删除，效果随之撤销
    if (str === '&blur=5') {
      t = Math.min(t, 1 - seg(p, BLUR_DEL[0], BLUR_DEL[1]))
      fx = Math.min(fx, 1 - smooth(seg(p, BLUR_DEL[0], BLUR_DEL[1])))
    }
    if (t > 0) {
      q += typed(str, t)
      if (t === 1) keys = keys.concat(ks)
    }
    k[i] = fx
  })
  const presetT = seg(p, 0.78, 0.86)
  const isPreset = !done && presetT > 0
  if (isPreset) {
    q = typed(PRESET, presetT)
    keys = presetT === 1 ? ['p'] : []
  }
  // 不固定舞台或减少动态效果时，直接给出最终的参数和两段说明
  if (done) {
    q = FINAL
    keys = ['w', 'h', 'fit', 'filt', 'fm']
  }
  query.value = q
  // 参数没有变化时不赋新数组，免得模板每帧重新渲染
  if (keys.join() !== used.value.join()) used.value = keys
  const el = out.value!
  el.style.setProperty('--ow', String(1 - 0.5 * k[0]))
  el.style.setProperty('--ar', String(4 / 3 - (1 / 3) * k[1]))
  el.style.setProperty('--bl', String(k[2]))
  el.style.setProperty('--sp', String(k[3] * 0.85))
  ofmt.value = k[4] > 0.5 ? 'WebP' : 'JPEG'
  odim.value = k[0] < 0.5 ? '1600 × 1200' : k[1] < 0.5 ? '640 × 480' : '640 × 640'
  note.value = done ? notes.join('') : notes[isPreset ? 1 : 0]
})
</script>

<template>
  <section id="cloud" ref="sec" class="sx-pin sx-alt cloud">
    <div class="sx-stage">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title"><span class="ph">在网址中加参数，</span><span class="ph">生成不同的版本</span></h2>
        <p class="sx-lead">访问图片时按参数实时生成，原图保持不变，生成的图片缓存在服务器上。</p>
      </div>
      <div class="cl">
        <div class="url">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
          <span><span class="base">https://img.example.com/uploads/photo.jpg</span><span class="q">{{ query }}</span></span>
        </div>
        <div class="params">
          <span v-for="[key, name] in params" :key="key" :class="{ on: used.includes(key) }">{{ key }} {{ name }}</span>
        </div>
        <div class="panels" aria-hidden="true">
          <figure>
            <div class="box"><div class="src"><LsScene :scene="scenes.sea" /></div></div>
            <figcaption>原图 <code>1600 × 1200</code><code>JPEG</code></figcaption>
          </figure>
          <figure>
            <div class="box"><div ref="out" class="out"><LsScene :scene="scenes.sea" /></div></div>
            <figcaption>输出 <code>{{ odim }}</code><code>{{ ofmt }}</code></figcaption>
          </figure>
        </div>
        <p class="note">{{ note }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cloud {
  height: 300vh;
}

.sx-stage {
  padding-top: 28px;
}

.sx-head {
  margin-bottom: 24px;
}

.cl {
  width: min(1032px, calc(100vw - 48px));
  margin: 0 auto;
}

/* 地址栏 */
.url {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  padding: 14px 20px;
  border-radius: 14px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  font: 16px/1.4 var(--vp-font-family-mono);
  white-space: nowrap;
}

.url svg {
  flex: none;
  color: var(--sx-text-3);
}

.base {
  color: var(--sx-text-3);
}

.q {
  color: var(--sx-text);
}

.q::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1.1em;
  margin-left: 2px;
  vertical-align: -0.2em;
  background: var(--sx-link);
  animation: caret 1s steps(1) infinite;
}

@keyframes caret {
  50% {
    opacity: 0;
  }
}

/* 可用的参数：网址中用到的高亮 */
.params {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 14px 0 18px;
}

.params span {
  padding: 3px 9px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px var(--sx-line);
  color: var(--sx-text-3);
  font: 13px/1.5 var(--vp-font-family-mono);
  transition: color 0.3s, background-color 0.3s;
}

.dark .params span {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
  color: var(--sx-text-2);
}

.params span.on {
  background: var(--sx-text);
  box-shadow: none;
  color: var(--sx-bg);
}

/* 原图和输出 */
.panels {
  --ph: clamp(200px, calc(var(--sx-vh) - 508px), 400px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 24px 32px 16px;
  border-radius: 24px;
  background: var(--ls-panel-soft);
}

.box {
  display: grid;
  place-items: center;
  width: min(100%, calc(var(--ph) * 4 / 3));
  aspect-ratio: 4 / 3;
}

.box > div {
  overflow: hidden;
  border-radius: 4px;
}

.src {
  width: 100%;
  height: 100%;
}

.box svg {
  display: block;
  width: 100%;
  height: 100%;
}

.out {
  width: calc(var(--ow, 1) * 100%);
  aspect-ratio: var(--ar, 1.3333);
  filter: sepia(var(--sp, 0)) blur(calc(var(--bl, 0) * 3px));
}

figcaption {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: var(--sx-text-2);
  font-size: 14px;
}

code {
  padding: 2px 8px;
  border-radius: 980px;
  background: var(--sx-tile);
  color: var(--sx-text);
  font-family: var(--vp-font-family-mono);
}

.note {
  min-height: 3em;
  margin: 16px 0 0;
  color: var(--sx-text-2);
  font-size: 15px;
  text-align: center;
}

/* 矮视口：标题区和各部分收紧 */
@media (max-height: 820px) and (min-width: 761px) {
  .sx-stage {
    padding-top: 16px;
  }

  .sx-head {
    margin-bottom: 18px;
  }

  .sx-title {
    font-size: clamp(30px, 5.2vh, 42px);
  }

  .sx-head .sx-lead {
    margin-top: 8px;
    font-size: 16px;
  }

  .url {
    padding: 10px 16px;
    font-size: 14px;
  }

  .params {
    margin: 10px 0 12px;
  }

  .params span {
    padding: 1px 7px;
    font-size: 12px;
  }

  .panels {
    --ph: clamp(200px, calc(var(--sx-vh) - 378px), 400px);
  }

  figure {
    padding: 18px 28px 12px;
  }

  figcaption {
    margin-top: 8px;
  }

  .note {
    margin-top: 10px;
    font-size: 14px;
  }
}

@media (max-width: 760px), (max-height: 640px) {
  .cloud {
    height: auto;
  }

  .sx-stage {
    padding-top: 72px;
  }

  .panels {
    --ph: 260px;
  }
}

@media (max-width: 760px) {
  .panels {
    grid-template-columns: 1fr;
  }

  figure {
    padding: 16px 16px 12px;
  }

  .url {
    padding: 12px 14px;
    font-size: 13px;
    white-space: normal;
    word-break: break-all;
  }

  .url svg {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cloud {
    height: auto;
  }

  .sx-stage {
    padding-top: 96px;
  }

  .q::after {
    animation: none;
  }
}
</style>
