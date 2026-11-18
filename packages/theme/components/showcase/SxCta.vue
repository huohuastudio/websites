<script setup lang="ts">
import type { SxAction } from './SxPlans.vue'

// 页面结尾：居中的标题、说明和按钮；默认插槽放按钮下方的小字链接（如许可协议）
defineProps<{ title: string; lead?: string; actions: SxAction[] }>()
</script>

<template>
  <section id="start" class="sx-sec sx-alt cta">
    <div class="sx-wrap">
      <h2 class="sx-title">{{ title }}</h2>
      <p v-if="lead" class="sx-lead">{{ lead }}</p>
      <div class="sx-actions">
        <a
          v-for="action in actions"
          :key="action.text"
          class="sx-btn"
          :class="action.theme === 'alt' ? 'ghost' : 'primary'"
          :href="action.link"
        >{{ action.text }}</a>
      </div>
      <div v-if="$slots.default" class="links"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  text-align: center;
}

.sx-lead {
  max-width: 560px;
  margin: 20px auto 32px;
}

.sx-actions {
  justify-content: center;
}

.links {
  margin-top: 28px;
  color: var(--sx-text-3);
  font-size: 14px;
}

/* 几个链接排成一行，窄屏时换行 */
.links :deep(p) {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 28px;
  margin: 0;
}
</style>
