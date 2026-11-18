<script setup lang="ts">
import { SxShot, isFlat, pinProgress, prefersReducedMotion, seg, smooth, stageTop, useScrollFrame } from '@huohuastudio/theme/showcase'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 运营：竖向滚动推动卡片横向移动

/** 截图卡片：public/screenshots 中的文件名（不含 -light.webp、-dark.webp） */
const shots = [
  { src: 'orders', h: '套餐和订单', p: '出售会员（角色组）套餐和容量套餐，支持优惠券。', alt: '后台的订单管理：套餐、金额和支付状态' },
  {
    src: 'payments',
    h: '在线支付',
    p: '支持支付宝、微信支付、银联、PayPal、Stripe 和易支付。在角色组中勾选可用的支付驱动，该组的用户下单时才能使用。',
    alt: '后台的支付驱动列表',
  },
  { src: 'ticket', h: '工单', p: '用户提交工单，管理员在后台查看对话并回复。', alt: '后台的工单详情：用户与管理员的对话' },
]

const sec = ref<HTMLElement>()
const track = ref<HTMLElement>()
const bar = ref<HTMLElement>()
/** 卡片需要横向移动的总距离 */
let dist = 0

/** 按卡片总宽度设定版块高度：横向移动多少，就多给多少滚动距离，另加约一屏用于开头和结尾的停顿 */
function layout() {
  const el = sec.value!
  if (prefersReducedMotion() || isFlat()) {
    el.style.height = ''
    dist = 0
    return
  }
  const t = track.value!
  const pad = parseFloat(getComputedStyle(t).paddingLeft)
  dist = Math.max(0, t.offsetWidth + pad - document.documentElement.clientWidth)
  el.style.height = `${innerHeight - stageTop(el) + dist + innerHeight * 0.9}px`
}

// 先于 useScrollFrame 注册，第一次计算进度时高度已经设好
onMounted(() => {
  layout()
  addEventListener('resize', layout)
})
onBeforeUnmount(() => removeEventListener('resize', layout))

useScrollFrame((still) => {
  if (still || isFlat()) {
    track.value!.style.setProperty('--tx', '0px')
    return
  }
  // 以减少动态效果打开、之后关闭这个设置时，还没有按卡片宽度设定版块高度
  if (!dist) layout()
  // 开头停留一段，让仪表盘完整显示；结尾留一小段停顿
  const p = smooth(seg(pinProgress(sec.value!), 0.3, 0.92))
  track.value!.style.setProperty('--tx', `${-p * dist}px`)
  bar.value!.style.setProperty('--t', String(p))
}, sec)
</script>

<template>
  <section id="ops" ref="sec" class="sx-pin ops">
    <div class="sx-stage">
      <div class="sx-wrap sx-head">
        <h2 class="sx-title"><span class="ph">对外提供</span><span class="ph">图床服务</span></h2>
        <p class="sx-lead">套餐、订单、优惠券、在线支付、工单、公告和举报管理都在程序中，可以直接对外提供服务。</p>
      </div>
      <div class="view">
        <div ref="track" class="track">
          <div class="oc wide">
            <div class="t">
              <h3>管理后台</h3>
              <p>用户、角色组、储存和各类驱动，都在后台管理。</p>
            </div>
            <div class="v sx-fade-rb">
              <SxShot src="/screenshots/dashboard" :width="1600" :height="1000" alt="管理后台的仪表板" />
            </div>
          </div>
          <div v-for="c in shots" :key="c.src" class="oc shot">
            <div class="t">
              <h3>{{ c.h }}</h3>
              <p>{{ c.p }}</p>
            </div>
            <div class="v sx-fade-rb">
              <SxShot :src="`/screenshots/${c.src}`" :width="1600" :height="1000" :alt="c.alt" />
            </div>
          </div>
          <div class="col">
            <div class="oc sm">
              <div class="t">
                <h3>反馈、举报和公告</h3>
                <p>处理意见反馈和举报，发布公告和独立页面。</p>
              </div>
              <div class="chips"><span>意见反馈</span><span>举报管理</span><span>违规记录</span><span>公告</span><span>独立页面</span></div>
            </div>
            <div class="oc sm">
              <div class="t">
                <h3>短信和邮件</h3>
                <p>国内外 30 多种短信服务；邮件支持 SMTP、Mailgun、Postmark 和 Amazon SES。前一个驱动发送失败时自动换下一个。</p>
              </div>
              <div class="chips"><span>驱动 1<small class="x">发送失败</small></span><span>驱动 2<small class="y">已发送</small></span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="bar" aria-hidden="true"><i ref="bar" /></div>
    </div>
  </section>
</template>

<style scoped>
.ops {
  --sx-run: 300vh;
}

.sx-stage {
  display: flex;
  flex-direction: column;
  padding-top: 40px;
}

.sx-head {
  margin-bottom: 36px;
}

.view {
  flex: none;
}

.track {
  --oh: clamp(330px, calc(var(--sx-vh) - 258px), 620px);
  display: flex;
  gap: 20px;
  width: max-content;
  padding-left: max(24px, calc((100vw - 1080px) / 2));
  transform: translateX(var(--tx, 0px));
}

.oc {
  display: flex;
  flex: none;
  flex-direction: column;
  width: min(400px, 78vw);
  height: var(--oh);
  overflow: hidden;
  border-radius: 28px;
  background: var(--sx-alt);
}

.oc .t {
  padding: 28px 30px 0;
}

.oc h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.oc p {
  margin: 8px 0 0;
  color: var(--sx-text-2);
  font-size: 15px;
  line-height: 1.55;
}

/* 截图卡片：截图延伸到卡片右边和底边，卡片用面板色 */
.oc.wide,
.oc.shot {
  background: var(--sx-panel);
}

.oc.shot {
  width: min(480px, 78vw);
}

.oc.wide {
  width: min(calc((var(--oh) - 80px) * 1.6 + 32px), calc(92vw - 48px));
}

.oc.wide .t {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 28px 32px 0;
}

.oc.wide h3 {
  font-size: 21px;
}

.oc.wide p {
  margin: 0;
}

.v {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin: 24px 0 0 32px;
  border-radius: 14px 0 0 0;
}

.v :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left top;
}

.col {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 20px;
  width: min(400px, 78vw);
  height: var(--oh);
}

.oc.sm {
  flex: 1;
  justify-content: space-between;
  width: auto;
  height: auto;
  min-height: 0;
}

.oc.sm .t {
  padding: 24px 26px 0;
}

.oc.sm h3 {
  font-size: 21px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 26px 24px;
}

.chips span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 13px;
  border-radius: 980px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  font-size: 14px;
  white-space: nowrap;
}

.chips small {
  font-size: 12px;
}

.chips .x {
  color: var(--ls-bad);
}

.chips .y {
  color: var(--ls-ok);
}

.bar {
  width: min(1032px, calc(100vw - 48px));
  height: 3px;
  margin: 28px auto 0;
  overflow: hidden;
  border-radius: 3px;
  background: var(--sx-line);
}

.bar i {
  display: block;
  width: calc(var(--t, 0) * 100%);
  height: 100%;
  background: var(--sx-text);
}

/* 矮视口：标题区和卡片收紧 */
@media (max-height: 832px) and (min-width: 761px) {
  .sx-stage {
    padding-top: 16px;
  }

  .sx-head {
    margin-bottom: 18px;
  }

  .oc.sm p {
    font-size: 14px;
  }

  .oc.sm .t {
    padding: 20px 22px 0;
  }

  .oc.sm h3 {
    font-size: 19px;
  }

  .chips {
    gap: 6px;
    padding: 12px 22px 18px;
  }

  .chips span {
    padding: 4px 11px;
    font-size: 13px;
  }

  .bar {
    margin-top: 18px;
  }
}

/* 不固定舞台、减少动态效果：卡片排成网格 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .sx-stage {
    display: block;
  }

  .track {
    --oh: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    width: auto;
    max-width: 1080px;
    margin: 0 auto;
    padding-inline: 24px;
    transform: none;
  }

  .oc,
  .oc.shot,
  .col {
    width: auto;
    height: auto;
    min-height: 0;
  }

  .oc.sm {
    flex: none;
  }

  .oc.wide {
    grid-column: 1 / -1;
    width: auto;
  }

  .v {
    flex: none;
    aspect-ratio: 16 / 10;
  }

  .bar {
    display: none;
  }
}

@media (max-width: 760px) {
  .oc.wide .t {
    flex-direction: column;
    gap: 4px;
    padding: 22px 20px 0;
  }

  .v {
    margin: 18px 0 0 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .track {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>
