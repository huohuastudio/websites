<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useLayoutCache, useScrollFrame } from '@huohuastudio/theme/showcase'
import { withBase } from 'vitepress'
import { ref } from 'vue'
import people from '../people.json'
import KbShot from '../visuals/KbShot.vue'
import { detailBox, focus } from './zoom'

// 人物、宠物和地点：分三幕。
// 一、人物：演示站上几个人的照片排成一片，框出每张照片中的人脸，然后每张照片裁成圆形、收拢到这个人的头像上，头像下出现名字和张数；
// 二、宠物：人物的头像移到上方、让出位置，宠物的照片从下方移入，同样框出、收拢成宠物的头像；
// 三、地点：头像移走，照片页「地点」的截图升起，再推近到地图上照片聚在一起的地方。
// 照片、人脸框和头像由 scripts/people.mjs 从演示站取得（people.json），收拢后换成从原图裁出的清晰头像。
// 舞台不固定时不做动画：头像排成一排，下面是地点的截图
type Subject = (typeof people)[number]

const subjects: Subject[] = people
const persons = subjects.filter((s) => s.kind === 'person')
const pets = subjects.filter((s) => s.kind === 'pet')

/** 照片按人物轮流排开（同一个人的照片不挨在一起）；cover 是头像所在的那张 */
function interleave(list: Subject[]) {
  const rounds = Math.max(...list.map((s) => s.photos.length))
  return Array.from({ length: rounds }, (_, i) =>
    list.flatMap((s) => (s.photos[i] ? [{ subject: s, photo: s.photos[i], cover: i === 0 }] : [])),
  ).flat()
}
// order：在同一种（人物或宠物）的照片中的序号，收拢时按它错开开始
const tiles = [interleave(persons), interleave(pets)].flatMap((group) =>
  group.map((t, order) => ({ ...t, order, last: group.length - 1, index: subjects.indexOf(t.subject) })),
)

// 照片中头像的范围（占照片宽、高的比例 [x, y, 宽, 高]，是正方形），由脚本按人脸框算好
const squares = tiles.map((t) => t.photo.face)

/** [x, y, 宽, 高]（比例）换成绝对定位的百分比 */
const pct = ([x, y, w, h]: number[]) => ({ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` })
const src = (name: string) => withBase(`/people/${name}.webp`)
const label = subjects.map((s) => `${s.name}（${s.count} 张）`).join('、')
const box = detailBox('places')

const acts = [
  { tab: '人物', plan: '专业版', captions: ['在照片中找出人脸，只在您的设备上处理', '同一个人的照片归在一起，起名后按人浏览'] },
  { tab: '宠物', plan: '专业版', captions: ['添加宠物时，选出它的几张照片作为样本', '之后找到的相近照片，由您逐张确认后归入'] },
  { tab: '地点', plan: '', captions: ['按拍摄地点归到城市，在地图上查看', '地图内置在程序中，不联网也能使用'] },
]

const root = ref<HTMLElement>()
const frame = ref<HTMLElement>()
const placesLayer = ref<HTMLElement>()
const zoom = ref<HTMLElement>()
const tileEls: HTMLElement[] = []
const boxEls: HTMLElement[] = []
const faceEls: HTMLElement[] = []
const nameEls: HTMLElement[] = []
const act = ref(0)
const caption = ref('')

type Rect = { x: number; y: number; w: number; h: number }

/** 照片排成两端对齐的几行（每行等高、铺满宽度），整体缩小到放进 area 中并居中 */
function justify(list: Subject['photos'], area: Rect, rows: number, gap: number): Rect[] {
  const target = (area.h - gap * (rows - 1)) / rows
  const lines: Subject['photos'][] = [[]]
  for (const p of list) {
    const line = lines[lines.length - 1]
    line.push(p)
    const sum = line.reduce((t, q) => t + q.aspect, 0)
    if (sum * target + gap * (line.length - 1) >= area.w && lines.length < rows) lines.push([])
  }
  if (!lines[lines.length - 1].length) lines.pop()
  const heights = lines.map((line) => Math.min(target * 1.3, (area.w - gap * (line.length - 1)) / line.reduce((t, q) => t + q.aspect, 0)))
  const total = heights.reduce((t, h) => t + h, 0) + gap * (lines.length - 1)
  const k = Math.min(1, area.h / total)
  const rects: Rect[] = []
  let y = area.y + (area.h - total * k) / 2
  lines.forEach((line, i) => {
    const h = heights[i] * k
    const width = line.reduce((t, q) => t + q.aspect * h, 0) + gap * k * (line.length - 1)
    let x = area.x + (area.w - width) / 2
    for (const p of line) {
      rects.push({ x, y, w: p.aspect * h, h })
      x += p.aspect * h + gap * k
    }
    y += h + gap * k
  })
  return rects
}

/** 头像排成一排的中心横坐标：n 个，人物和宠物之间多留一点 */
function row(n: number, W: number, D: number) {
  const gap = D * 0.45
  const split = n > persons.length ? D * 0.4 : 0
  const width = n * D + (n - 1) * gap + split
  return Array.from({ length: n }, (_, i) => (W - width) / 2 + D / 2 + i * (D + gap) + (i >= persons.length ? split : 0))
}

const layout = useLayoutCache(
  () => [frame.value],
  () => {
    const W = frame.value!.clientWidth
    const H = frame.value!.clientHeight
    const gap = Math.max(6, W * 0.008)
    const grid = justify(
      tiles.filter((t) => t.subject.kind === 'person').map((t) => t.photo),
      { x: 0, y: 0, w: W, h: H },
      3,
      gap,
    )
    const animals = justify(
      tiles.filter((t) => t.subject.kind === 'pet').map((t) => t.photo),
      { x: W * 0.05, y: H * 0.5, w: W * 0.9, h: H * 0.46 },
      1,
      gap,
    )
    const D = Math.min(W * 0.093, H * 0.2, 120)
    return { W, H, D, rects: [...grid, ...animals], five: row(persons.length, W, D), all: row(subjects.length, W, D) }
  },
  () => refresh(),
)

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const refresh = useScrollFrame((still) => {
  if (still || isFlat()) {
    caption.value = ''
    return
  }
  const q = seg(pinProgress(root.value!), 0.03, 0.97)
  const { W, H, D, rects, five, all } = layout()
  act.value = q < 0.4 ? 0 : q < 0.71 ? 1 : 2
  const a = acts[act.value]
  caption.value = a.captions[q > [0.2, 0.53, 0.86][act.value] ? 1 : 0]

  // 头像的位置：第一幕在中间偏上，第二幕移到上方并为宠物让出位置，宠物归入后回到中间；第三幕向上移走、淡出
  const relayout = smooth(seg(q, 0.4, 0.46))
  const back = smooth(seg(q, 0.65, 0.7))
  const out = smooth(seg(q, 0.72, 0.78))
  const cy = lerp(lerp(H * 0.42, H * 0.24, relayout), H * 0.42, back) - out * H * 0.12
  const centers = subjects.map((_, i) => (i < persons.length ? lerp(five[i], all[i], relayout) : all[i]))
  // 宠物的照片在第二幕开始时从下方移入
  const petsIn = smooth(seg(q, 0.42, 0.48))

  tiles.forEach((tile, i) => {
    const el = tileEls[i]
    const pet = tile.subject.kind === 'pet'
    const r = rects[i]
    const y0 = r.y + (pet ? (1 - petsIn) * H * 0.3 : 0)
    // 框出人脸，然后依次收拢：同一幕中的照片按顺序错开开始
    const [boxFrom, from, to, span] = pet ? [0.48, 0.53, 0.64, 0.08] : [0.04, 0.12, 0.34, 0.12]
    const start = from + (tile.order / Math.max(1, tile.last)) * (to - from - span)
    const t = smooth(seg(q, start, start + span))
    const [fx, fy, fs] = squares[i]
    const sx = fx * r.w
    const sy = fy * r.h
    const ss = fs * r.w
    const k1 = D / ss
    const k = lerp(1, k1, t)
    const x = lerp(0, centers[tile.index] - D / 2 - r.x - k1 * sx, t)
    const y = lerp(0, cy - D / 2 - y0 - k1 * sy, t)
    el.style.left = `${r.x}px`
    el.style.top = `${y0}px`
    el.style.width = `${r.w}px`
    el.style.height = `${r.h}px`
    el.style.transform = `translate(${x}px, ${y}px) scale(${k})`
    el.style.clipPath = `inset(${sy * t}px ${(r.w - sx - ss) * t}px ${(r.h - sy - ss) * t}px ${sx * t}px round ${lerp(10, ss / 2, t)}px)`
    // 其余照片落到头像上时淡去，只留封面；第三幕全部淡出
    el.style.opacity = String((pet ? petsIn : 1) * (tile.cover ? 1 : 1 - seg(t, 0.75, 1)) * (1 - out))
    boxEls[i].style.opacity = String(seg(q, boxFrom, boxFrom + 0.05) * (1 - seg(t, 0, 0.3)))
    if (tile.cover) faceEls[i].style.opacity = String(seg(t, 0.8, 1))
  })

  subjects.forEach((subject, s) => {
    const el = nameEls[s]
    const shown = subject.kind === 'pet' ? seg(q, 0.63, 0.67) : seg(q, 0.32, 0.38)
    el.style.left = `${centers[s]}px`
    el.style.top = `${cy + D / 2 + 10}px`
    el.style.opacity = String(shown * (1 - out))
  })

  // 地点的截图从下方升起，再推近到地图
  const rise = smooth(seg(q, 0.74, 0.84))
  placesLayer.value!.style.opacity = String(rise)
  placesLayer.value!.style.transform = `translateY(${(1 - rise) * 40}%)`
  focus(zoom.value!, box, smooth(seg(q, 0.86, 0.96)))
}, root)
</script>

<template>
  <section ref="root" class="sx-pin sx-alt people">
    <div class="sx-stage sx-stage-top">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title">按人物、宠物和地点浏览照片</h2>
        <p class="sx-lead">人脸和宠物在您的设备上识别，照片不会发送到云端。地点取自照片的拍摄位置。</p>
      </div>
      <div class="tabs" aria-hidden="true">
        <span v-for="(a, i) in acts" :key="a.tab" :class="{ on: i === act }">{{ a.tab }}<small v-if="a.plan">{{ a.plan }}</small></span>
      </div>
      <div ref="frame" class="frame" role="img" :aria-label="`照片中的人脸被框出，同一个人或宠物的照片收拢成头像：${label}。随后显示照片页的地点：地图和城市`">
        <div
          v-for="(t, i) in tiles"
          :key="t.photo.id"
          :ref="(el) => (tileEls[i] = el as HTMLElement)"
          class="tile"
          :class="{ cover: t.cover }"
          aria-hidden="true"
        >
          <img :src="src(t.photo.id)" alt="" loading="lazy" />
          <span
            :ref="(el) => (boxEls[i] = el as HTMLElement)"
            class="box"
            :style="pct(t.photo.box)"
          />
          <img
            v-if="t.cover"
            :ref="(el) => (faceEls[i] = el as HTMLElement)"
            class="face"
            :src="src(`face-${t.subject.id}`)"
            alt=""
            loading="lazy"
            :style="pct(squares[i])"
          />
        </div>
        <div v-for="(s, i) in subjects" :key="s.id" :ref="(el) => (nameEls[i] = el as HTMLElement)" class="name" aria-hidden="true">
          {{ s.name }}<small>{{ s.count }} 张</small>
        </div>
        <div ref="placesLayer" class="places">
          <div ref="zoom" class="zoom">
            <KbShot name="places" size="wide" fit detail alt="" />
          </div>
        </div>
      </div>
      <p class="caption">{{ caption }}</p>

      <!-- 舞台不固定时：头像排成一排，下面是地点的截图 -->
      <div class="still">
        <ul class="faces">
          <li v-for="s in subjects" :key="s.id">
            <img :src="src(`face-${s.id}`)" :alt="s.name" width="256" height="256" loading="lazy" />
            {{ s.name }}<small>{{ s.count }} 张</small>
          </li>
        </ul>
        <p class="note">人物和宠物（专业版）：在您的设备上识别，同一个人或宠物的照片归在一起，起名后按人浏览。</p>
        <div class="shot">
          <KbShot name="places" alt="照片页的地点：上方是照片地图，照片按拍摄位置聚在一起，下面是城市卡片" />
        </div>
        <p class="note">地点：按拍摄地点归到城市，在地图上查看。地图内置在程序中，不联网也能使用。</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.people {
  --sx-run: 420vh;
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

.tabs small {
  margin-left: 6px;
  font-size: 11px;
  opacity: 0.7;
}

.tabs span.on {
  background: var(--sx-text);
  color: var(--sx-bg);
}

/* 宽度受舞台高度限制，与 KbAi 相同 */
.frame {
  --chrome: calc(272px + var(--sx-stage-pad) + var(--sx-stage-gap));
  position: relative;
  width: min(1200px, 88vw, calc((var(--sx-vh) - var(--chrome)) * 1.6));
  aspect-ratio: 16 / 10;
  margin: 0 auto;
}

.tile {
  position: absolute;
  transform-origin: 0 0;
  will-change: transform, clip-path;
}

.tile.cover {
  z-index: 1;
}

.tile > img {
  position: absolute;
  display: block;
  max-width: none;
}

.tile > img:first-child {
  inset: 0;
  width: 100%;
  height: 100%;
}

.face {
  border-radius: 50%;
  opacity: 0;
}

/* 人脸框：与 Keepbay 查看器中的人脸框一样是白色细框，加一圈很淡的暗边，浅色照片上也看得清 */
.box {
  position: absolute;
  border: 2px solid #fff;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.25), inset 0 0 0 1px rgb(0 0 0 / 0.25);
  opacity: 0;
}

.name {
  position: absolute;
  z-index: 2;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 600;
  opacity: 0;
}

.name small,
.faces small {
  color: var(--sx-text-2);
  font-size: 12px;
  font-weight: 400;
}

.places {
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  border-radius: 18px;
  opacity: 0;
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

.still {
  display: none;
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

/* 舞台不固定：不做动画，头像排成一排，下面是地点的截图 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .tabs,
  .frame,
  .caption {
    display: none;
  }

  .still {
    display: block;
    width: min(1200px, calc(100vw - 48px));
    margin: 0 auto;
  }

  .faces {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px 28px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .faces li {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 96px;
    font-size: 15px;
    font-weight: 600;
  }

  .faces img {
    width: 96px;
    height: 96px;
    margin-bottom: 8px;
    border-radius: 50%;
  }

  .shot {
    overflow: hidden;
    border-radius: 18px;
  }

  .note {
    margin: 20px auto 36px;
    max-width: 640px;
    text-align: center;
    color: var(--sx-text-2);
  }
}

@media (max-width: 760px) {
  .faces {
    gap: 16px 18px;
  }

  .faces li {
    width: 72px;
    font-size: 14px;
  }

  .faces img {
    width: 72px;
    height: 72px;
  }

  .shot {
    border-radius: 28px;
  }
}
</style>
