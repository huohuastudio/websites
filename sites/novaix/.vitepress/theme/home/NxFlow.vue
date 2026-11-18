<script setup lang="ts">
import { isFlat, pinProgress, seg, smooth, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'

// 从下单到售后：流程线随滚动画出，到哪一步点亮哪一步，下方的说明和示意随之切换。
// 不固定舞台时隐藏流程线，七个步骤按顺序排下来

interface Board {
  /** 面板的小标题 */
  k: string
  /** 大字的一组词；cycle 时依次高亮 */
  big?: string[]
  cycle?: boolean
  /** 状态流转 */
  chain?: string[]
  /** 第二个小标题，跟在状态流转后面 */
  k2?: string
  /** 两列的说明行 */
  rows?: [string, string][]
  /** 底部的补充说明，一项一行 */
  foot?: string[]
}

interface Step {
  /** 流程线上的名称 */
  n: string
  h: string
  p: string
  shot?: { src: string; alt: string }
  board?: Board
}

const STEPS: Step[] = [
  {
    n: '套餐',
    h: '创建套餐',
    p: '设定 CPU、内存、磁盘、带宽和流量，选择可用节点后上架。套餐分为虚拟机和容器两种类型。',
    board: { k: '计费周期', big: ['按小时', '月付', '季付', '年付'], foot: ['按小时计费的实例，按使用时长从余额实时扣费。'] },
  },
  {
    n: '订单',
    h: '用户下单',
    p: '新购、续费、升级、附加 IP 和流量包都会生成订单。管理员可以按类型和状态筛选订单，也可以在后台代客下单。',
    shot: { src: '/screenshots/orders.webp', alt: '订单：新购、续费、升级订单的列表和筛选' },
  },
  {
    n: '支付',
    h: '在线支付',
    p: '支持支付宝、微信支付、Stripe、PayPal 和易支付，也可以用余额支付。其他渠道可以用插件接入。',
    board: {
      k: '支付渠道',
      big: ['支付宝', '微信支付', 'Stripe', 'PayPal', '易支付'],
      cycle: true,
      foot: ['易支付兼容彩虹易支付和 ZPAY。手续费可以设为不收取、固定金额或按比例。'],
    },
  },
  {
    n: '开通实例',
    h: '自动开通',
    p: '支付成功后，系统创建异步任务：创建实例、配置网络、分配 IP。用户在实例详情页的第一屏就能看到 IP、用户名、密码和 SSH 命令。',
    shot: { src: '/screenshots/instance.webp', alt: '实例详情：运行状态、资源用量和常用操作' },
  },
  {
    n: '续费和升级',
    h: '续费和升级',
    p: '用户可以自助续费和升级配置。开启自动续费后，余额充足时系统在到期前 1 天自动续费。',
    board: {
      k: '到期处理',
      rows: [
        ['到期前 3 天', '发送邮件，提醒用户续费'],
        ['到期前 1 天', '余额充足时自动续费'],
        ['到期后', '按暂停宽限天数冻结实例，默认 0 天'],
        ['冻结之后', '超过删除宽限天数自动删除，默认 7 天'],
      ],
    },
  },
  {
    n: '工单',
    h: '工单',
    p: '用户提交工单时可以关联一个实例，管理员在工单详情中直接看到实例的运行状态和 IP。支持部门分类、指派和邮件回复。',
    board: {
      k: '工单状态',
      chain: ['待处理', '已回复', '用户回复', '已关闭'],
      k2: 'SLA 默认响应时限',
      rows: [
        ['高优先级', '60 分钟'],
        ['中优先级', '4 小时'],
        ['低优先级', '24 小时'],
      ],
    },
  },
  {
    n: '发票',
    h: '发票',
    p: '用户自助申请，管理员审核后在外部系统开票，再上传电子发票。用户在线查看和下载。',
    board: {
      k: '发票状态',
      chain: ['待审核', '待开票', '已开票'],
      foot: ['审核未通过时为「已驳回」，用户可以查看驳回原因。', '最低开票金额默认 100 元，可以修改。'],
    },
  },
]

const root = ref<HTMLElement>()
/** 当前点亮的步骤 */
const on = ref(0)
/** 流程线画到的位置，0–1 */
const line = ref(0)

useScrollFrame((still) => {
  if (still || isFlat()) return
  // 每一步占一段：前 30% 把线从上一步画到这一步，然后这一步点亮、内容切换
  const f = seg(pinProgress(root.value!), 0.03, 0.97) * STEPS.length
  const i = Math.min(STEPS.length - 1, Math.floor(f))
  const k = i === 0 ? 1 : smooth(seg(f - i, 0, 0.3))
  line.value = i === 0 ? 0 : (i - 1 + k) / (STEPS.length - 1)
  on.value = k >= 1 ? i : i - 1
})
</script>

<template>
  <section id="flow" ref="root" class="sx-pin sx-alt flow">
    <div class="sx-stage">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title">从下单到售后</h2>
        <p class="sx-lead">套餐、订单、支付、开通、续费、工单和发票都在系统内完成，不需要另外的财务系统。</p>
      </div>
      <div class="rail" :style="{ '--lp': line }" aria-hidden="true">
        <span class="fill" />
        <div v-for="(s, j) in STEPS" :key="s.n" class="rs" :class="{ on: j === on, done: j < on }"><i />{{ s.n }}</div>
      </div>
      <div class="fpanel">
        <div v-for="(s, j) in STEPS" :key="s.n" class="fpane" :class="{ on: j === on }">
          <div class="ftxt">
            <div class="num">{{ j + 1 }} / {{ STEPS.length }}</div>
            <h3>{{ s.h }}</h3>
            <p>{{ s.p }}</p>
          </div>
          <div class="fvis" :class="{ tall: !s.shot }">
            <div v-if="s.shot" class="crop sx-fade-rb">
              <img :src="s.shot.src" width="2048" height="1280" :alt="s.shot.alt" loading="lazy" />
            </div>
            <div v-else-if="s.board" class="board">
              <div class="k">{{ s.board.k }}</div>
              <div v-if="s.board.big" class="big" :class="{ cyc: s.board.cycle }">
                <span
                  v-for="(w, n) in s.board.big"
                  :key="w"
                  :class="{ k1: !s.board.cycle }"
                  :style="s.board.cycle ? { animationDelay: `${n * 1.2}s` } : undefined"
                >{{ w }}</span>
              </div>
              <div v-if="s.board.chain" class="chain">
                <template v-for="(c, n) in s.board.chain" :key="c">
                  <em v-if="n > 0" />
                  <span>{{ c }}</span>
                </template>
              </div>
              <div v-if="s.board.k2" class="k k2">{{ s.board.k2 }}</div>
              <div v-if="s.board.rows" class="rows">
                <div v-for="[b, t] in s.board.rows" :key="b"><b>{{ b }}</b><span>{{ t }}</span></div>
              </div>
              <div v-if="s.board.foot" class="foot2">
                <template v-for="(t, n) in s.board.foot" :key="n"><br v-if="n > 0" />{{ t }}</template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.flow {
  height: 490vh;
}

.sx-stage {
  display: flex;
  flex-direction: column;
  padding-top: 60px;
}

.sx-head {
  margin-bottom: 40px;
}

.sx-lead,
.fpane p,
.foot2 {
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.sx-head .sx-lead,
.foot2 {
  text-wrap: balance;
}

/* 流程线：底线是浅灰，走过的部分是文字色 */
.rail {
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  width: min(1000px, calc(100vw - 48px));
  margin: 0 auto 44px;
}

.rail::before,
.rail .fill {
  content: '';
  position: absolute;
  top: 7px;
  left: calc(100% / 14);
  right: calc(100% / 14);
  height: 2px;
  border-radius: 2px;
  background: var(--sx-line);
}

.rail .fill {
  background: var(--sx-text);
  transform-origin: 0 0;
  transform: scaleX(var(--lp, 0));
}

.rs {
  position: relative;
  color: var(--sx-text-3);
  font-size: 15px;
  text-align: center;
  transition: color 0.35s;
}

.rs i {
  display: block;
  width: 16px;
  height: 16px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: var(--sx-alt);
  box-shadow: inset 0 0 0 2px var(--sx-text-3);
  transition: background-color 0.35s, box-shadow 0.35s, transform 0.35s var(--sx-ease);
}

.rs.done {
  color: var(--sx-text-2);
}

.rs.done i {
  background: var(--sx-text);
  box-shadow: inset 0 0 0 2px var(--sx-text);
}

.rs.on {
  color: var(--sx-text);
  font-weight: 600;
}

.rs.on i {
  background: var(--sx-text);
  box-shadow: 0 0 0 4px var(--sx-alt), 0 0 0 5px var(--sx-text);
  transform: scale(1.1);
}

.fpanel {
  position: relative;
  flex: 1;
  min-height: 0;
  width: min(1000px, calc(100vw - 48px));
  margin: 0 auto 6vh;
}

.fpane {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 4fr 7fr;
  gap: 56px;
  align-items: center;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.5s, transform 0.6s var(--sx-ease);
  pointer-events: none;
}

.fpane.on {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.num {
  margin-bottom: 8px;
  color: var(--sx-text-3);
  font-size: 15px;
}

.fpane h3 {
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.fpane p {
  margin: 16px 0 0;
  color: var(--sx-text-2);
}

/* 示意面板：16:10，截图左、上留边，延伸到右边和底边 */
.fvis {
  position: relative;
  justify-self: end;
  width: min(100%, calc((var(--sx-vh) - 348px) * 1.6));
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 22px;
  background: var(--sx-panel);
}

.crop {
  position: absolute;
  inset: var(--gut, 32px) 0 0 var(--gut, 32px);
  overflow: hidden;
  border-radius: 14px 0 0 0;
}

.crop img {
  width: 118%;
  max-width: none;
  height: auto;
}

/* 没有截图的步骤：文字面板至少 16:10，内容多时撑高，不裁切（较窄的宽屏上标签会换行） */
.fvis.tall {
  display: flex;
  overflow: visible;
}

.fvis.tall .board {
  position: relative;
  flex: 1;
}

.board {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 7% 8%;
}

.k {
  margin-bottom: 10px;
  color: var(--sx-text-2);
  font-size: 14px;
}

.k2 {
  margin-top: 22px;
}

.big {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15em 0.55em;
  font-size: clamp(26px, 3.4vw, 44px);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.big span {
  color: var(--sx-text-3);
}

.big span.k1 {
  color: var(--sx-text);
}

.cyc span {
  animation: cyc 6s infinite;
}

@keyframes cyc {
  0%,
  18% {
    color: var(--sx-text);
  }

  22%,
  100% {
    color: var(--sx-text-3);
  }
}

.foot2 {
  margin-top: 18px;
  color: var(--sx-text-2);
  font-size: 15px;
}

.rows > div {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 16px;
  padding: 11px 0;
  border-top: 1px solid color-mix(in srgb, var(--sx-text) 12%, transparent);
  font-size: 16px;
  line-height: 1.45;
}

.rows > div:first-child {
  border-top: 0;
}

.rows b {
  font-weight: 600;
}

.rows span {
  color: var(--sx-text-2);
}

.chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 0;
}

.chain span {
  padding: 8px 16px;
  border-radius: 980px;
  background: var(--sx-tile);
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.chain em {
  width: 22px;
  height: 1px;
  background: color-mix(in srgb, var(--sx-text) 30%, transparent);
}

/* 矮视口：标题区收紧，面板改用较小的留边 */
@media (max-height: 832px) and (min-width: 761px) {
  .sx-stage {
    padding-top: 28px;
  }

  .sx-title {
    font-size: clamp(28px, 5.2vh, 42px);
  }

  .sx-head {
    margin-bottom: 20px;
  }

  .sx-head .sx-lead {
    margin-top: 10px;
    font-size: 17px;
  }

  .rail {
    margin-bottom: 26px;
  }

  .fvis {
    --gut: 24px;
    width: min(100%, calc((var(--sx-vh) - 278px) * 1.6));
  }
}

/* 较窄的宽屏（示意面板只有约 440px 宽）：文字面板收紧内边距和字号，内容放得进 16:10 */
@media (max-width: 1100px) and (min-width: 761px) {
  .board {
    padding: 4% 6%;
  }

  .rows > div {
    gap: 12px;
    padding: 6px 0;
    font-size: 14px;
  }

  .chain span {
    padding: 5px 12px;
    font-size: 14px;
  }

  .chain em {
    width: 12px;
  }
}

/* 平板竖屏等较窄的宽度：文字在上、示意在下 */
@media (max-width: 1000px) and (min-width: 761px) and (min-height: 833px) {
  .fpane {
    grid-template-columns: 1fr;
    gap: 20px;
    align-content: center;
    text-align: center;
  }

  .fpane p {
    max-width: 600px;
    margin-inline: auto;
  }

  .fvis {
    justify-self: center;
    width: min(100%, calc((var(--sx-vh) - 608px) * 1.6));
  }

  .board {
    text-align: left;
  }
}

/* 不固定舞台：隐藏流程线，步骤按顺序排下来 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .flow {
    height: auto;
  }

  .rail {
    display: none;
  }

  .fpanel {
    margin-bottom: 0;
  }

  .fpane {
    position: static;
    margin-bottom: 72px;
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .fpane:last-child {
    margin-bottom: 0;
  }

  .fvis {
    width: 100%;
  }
}

@media (max-width: 760px) {
  .fvis {
    --gut: 20px;
  }

  .fpane {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .fpane h3 {
    font-size: 28px;
  }

  .board {
    padding: 6% 7%;
  }

  .big {
    font-size: clamp(22px, 7vw, 30px);
  }

  .rows > div {
    gap: 10px;
    padding: 7px 0;
    font-size: 14px;
  }

  .k {
    margin-bottom: 4px;
    font-size: 13px;
  }

  .foot2 {
    margin-top: 10px;
    font-size: 13px;
  }

  .chain span {
    padding: 5px 11px;
    font-size: 13px;
  }

  .chain em {
    width: 10px;
  }

  .fvis.tall {
    aspect-ratio: auto;
    min-height: 230px;
  }

  .fvis.tall .board {
    position: relative;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fpane,
  .rs,
  .rs i {
    transition: none;
  }

  .cyc span {
    animation: none;
    color: var(--sx-text);
  }
}
</style>
