<script setup lang="ts">
import { easeOut, isFlat, pinProgress, seg, smooth, useLayoutCache, useScrollFrame } from '@huohuastudio/theme/showcase'
import { computed, ref } from 'vue'
import NxShot from './NxShot.vue'

// 首屏：终端随滚动逐行输入下载、解压、运行三条命令，然后缩小退到左下并淡出，仪表盘从后面放大。
// 窄屏、视口太矮或减少动态效果时不固定舞台，终端和仪表盘上下排列，命令直接显示完整

const RELEASES = 'https://github.com/huohuastudio/novaix-releases/releases/latest'
const TITLE = '开箱即用的 IDC 管理系统'

// 标题每个字从下方升起，连续的英文字母作为一个整体；按空格分成短语，短语内不断行
let order = 0
const phrases = TITLE.split(' ').map((phrase) =>
  (phrase.match(/[A-Za-z]+|./g) ?? []).map((text) => ({ text, delay: `${0.05 + order++ * 0.05}s` })),
)

interface Line {
  /** 命令，逐字输入 */
  cmd?: string
  /** 注释，轮到时整行出现 */
  note?: string
  /** 最后一行的访问地址用正文色 */
  url?: boolean
}

const LINES: Line[] = [
  { note: '# 下载（ARM 服务器把 amd64 换成 arm64）' },
  { cmd: 'wget https://github.com/huohuastudio/novaix-releases/releases/latest/download/novaix_linux_amd64.tar.gz' },
  { note: '# 解压' },
  { cmd: 'tar -xzf novaix_linux_amd64.tar.gz' },
  { note: '# 运行' },
  { cmd: './novaix_linux_amd64/novaix' },
  { note: '# 首次运行在当前目录生成 config.yaml，并在终端输出初始管理员密码' },
  { note: '# 在浏览器中访问 http://服务器IP:8080，用初始管理员账号登录', url: true },
]

// 每行在打字进度中占的区间：注释一下出现，命令按长度逐字输入（长命令按比例压缩）
const weights = LINES.map((l) => (l.cmd ? Math.min(14, 4 + l.cmd.length / 8) : 3))
const total = weights.reduce((a, b) => a + b, 0)
let acc = 0
const spans = weights.map((w) => {
  const span = [acc / total, (acc + w) / total] as const
  acc += w
  return span
})

// 斜杠后加零宽空格，长网址只在斜杠处换行
const breakable = (s: string) => s.replace(/\//g, '/\u200b')

/** 打字进度 0–1；服务端渲染和不固定舞台时为 1，命令完整显示 */
const typed = ref(1)
const lines = computed(() => {
  const q = typed.value
  // 光标停在正在输入的命令上；全部输入完后不显示
  let cur = -1
  const out = LINES.map((line, i) => {
    const t = seg(q, spans[i][0], spans[i][1])
    if (!line.cmd) return { line, on: q >= spans[i][0] && (i === 0 || t > 0), started: false, done: '', rest: '' }
    const n = Math.round(t * line.cmd.length)
    if (q > spans[i][0] && t < 1) cur = i
    return {
      line,
      on: false,
      started: q > spans[i][0],
      // 未输入的部分透明占位，终端高度不会跳动
      done: breakable(line.cmd.slice(0, n)),
      rest: breakable(line.cmd.slice(n)),
    }
  })
  return out.map((item, i) => ({ ...item, cur: i === cur }))
})

// 入场淡入结束后去掉动画，否则动画的 opacity 会盖过滚动时设置的 --to
const fadeIn = ref(true)

const root = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const head = ref<HTMLElement>()
const actions = ref<HTMLElement>()
const scene = ref<HTMLElement>()
const term = ref<HTMLElement>()

const refresh = useScrollFrame((still) => {
  if (still || isFlat()) {
    typed.value = 1
    return
  }
  const el = root.value!
  const sc = scene.value!
  const { actionsBottom, H, W, th, x0, stageH } = layout()
  const p = pinProgress(el)
  const a = easeOut(seg(p, 0, 0.16))
  const b = smooth(seg(p, 0.56, 0.86))
  el.style.setProperty('--fade', String(1 - seg(p, 0, 0.14)))

  // 终端在场景中垂直居中；起始时它的顶边落在按钮下方 40px，随后升到舞台中央（坐标都相对舞台顶边）
  const cy = Math.max(0, (H - th) / 2)
  const termTopCentered = stageH / 2 - H / 2 - innerHeight * 0.025 + cy
  const dy0 = Math.max(0, actionsBottom + 40 - termTopCentered)
  sc.style.setProperty('--dy', `${(1 - a) * dy0}px`)
  // 按 1/400 取整：字数不变时值也不变，终端不会每帧重新渲染
  typed.value = Math.round(seg(p, 0.1, 0.5) * 400) / 400

  // 仪表盘从后面放大；终端以左下角为原点缩小到一半，移向左下角并淡出
  const y0 = cy + th
  sc.style.setProperty('--tx', `${b * (-0.02 * W - x0)}px`)
  sc.style.setProperty('--ty', `${cy + b * (H * 0.98 - y0)}px`)
  sc.style.setProperty('--ts', String(1 - b * 0.5))
  // 终端先淡出，仪表盘再显现，两层文字不同时出现
  sc.style.setProperty('--to', String(1 - seg(b, 0, 0.25)))
  sc.style.setProperty('--do', String(seg(b, 0.3, 0.75)))
  sc.style.setProperty('--dsc', String(0.9 + 0.1 * b))
  el.style.setProperty('--no', String(seg(p, 0.86, 0.94)))
}, root)

/** 只随尺寸变化的布局值（终端打字时未输入的部分透明占位，高度不变），缓存起来，不必每帧读布局 */
const layout = useLayoutCache(
  () => [stage.value, head.value, scene.value, term.value],
  () => {
    const sc = scene.value!
    const tm = term.value!
    return {
      actionsBottom: head.value!.offsetTop + actions.value!.offsetTop + actions.value!.offsetHeight,
      H: sc.offsetHeight,
      W: sc.offsetWidth,
      th: tm.offsetHeight,
      x0: tm.offsetLeft,
      stageH: stage.value!.clientHeight,
    }
  },
  refresh,
)
</script>

<template>
  <section id="hero" ref="root" class="sx-pin hero">
    <div ref="stage" class="sx-stage">
      <div ref="head" class="head sx-wrap">
        <h1 class="sx-display" :aria-label="TITLE">
          <template v-for="(phrase, i) in phrases" :key="i">
            <template v-if="i > 0">{{ ' ' }}</template>
            <span class="nw"><span v-for="(w, j) in phrase" :key="j" class="cw" aria-hidden="true"><span class="ch" :style="{ animationDelay: w.delay }">{{ w.text }}</span></span></span>
          </template>
        </h1>
        <p class="sx-lead sx-enter d3">面向中小型 VPS 服务商。单个可执行文件部署，内置数据库。容器和虚拟机统一管理，自带计费、工单和内容管理。</p>
        <div ref="actions" class="sx-actions sx-enter d3">
          <a class="sx-btn primary" :href="RELEASES">下载安装</a>
          <a class="sx-btn ghost" href="https://demo.novaix.cc">在线演示</a>
        </div>
      </div>
      <div ref="scene" class="scene">
        <div class="dash sx-plate">
          <div class="sx-win">
            <NxShot name="dashboard" alt="Novaix 管理面板的仪表盘：收入、订单、实例和节点的概况" priority />
          </div>
        </div>
        <div
          ref="term"
          class="sx-term nterm"
          data-title="server — bash"
          :class="{ fadein: fadeIn }"
          role="img"
          aria-label="安装命令：下载、解压、运行"
          @animationend="fadeIn = false"
        >
          <div
            v-for="(l, i) in lines"
            :key="i"
            class="ln"
            :class="l.line.cmd ? { cmd: true, started: l.started, cur: l.cur } : { c: true, on: l.on, url: l.line.url }"
          >
            <template v-if="l.line.cmd"><span class="p">$ </span><span class="typed">{{ l.done }}</span><span class="rest">{{ l.rest }}</span></template>
            <template v-else>{{ l.line.note }}</template>
          </div>
        </div>
      </div>
      <p class="hnote">首次登录后，仪表盘上的「快速开始」清单引导您添加节点、添加镜像、上架套餐和配置支付渠道。</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  --sx-run: 320vh;
}

/* 标题区：舞台从导航栏下沿开始，顶部留白比原型少一个导航栏的高度 */
.head {
  position: absolute;
  inset: 0 0 auto;
  z-index: 2;
  padding-top: clamp(32px, calc(13vh - 52px), 98px);
  text-align: center;
  opacity: var(--fade, 1);
  transform: translateY(calc((1 - var(--fade, 1)) * -60px));
}

.sx-display {
  line-height: 1.08;
}

.sx-lead {
  max-width: 640px;
  margin: 22px auto 32px;
}

.nterm .ln.c {
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.sx-lead,
.hnote {
  text-wrap: balance;
}

.sx-actions {
  justify-content: center;
}

/* 标题：每个字从下方升起 */
.cw {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.06em;
  margin-bottom: -0.06em;
}

.ch {
  display: inline-block;
  transform: translateY(105%);
  animation: rise 0.9s var(--sx-ease) forwards;
}

@keyframes rise {
  to {
    transform: none;
  }
}

/* 场景：仪表盘截图放在底板中（白底区域），底板内的截图保持 16:10。
   高度 = 截图高度 + 上下留白 = 宽度 / 1.6 + 0.75 × 留白，宽度上限扣掉 1.2 × 留白，场景高度仍不超过可用高度减 158px */
.scene {
  --sw: min(1040px, 80vw, calc((var(--sx-vh) - 158px) * 1.6 - 1.2 * var(--sx-plate-pad)));

  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--sw);
  height: calc((var(--sw) - 2 * var(--sx-plate-pad)) / 1.6 + 2 * var(--sx-plate-pad));
  transform: translate(-50%, -50%) translateY(calc(var(--dy, 0px) - 2.5vh));
}

.dash {
  position: absolute;
  inset: 0;
  opacity: var(--do, 0);
  transform: scale(var(--dsc, 0.9));
}

.dash .sx-win {
  height: 100%;
}

.dash :deep(img) {
  height: 100%;
  object-fit: cover;
  object-position: left top;
}

.scene .nterm {
  position: absolute;
  left: 7%;
  right: 7%;
  top: 0;
  z-index: 1;
  font-size: 13.5px;
  transform-origin: 0 100%;
  transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(var(--ts, 1));
  opacity: var(--to, 1);
}

.ln {
  min-height: 1.85em;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.ln.c {
  opacity: 0;
  transition: opacity 0.3s;
}

.ln.c.on {
  opacity: 1;
}

.ln.url {
  color: #f5f5f7;
}

.ln .p {
  visibility: hidden;
  color: #8e8e93;
  user-select: none;
}

.ln.started .p {
  visibility: visible;
}

.ln .rest {
  color: transparent;
}

.ln.cur .typed::after {
  content: '';
  display: inline-block;
  width: 0.55em;
  height: 1.1em;
  margin-left: 1px;
  vertical-align: -0.2em;
  background: #f5f5f7;
  animation: caret 1s steps(1) infinite;
}

@keyframes caret {
  50% {
    opacity: 0;
  }
}

/* 终端只淡入：它的 transform 由滚动控制，入场动画不能占用 transform */
.fadein {
  opacity: 0;
  animation: fadein 1.2s 0.7s var(--sx-ease) forwards;
}

@keyframes fadein {
  to {
    opacity: 1;
  }
}

.hnote {
  position: absolute;
  left: 50%;
  bottom: 4vh;
  width: max-content;
  max-width: calc(100vw - 48px);
  margin: 0;
  color: var(--sx-text-2);
  font-size: 17px;
  text-align: center;
  opacity: var(--no, 0);
  transform: translateX(-50%) translateY(calc((1 - var(--no, 0)) * 12px));
}

/* 矮视口：标题区和场景收紧 */
@media (max-height: 832px) and (min-width: 761px) {
  .sx-lead {
    margin: 16px auto 24px;
  }

  .scene {
    --sw: min(1040px, 80vw, calc((var(--sx-vh) - 118px) * 1.6 - 1.2 * var(--sx-plate-pad)));
  }
}

/* 不固定舞台：终端在上，仪表盘在下，说明文字跟在后面 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .head {
    position: static;
    padding-top: 24px;
    opacity: 1;
    transform: none;
  }

  .scene {
    position: relative;
    left: auto;
    top: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1000px;
    height: auto;
    margin: 56px auto 0;
    padding-inline: 24px;
    transform: none;
  }

  .scene .nterm {
    position: static;
    order: -1;
    opacity: 1;
    transform: none;
  }

  .dash {
    position: relative;
    inset: auto;
    margin-top: 20px;
    opacity: 1;
    transform: none;
  }

  .dash .sx-win,
  .dash :deep(img) {
    height: auto;
  }

  .hnote {
    position: static;
    width: auto;
    max-width: none;
    margin: 24px 24px 0;
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 760px) {
  .scene {
    margin-top: 44px;
  }

  .scene .nterm {
    font-size: 12px;
  }

  .ln {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ch {
    transform: none;
    animation: none;
  }

  .fadein {
    opacity: 1;
    animation: none;
  }

  .ln.c {
    opacity: 1;
    transition: none;
  }

  .ln.cur .typed::after {
    display: none;
  }
}
</style>
