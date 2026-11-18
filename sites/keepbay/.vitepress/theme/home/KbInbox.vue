<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame } from '@huohuastudio/theme/showcase'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 收件箱自动整理：三个文件随滚动依次从收件箱飞进目标文件夹，到达后显示所用的规则，最后出现"撤销"提示。
// 舞台不固定时文件直接放在目标文件夹中；窄屏不显示飞行的文件，规则和提示直接显示
const files = [
  { type: 'PDF', name: '2026-03 洗衣机发票.pdf' },
  { type: 'JPG', name: 'IMG_20260314_101522.jpg' },
  { type: 'PDF', name: '车险保单-续保.pdf' },
]
const dests = [
  { folder: '家庭文档/票据', rule: '规则：名称包含"发票"' },
  { folder: '家庭相册/2026/03', rule: '规则：图片，按年和月分子文件夹' },
  { folder: '家庭文档/保险', rule: 'AI 建议，经您确认后移动' },
]

const root = ref<HTMLElement>()
const sort = ref<HTMLElement>()
const undo = ref<HTMLElement>()
const chips: HTMLElement[] = []
const fromSlots: HTMLElement[] = []
const toSlots: HTMLElement[] = []
const rules: HTMLElement[] = []

/** 按进度 p 摆放三个文件。 */
function update(p: number) {
  const base = sort.value!.getBoundingClientRect()
  chips.forEach((chip, i) => {
    const t = smooth(seg(p, 0.12 + i * 0.22, 0.3 + i * 0.22))
    const from = fromSlots[i].getBoundingClientRect()
    const to = toSlots[i].getBoundingClientRect()
    // 飞行途中向上拱起
    const arc = Math.sin(t * Math.PI) * -40
    chip.style.setProperty('--tx', `${from.left - base.left + (to.left - from.left) * t}px`)
    chip.style.setProperty('--ty', `${from.top - base.top + (to.top - from.top) * t + arc}px`)
    chip.style.width = `${fromSlots[i].offsetWidth + (toSlots[i].offsetWidth - fromSlots[i].offsetWidth) * t}px`
    rules[i].style.setProperty('--ro', String(seg(t, 0.8, 1)))
  })
  undo.value!.style.setProperty('--uo', String(seg(p, 0.82, 0.92)))
}

// 减少动态效果时 useScrollFrame 只调用一次，窗口大小变化后要重新摆放
let still = false
const onResize = () => still && update(1)
onMounted(() => addEventListener('resize', onResize))
onBeforeUnmount(() => removeEventListener('resize', onResize))

useScrollFrame((s) => {
  still = s
  update(s || isFlat() ? 1 : pinProgress(root.value!))
})
</script>

<template>
  <section ref="root" class="sx-pin inbox">
    <div class="sx-stage">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title">收件箱自动整理<span class="sx-badge">专业版</span></h2>
        <p class="sx-lead">新文件先放进收件箱，按您定的规则或 AI 的建议归档。只整理收件箱，不改动其他文件夹。</p>
      </div>
      <div ref="sort" class="sort">
        <div class="panel source">
          <h4>收件箱</h4>
          <div v-for="(f, i) in files" :key="f.name" :ref="(el) => (fromSlots[i] = el as HTMLElement)" class="slot" />
        </div>
        <div class="dests">
          <div v-for="(d, i) in dests" :key="d.folder" class="dest">
            <div class="panel">
              <h4>{{ d.folder }}</h4>
              <div :ref="(el) => (toSlots[i] = el as HTMLElement)" class="slot" />
            </div>
            <p :ref="(el) => (rules[i] = el as HTMLElement)" class="rule">{{ d.rule }}</p>
          </div>
        </div>
        <div v-for="(f, i) in files" :key="f.name" :ref="(el) => (chips[i] = el as HTMLElement)" class="chip">
          <b>{{ f.type }}</b>{{ f.name }}
        </div>
      </div>
      <div ref="undo" class="undo">已整理 3 个文件<span>撤销</span></div>
    </div>
  </section>
</template>

<style scoped>
.inbox {
  height: 210vh;
}

.sx-stage {
  padding-top: 28px;
}

.sort {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 72px;
  width: min(1000px, 88vw);
  margin: 0 auto;
}

.panel {
  padding: 22px;
  border-radius: 24px;
  background: var(--sx-alt);
}

h4 {
  margin: 0 0 14px;
  color: var(--sx-text-2);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.6;
}

.slot {
  height: 52px;
  margin-bottom: 10px;
  border-radius: 12px;
}

.source .slot {
  border: 1px dashed color-mix(in srgb, var(--sx-text-3) 55%, transparent);
}

.dests {
  display: grid;
  gap: 16px;
}

.dest .slot {
  background: var(--sx-tile);
}

.rule {
  min-height: 1.5em;
  margin: -2px 0 0;
  color: var(--sx-text-2);
  font-size: 14px;
  opacity: var(--ro, 0);
  transition: opacity 0.4s;
}

/* 飞行的文件：位置由脚本按收件箱和目标文件夹中空位的位置算出 */
.chip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  font-size: 15px;
  white-space: nowrap;
  transform: translate(var(--tx, 0px), var(--ty, 0px));
}

.chip b {
  display: grid;
  place-items: center;
  flex: none;
  width: 26px;
  height: 32px;
  border-radius: 5px;
  background: var(--sx-alt);
  box-shadow: inset 0 0 0 1px var(--sx-line);
  color: var(--sx-text-2);
  font-size: 9px;
  font-weight: 600;
}

.undo {
  display: flex;
  align-items: center;
  gap: 16px;
  width: max-content;
  margin: 28px auto 0;
  padding: 12px 14px 12px 22px;
  border-radius: 980px;
  background: var(--sx-text);
  color: var(--sx-bg);
  font-size: 15px;
  opacity: var(--uo, 0);
  transform: translateY(calc((1 - var(--uo, 0)) * 16px));
}

.undo span {
  padding: 6px 14px;
  border-radius: 980px;
  background: color-mix(in srgb, var(--sx-bg) 18%, transparent);
}

@media (max-height: 920px) {
  .sx-head {
    margin-bottom: 24px;
  }

  .slot,
  .chip {
    height: 42px;
  }

  .panel {
    padding: 14px 16px;
  }

  h4 {
    margin-bottom: 8px;
  }

  .dests {
    gap: 10px;
  }

  .undo {
    margin-top: 16px;
  }
}

@media (max-height: 820px) and (min-width: 761px) {
  .sx-stage {
    padding-top: 12px;
  }
}

@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .inbox {
    height: auto;
  }

  .sx-stage {
    padding-top: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sx-stage {
    padding-top: 96px;
  }
}

/* 手机：不显示飞行的文件，规则和提示直接显示 */
@media (max-width: 760px) {
  .sort {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .chip {
    display: none;
  }

  .rule,
  .undo {
    opacity: 1;
    transform: none;
  }
}
</style>
