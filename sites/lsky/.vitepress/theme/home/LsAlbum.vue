<script setup lang="ts">
import { easeOut, seg, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import LsShot from './LsShot.vue'

// 相册和分享：截图（白底区域，放在底板上）随滚动放大到原大，右侧要点依次出现，访问密码逐位填入

const items = [
  { title: '相册访问密码', text: '公开的相册可以设置 4 到 32 位的密码。加密相册中的图片不会出现在广场、用户主页等公开列表中。' },
  { title: '分享链接', text: '分享相册或图片，分享链接可以设置密码。' },
  { title: '广场和用户主页', text: '展示公开的图片和相册。' },
  { title: '打包下载', text: '管理员可以把指定用户的全部图片打包下载。' },
]
const DOTS = 4

const root = ref<HTMLElement>()
const fig = ref<HTMLElement>()
const lock = ref<HTMLElement>()
// 用函数 ref 按序号保存，保证依次出现的顺序
const lis: HTMLElement[] = []
/** 已填入的密码位数 */
const filled = ref(0)

useScrollFrame((still) => {
  const k = still ? 1 : easeOut(viewProgress(fig.value!, innerHeight, innerHeight * 0.3))
  fig.value!.style.setProperty('--k', String(k))
  lock.value!.style.setProperty('--lo', String(seg(k, 0.35, 0.6)))
  filled.value = Math.round(seg(k, 0.55, 0.95) * DOTS)
  lis.forEach((li, i) => li.style.setProperty('--o', String(still ? 1 : easeOut(seg(k, 0.1 + i * 0.15, 0.45 + i * 0.15)))))
}, root)
</script>

<template>
  <section id="album" ref="root" class="sx-sec album">
    <div class="sx-wrap">
      <div class="sx-head">
        <h2 class="sx-title">相册和分享</h2>
        <p class="sx-lead">按相册整理图片，分享相册或单张图片。公开的图片和相册会出现在广场和用户主页。</p>
      </div>
      <div class="grid">
        <div ref="fig" class="fig">
          <div class="sx-plate">
            <div class="sx-win">
              <LsShot name="albums" alt="相册页面" />
            </div>
          </div>
          <div ref="lock" class="lock" aria-hidden="true">
            <b>输入访问密码</b>
            <div class="pw"><i v-for="n in DOTS" :key="n" :class="{ on: n <= filled }" /></div>
            <small>解锁后 120 分钟内有效</small>
          </div>
        </div>
        <ul class="list">
          <li v-for="(item, i) in items" :key="item.title" :ref="(el) => (lis[i] = el as HTMLElement)"><b>{{ item.title }}</b>{{ item.text }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.album {
  padding-bottom: clamp(160px, 16vw, 210px);
}

.grid {
  display: grid;
  grid-template-columns: 7fr 4fr;
  gap: 56px;
  align-items: center;
}

.fig {
  position: relative;
  transform: scale(calc(0.92 + var(--k, 1) * 0.08));
  transform-origin: 50% 100%;
}

.sx-win :deep(img) {
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top;
}

/* 访问密码框：跨在截图底边上，伸出底板。浅色下掺的品牌色比底板（--sx-panel）多一倍，与白色截图、底板、白底都分得开；深色下底板透明，直接用 --sx-panel */
.lock {
  position: absolute;
  right: calc(var(--sx-plate-pad) + 16px);
  top: calc(100% - var(--sx-plate-pad) - 36px);
  width: 260px;
  padding: 18px 20px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--vp-c-brand-3) 18%, #f5f5f7);
  font-size: 14px;
  opacity: var(--lo, 1);
  transform: translateY(calc((1 - var(--lo, 1)) * 20px));
}

.dark .lock {
  background: var(--sx-panel);
}

.lock b {
  display: block;
  margin-bottom: 10px;
  font-size: 15px;
}

.pw {
  display: flex;
  gap: 8px;
}

.pw i {
  display: grid;
  flex: 1;
  place-items: center;
  height: 34px;
  border-radius: 8px;
  background: var(--sx-card-in);
}

.pw i.on::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sx-text);
}

.lock small {
  display: block;
  margin-top: 10px;
  color: var(--sx-text-2);
  font-size: 12px;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list li {
  padding: 16px 0;
  border-top: 1px solid var(--sx-line);
  color: var(--sx-text-2);
  font-size: 16px;
  opacity: var(--o, 1);
  transform: translateY(calc((1 - var(--o, 1)) * 18px));
}

.list li:last-child {
  border-bottom: 1px solid var(--sx-line);
}

.list b {
  display: block;
  margin-bottom: 2px;
  color: var(--sx-text);
  font-size: 17px;
  font-weight: 600;
}

@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .lock {
    position: relative;
    right: auto;
    top: auto;
    width: auto;
    margin-top: 16px;
  }
}

/* 截图占满一行时不比宽屏下大（截图按宽屏下的显示宽度 557px 出图，见 scripts/screenshots.mjs）；手机上仍铺满 */
@media (min-width: 581px) and (max-width: 760px) {
  .fig {
    justify-self: center;
    width: min(100%, calc(557px + 2 * var(--sx-plate-pad)));
  }
}
</style>
