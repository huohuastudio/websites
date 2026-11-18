<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import KbShot from '../visuals/KbShot.vue'
import { detailBox, focus } from './zoom'

// 揭开对照：先是终端中 ls 列出的磁盘文件夹，滚动时从右向左擦去，露出 Keepbay 中的同一个文件夹，再推近到侧栏的文件夹列表。
// 舞台不固定时只做擦去（随元素在视口中的位置），不推近。推近的区域和高清图由截图脚本生成
const names = 'IMG_20250104_100913 IMG_20250104_120959 IMG_20250111_100327 IMG_20250115_101359 IMG_20250115_142315 IMG_20250118_105237 IMG_20250118_131814 IMG_20250201_120553 IMG_20250201_181826 IMG_20250201_213203 IMG_20250208_130648 IMG_20250208_185428 IMG_20250222_190544 IMG_20250317_134345 IMG_20250317_162005 IMG_20250320_120413 IMG_20250320_161248 IMG_20250326_093836 IMG_20250326_141004 IMG_20250405_104250 IMG_20250405_111422 IMG_20250405_141423 IMG_20250408_100731 IMG_20250408_110825 IMG_20250412_164021 IMG_20250420_122746 IMG_20250420_150648 IMG_20250502_065925 IMG_20250502_110433 IMG_20250507_101115 IMG_20250507_114916 IMG_20250514_114503 IMG_20250514_162757 IMG_20250602_140819 IMG_20250602_162501 IMG_20250606_192015 IMG_20250609_132850 IMG_20250609_143059 IMG_20250626_140036 IMG_20250626_140114 IMG_20250701_091851 IMG_20250701_100544 IMG_20250701_122824 IMG_20250713_164432 IMG_20250713_170533 IMG_20250721_144650 IMG_20250721_153921 IMG_20250806_114937'.split(' ')
const captions = ['磁盘上的文件夹', 'Keepbay 中的同一个文件夹', '侧栏中是您已有的文件夹，名称和层级保持原样']

const box = detailBox('files')
const root = ref<HTMLElement>()
const frame = ref<HTMLElement>()
const zoom = ref<HTMLElement>()
const caption = ref(0)

useScrollFrame((still) => {
  let w: number
  let z: number
  if (still) [w, z] = [1, 0]
  else if (isFlat()) [w, z] = [smooth(viewProgress(frame.value!, innerHeight * 0.9, innerHeight * 0.2)), 0]
  else {
    const p = pinProgress(root.value!)
    ;[w, z] = [smooth(seg(p, 0.1, 0.5)), smooth(seg(p, 0.62, 0.92))]
  }
  frame.value!.style.setProperty('--w', String(w))
  focus(zoom.value!, box, z)
  caption.value = z > 0.5 ? 2 : w > 0.5 ? 1 : 0
}, root)
</script>

<template>
  <section ref="root" class="sx-pin sx-alt wipe">
    <div class="sx-stage sx-stage-top">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title">文件留在<wbr />原来的文件夹里</h2>
        <p class="sx-lead">Keepbay 只读取文件并建立索引，不移动文件，也不改变目录结构。</p>
      </div>
      <div ref="frame" class="frame">
        <div ref="zoom" class="zoom">
          <KbShot name="files" size="wide" fit detail alt="Keepbay 中的同一个文件夹：日常相册中的照片排成网格，左侧是文件夹列表" />
        </div>
        <div class="disk sx-term" data-title="nas — ls" aria-hidden="true">
          <div class="cmd"><b>$</b> ls /srv/nas/家庭相册/2025/日常</div>
          <div class="ls">
            <div v-for="n in names" :key="n">{{ n }}.jpg</div>
          </div>
        </div>
        <div class="seam" />
      </div>
      <p class="caption">{{ captions[caption] }}</p>
    </div>
  </section>
</template>

<style scoped>
.wipe {
  --sx-run: 250vh;
}

/* 宽度受舞台高度限制：舞台高度减去标题、说明和留白（--chrome）后按 16:10 换算 */
.frame {
  --chrome: calc(212px + var(--sx-stage-pad) + var(--sx-stage-gap));
  position: relative;
  width: min(1000px, 84vw, calc((var(--sx-vh) - var(--chrome)) * 1.6));
  aspect-ratio: 16 / 10;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 18px;
}

.zoom {
  position: absolute;
  inset: 0;
  transform-origin: 0 0;
  transform: scale(var(--zs, 1)) translate(var(--zx, 0%), var(--zy, 0%));
}

/* 磁盘上的文件夹：共用的终端样式（带标题栏），铺满截图框，随擦去从右向左收起。
   多一层 .frame，免得与共用的 .sx-term 规则比先后 */
.frame .disk {
  --sx-term-x: 28px;
  --sx-term-y: 24px;
  position: absolute;
  inset: 0;
  border-radius: inherit;
  clip-path: inset(0 calc(var(--w, 0) * 100%) 0 0);
  color: #d2d2d7;
  font: 13px/1.85 var(--vp-font-family-mono);
}

.cmd {
  margin-bottom: 8px;
  color: #fff;
}

.cmd b {
  color: #6cc5bc;
  font-weight: 400;
}

.ls {
  columns: 3 210px;
  column-gap: 28px;
}

/* 擦去的边缘：一条白线，开始和结束时淡出 */
.seam {
  position: absolute;
  top: 0;
  bottom: 0;
  right: calc(var(--w, 0) * 100%);
  width: 2px;
  margin-right: -1px;
  background: #fff;
  opacity: min(1, calc(var(--w, 0) * 30), calc((1 - var(--w, 0)) * 30));
}

.caption {
  min-height: 1.6em;
  margin: 24px 0 0;
  padding-inline: 24px;
  text-align: center;
  color: var(--sx-text-2);
}

@media (max-height: 832px) and (min-width: 761px) {
  .frame {
    --chrome: calc(170px + var(--sx-stage-pad) + var(--sx-stage-gap));
  }

  .caption {
    margin-top: 14px;
  }
}

/* 舞台不固定时不受舞台高度限制 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .frame {
    width: min(1000px, calc(100vw - 48px));
  }
}

@media (max-width: 760px) {
  .frame .disk {
    --sx-term-x: 12px;
    --sx-term-y: 12px;
    font-size: 9px;
  }

  .ls {
    columns: 2;
  }
}
</style>
