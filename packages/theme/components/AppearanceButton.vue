<script setup lang="ts">
import { useData } from 'vitepress'
import { inject, ref, watchPostEffect } from 'vue'

// 取代默认主题的浅色/深色开关（config.ts 中按文件名替换 VPSwitchAppearance）：一个圆形图标按钮，
// 浅色时显示月亮，点击切到深色；深色时显示太阳。切换动效由 Layout.vue 提供的 toggle-appearance 完成
const { isDark, theme } = useData()

const toggleAppearance = inject('toggle-appearance', () => {
  isDark.value = !isDark.value
})

// 服务端渲染时不知道访客选的是哪种，先留空，挂载后再按当前主题设置，免得水合时属性不一致
const title = ref('')
watchPostEffect(() => {
  title.value = isDark.value
    ? theme.value.lightModeSwitchTitle || '切换到浅色'
    : theme.value.darkModeSwitchTitle || '切换到深色'
})
</script>

<template>
  <button type="button" class="appearance-button" :title="title" :aria-label="title" @click="toggleAppearance">
    <!-- 两个图标都渲染，按 html 上的 dark 类显示其中一个：服务端渲染时还不知道访客选的是哪种 -->
    <svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
    <svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  </button>
</template>

<style scoped>
.appearance-button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-text-1) 6%, transparent);
  color: var(--vp-c-text-2);
  transition: color 0.2s, background-color 0.2s;
}

.appearance-button:hover {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-text-1) 12%, transparent);
}

.appearance-button > svg {
  grid-area: 1 / 1;
}

.sun,
:global(.dark) .appearance-button .moon {
  display: none;
}

:global(.dark) .appearance-button .sun {
  display: block;
}
</style>
