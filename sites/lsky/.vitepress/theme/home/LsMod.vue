<script setup lang="ts">
import { isFlat, pinProgress, seg, useScrollFrame } from '@huohuastudio/theme/showcase'
import { computed, ref } from 'vue'

// 内容审核：扫描线扫过一组图片，违规和疑似违规的被标出

const services = ['阿里云', '腾讯云', '百度', 'NSFW.js', 'ModerateContent', 'AI 大模型审核']
// 审核墙的照片（public/photos），第 7、10 张被标出
const PHOTOS = ['barn', 'town', 'cosmos', 'dog', 'butterfly', 'lighthouse', 'bay', 'munich', 'paella', 'harbor', 'blueberries', 'sailboat']
const TILES = PHOTOS.length
/** 被标出的图片：键为序号，值为类型和标签 */
const flags: Record<number, { type: 'bad' | 'warn'; label: string }> = {
  6: { type: 'bad', label: '违规' },
  9: { type: 'warn', label: '疑似违规' },
}

const sec = ref<HTMLElement>()
const wall = ref<HTMLElement>()
const scan = ref<HTMLElement>()
// 用函数 ref 按序号保存，保证与 seen 的下标对应
const tiles: HTMLElement[] = []
/** 每张图是否已被扫过 */
const seen = ref<boolean[]>(Array(TILES).fill(false))
const counts = computed(() => {
  let all = 0, bad = 0, warn = 0
  seen.value.forEach((s, i) => {
    if (!s) return
    all++
    if (flags[i]?.type === 'bad') bad++
    if (flags[i]?.type === 'warn') warn++
  })
  return { all, bad, warn }
})

useScrollFrame((still) => {
  const done = still || isFlat()
  const y = done ? 1 : seg(pinProgress(sec.value!), 0.08, 0.86)
  // 先读布局再写样式，避免同一帧中反复重排
  const h = wall.value!.offsetHeight
  const next = tiles.map((t) => done || y * h > t.offsetTop + t.offsetHeight / 2)
  scan.value!.style.setProperty('--sy', String(y))
  scan.value!.style.setProperty('--so', String(done ? 0 : Math.min(seg(y, 0, 0.03), 1 - seg(y, 0.97, 1))))
  if (next.some((s, i) => s !== seen.value[i])) seen.value = next
})
</script>

<template>
  <section id="mod" ref="sec" class="sx-pin sx-alt mod">
    <div class="sx-stage">
      <div class="side">
        <h2 class="sx-title"><span class="ph">上传的图片</span><span class="ph">先经过审核</span></h2>
        <p class="sx-lead">在储存中关联图片安全驱动，上传后自动审核，违规图片可以删除或标记。</p>
        <ul class="svc">
          <li v-for="s in services" :key="s">{{ s }}</li>
        </ul>
        <div class="tally">
          <span>已审核<b>{{ counts.all }}</b></span>
          <span class="bad">违规<b>{{ counts.bad }}</b></span>
          <span class="warn">疑似违规<b>{{ counts.warn }}</b></span>
        </div>
        <p class="rule">AI 大模型审核按分数判断：违规阈值默认 80，疑似违规阈值默认 50，疑似违规的图片转人工审核。开启同步审核时，违规图片在上传时直接被拒绝。</p>
      </div>
      <div ref="wall" class="wall" aria-hidden="true">
        <div v-for="i in TILES" :key="i" :ref="(el) => (tiles[i - 1] = el as HTMLElement)" class="tile" :class="[flags[i - 1]?.type, { seen: seen[i - 1] }]">
          <img :src="`/photos/${PHOTOS[i - 1]}.webp`" alt="" loading="lazy" />
          <em v-if="flags[i - 1]">{{ flags[i - 1].label }}</em>
        </div>
        <i ref="scan" class="scan" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.mod {
  height: 250vh;
}

.sx-stage {
  display: grid;
  grid-template-columns: 5fr 6fr;
  gap: 56px;
  align-items: center;
  padding-inline: max(24px, calc((100vw - 1080px) / 2));
}

.sx-lead {
  margin-top: 18px;
  font-size: 18px;
}

.svc {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
}

.svc li {
  padding: 5px 13px;
  border-radius: 980px;
  background: var(--sx-tile);
  font-size: 14px;
}

.tally {
  display: flex;
  gap: 28px;
  margin-top: 28px;
  color: var(--sx-text-2);
  font-size: 14px;
}

.tally b {
  display: block;
  color: var(--sx-text);
  font-size: 32px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.tally .bad b {
  color: var(--ls-bad);
}

.tally .warn b {
  color: var(--ls-warn);
}

.rule {
  max-width: 460px;
  margin-top: 18px;
  color: var(--sx-text-3);
  font-size: 14px;
}

/* 图片墙：扫过的恢复颜色，违规的模糊并标红，疑似违规的标橙 */
.wall {
  --W: min(560px, 44vw, calc((var(--sx-vh) - 118px) * 4 / 3));
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  justify-self: center;
  width: var(--W);
}

.tile {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 10px;
  background: var(--sx-alt);
}

.tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.25);
  opacity: 0.55;
  transition: filter 0.5s, opacity 0.5s;
}

.tile.seen img {
  filter: none;
  opacity: 1;
}

.tile.bad.seen img {
  filter: blur(6px);
}

.tile em {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 2px 8px;
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 1.5;
  opacity: 0;
  transition: opacity 0.4s;
}

.tile.bad em {
  background: var(--ls-bad);
}

.tile.warn em {
  background: var(--ls-warn);
}

.tile.seen em {
  opacity: 1;
}

.tile::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--sx-edge);
  pointer-events: none;
}

.tile.bad.seen::after {
  box-shadow: inset 0 0 0 2px var(--ls-bad);
}

.tile.warn.seen::after {
  box-shadow: inset 0 0 0 2px var(--ls-warn);
}

.scan {
  position: absolute;
  left: -12px;
  right: -12px;
  top: calc(var(--sy, 0) * 100%);
  height: 2px;
  background: var(--sx-text);
  opacity: var(--so, 0);
}

.scan::before {
  content: '';
  position: absolute;
  right: 0;
  top: -9px;
  width: 8px;
  height: 20px;
  border-radius: 4px;
  background: var(--sx-text);
}

/* 矮视口：文字收紧 */
@media (max-height: 820px) and (min-width: 761px) {
  .sx-title {
    font-size: clamp(30px, 5.2vh, 42px);
  }

  .sx-lead {
    font-size: 16px;
  }

  .svc,
  .tally {
    margin-top: 18px;
  }

  .tally b {
    font-size: 26px;
  }
}

@media (max-width: 760px), (max-height: 640px) {
  .mod {
    height: auto;
  }

  .sx-stage {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .wall {
    --W: min(560px, calc(100vw - 48px));
  }
}

@media (max-width: 760px) {
  .wall {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mod {
    height: auto;
  }

  .scan {
    display: none;
  }
}
</style>
