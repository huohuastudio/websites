<script setup lang="ts">
import { easeOut, isFlat, pinProgress, seg, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import KbShot from '../visuals/KbShot.vue'
import { links } from './links'

// 首屏：标题逐字出现；滚动时截图从倾斜放平、升到中央，再缩小，两侧滑入两台手机，底部出现一行说明。
// 舞台不固定时（窄屏、视口太矮、减少动态效果）按顺序排下来，直接显示最终状态
const title = '自部署的私有网盘'
const chars = [...title]

const root = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const head = ref<HTMLElement>()
const actions = ref<HTMLElement>()
const rig = ref<HTMLElement>()

/** 截图起始的下移量：让缩小后的截图顶边落在按钮下方 40px 处，至少下移舞台高度的 18%。 */
function startOffset() {
  const height = stage.value!.clientHeight
  const bottom = actions.value!.offsetTop + actions.value!.offsetHeight + head.value!.offsetTop
  const shot = rig.value!.offsetHeight * 0.8
  // offsetTop 不含 transform，就是截图中心的位置（见样式中 .rig 的 top）
  return Math.max(height * 0.18, bottom + 40 - (rig.value!.offsetTop - shot / 2))
}

useScrollFrame((still) => {
  if (still || isFlat()) return
  const el = root.value!
  const p = pinProgress(el)
  // 0–0.42 放平、升到中央；0.52–0.86 缩小，手机滑入
  const a = easeOut(seg(p, 0, 0.42))
  const b = easeOut(seg(p, 0.52, 0.86))
  el.style.setProperty('--fade', String(1 - seg(p, 0, 0.18)))
  el.style.setProperty('--po', String(b))
  el.style.setProperty('--px', String(1 - b))
  rig.value!.style.setProperty('--tilt', `${(1 - a) * 16}deg`)
  rig.value!.style.setProperty('--dy', `${(1 - a) * startOffset()}px`)
  rig.value!.style.setProperty('--s', String(0.8 + a * 0.2 - b * 0.18))
})
</script>

<template>
  <section ref="root" class="sx-pin hero">
    <div ref="stage" class="sx-stage">
      <div ref="head" class="head sx-wrap">
        <h1 class="sx-display" :aria-label="title">
          <span
            v-for="(c, i) in chars"
            :key="i"
            class="ch"
            aria-hidden="true"
            :style="{ animationDelay: `${0.05 + i * 0.06}s` }"
          >{{ c }}</span>
        </h1>
        <p class="sx-lead sx-enter d3">装在您自己的服务器或 NAS 上，供您和家人使用。文件留在原来的文件夹里，AI 默认在您自己的设备上运行。</p>
        <div ref="actions" class="sx-actions sx-enter d3">
          <a class="sx-btn primary" :href="links.download">下载安装</a>
          <a class="sx-btn ghost" :href="links.demo">在线演示</a>
        </div>
      </div>
      <div ref="rig" class="rig">
        <div class="sx-enter d4">
          <div class="sx-win win">
            <KbShot name="files" alt="Keepbay 的文件页面：日常相册中的照片按原比例排成网格" />
          </div>
          <div class="phone l"><KbShot name="photos" size="mobile" alt="手机上的照片时间线" /></div>
          <div class="phone r"><KbShot name="share" size="mobile" alt="手机上打开的分享页面" /></div>
        </div>
      </div>
      <p class="note">电脑和手机的浏览器都能使用，不用另装 App。</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  height: 220vh;
}

/* 标题区随滚动淡出、上移；顶部留白已扣除导航栏 */
.head {
  position: absolute;
  inset: 0 0 auto;
  padding-top: clamp(44px, calc(15vh - 52px), 118px);
  text-align: center;
  opacity: var(--fade, 1);
  transform: translateY(calc((1 - var(--fade, 1)) * -60px));
}

.ch {
  display: inline-block;
  opacity: 0;
  filter: blur(10px);
  transform: translateY(0.2em);
  animation: ch 1.1s var(--sx-ease) forwards;
}

@keyframes ch {
  to {
    opacity: 1;
    filter: none;
    transform: none;
  }
}

.sx-lead {
  max-width: 600px;
  margin: 22px auto 32px;
}

.sx-actions {
  justify-content: center;
}

/* 截图的中心对准视口中线（舞台钉在固定导航栏下方时，向上让出导航栏高度的一半），与底部说明之间留出空间 */
.rig {
  position: absolute;
  left: 50%;
  top: calc(50% - var(--sx-nav) / 2);
  width: min(1040px, 78vw);
  transform: translate(-50%, -50%) translateY(var(--dy, 0px)) scale(var(--s, 1));
  perspective: 2200px;
}

.win {
  transform: rotateX(var(--tilt, 0deg));
  transform-origin: 50% 100%;
}

.phone {
  position: absolute;
  bottom: -7%;
  width: 23%;
  padding: 4px;
  border-radius: 36px;
  background: #1d1d1f;
  opacity: var(--po, 0);
}

.phone :deep(img) {
  aspect-ratio: 1170 / 2100;
  object-fit: cover;
  border-radius: 32px;
  box-shadow: 0 0 0 1px var(--sx-edge);
}

.phone.l {
  left: -9%;
  transform: translateX(calc(var(--px, 1) * -70%));
}

.phone.r {
  right: -9%;
  transform: translateX(calc(var(--px, 1) * 70%));
}

.note {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6vh;
  margin: 0;
  padding-inline: 24px;
  text-align: center;
  color: var(--sx-text-2);
  font-size: 19px;
  opacity: var(--po, 0);
}

/* 舞台不固定（视口太矮或减少动态效果）的宽屏：按顺序排下来，手机和说明直接显示 */
@media (max-height: 640px) and (min-width: 761px), (prefers-reduced-motion: reduce) and (min-width: 761px) {
  .hero {
    height: auto;
  }

  .head {
    position: static;
    opacity: 1;
    transform: none;
  }

  .rig {
    position: relative;
    left: auto;
    top: auto;
    margin: 56px auto 0;
    transform: none;
  }

  .win {
    transform: none;
  }

  .phone.l,
  .phone.r {
    opacity: 1;
    transform: none;
  }

  .note {
    position: static;
    margin-top: 80px;
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ch {
    opacity: 1;
    filter: none;
    transform: none;
    animation: none;
  }
}

/* 窄屏：只放一张手机截图 */
@media (max-width: 760px) {
  .hero {
    height: auto;
  }

  .head {
    position: static;
    padding-top: 24px;
    opacity: 1;
    transform: none;
  }

  .rig {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    margin-top: 48px;
    padding-inline: 24px;
    transform: none;
  }

  .win {
    max-width: 300px;
    margin: 0 auto;
    border-radius: 28px;
    transform: none;
  }

  .phone,
  .note {
    display: none;
  }
}
</style>
