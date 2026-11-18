<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 高可用：节点 A 离线后，开启了高可用保护的实例沿弧线移到同组的健康节点，未开启的留在原处。
// 固定舞台时按舞台进度；不固定时按示意图经过视口的进度；减少动态效果时直接显示结果

const NODES = ['节点 A', '节点 B', '节点 C']

/** 实例：from、to 为槽位序号（节点 A 0–2，B 3–5，C 6–8） */
const INSTANCES = [
  { name: '实例 1', prot: true, from: 0, to: 5 },
  { name: '实例 2', prot: true, from: 1, to: 7 },
  { name: '实例 3', prot: false, from: 2, to: 2 },
  { name: '实例 4', prot: true, from: 3, to: 3 },
  { name: '实例 5', prot: false, from: 4, to: 4 },
  { name: '实例 6', prot: true, from: 6, to: 6 },
]
/** 需要迁移的实例在 INSTANCES 中的序号，按顺序依次移动 */
const MOVERS = INSTANCES.flatMap((inst, i) => (inst.from !== inst.to ? [i] : []))

const CAPTIONS = [
  '节点组中的三个节点都在线',
  '节点 A 离线',
  '实例 1 迁移到节点 B，实例 2 迁移到节点 C；实例 3 未开启保护，留在节点 A',
]

const root = ref<HTMLElement>()
const grp = ref<HTMLElement>()
// 槽位和实例的元素，按序号存放（嵌套的 v-for 中 ref 数组的顺序没有保证，所以用函数 ref）
const slots: HTMLElement[] = []
const insts: HTMLElement[] = []

const down = ref(false)
const phase = ref(0)
const caption = ref(0)

function update(still: boolean) {
  const flat = isFlat()
  const p = still ? 1 : flat ? viewProgress(grp.value!, innerHeight * 0.9, innerHeight * 0.15) : pinProgress(root.value!)
  down.value = p >= 0.24
  // 先读完所有槽位的位置再写，避免每写一个实例就重新计算一次布局
  const base = grp.value!.getBoundingClientRect()
  const rects = slots.map((el) => el.getBoundingClientRect())
  INSTANCES.forEach((inst, i) => {
    const el = insts[i]
    const a = rects[inst.from]
    const b = rects[inst.to]
    const k = MOVERS.indexOf(i)
    const t = k < 0 ? 0 : smooth(seg(p, 0.5 + k * 0.12, 0.68 + k * 0.12))
    const arc = Math.sin(t * Math.PI) * -36
    el.style.setProperty('--x', `${a.left - base.left + (b.left - a.left) * t}px`)
    el.style.setProperty('--y', `${a.top - base.top + (b.top - a.top) * t + arc}px`)
    el.style.width = `${a.width}px`
  })
  // 不固定时三段说明全部显示，不切换
  if (!flat) phase.value = p < 0.24 ? 0 : p < 0.5 ? 1 : 2
  caption.value = p >= 0.8 ? 2 : p >= 0.24 ? 1 : 0
}

const refresh = useScrollFrame(update, root)

// 实例按槽位的像素位置摆放：示意图尺寸变化（字体载入、窗口缩放）时重新计算；减少动态效果时也要算
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(refresh)
  observer.observe(grp.value!)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section id="ha" ref="root" class="sx-pin ha">
    <div class="sx-stage">
      <div class="side">
        <div class="steps">
          <div class="s" :class="{ on: phase === 0 }">
            <h2 class="sx-title"><span class="nw">高可用与</span><span class="nw">自动疏散</span><span class="sx-badge">授权版</span></h2>
            <p>节点组启用集群模式和高可用后，可以在实例详情页为每个实例单独开启「高可用保护」。</p>
          </div>
          <div class="s" :class="{ on: phase === 1 }">
            <h2 class="sx-title">节点 A 离线</h2>
            <p>系统检测到故障，在同一节点组中查找健康节点。</p>
          </div>
          <div class="s" :class="{ on: phase === 2 }">
            <h2 class="sx-title"><span class="nw">开启了保护的实例</span><span class="nw">迁移到健康节点</span></h2>
            <p>未开启保护的实例留在原节点。疏散在后台异步执行，进度和日志在「任务管理」中查看。同组没有健康节点时，系统发出告警通知，等待人工处理。</p>
          </div>
        </div>
        <div class="legend"><span><i />已开启高可用保护</span><span><i class="np" />未开启</span></div>
      </div>
      <div>
        <div ref="grp" class="grp">
          <div class="grp-h"><b>节点组</b><small><span>集群模式</span><span>高可用</span></small></div>
          <div class="nodes3">
            <div v-for="(node, n) in NODES" :key="node" class="hnode" :class="{ down: n === 0 && down }">
              <h4>{{ node }}</h4>
              <div class="st"><i /><span>{{ n === 0 && down ? '离线' : '在线' }}</span></div>
              <div v-for="s in 3" :key="s" :ref="(el) => (slots[n * 3 + s - 1] = el as HTMLElement)" class="hslot" />
            </div>
          </div>
          <div
            v-for="(inst, i) in INSTANCES"
            :key="inst.name"
            :ref="(el) => (insts[i] = el as HTMLElement)"
            class="inst"
            :class="{ prot: inst.prot, stuck: !inst.prot && inst.from < 3 && down }"
          >
            {{ inst.name }}
            <svg v-if="inst.prot" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" role="img" aria-label="已开启高可用保护"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" /></svg>
          </div>
        </div>
        <p class="hcap">{{ CAPTIONS[caption] }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ha {
  --sx-run: 340vh;
}

.sx-stage {
  display: grid;
  grid-template-columns: 4fr 7fr;
  gap: 64px;
  align-items: center;
  padding-inline: max(24px, calc((100vw - 1080px) / 2));
}

.steps {
  position: relative;
  min-height: 270px;
}

.s {
  position: absolute;
  inset: 0 0 auto;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.5s, transform 0.5s var(--sx-ease);
}

.s.on {
  opacity: 1;
  transform: none;
}

.s .sx-title {
  font-size: clamp(28px, 2.8vw, 40px);
  line-height: 1.1;
}

.s p {
  margin: 16px 0 0;
  color: var(--sx-text-2);
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--sx-line);
  color: var(--sx-text-2);
  font-size: 15px;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend i {
  display: inline-block;
  width: 22px;
  height: 16px;
  border-radius: 5px;
  background: var(--sx-panel);
}

.legend i.np {
  background: var(--sx-alt);
  box-shadow: inset 0 0 0 1px var(--sx-line);
}

/* 节点组示意图：节点状态的绿色、红色只用在这里 */
.grp {
  --ok: #1f9d55;
  --down: #d93036;

  position: relative;
  padding: 26px;
  border-radius: 28px;
  background: var(--sx-alt);
}

.dark .grp {
  --ok: #3dd68c;
  --down: #ff6369;
}

.grp-h {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.grp-h b {
  font-size: 17px;
  font-weight: 600;
}

.grp-h small {
  display: flex;
  gap: 8px;
}

.grp-h small span {
  padding: 3px 10px;
  border-radius: 980px;
  background: var(--sx-tile);
  color: var(--sx-text-2);
  font-size: 13px;
}

.nodes3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.hnode {
  padding: 16px 14px 14px;
  border-radius: 18px;
  background: var(--sx-tile);
  box-shadow: inset 0 0 0 1px transparent;
  transition: box-shadow 0.4s;
}

.hnode h4 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.6;
}

.st {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: var(--sx-text-2);
  font-size: 13px;
  transition: color 0.4s;
}

.st i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ok);
  transition: background-color 0.4s;
}

.hnode.down {
  box-shadow: inset 0 0 0 2px var(--down);
}

.hnode.down .st {
  color: var(--down);
}

.hnode.down .st i {
  background: var(--down);
}

.hslot {
  height: 46px;
  margin-top: 8px;
  border: 1px dashed color-mix(in srgb, var(--sx-text-3) 45%, transparent);
  border-radius: 10px;
}

.inst {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: 46px;
  padding: 0 12px;
  border-radius: 10px;
  background: var(--sx-alt);
  box-shadow: inset 0 0 0 1px var(--sx-line);
  font-size: 14px;
  white-space: nowrap;
  transform: translate(var(--x, 0px), var(--y, 0px));
  transition: opacity 0.4s, color 0.4s;
}

.inst.prot {
  background: var(--sx-panel);
  box-shadow: none;
}

.inst svg {
  flex: none;
  color: var(--sx-text-2);
}

.inst.stuck {
  color: var(--sx-text-3);
}

.hcap {
  min-height: 1.6em;
  margin: 16px 0 0;
  color: var(--sx-text-2);
  font-size: 15px;
  text-align: center;
  text-wrap: balance;
}

@media (max-height: 832px) and (min-width: 761px) {
  .steps {
    min-height: 240px;
  }

  .grp {
    padding: 20px;
  }

  .hslot,
  .inst {
    height: 40px;
  }
}

/* 不固定舞台：说明和示意图上下排列，三段说明全部显示 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .sx-stage {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .steps {
    min-height: 0;
  }

  .s {
    position: static;
    margin-bottom: 20px;
    opacity: 1;
    transform: none;
  }

  .s .sx-title {
    font-size: clamp(26px, 6vw, 36px);
  }

  .s:first-child .sx-title {
    font-size: clamp(34px, 4.6vw, 56px);
  }
}

@media (max-width: 760px) {
  .grp {
    padding: 16px;
    border-radius: 22px;
  }

  .grp-h b {
    font-size: 15px;
  }

  .nodes3 {
    gap: 8px;
  }

  .hnode {
    padding: 12px 8px 10px;
    border-radius: 14px;
  }

  .hnode h4 {
    font-size: 15px;
  }

  .st {
    font-size: 12px;
  }

  .inst {
    padding: 0 8px;
    font-size: 12.5px;
  }

  .inst svg {
    width: 12px;
    height: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .s,
  .hnode,
  .st,
  .st i,
  .inst {
    transition: none;
  }
}
</style>
