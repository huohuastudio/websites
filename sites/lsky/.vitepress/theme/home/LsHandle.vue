<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame } from '@huohuastudio/theme/showcase'
import { computed, ref } from 'vue'

// 图片处理：规则按分类顺序依次作用在示例照片上

const rules = [
  { name: '裁剪', desc: '裁剪并缩放、裁剪图片、修剪图像', done: '裁剪' },
  { name: '尺寸', desc: '调整为指定尺寸、按比例缩放、填充缩放、调整画布等', done: '尺寸' },
  { name: '滤镜', desc: '亮度、对比度、灰度、模糊、锐化、像素化等', done: '滤镜：降低饱和度' },
  { name: '旋转', desc: '图像旋转', done: '旋转 90°' },
  { name: '文本', desc: '文字水印：内容、位置、字体、颜色、角度、平铺', done: '文字水印' },
  { name: '水印', desc: '图片水印：位置、不透明度、大小比例、平铺', done: '图片水印' },
]

const sec = ref<HTMLElement>()
const art = ref<HTMLElement>()
/** 已执行的规则数 */
const done = ref(0)
const dims = ref('4032 × 3024')
const stepText = computed(() => (done.value ? `已执行：${rules[done.value - 1].done}` : '原图'))

useScrollFrame((still) => {
  const p = still || isFlat() ? 1 : pinProgress(sec.value!)
  // 六类规则各占一段，依次生效
  const k = rules.map((_, j) => smooth(seg(p, 0.1 + j * 0.13, 0.19 + j * 0.13)))
  const el = art.value!
  el.style.setProperty('--gd', String((1 - k[0]) * seg(p, 0.02, 0.08)))
  el.style.setProperty('--cr', String(k[0]))
  el.style.setProperty('--sz', String(k[1]))
  el.style.setProperty('--gs', String(k[2] * 0.6))
  el.style.setProperty('--ro', String(k[3]))
  el.style.setProperty('--wt', String(k[4]))
  el.style.setProperty('--wi', String(k[5]))
  done.value = k.filter((v) => v > 0.5).length
  dims.value = k[1] > 0.5 ? '1200 × 1200' : k[0] > 0.5 ? '3024 × 3024' : '4032 × 3024'
}, sec)
</script>

<template>
  <section id="handle" ref="sec" class="sx-pin handle">
    <div class="sx-stage">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title"><span class="ph">上传后</span><span class="ph">按规则处理图片</span></h2>
        <p class="sx-lead">在图片处理驱动中添加规则，上传到关联储存的图片按分类顺序依次处理，结果覆盖原图。</p>
      </div>
      <div class="hd">
        <div>
          <ol class="rules">
            <li v-for="(r, j) in rules" :key="r.name" :class="{ on: j < done }"><b>{{ r.name }}</b><span>{{ r.desc }}</span></li>
          </ol>
          <p class="note">支持 Imagick 和 libvips。上传时同步或异步处理，已有图片可以重新处理。</p>
        </div>
        <div class="easel" aria-hidden="true">
          <figure class="orig">
            <div class="pic"><img src="/photos/sailboat.webp" alt="" loading="lazy" /></div>
            <figcaption>原图<br />4032 × 3024</figcaption>
          </figure>
          <div class="easel-r">
            <div ref="art" class="art">
              <img class="rot" src="/photos/sailboat.webp" alt="" loading="lazy" />
              <div class="guide" />
              <img class="wm-i" src="/logo.png" alt="" />
              <span class="wm-t">© example.com</span>
            </div>
            <div class="dims"><span>{{ dims }}</span><span>{{ stepText }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.handle {
  --sx-run: 270vh;
}

.sx-stage {
  display: flex;
  flex-direction: column;
  padding-top: 40px;
}

.sx-head {
  margin-bottom: 36px;
}

.hd {
  display: grid;
  grid-template-columns: 3.2fr 6.8fr;
  gap: 40px;
  align-items: center;
  width: min(1032px, calc(100vw - 48px));
  margin: 0 auto;
}

.rules {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: r;
}

.rules li {
  display: grid;
  grid-template-columns: 28px 1fr;
  column-gap: 12px;
  padding: 11px 0;
  border-top: 1px solid var(--sx-line);
  color: var(--sx-text-3);
  counter-increment: r;
  transition: color 0.4s;
}

.rules li:last-child {
  border-bottom: 1px solid var(--sx-line);
}

.rules li::before {
  content: counter(r);
  grid-row: span 2;
  font: 600 13px/1.9 var(--vp-font-family-mono);
}

.rules b {
  font-size: 17px;
  font-weight: 600;
}

.rules span {
  font-size: 14px;
  line-height: 1.5;
}

.rules li.on {
  color: var(--sx-text-2);
}

.rules li.on b,
.rules li.on::before {
  color: var(--sx-text);
}

.note {
  margin: 16px 0 0;
  color: var(--sx-text-3);
  font-size: 14px;
}

/* 示意图：左边原图，右边逐步处理的结果 */
.easel {
  --eh: clamp(240px, calc(var(--sx-vh) - 308px), 500px);
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 3fr);
  gap: 20px;
  align-items: center;
  height: var(--eh);
  padding: 20px 24px;
  border-radius: 28px;
  background: var(--ls-panel-soft);
}

.orig {
  margin: 0;
  color: var(--sx-text-2);
  font: 12px/1.5 var(--vp-font-family-mono);
  text-align: center;
}

.pic {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 4px;
}

.pic img,
.rot {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.orig figcaption {
  margin-top: 8px;
}

.easel-r {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.art {
  position: relative;
  width: min(100%, calc((var(--eh) - 100px) * 4 / 3));
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 6px;
  clip-path: inset(0 calc(var(--cr, 0) * 12.5%) round 6px);
  transform: scale(calc(1 - var(--sz, 0) * 0.1));
}

.rot {
  position: absolute;
  inset: 0;
  transform: rotate(calc(var(--ro, 0) * 90deg));
  filter: grayscale(var(--gs, 0));
}

.guide {
  position: absolute;
  inset: 0 12.5%;
  border: 2px dashed #fff;
  opacity: var(--gd, 0);
}

.wm-t {
  position: absolute;
  right: calc(12.5% + 10px);
  bottom: 8px;
  color: #fff;
  font-size: clamp(12px, 1.3vw, 16px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.75), 0 0 1px rgba(0, 0, 0, 0.9);
  opacity: var(--wt, 0);
}

.wm-i {
  position: absolute;
  left: calc(12.5% + 10px);
  top: 10px;
  width: 11%;
  opacity: calc(var(--wi, 0) * 0.85);
}

.dims {
  display: flex;
  justify-content: center;
  gap: 10px;
  color: var(--sx-text-2);
  font-size: 13px;
}

.dims span {
  padding: 3px 10px;
  border-radius: 980px;
  background: var(--sx-tile);
  font-family: var(--vp-font-family-mono);
}

/* 矮视口：标题区收紧 */
@media (max-height: 832px) and (min-width: 761px) {
  .sx-stage {
    padding-top: 16px;
  }

  .sx-head {
    margin-bottom: 18px;
  }

  .rules li {
    padding: 8px 0;
  }
}

/* 不固定舞台：规则列表在上，示意图在下，显示全部规则生效后的结果 */
@media (max-width: 760px), (max-height: 640px) {
  .hd {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .easel {
    --eh: 420px;
    height: auto;
  }
}

@media (max-width: 760px) {
  .easel {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
  }

  .orig {
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
  }

  .pic {
    flex: none;
    width: 96px;
  }

  .orig figcaption {
    margin: 0;
  }
}
</style>
