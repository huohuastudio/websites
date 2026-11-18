<script setup lang="ts">
import { SxShot, easeOut, isFlat, pinProgress, seg, smooth, useLayoutCache, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import { BUY_URL, DEMO_URL } from './links'
import { lerp } from './util'

// 首屏：文件卡片飞进上传页，再由按日期分组的图片管理页从下方推上来

// 文件名、格式、缩略图（public/photos 中的照片）、出现在截图的哪一侧（-1 左、1 右）、纵向位置（占截图高度的比例）
const files = [
  { name: 'IMG_0412.jpg', fmt: 'JPEG', img: 'sunset', side: -1, yf: 0.14 },
  { name: 'camels.png', fmt: 'PNG', img: 'camels', side: 1, yf: 0.22 },
  { name: 'castle-night.webp', fmt: 'WebP', img: 'castle', side: -1, yf: 0.58 },
  { name: 'IMG_0415.jpg', fmt: 'JPEG', img: 'paella', side: 1, yf: 0.66 },
  { name: 'cat.gif', fmt: 'GIF', img: 'cat', side: -1, yf: 0.9 },
]
const captions = ['批量上传、拖拽上传、粘贴上传，带上传队列', '上传的图片在图片管理中按日期分组']
const capIndex = ref(0)

const hero = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const head = ref<HTMLElement>()
const actions = ref<HTMLElement>()
const rig = ref<HTMLElement>()
const frame = ref<HTMLElement>()
// 用函数 ref 按序号保存，与 files 一一对应
const flies: HTMLElement[] = []

const refresh = useScrollFrame((still) => {
  // 减少动态效果时由样式直接排出两张截图
  if (still) return
  const sec = hero.value!
  const fr = frame.value!
  if (isFlat()) {
    // 不固定舞台时按截图在视口中的位置推上第二张
    const b = smooth(viewProgress(fr, innerHeight * 0.85, innerHeight * 0.15))
    fr.style.setProperty('--b', String(b))
    sec.style.setProperty('--fade', '1')
    capIndex.value = b > 0.5 ? 1 : 0
    return
  }
  const st = stage.value!
  const { offset, vw, sizes } = layout()
  const p = pinProgress(sec)
  const a = easeOut(seg(p, 0, 0.34))
  sec.style.setProperty('--fade', String(1 - seg(p, 0, 0.16)))
  rig.value!.style.setProperty('--dy', `${(1 - a) * offset}px`)
  rig.value!.style.setProperty('--s', String(0.86 + a * 0.14))
  const b = smooth(seg(p, 0.7, 0.92))
  fr.style.setProperty('--b', String(b))
  sec.style.setProperty('--co', String(seg(p, 0.2, 0.3)))
  capIndex.value = b > 0.5 ? 1 : 0

  // 文件卡片：先在截图两侧出现，再依次飞进截图中央并淡出。坐标相对舞台；截图的位置含缩放，每帧读取
  const sr = st.getBoundingClientRect()
  const r = fr.getBoundingClientRect()
  const left = r.left - sr.left
  const right = r.right - sr.left
  const top = r.top - sr.top
  flies.forEach((c, i) => {
    const { side, yf } = files[i]
    const [w, h] = sizes[i]
    const appear = easeOut(seg(p, 0.16 + i * 0.025, 0.26 + i * 0.025))
    const t = smooth(seg(p, 0.3 + i * 0.05, 0.46 + i * 0.05))
    const x0 = Math.min(vw - w - 16, Math.max(16, (side < 0 ? left - w * 0.55 : right - w * 0.45) + side * (1 - appear) * 60))
    const y0 = top + yf * r.height - h / 2
    const x1 = left + r.width / 2 - w / 2
    const y1 = top + r.height * 0.42 - h / 2
    c.style.setProperty('--x', `${lerp(x0, x1, t)}px`)
    c.style.setProperty('--y', `${lerp(y0, y1, t) - Math.sin(t * Math.PI) * 50}px`)
    c.style.setProperty('--sc', String(1 - t * 0.45))
    c.style.setProperty('--o', String(appear * (1 - seg(t, 0.7, 1))))
  })
}, hero)

/** 只随尺寸变化的布局值：截图起始的下移量、舞台宽度、文件卡片的宽高 */
const layout = useLayoutCache(
  () => [stage.value, head.value, rig.value, ...flies],
  () => {
    // 截图起始的下移量：让缩放后的截图顶边落在按钮下方 40px 处，至少下移舞台高度的 18%
    const bottom = head.value!.offsetTop + actions.value!.offsetTop + actions.value!.offsetHeight
    const r = rig.value!
    // .rig 用 translate(-50%, -50%) 居中，offsetTop 即截图中线的位置
    const offset = Math.max(stage.value!.clientHeight * 0.18, bottom + 40 - (r.offsetTop - (r.offsetHeight * 0.86) / 2))
    return { offset, vw: stage.value!.clientWidth, sizes: flies.map((c) => [c.offsetWidth, c.offsetHeight] as const) }
  },
  refresh,
)
</script>

<template>
  <section id="hero" ref="hero" class="sx-pin hero">
    <div ref="stage" class="sx-stage">
      <div ref="head" class="head sx-wrap">
        <h1 class="sx-display"><span class="ln"><span>自己搭建的图床</span></span><span class="ln"><span>和云端相册</span></span></h1>
        <p class="sx-lead sx-enter d2">基于 Laravel 开发。图片可以存到本地或各家对象储存，带多用户、角色组、图片处理、内容审核、套餐和在线支付。</p>
        <div ref="actions" class="sx-actions sx-enter d3">
          <a class="sx-btn primary" :href="BUY_URL">购买授权</a>
          <a class="sx-btn ghost" :href="DEMO_URL">在线演示</a>
        </div>
      </div>
      <div ref="rig" class="rig">
        <div class="sx-enter d4">
          <div ref="frame" class="sx-win stack2">
            <div class="layer up">
              <SxShot src="/screenshots/upload" :width="1600" :height="1000" alt="上传页面：批量选择的图片排在上传队列中" priority />
            </div>
            <div class="layer ph">
              <SxShot src="/screenshots/photos" :width="1600" :height="1000" alt="图片管理页面：图片按日期分组排列" />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true">
        <div v-for="(f, i) in files" :key="f.name" :ref="(el) => (flies[i] = el as HTMLElement)" class="fly">
          <img :src="`/photos/${f.img}.webp`" alt="" />
          <div>{{ f.name }}<small>{{ f.fmt }}</small></div>
        </div>
      </div>
      <p class="hcap">{{ captions[capIndex] }}</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  --sx-run: 270vh;
}

/* 截图宽度：同时受视口宽度和舞台高度限制，四周留出标题区和说明的位置。
   截图中线按整个视口居中（舞台中线上移半个导航栏高度），与原型的位置一致 */
.sx-stage {
  --fw: min(1040px, 80vw, calc((var(--sx-vh) - 146px) * 1.6));
  --cy: calc(50% - var(--sx-nav) / 2);
}

.head {
  position: absolute;
  inset: 0 0 auto;
  /* 首次打开时标题距导航栏下沿的距离与原型相同 */
  padding-top: clamp(84px, calc(15vh - 12px), 158px);
  text-align: center;
  opacity: var(--fade, 1);
  transform: translateY(calc((1 - var(--fade, 1)) * -60px));
}

/* 标题逐行升起 */
.ln {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.06em;
}

.ln span {
  display: inline-block;
  transform: translateY(105%);
  animation: rise 1s var(--sx-ease) forwards;
}

.ln:nth-child(2) span {
  animation-delay: 0.12s;
}

@keyframes rise {
  to {
    transform: none;
  }
}

.sx-lead {
  max-width: 640px;
  margin: 22px auto 32px;
}

.sx-actions {
  justify-content: center;
}

.rig {
  position: absolute;
  left: 50%;
  top: var(--cy);
  width: var(--fw);
  transform: translate(-50%, -50%) translateY(var(--dy, 0px)) scale(var(--s, 1));
}

/* 两张截图叠放：图片管理页从下方推上来，盖住上传页 */
.stack2 {
  aspect-ratio: 16 / 10;
}

.layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.layer :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.layer.up {
  transform: scale(calc(1 - var(--b, 0) * 0.05));
  transform-origin: 50% 0;
  opacity: calc(1 - var(--b, 0) * 0.6);
}

.layer.ph {
  transform: translateY(calc((1 - var(--b, 0)) * 101%));
  border-radius: 18px 18px 0 0;
  box-shadow: 0 0 0 1px var(--sx-edge);
}

.fly {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 10px;
  border-radius: 14px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  font-size: 14px;
  white-space: nowrap;
  opacity: var(--o, 0);
  transform: translate(var(--x, 0px), var(--y, 0px)) scale(var(--sc, 1));
  transform-origin: 50% 50%;
  pointer-events: none;
}

.fly img {
  flex: none;
  width: 44px;
  height: 33px;
  border-radius: 6px;
  object-fit: cover;
}

.fly small {
  display: block;
  color: var(--sx-text-3);
  font-size: 12px;
}

.hcap {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--cy) + var(--fw) / 3.2 + 18px);
  margin: 0;
  padding-inline: 24px;
  text-align: center;
  color: var(--sx-text-2);
  font-size: 17px;
  opacity: var(--co, 0);
}

/* 不固定舞台：窄屏，或视口太矮 */
@media (max-width: 760px), (max-height: 640px) {
  .head {
    position: static;
    padding-top: 24px;
  }

  .rig {
    position: relative;
    left: auto;
    top: auto;
    width: auto;
    max-width: 880px;
    margin: 48px auto 0;
    padding-inline: 24px;
    transform: none;
  }

  .fly {
    display: none;
  }

  .hcap {
    --co: 1;
    position: static;
    margin-top: 16px;
  }
}

/* 减少动态效果：两张截图上下排列 */
@media (prefers-reduced-motion: reduce) {
  .head {
    position: static;
  }

  .ln span {
    animation: none;
    transform: none;
  }

  .rig {
    position: relative;
    left: auto;
    top: auto;
    width: auto;
    max-width: 1040px;
    margin: 56px auto 0;
    padding-inline: 24px;
    transform: none;
  }

  .rig .sx-win {
    overflow: visible;
    border-radius: 0;
    background: none;
    box-shadow: none;
  }

  .stack2 {
    display: grid;
    gap: 20px;
    aspect-ratio: auto;
  }

  .layer,
  .layer.up,
  .layer.ph {
    position: static;
    transform: none;
    opacity: 1;
    border-radius: 18px;
    box-shadow: 0 0 0 1px var(--sx-edge);
  }

  .fly {
    display: none;
  }

  .hcap {
    --co: 1;
    position: static;
    margin-top: 20px;
  }
}
</style>
