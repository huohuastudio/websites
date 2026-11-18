<script setup lang="ts">
import type { Scene } from './scenes'

// 几何风景示意图：天空、太阳，加山和湖或海和小岛
defineProps<{ scene: Scene }>()
</script>

<template>
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="400" height="300" :fill="scene.sky" />
    <g v-if="scene.clouds" fill="#fff">
      <ellipse cx="90" cy="72" rx="48" ry="15" />
      <ellipse cx="118" cy="62" rx="30" ry="18" />
      <ellipse cx="250" cy="104" rx="42" ry="13" />
      <ellipse cx="272" cy="95" rx="24" ry="14" />
    </g>
    <circle :cx="scene.sx" :cy="scene.sy" r="28" :fill="scene.sun" />
    <template v-if="scene.kind === 'mount'">
      <path d="M0 205 L60 140 L115 180 L190 100 L265 178 L320 135 L400 190 V300 H0Z" :fill="scene.far" />
      <path d="M0 232 L80 175 L150 222 L235 160 L310 225 L400 195 V300 H0Z" :fill="scene.near" />
      <rect y="238" width="400" height="62" :fill="scene.water" />
      <g fill="#fff" opacity=".35">
        <rect x="250" y="252" width="60" height="2" />
        <rect x="80" y="266" width="90" height="2" />
        <rect x="200" y="282" width="70" height="2" />
      </g>
    </template>
    <template v-else>
      <rect y="196" width="400" height="104" :fill="scene.water" />
      <path d="M215 198 Q252 146 300 172 Q330 158 368 198Z" :fill="scene.far" />
      <path d="M0 300 V246 Q70 230 140 250 L176 300Z" :fill="scene.near" />
      <g :fill="scene.sun" opacity=".55">
        <rect :x="scene.sx - 34" y="206" width="68" height="3" />
        <rect :x="scene.sx - 22" y="220" width="44" height="3" />
        <rect :x="scene.sx - 12" y="234" width="24" height="3" />
      </g>
    </template>
  </svg>
</template>
