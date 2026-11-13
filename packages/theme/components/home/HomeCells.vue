<script setup lang="ts">
// 单元格网格（细线做法见 home.css 的 .home-lines），里面放 HomeCell。
// 两列的从 768px 起分列，三列的从 1100px 起分列（再窄放不下示意图）；wide 的格子占满一行
withDefaults(defineProps<{ columns?: 1 | 2 | 3 }>(), { columns: 2 })
</script>

<template>
  <div class="home-lines" :class="`cols-${columns}`">
    <slot />
  </div>
</template>

<style scoped>
@media (min-width: 768px) {
  .cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 三列的在分列之前是单列，格子很宽：改成文字在左、示意图在右 */
@media (min-width: 768px) and (max-width: 1099px) {
  .cols-3 > :deep(.home-cell:not(.wide)) {
    grid-row: auto;
    grid-template-rows: none;
    grid-template-columns: 2fr 3fr;
    column-gap: 40px;
    align-items: start;
  }

  .cols-3 > :deep(.home-cell:not(.wide)) .visual {
    max-width: none;
  }
}

@media (min-width: 1100px) {
  .cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
