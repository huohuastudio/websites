<script setup lang="ts">
import { VPButton } from 'vitepress/theme'
import type { HomeAction } from './HomeActions.vue'

// 首页首屏：居中的大标题、一句话介绍和按钮，下面是 visual 插槽（截图或示意图），放在带光晕的底板上；
// 默认插槽放按钮下方的小字说明
defineProps<{
  title: string
  text: string
  actions: HomeAction[]
}>()
</script>

<template>
  <section class="home-hero">
    <div class="intro">
      <h1 class="title">{{ title }}</h1>
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
  padding: 56px var(--home-pad-x) 36px;
  text-align: center;
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
    padding: 80px var(--home-pad-x) 48px;
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
    padding: 40px 48px;
  }
}
</style>
