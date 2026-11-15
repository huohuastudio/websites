<script setup lang="ts">
import { withBase } from 'vitepress'
import manifest from '../screenshots.json'

// 界面截图（public/screenshots/ 中由 scripts/screenshots.mjs 生成，尺寸见 screenshots.json）：浅色、深色各一张，按网站当前的主题显示其中一张；
// 有手机截图（mobile）时，官网的手机宽度下换用手机截图；compact 是放在窄格子里的截图，各种宽度都用它。
// 都懒加载：不显示的那几张不会下载。defer 时先不给图片地址（首屏轮播还没轮到的截图），元素照样占位
const props = defineProps<{ name: keyof typeof manifest; alt: string; defer?: boolean }>()

const sizes: Partial<Record<'wide' | 'mobile' | 'compact', number[]>> = manifest[props.name]
const variants = Object.entries(sizes).map(([size, [width, height]]) => ({ size, width, height }))
// 宽屏和手机两种都有时才按页面宽度二选一
const responsive = !!sizes.mobile
</script>

<template>
  <template v-for="v in variants" :key="v.size">
    <img
      v-for="scheme in ['light', 'dark']"
      :key="scheme"
      :class="['kb-shot', `kb-shot-${scheme}`, responsive && `kb-shot-${v.size}`]"
      :src="defer ? undefined : withBase(`/screenshots/${name}${v.size === 'mobile' ? '-mobile' : ''}-${scheme}.webp`)"
      :alt="alt"
      :width="v.width"
      :height="v.height"
      loading="lazy"
    />
  </template>
</template>

<style>
/* 不用 scoped：要按 <html> 上的 dark 类选择；:root 提高优先级，免得被窗口外框中 img 的 display 盖住 */
.kb-shot {
  display: block;
  width: 100%;
  height: auto;
}

:root.dark .kb-shot-light,
:root:not(.dark) .kb-shot-dark {
  display: none;
}

@media (max-width: 640px) {
  :root .kb-shot.kb-shot-wide {
    display: none;
  }
}

@media (min-width: 641px) {
  :root .kb-shot.kb-shot-mobile {
    display: none;
  }
}
</style>
