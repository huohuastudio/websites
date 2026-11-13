<script setup lang="ts">
// HomeCells 中的一个格子：标题和说明在上，visual 插槽（示意图）在下。
// wide 时占满整行，作为重点：标题更大，示意图放在带光晕的底板上，宽屏下文字在左、示意图在右。
// 所在版块没有标题时 level 设为 2，保持标题层级连贯
withDefaults(defineProps<{ title: string; wide?: boolean; level?: 2 | 3 }>(), { level: 3 })
</script>

<template>
  <div class="home-cell" :class="{ wide }">
    <div class="text">
      <component :is="`h${level}`" class="title">{{ title }}</component>
      <div class="content home-prose">
        <slot />
      </div>
    </div>
    <div v-if="$slots.visual" class="visual" :class="{ 'home-stage': wide }">
      <slot name="visual" />
    </div>
  </div>
</template>

<style scoped>
.home-cell {
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-width: 0;
  padding: 40px var(--home-pad-x);
  background: var(--vp-c-bg);
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  text-wrap: balance;
  color: var(--vp-c-text-1);
}

.content {
  max-width: 34em;
  margin-top: 12px;
  font-size: 15px;
}

.visual {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

/* 普通格子的示意图顶端对齐；单列排时格子很宽，示意图不跟着拉宽 */
.home-cell:not(.wide) .visual {
  justify-content: flex-start;
  width: 100%;
  max-width: 520px;
}

.wide {
  grid-column: 1 / -1;
}

.wide .title {
  font-size: 26px;
}

.wide .content {
  margin-top: 20px;
  font-size: 16px;
}

.wide .visual {
  padding: 28px 20px;
}

/* 页面很宽时，底板跟着铺开，示意图本身不超过 760px、居中 */
.wide .visual > :deep(*) {
  align-self: center;
  width: 100%;
  max-width: 760px;
}

@media (min-width: 768px) {
  /* 每格占网格的两行（文字、示意图），同一排各格的文字区和示意图分别等高 */
  .home-cell:not(.wide) {
    display: grid;
    grid-row: span 2;
    grid-template-rows: subgrid;
    row-gap: 32px;
  }

  .home-cell {
    padding: 48px var(--home-pad-x) var(--home-pad-x);
  }

  .wide .visual {
    padding: 40px 36px;
  }
}

@media (min-width: 960px) {
  .wide {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: 64px;
    align-items: center;
    padding: 72px var(--home-pad-x);
  }

  .wide .title {
    font-size: 32px;
  }

  .wide .visual {
    padding: 56px 48px;
  }
}
</style>
