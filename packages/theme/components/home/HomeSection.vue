<script setup lang="ts">
// 首页的一个版块：顶部一条通栏细线，内容铺满页面宽度。
// 单元格类内容（HomeCells、HomeFeatureList 的 cells、HomePlans）贴边排列，其余内容放进 .home-pad 留边距。
// layout 为 side 时标题在左、内容在右（宽屏）；center 时标题居中，底部带光晕
defineProps<{
  id?: string
  title?: string
  lead?: string
  layout?: 'side' | 'center'
}>()
</script>

<template>
  <section :id="id" class="home-section" :class="layout">
    <div class="inner">
      <header v-if="title || $slots.header" class="header">
        <h2 v-if="title" class="title">{{ title }}</h2>
        <p v-if="lead" class="lead">{{ lead }}</p>
        <div v-if="$slots.header" class="header-extra home-prose">
          <slot name="header" />
        </div>
      </header>
      <div class="body">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-section {
  border-top: 1px solid var(--home-line);
  scroll-margin-top: var(--vp-nav-height);
}

.header {
  padding: 64px var(--home-pad-x) 40px;
}

.title {
  max-width: 20em;
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  text-wrap: balance;
  color: var(--vp-c-text-1);
}

.lead {
  max-width: 38em;
  margin: 16px 0 0;
  font-size: 17px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.header-extra {
  margin-top: 16px;
}

/* 非贴边布局的内容自己留边距 */
.side .body,
.center .body {
  padding: 0 var(--home-pad-x) 64px;
}

/* 标题居中，整块带底部光晕，用作页尾的行动区 */
.center .inner {
  background: radial-gradient(60% 80% at 50% 100%, var(--vp-c-brand-soft), transparent);
}

.center .header {
  text-align: center;
}

.center .title,
.center .lead {
  margin-inline: auto;
}

@media (min-width: 640px) {
  .title {
    font-size: 40px;
  }
}

@media (min-width: 960px) {
  .header {
    padding: 80px var(--home-pad-x) 48px;
  }

  .center .header {
    padding-top: 120px;
  }

  .center .body {
    padding-bottom: 120px;
  }

  /* 标题在左、内容在右，标题跟着滚动停在顶部 */
  .side .inner {
    display: grid;
    grid-template-columns: 5fr 7fr;
    align-items: start;
  }

  .side .header {
    position: sticky;
    top: var(--vp-nav-height);
    padding-bottom: 96px;
  }

  .side .body {
    padding: 96px var(--home-pad-x) 96px 0;
  }
}
</style>
