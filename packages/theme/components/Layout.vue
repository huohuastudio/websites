<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed, nextTick, onBeforeUnmount, onMounted, provide } from 'vue'
import type { ThemeConfig } from '../config'

const { Layout } = DefaultTheme
const { isDark, theme } = useData<ThemeConfig>()
const route = useRoute()

// 旧版本的页面：顶部提示并链到当前版本
const archivedVersion = computed(() =>
  theme.value.versions?.archived.find((v) => route.path.startsWith(v.link)),
)

// 嵌入模式（?embed=1）：class 由 head 中的脚本在首屏前加到 <html> 上。
// 父页面（如产品后台）用 iframe 打开帮助，按 Esc 时通知父页面关闭
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || e.isComposing || window.parent === window) return
  // 搜索框、放大的图片打开时，Esc 先关闭它们
  if (document.querySelector('.VPLocalSearchBox, .medium-zoom-image--opened')) return
  window.parent.postMessage('help-doc-close', '*')
}

// 站内跳转时路由写入的地址不带 embed=1，在写入时补上（含同页跳转和路径规范化），刷新后仍是嵌入模式
function keepEmbedParam() {
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = history[method].bind(history)
    history[method] = (state, unused, url) => {
      if (url == null) return original(state, unused, url)
      const next = new URL(url, location.href)
      next.searchParams.set('embed', '1')
      original(state, unused, next)
    }
  }
}

onMounted(() => {
  if (!document.documentElement.classList.contains('embed-mode')) return
  // 捕获阶段：先于搜索框自己的 Esc 处理，此时还能判断它是否打开着
  window.addEventListener('keydown', onKeydown, true)
  keepEmbedParam()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true))

// 切换浅色/深色：从点击位置圆形扩散，不支持或减少动态效果时直接切换
const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px at ${x}px ${y}px)`,
  ]

  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })
  try {
    await transition.ready
  } catch {
    // 动画开始前又点了一次或页面被隐藏时过渡会被跳过：主题已经切好，不放动画
    return
  }

  const animation = document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      // 动画结束到过渡收尾之间还会渲染一帧，不保持终点状态时上层快照会复原，闪一下旧主题
      fill: 'forwards',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`,
    },
  )
  // 保持终点状态的动画会留在 <html> 上，作用到下一次切换的同名伪元素，过渡结束后取消
  transition.finished.finally(() => animation.cancel())
})
</script>

<template>
  <Layout>
    <template #doc-before>
      <p v-if="archivedVersion && theme.versions" class="version-notice" role="note">
        这是旧版本（{{ archivedVersion.text }}）的文档。
        <a :href="theme.versions.current.link">查看当前版本</a>
      </p>
    </template>
  </Layout>
</template>
