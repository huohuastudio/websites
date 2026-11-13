<script lang="ts">
// mermaid 用全局配置渲染，多个图表同时渲染会互相影响主题，所以所有图表共用一个队列逐个渲染
let queue: Promise<unknown> = Promise.resolve()
// 上次初始化用的深浅色，没变时不再重复初始化
let initializedDark: boolean | undefined
</script>

<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'
import { useData } from 'vitepress'

// markdown 中的 ```mermaid 代码块由 mermaid-markdown.ts 改写成本组件，代码经 encodeURIComponent 编码后传入
const props = defineProps<{ code: string }>()

const { isDark } = useData()
const source = computed(() => decodeURIComponent(props.code))
const svg = ref('')
const failed = ref(false)
const id = `mermaid-${useId()}`

function render() {
  const dark = isDark.value
  const task = queue.then(async () => {
    // 排队期间深浅色又切换过：后面已有按新颜色渲染的任务，这次跳过
    if (dark !== isDark.value) return
    const { default: mermaid } = await import('mermaid')
    if (initializedDark !== dark) {
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'default' })
      initializedDark = dark
    }
    try {
      svg.value = (await mermaid.render(id, source.value)).svg
      failed.value = false
    } catch {
      failed.value = true
    }
  })
  // 加载 mermaid 失败（如网络中断）时不卡住后面的图表
  queue = task.catch(() => {
    failed.value = true
  })
}

onMounted(render)
watch(isDark, render)
</script>

<template>
  <pre v-if="failed" class="mermaid-diagram"><code>{{ source }}</code></pre>
  <div v-else class="mermaid-diagram" v-html="svg" />
</template>
