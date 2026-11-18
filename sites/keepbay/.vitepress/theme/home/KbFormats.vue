<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import KbShot from '../visuals/KbShot.vue'

// 在网页中直接打开：三行格式名随滚动反向平移，五张截图从一叠展开成扇形。
// 手机上截图排成一行左右滑动；减少动态效果时格式名换行排列，截图直接展开
const rows = [
  ['*照片', 'JPEG', 'PNG', 'HEIC', 'WebP', 'AVIF', 'GIF', 'TIFF', 'SVG', '*相机 RAW', '索尼 ARW', '尼康 NEF', '佳能 CR2', '佳能 CR3', '富士 RAF', '松下 RW2', '奥林巴斯 ORF', 'DNG', '*实况照片'],
  ['*视频', 'MP4', 'MOV', 'WebM', 'TS', 'M2TS', 'MTS', '*字幕', 'SRT', 'VTT', 'ASS', 'SSA', '*音乐', 'MP3', 'AAC', 'FLAC', 'WAV', 'OGG', 'Opus', 'LRC 歌词'],
  ['*文档', 'PDF', 'Word .docx', 'Excel .xlsx', '.xls', '.ods', 'CSV', 'TSV', 'PowerPoint', '*文本和代码', 'Markdown', 'JSON', 'XML', '语法高亮', '*压缩包', 'zip', 'tar.gz', '解压到这里'],
].map((row) => row.map((text) => (text.startsWith('*') ? { text: text.slice(1), key: true } : { text, key: false })))

// 后面的盖在前面的上面：最中间的一张放最后。dx、r 是展开后的横向位移和旋转，sy、fy 是叠起和展开时的纵向位移
const cards = [
  { name: 'photos', caption: '照片时间线', style: { '--dx': '-92%', '--r': '-7deg', '--sy': '-24px', '--fy': '22px' } },
  { name: 'sheet', caption: 'Excel 表格', style: { '--dx': '92%', '--r': '7deg', '--sy': '24px', '--fy': '22px' } },
  { name: 'video', caption: '视频', style: { '--dx': '-50%', '--r': '-3.5deg', '--sy': '-12px', '--fy': '8px' } },
  { name: 'doc', caption: 'Word 文档', style: { '--dx': '50%', '--r': '3.5deg', '--sy': '12px', '--fy': '8px' } },
  { name: 'viewer', caption: '照片和相机 RAW', style: { '--dx': '0%', '--r': '0deg', '--sy': '0px', '--fy': '0px' } },
] as const

const root = ref<HTMLElement>()
const rowEls: HTMLElement[] = []
const deck = ref<HTMLElement>()

useScrollFrame((still) => {
  // 减少动态效果：清掉滚动时写入的位移，截图展开（页面打开后才切换这个设置时，可能停在中间状态）
  if (still) {
    for (const row of rowEls) row.style.removeProperty('--rx')
    deck.value!.style.setProperty('--f', '1')
    return
  }
  const flat = isFlat()
  const p = flat ? viewProgress(root.value!) : pinProgress(root.value!)
  rowEls.forEach((row, i) => {
    // 每行以视口中线为准居中，滚动时左右各平移一段，奇偶行方向相反
    const base = (innerWidth - row.scrollWidth) / 2
    const amp = Math.min(260, Math.max(80, (row.scrollWidth - innerWidth) / 2 + 80))
    row.style.setProperty('--rx', `${base + (p - 0.5) * 2 * amp * (i % 2 ? -1 : 1)}px`)
  })
  deck.value!.style.setProperty('--f', String(flat ? 1 : smooth(seg(p, 0.15, 0.7))))
})
</script>

<template>
  <section ref="root" class="sx-pin formats">
    <div class="sx-stage">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title">在网页中直接打开</h2>
        <p class="sx-lead">预览都在浏览器里完成，服务器上无需另外安装 Office 或转换程序。</p>
      </div>
      <div class="rows">
        <div v-for="(row, i) in rows" :key="i" :ref="(el) => (rowEls[i] = el as HTMLElement)">
          <span v-for="item in row" :key="item.text" :class="{ key: item.key }">{{ item.text }}</span>
        </div>
      </div>
      <div ref="deck" class="deck">
        <figure v-for="card in cards" :key="card.name" :style="card.style">
          <div class="sx-win shot"><KbShot :name="card.name" size="wide" fit alt="" /></div>
          <figcaption>{{ card.caption }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.formats {
  height: 210vh;
  overflow-x: clip;
}

.sx-stage {
  display: flex;
  flex-direction: column;
  padding-top: 36px;
}

.sx-head {
  margin-bottom: 24px;
}

.rows {
  display: grid;
  gap: 10px;
  margin-bottom: 3vh;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.rows div {
  display: flex;
  width: max-content;
  gap: 10px;
  white-space: nowrap;
  transform: translateX(var(--rx, 0px));
}

.rows span {
  padding: 6px 16px;
  border-radius: 980px;
  background: var(--sx-alt);
  color: var(--sx-text-2);
  font-size: 15px;
}

.rows span.key {
  color: var(--sx-text);
  font-weight: 600;
}

.deck {
  position: relative;
  flex: 1;
  min-height: 0;
  margin-bottom: 6vh;
}

/* 叠起时（--f 为 0）都在中间，展开时按各自的位移和旋转散开 */
figure {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(34vw, 480px, calc((var(--sx-vh) - 428px) * 1.6));
  margin: 0;
  transform: translate(-50%, -50%) translateX(calc(var(--f, 0) * var(--dx))) translateY(calc((1 - var(--f, 0)) * var(--sy) + var(--f, 0) * var(--fy))) rotate(calc(var(--f, 0) * var(--r)));
}

.shot {
  aspect-ratio: 16 / 10;
  border-radius: 14px;
}

.shot :deep(img) {
  object-position: top;
}

figcaption {
  margin-top: 12px;
  text-align: center;
  color: var(--sx-text-2);
  font-size: 15px;
  opacity: var(--f, 0);
}

@media (max-height: 820px) and (min-width: 761px) {
  .sx-stage {
    padding-top: 12px;
  }
}

@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .formats {
    height: auto;
  }

  .sx-stage {
    padding-top: 72px;
  }

  .deck {
    --f: 1;
  }
}

/* 视口太矮的宽屏：截图展开，给扇形留出固定高度；宽度只按视口宽度算（按舞台高度算会是负数） */
@media (max-height: 640px) and (min-width: 761px) {
  .deck {
    flex: none;
    height: 70vh;
  }

  figure {
    width: min(34vw, 480px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sx-stage {
    padding-top: 96px;
  }

  .deck {
    height: 46vh;
  }

  figure {
    width: min(34vw, 480px, 74vh);
  }

  .rows div {
    flex-wrap: wrap;
    justify-content: center;
    width: auto;
    padding-inline: 24px;
  }
}

/* 手机：截图排成一行左右滑动，两侧留白，露出下一张的一部分 */
@media (max-width: 760px) {
  .deck {
    display: flex;
    gap: 14px;
    height: auto;
    padding: 4px 24px 8px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 24px;
    scrollbar-width: none;
  }

  .deck::-webkit-scrollbar {
    display: none;
  }

  figure {
    position: static;
    flex: 0 0 78%;
    width: auto;
    transform: none;
    scroll-snap-align: start;
  }
}
</style>
