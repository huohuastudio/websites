<script setup lang="ts">
import { withBase } from 'vitepress'

// 界面截图（public/screenshots/ 中由 scripts/screenshots.mjs 生成）：浅色、深色各一张，按网站当前的主题显示其中一张；
// 有手机截图（mobile）时，官网的手机宽度下换用手机截图；compact 是放在窄格子里的截图，各种宽度都用它。
// 都懒加载：不显示的那几张不会下载
const props = defineProps<{ name: string; alt: string; mobile?: boolean; compact?: boolean }>()

// 宽高与截图脚本中的尺寸一致
const variants = props.compact
  ? [{ file: '', width: 1200, height: 1500 }]
  : [{ file: '', width: 2048, height: 1280 }, ...(props.mobile ? [{ file: '-mobile', width: 1170, height: 2100 }] : [])]
</script>

<template>
  <template v-for="v in variants" :key="v.file">
    <img
      v-for="scheme in ['light', 'dark']"
      :key="scheme"
      :class="['kb-shot', `kb-shot-${scheme}`, mobile && (v.file ? 'kb-shot-mobile' : 'kb-shot-wide')]"
      :src="withBase(`/screenshots/${name}${v.file}-${scheme}.webp`)"
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
