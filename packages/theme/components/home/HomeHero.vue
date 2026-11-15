<script setup lang="ts">
import { computed } from 'vue'
import { VPButton } from 'vitepress/theme'
import type { HomeAction } from './HomeActions.vue'

// 首页首屏：居中的大标题、一句话介绍和按钮，下面是 visual 插槽（截图或示意图），放在带光晕的底板上；
// 默认插槽放按钮下方的小字说明，badge 是标题上方的小标签（如测试状态）。
// highlight 是标题中突出显示的一段，颜色取 VitePress 首屏的 --vp-home-hero-name-color、--vp-home-hero-name-background（站点设渐变）；
// animate 时标题逐字浮现，只在打开页面时播放一次，减少动态效果时不播放
const props = defineProps<{
  title: string
  text: string
  actions: HomeAction[]
  badge?: string
  highlight?: string
  animate?: boolean
}>()

// 标题拆成逐字（逐字浮现要每个字单独做动画；突出的一段每个字取渐变中对应的一截，连起来是一道完整的渐变）。
// 先按突出的一段（第一次出现处）切成三截再各自按码点拆，emoji 等代理对不会错位
const chars = computed(() => {
  const { title, highlight } = props
  const start = highlight ? title.indexOf(highlight) : -1
  const parts =
    start < 0 ? [title, '', ''] : [title.slice(0, start), highlight!, title.slice(start + highlight!.length)]
  const hl = [...parts[1]]
  let i = 0
  const plain = (text: string) => ({ text, key: false, style: { '--i': i++ } })
  return [
    ...[...parts[0]].map(plain),
    ...hl.map((text, k) => ({
      text,
      key: true,
      style: {
        '--i': i++,
        backgroundPosition: `${hl.length > 1 ? (k / (hl.length - 1)) * 100 : 0}% 0`,
        backgroundSize: `${hl.length * 100}% 100%`,
      },
    })),
    ...[...parts[2]].map(plain),
  ]
})
</script>

<template>
  <section class="home-hero">
    <div class="intro">
      <p v-if="badge" class="badge">{{ badge }}</p>
      <h1 v-if="highlight || animate" class="title" :class="{ animate }" :aria-label="title">
        <span aria-hidden="true"><span v-for="(c, i) in chars" :key="i" class="ch" :class="{ key: c.key }" :style="c.style">{{ c.text }}</span></span>
      </h1>
      <h1 v-else class="title">{{ title }}</h1>
      <p class="text">{{ text }}</p>
      <div class="actions">
        <VPButton
          v-for="action in actions"
          :key="action.link"
          size="big"
          :theme="action.theme ?? 'brand'"
          :text="action.text"
          :href="action.link"
        />
      </div>
      <div v-if="$slots.default" class="note home-prose">
        <slot />
      </div>
    </div>
    <div v-if="$slots.visual" class="stage-wrap">
      <div class="home-stage stage">
        <div class="visual">
          <slot name="visual" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.intro {
  padding: 32px var(--home-pad-x) 28px;
  text-align: center;
}

.badge {
  display: inline-block;
  margin: 0 0 20px;
  padding: 2px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 13px;
  line-height: 22px;
  color: var(--vp-c-text-2);
}

.title {
  margin: 0;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  text-wrap: balance;
  color: var(--vp-c-text-1);
}

.ch {
  display: inline-block;
  white-space: pre;
}

.ch.key {
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  color: var(--vp-home-hero-name-color);
}

/* 每个字从模糊、略低处依次淡入 */
.animate .ch {
  animation: rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
  animation-delay: calc(var(--i) * 35ms);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(0.25em);
    filter: blur(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate .ch {
    animation: none;
  }
}

.text {
  max-width: 36em;
  margin: 24px auto 0;
  font-size: 17px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

.note {
  margin-top: 16px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
}

.stage-wrap {
  padding: 0 12px 12px;
}

.stage {
  padding: 24px 16px;
}

.visual {
  max-width: 1120px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .title {
    font-size: 56px;
  }

  .text {
    font-size: 18px;
  }

  .stage {
    padding: 48px 40px;
  }
}

@media (min-width: 960px) {
  .intro {
    padding: 64px var(--home-pad-x) 32px;
  }

  .title {
    font-size: 72px;
  }

  .actions {
    margin-top: 32px;
  }

  .stage-wrap {
    padding: 0 16px 16px;
  }

  .stage {
    padding: 24px 40px 32px;
  }
}
</style>
