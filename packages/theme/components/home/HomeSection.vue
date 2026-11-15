<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

// 首页的一个版块：顶部一条通栏细线，内容铺满页面宽度。
// 单元格类内容（HomeCells、HomeFeatureList 的 cells、HomePlans）贴边排列，其余内容放进 .home-pad 留边距。
// layout 为 side 时标题在左、内容在右（宽屏）；center 时标题居中，底部带光晕。
// 页面 frontmatter 写 reveal: true 时，版块内容滚动进入视口时淡入、轻微上移（细线不动）；
// 打开页面时已在视口中或上方的版块不做；系统开了"减少动态效果"和打印时直接显示（打开页面后才改设置也按 CSS 生效）
defineProps<{
  id?: string
  title?: string
  lead?: string
  layout?: 'side' | 'center'
}>()

const { frontmatter } = useData()
const inner = ref<HTMLElement>()
const hidden = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  const el = inner.value!
  if (!frontmatter.value.reveal || el.getBoundingClientRect().top < innerHeight) return
  hidden.value = true
  // 版块顶部进入视口下方 10% 以内时显示
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      hidden.value = false
      observer?.disconnect()
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section :id="id" class="home-section" :class="layout">
    <div ref="inner" class="inner" :class="{ hidden }">
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

.inner {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.inner.hidden {
  opacity: 0;
  transform: translateY(24px);
}

@media (prefers-reduced-motion: reduce), print {
  .inner {
    transition: none;
  }

  .inner.hidden {
    opacity: 1;
    transform: none;
  }
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
