<script setup lang="ts">
import { withBase } from 'vitepress'

// 界面截图：浅色、深色各一张（<src>-light.webp、<src>-dark.webp），按 <html> 上的 dark 类显示其中一张。
// 两张都渲染出来，服务端渲染与客户端一致；隐藏的那张懒加载，不会下载。
// priority 用于首屏：浅色那张立即加载（全站默认浅色）。class、style 等属性加到每一张图片上。
// dpr：按显示尺寸另出的倍数图（<src>-<倍数>x-<主题>.webp，如 [1, 1.25]），与主图（2 倍）一起写进 srcset，浏览器按屏幕挑选、1:1 显示
defineOptions({ inheritAttrs: false })

const props = defineProps<{ src: string; width: number; height: number; alt: string; priority?: boolean; dpr?: number[] }>()

const srcset = (scheme: string) =>
  props.dpr && [...props.dpr.map((d) => `${withBase(`${props.src}-${d}x-${scheme}.webp`)} ${d}x`), `${withBase(`${props.src}-${scheme}.webp`)} 2x`].join(', ')
</script>

<template>
  <img
    v-for="scheme in ['light', 'dark']"
    :key="scheme"
    v-bind="$attrs"
    :class="['sx-shot', `sx-shot-${scheme}`]"
    :src="withBase(`${src}-${scheme}.webp`)"
    :srcset="srcset(scheme)"
    :width="width"
    :height="height"
    :alt="alt"
    :loading="priority && scheme === 'light' ? 'eager' : 'lazy'"
    :fetchpriority="priority && scheme === 'light' ? 'high' : undefined"
  />
</template>

<style>
/* 不用 scoped：要按 <html> 上的 dark 类选择；:root 提高优先级，免得被外层容器中 img 的 display 盖住 */
:root.dark .sx-shot-light,
:root:not(.dark) .sx-shot-dark {
  display: none;
}
</style>
