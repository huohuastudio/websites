<script setup lang="ts">
import { withBase } from 'vitepress'
import manifest from '../screenshots.json'

// 界面截图（public/screenshots/ 中由 scripts/screenshots.mjs 生成，尺寸见 screenshots.json）：浅色、深色各一张，按网站当前的主题显示其中一张；
// 有手机截图（mobile）时，首页舞台不固定的手机宽度下（≤760px，与 showcase.css 一致）换用手机截图；card 是卡片中的局部图，compact、panel 是搜索一节结果区的截图。
// size 指定只用其中一种（如只用宽屏截图、只用手机截图），不随页面宽度切换；fit 时铺满容器（object-fit: cover，位置用 style 中的 object-position 调）。
// 浅色、深色和两种尺寸都渲染出来，由 CSS 按 <html> 上的 dark 类和页面宽度显示其中一张：服务端渲染与客户端一致，不会水合不一致。
// 都懒加载：不显示的那几张不会下载。class、style 等属性加到每一张图片上。
// detail 时叠上推近用的高清图（清单中有 detail 的截图才有，见 zoom.ts），只在首页舞台固定时显示。
// 清单中有 dpr 的截图，卡片的局部图另有按显示尺寸出的 1 倍、1.25 倍图，用 srcset 按屏幕挑选（2 倍屏用主图），1:1 显示不再缩小
defineOptions({ inheritAttrs: false })

type Size = 'wide' | 'mobile' | 'compact' | 'panel' | 'card'

const props = defineProps<{ name: keyof typeof manifest; alt: string; size?: 'wide' | 'mobile'; fit?: boolean; detail?: boolean }>()

const { detail: region, dpr, ...sizes }: Partial<Record<Size, number[]>> & { detail?: number[]; dpr?: number[] } = manifest[props.name]
const variants = Object.entries(sizes)
  .filter(([size]) => !props.size || size === props.size)
  .map(([size, [width, height]]) => ({ size, width, height }))
const detailStyle = region && {
  left: `${region[0]}%`,
  top: `${region[1]}%`,
  width: `${region[2]}%`,
  height: `${region[3]}%`,
}
// 截图文件：<名称><后缀>-<主题>.webp，后缀为 -mobile（手机截图）、-1x 等（倍数图）、-detail（推近用的高清图）或空
const file = (suffix: string, scheme: string) => withBase(`/screenshots/${props.name}${suffix}-${scheme}.webp`)
const main = (size: string, scheme: string) => file(size === 'mobile' ? '-mobile' : '', scheme)
// 清单中的 dpr 只属于 card 这一档（脚本只给 card 出倍数图）
const srcset = (size: string, scheme: string) =>
  size === 'card' && dpr ? [...dpr.map((d) => `${file(`-${d}x`, scheme)} ${d}x`), `${main(size, scheme)} 2x`].join(', ') : undefined
// 有手机截图、又没有指定尺寸时才按页面宽度二选一：手机宽度下用手机截图，其余宽度用另一种（kb-shot-desk）
const responsive = !props.size && !!sizes.mobile
</script>

<template>
  <template v-for="v in variants" :key="v.size">
    <img
      v-for="scheme in ['light', 'dark']"
      :key="scheme"
      v-bind="$attrs"
      :class="['kb-shot', `kb-shot-${scheme}`, responsive && (v.size === 'mobile' ? 'kb-shot-mobile' : 'kb-shot-desk'), fit && 'kb-shot-fit']"
      :src="main(v.size, scheme)"
      :srcset="srcset(v.size, scheme)"
      :alt="alt"
      :width="v.width"
      :height="v.height"
      loading="lazy"
    />
  </template>
  <template v-if="detail && detailStyle">
    <img
      v-for="scheme in ['light', 'dark']"
      :key="scheme"
      :class="['kb-shot-detail', `kb-shot-${scheme}`]"
      :src="file('-detail', scheme)"
      :style="detailStyle"
      alt=""
      loading="lazy"
    />
  </template>
</template>

<style>
/* 不用 scoped：要按 <html> 上的 dark 类选择；:root 提高优先级，免得被外层容器中 img 的 display 盖住 */
.kb-shot {
  display: block;
  width: 100%;
  height: auto;
}

.kb-shot.kb-shot-fit {
  height: 100%;
  object-fit: cover;
}

/* 高清图叠在主图上同样的位置（父元素要定位），与主图的内容完全重合 */
.kb-shot-detail {
  position: absolute;
  max-width: none;
}

@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  :root .kb-shot-detail {
    display: none;
  }
}

:root.dark .kb-shot-light,
:root:not(.dark) .kb-shot-dark {
  display: none;
}

@media (max-width: 760px) {
  :root .kb-shot.kb-shot-desk {
    display: none;
  }
}

@media (min-width: 761px) {
  :root .kb-shot.kb-shot-mobile {
    display: none;
  }
}
</style>
