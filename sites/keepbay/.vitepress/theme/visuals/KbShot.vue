<script setup lang="ts">
import { withBase } from 'vitepress'
import manifest from '../screenshots.json'

// 界面截图（public/screenshots/ 中由 scripts/screenshots.mjs 生成，尺寸见 screenshots.json）：浅色、深色各一张，按网站当前的主题显示其中一张；
// 有手机截图（mobile）时，首页舞台不固定的手机宽度下（≤760px，与 showcase.css 一致）换用手机截图；compact 是放在窄格子里的截图，各种宽度都用它。
// size 指定只用其中一种（如只用宽屏截图、只用手机截图），不随页面宽度切换；fit 时铺满容器（object-fit: cover，位置用 style 中的 object-position 调）。
// 浅色、深色和两种尺寸都渲染出来，由 CSS 按 <html> 上的 dark 类和页面宽度显示其中一张：服务端渲染与客户端一致，不会水合不一致。
// 都懒加载：不显示的那几张不会下载。class、style 等属性加到每一张图片上
defineOptions({ inheritAttrs: false })

type Size = 'wide' | 'mobile' | 'compact'

const props = defineProps<{ name: keyof typeof manifest; alt: string; size?: Exclude<Size, 'compact'>; fit?: boolean }>()

const sizes: Partial<Record<Size, number[]>> = manifest[props.name]
const variants = Object.entries(sizes)
  .filter(([size]) => !props.size || size === props.size)
  .map(([size, [width, height]]) => ({ size, width, height }))
// 宽屏和手机两种都有、又没有指定时才按页面宽度二选一
const responsive = !props.size && !!sizes.mobile
</script>

<template>
  <template v-for="v in variants" :key="v.size">
    <img
      v-for="scheme in ['light', 'dark']"
      :key="scheme"
      v-bind="$attrs"
      :class="['kb-shot', `kb-shot-${scheme}`, responsive && `kb-shot-${v.size}`, fit && 'kb-shot-fit']"
      :src="withBase(`/screenshots/${name}${v.size === 'mobile' ? '-mobile' : ''}-${scheme}.webp`)"
      :alt="alt"
      :width="v.width"
      :height="v.height"
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

:root.dark .kb-shot-light,
:root:not(.dark) .kb-shot-dark {
  display: none;
}

@media (max-width: 760px) {
  :root .kb-shot.kb-shot-wide {
    display: none;
  }
}

@media (min-width: 761px) {
  :root .kb-shot.kb-shot-mobile {
    display: none;
  }
}
</style>
