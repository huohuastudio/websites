<script setup lang="ts">
import { SxShot, isFlat, pinProgress, seg, smooth, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'

// 从下单到售后：流程线随滚动画出，到哪一步点亮哪一步，下方的说明和截图随之切换。
// 不固定舞台时隐藏流程线，七个步骤按顺序排下来

interface Step {
  /** 流程线上的名称 */
  n: string
  h: string
  p: string
  /** 截图（public/screenshots 中的文件名，不含 -light.webp、-dark.webp） */
  shot: string
  alt: string
}

const STEPS: Step[] = [
  {
    n: '套餐',
    h: '创建套餐',
    p: '设定 CPU、内存、磁盘、带宽和流量，选择可用节点后上架。套餐分为虚拟机和容器两种类型，可以按小时、月、季、年计费；按小时计费的实例从余额实时扣费。',
    shot: 'plans',
    alt: '套餐列表：配置、价格、库存和地区',
  },
  {
    n: '订单',
    h: '用户下单',
    p: '新购、续费、升级、附加 IP 和流量包都会生成订单。管理员可以按类型和状态筛选订单，也可以在后台代客下单。',
    shot: 'orders',
    alt: '订单：新购、续费、升级订单的列表和筛选',
  },
  {
    n: '支付',
    h: '在线支付',
    p: '支持支付宝、微信支付、Stripe、PayPal 和易支付，也可以用余额支付。其他渠道可以用插件接入。',
    shot: 'payments',
    alt: '支付记录：各渠道的支付流水',
  },
  {
    n: '开通实例',
    h: '自动开通',
    p: '支付成功后，系统创建异步任务：创建实例、配置网络、分配 IP。用户在实例详情页的第一屏就能看到 IP、用户名、密码和 SSH 命令。',
    shot: 'instance',
    alt: '实例详情：运行状态、资源用量和常用操作',
  },
  {
    n: '续费和升级',
    h: '续费和升级',
    p: '用户可以自助续费和升级配置。开启自动续费后，余额充足时系统在到期前 1 天自动续费；到期未续费的实例按设置的宽限天数先冻结、再删除。',
    shot: 'lifecycle',
    alt: '到期处理设置：提醒、冻结和删除的宽限天数',
  },
  {
    n: '工单',
    h: '工单',
    p: '用户提交工单时可以关联一个实例，管理员在工单详情中直接看到实例的运行状态和 IP。支持部门分类、指派、SLA 响应时限和邮件回复。',
    shot: 'ticket',
    alt: '工单详情：对话、关联的实例和工单属性',
  },
  {
    n: '发票',
    h: '发票',
    p: '用户自助申请，管理员审核后在外部系统开票，再上传电子发票。用户在线查看和下载。',
    shot: 'invoices',
    alt: '发票：待审核、待开票、已开票和已驳回的申请',
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
}, root)
</script>

<template>
  <section id="flow" ref="root" class="sx-pin sx-alt flow">
    <div class="sx-stage sx-stage-top">
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
          <div class="fvis">
            <div class="crop sx-fade-rb">
              <SxShot :src="`/screenshots/${s.shot}`" :width="2048" :height="1280" :alt="s.alt" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.flow {
  --sx-run: 490vh;
}

.sx-stage {
  display: flex;
  flex-direction: column;
}

.sx-lead,
.fpane p {
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.sx-head .sx-lead {
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

/* 截图面板：16:10，截图左、上留边，延伸到右边和底边 */
.fvis {
  position: relative;
  justify-self: end;
  width: min(100%, calc((var(--sx-vh) - 248px - var(--sx-stage-pad) - var(--sx-stage-gap)) * 1.6));
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

/* 截图放大取景，显示左上部分（窄屏放得更大），文字才看得清 */
.crop :deep(img) {
  width: var(--zw, 150%);
  max-width: none;
  height: auto;
}

/* 矮视口：步骤条收紧，面板改用较小的留边 */
@media (max-height: 832px) and (min-width: 761px) {
  .rail {
    margin-bottom: 26px;
  }

  .fvis {
    --gut: 24px;
    width: min(100%, calc((var(--sx-vh) - 230px - var(--sx-stage-pad) - var(--sx-stage-gap)) * 1.6));
  }
}

/* 平板竖屏等较窄的宽度：文字在上、截图在下 */
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
    width: min(100%, calc((var(--sx-vh) - 508px - var(--sx-stage-pad) - var(--sx-stage-gap)) * 1.6));
  }
}

/* 不固定舞台：隐藏流程线，步骤按顺序排下来 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
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
    --zw: 190%;
  }

  .fpane {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .fpane h3 {
    font-size: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fpane,
  .rs,
  .rs i {
    transition: none;
  }
}
</style>
