<script setup lang="ts">
import { SxShot } from '@huohuastudio/theme/showcase'
import manifest from '../screenshots.json'

// 界面截图（public/screenshots/ 中由 scripts/screenshots.mjs 生成，尺寸见 screenshots.json）：浅色、深色各一张，按网站当前的主题显示其中一张。
// 清单中有 dpr 的另有按显示尺寸出的 1 倍、1.25 倍图，用 srcset 按屏幕挑选、1:1 显示。class 等属性加到每一张图片上
defineProps<{ name: keyof typeof manifest; alt: string; priority?: boolean }>()
</script>

<template>
  <SxShot :src="`/screenshots/${name}`" v-bind="manifest[name]" :alt="alt" :priority="priority" />
</template>
