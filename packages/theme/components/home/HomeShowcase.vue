<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

export interface ShowcaseItem {
  /** public 下的图片路径，如 /screenshots/dashboard.webp */
  src: string
  /** 标签页上的名称 */
  title: string
  /** 图片下方的说明 */
  desc?: string
  width?: number
  height?: number
}

// 界面截图展示：上方一排标签切换，下方一张大图和说明
const props = defineProps<{ items: ShowcaseItem[] }>()

const active = ref(0)
const current = computed(() => props.items[active.value])
const tabs = ref<HTMLButtonElement[]>([])

// 标签页的键盘操作：左右方向键切换，Home/End 到首尾
function onKeydown(event: KeyboardEvent) {
  const last = props.items.length - 1
  const next = { ArrowLeft: active.value - 1, ArrowRight: active.value + 1, Home: 0, End: last }[event.key]
  if (next === undefined) return
  event.preventDefault()
  active.value = next < 0 ? last : next > last ? 0 : next
  tabs.value[active.value]?.focus()
}
</script>

<template>
  <div class="showcase">
    <div class="showcase-tabs" role="tablist" aria-label="界面截图" @keydown="onKeydown">
      <button
        v-for="(item, i) in items"
        :key="item.src"
        ref="tabs"
        type="button"
        role="tab"
        :id="`showcase-tab-${i}`"
        :aria-selected="i === active"
        aria-controls="showcase-panel"
        :tabindex="i === active ? 0 : -1"
        class="showcase-tab"
        :class="{ active: i === active }"
        @click="active = i"
      >
        {{ item.title }}
      </button>
    </div>
    <figure id="showcase-panel" class="showcase-panel" role="tabpanel" tabindex="0" :aria-labelledby="`showcase-tab-${active}`">
      <img
        :src="withBase(current.src)"
        :alt="current.title"
        :width="current.width ?? 1440"
        :height="current.height ?? 900"
        loading="lazy"
        decoding="async"
      />
      <figcaption v-if="current.desc">{{ current.desc }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
/* 页面很宽时截图不跟着放大，居中 */
.showcase {
  max-width: 1120px;
  margin: 0 auto;
}

.showcase-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.showcase-tab {
  padding: 4px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  font-size: 14px;
  line-height: 24px;
  color: var(--vp-c-text-2);
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.showcase-tab:hover {
  color: var(--vp-c-text-1);
}

.showcase-tab.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.showcase-panel {
  margin: 20px 0 0;
}

.showcase-panel img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.showcase-panel figcaption {
  margin-top: 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>
