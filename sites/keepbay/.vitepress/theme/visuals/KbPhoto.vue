<script setup lang="ts">
// 示意图里的照片缩略图：用色块画出天空、海面和太阳，颜色跟随深浅模式
defineProps<{ tone?: 'sea' | 'dusk' | 'hill' | 'night' }>()
</script>

<template>
  <span class="kb-photo" :class="tone"><i class="sun" /></span>
</template>

<style scoped>
/* 只用品牌色的深浅和中性灰，靠构图区分不同的照片 */
.kb-photo {
  --sky: color-mix(in srgb, var(--vp-c-brand-1) 16%, var(--vp-c-bg));
  --ground: color-mix(in srgb, var(--vp-c-brand-1) 50%, var(--vp-c-bg));
  --sun: var(--vp-c-bg);
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 6px;
  background: linear-gradient(to bottom, var(--sky) 0 60%, var(--ground) 60% 100%);
}

.sun {
  position: absolute;
  top: 22%;
  right: 22%;
  width: 18%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--sun);
  opacity: 0.85;
}

/* 傍晚：中性灰的天，太阳落到海面上 */
.dusk {
  --sky: color-mix(in srgb, var(--vp-c-gray-1) 30%, var(--vp-c-bg));
  --ground: color-mix(in srgb, var(--vp-c-brand-1) 70%, var(--vp-c-bg));
}

.dusk .sun {
  top: 46%;
  right: 40%;
}

/* 山坡：地面画成一个大弧 */
.hill {
  --sky: color-mix(in srgb, var(--vp-c-gray-1) 18%, var(--vp-c-bg));
  background: var(--sky);
}

.hill::after {
  content: '';
  position: absolute;
  left: -20%;
  right: -20%;
  top: 55%;
  height: 100%;
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-brand-1) 38%, var(--vp-c-bg));
}

.night {
  --sky: color-mix(in srgb, var(--vp-c-brand-1) 60%, #000);
  --ground: color-mix(in srgb, var(--vp-c-brand-1) 42%, #000);
}

.night .sun {
  width: 12%;
  left: 20%;
  right: auto;
}
</style>
