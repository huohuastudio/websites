<script setup lang="ts">
import { computed } from 'vue'
import LsScene from './LsScene.vue'
import { miniScene } from './scenes'

// 审核墙的示意图：风景、人物、建筑、物品、花轮换，不写实
const props = defineProps<{ index: number }>()

const bgs = ['#e8d9c4', '#cfe0ec', '#dfe8d4', '#eadcea', '#f2e4cf', '#d6e2e6']
const order = [0, 1, 2, 3, 4, 0, 1, 2, 4, 3, 0, 1]

const kind = computed(() => order[props.index % order.length])
const bg = computed(() => bgs[props.index % bgs.length])
// 建筑的窗户：3 列 4 行
const windows = Array.from({ length: 12 }, (_, k) => ({ x: 180 + (k % 3) * 28, y: 80 + Math.floor(k / 3) * 44 }))
// 花瓣：5 片均匀分布
const petals = [0, 72, 144, 216, 288].map((a) => ({
  cx: 200 + 34 * Math.cos((a * Math.PI) / 180),
  cy: 130 + 34 * Math.sin((a * Math.PI) / 180),
}))
</script>

<template>
  <LsScene v-if="kind === 0" :scene="miniScene(index + 2)" />
  <svg v-else viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <template v-if="kind === 1">
      <rect width="400" height="300" :fill="bg" />
      <circle cx="200" cy="120" r="46" fill="#6b5a4e" />
      <path d="M110 300 Q115 190 200 185 Q285 190 290 300Z" fill="#4f6d8a" />
    </template>
    <template v-else-if="kind === 2">
      <rect width="400" height="300" fill="#bcd6ea" />
      <rect x="60" y="110" width="90" height="190" fill="#8a96a8" />
      <rect x="160" y="60" width="110" height="240" fill="#6d7a8f" />
      <rect x="280" y="140" width="80" height="160" fill="#9aa6b6" />
      <g fill="#f1e6b8">
        <rect v-for="(w, k) in windows" :key="k" :x="w.x" :y="w.y" width="14" height="20" />
      </g>
    </template>
    <template v-else-if="kind === 3">
      <rect width="400" height="300" :fill="bg" />
      <rect y="220" width="400" height="80" fill="#c9b49c" />
      <path d="M150 120 H250 L240 230 H160Z" fill="#d9734e" />
      <path d="M250 140 Q295 150 280 190 Q270 205 245 200" fill="none" stroke="#d9734e" stroke-width="12" />
    </template>
    <template v-else>
      <rect width="400" height="300" fill="#dfe8d4" />
      <path d="M200 300 V170" stroke="#5d8a5a" stroke-width="10" />
      <g fill="#e48aa0">
        <circle v-for="(p, k) in petals" :key="k" :cx="p.cx" :cy="p.cy" r="28" />
      </g>
      <circle cx="200" cy="130" r="20" fill="#f4c45a" />
    </template>
  </svg>
</template>
