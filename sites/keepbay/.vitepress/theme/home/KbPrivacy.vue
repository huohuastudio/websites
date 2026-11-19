<script setup lang="ts">
import { clamp01, isFlat, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import KbShot from '../visuals/KbShot.vue'

// 隐私与安全：四张卡片依次压上来（sticky），下面的一张略微缩小、变暗。窄屏时卡片按顺序排下来
const cards = [
  {
    title: '数据在哪里',
    items: [
      ['只在您自己的设备和存储上', '索引、缩略图、设置存在您的服务器上。'],
      ['联网有清单', '检查更新、激活专业版、下载本地模型，以及您自己配置的服务，每种情况发送什么都写在文档里。'],
    ],
    number: '0',
    note: '统计、遥测和崩溃上报。网页也不加载第三方的资源。',
  },
  {
    title: 'AI',
    items: [
      ['优先在本地处理', '本地模型在您的设备上运行，不发送任何数据。'],
      ['云端由您决定', '界面上写明每项功能发送什么；后台自动处理文件的三项功能，还要逐项再允许一次。'],
      ['每次调用都有记录', '发起人、功能、发送的数据类型和费用。'],
    ],
    shot: { name: 'ai-calls-card', alt: 'AI 调用记录：标明本地处理、未发送到云端' },
  },
  {
    title: '家人和访客',
    items: [
      ['按文件夹授权', '成员只看得到授权给他的文件夹。'],
      ['会让数据离开设备的功能默认关闭', '分享链接、云端 AI、离线下载，由所有者为每位成员单独开启。'],
      ['日志', '登录、下载、分享链接的打开和下载都有记录，保留 180 天。'],
    ],
    number: '7',
    unit: '天',
    note: '分享链接默认的有效期。可以另设密码、下载次数和限速。',
  },
  {
    title: '登录和文件处理',
    items: [
      ['安全功能不收费', '两步验证、通行密钥、外部帐号登录都在免费版中。'],
      ['照片在隔离的进程中解码', '即使特制的图片攻破了解码器，也无法读取数据库和密钥。'],
    ],
    shot: { name: 'member-features', alt: '成员的功能设置：会让数据离开设备的功能默认关闭' },
  },
] as const

const root = ref<HTMLElement>()
const cardEls: HTMLElement[] = []

useScrollFrame((still) => {
  if (still || isFlat()) {
    for (const card of cardEls) {
      card.style.removeProperty('--cs')
      card.style.removeProperty('--cd')
    }
    return
  }
  // 先读完所有卡片的位置再写，避免每写一张就重新计算一次布局
  const tops = cardEls.map((card) => card.getBoundingClientRect().top)
  const heights = cardEls.map((card) => card.offsetHeight)
  cardEls.forEach((card, i) => {
    if (i + 1 >= cardEls.length) return
    // 下一张压上来的程度：两张的顶边距离从一张卡片的高度缩到 0
    const p = clamp01(1 - (tops[i + 1] - tops[i]) / heights[i])
    card.style.setProperty('--cs', String(1 - p * 0.08))
    card.style.setProperty('--cd', String(p * 0.08))
  })
}, root)
</script>

<template>
  <section ref="root" class="sx-alt privacy">
    <div class="sx-wrap">
      <div class="sx-head">
        <h2 class="sx-title">隐私与安全</h2>
        <p class="sx-lead">网盘中存放着照片、证件、合同、病历等私密资料，因此隐私与安全是我们设计 Keepbay 时首先考虑的问题。</p>
      </div>
      <div class="cards">
        <div
          v-for="(card, i) in cards"
          :key="card.title"
          :ref="(el) => (cardEls[i] = el as HTMLElement)"
          class="card"
          :style="{ '--i': i }"
        >
          <div class="t">
            <h3>{{ card.title }}</h3>
            <p v-for="[name, text] in card.items" :key="name"><b>{{ name }}</b>{{ text }}</p>
          </div>
          <div class="v">
            <div v-if="'shot' in card" class="crop sx-fade-rb">
              <KbShot :name="card.shot.name" fit :alt="card.shot.alt" />
            </div>
            <template v-else>
              <div class="n">{{ card.number }}<small v-if="'unit' in card">{{ card.unit }}</small></div>
              <div class="k">{{ card.note }}</div>
            </template>
          </div>
        </div>
      </div>
      <p class="note">Keepbay 没有做端到端加密，因为服务端要生成缩略图、提取文字。服务器本身的安全，比如系统更新、防火墙、磁盘加密，仍需由您负责。Keepbay 什么时候联网、发送什么、密钥怎么保存，见<a href="./docs/privacy">隐私与安全</a>。</p>
    </div>
  </section>
</template>

<style scoped>
.privacy {
  padding-block: 120px 160px;
}

.cards {
  position: relative;
}

/* 钉在导航栏下方（导航栏不固定时从视口顶部算起），每张比上一张低 18px */
.card {
  position: sticky;
  top: calc(var(--sx-nav) + 44px + var(--i) * 18px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: min(672px, 76vh);
  margin-bottom: 64px;
  overflow: hidden;
  border-radius: 28px;
  background: var(--sx-card);
  transform: scale(var(--cs, 1));
  transform-origin: 50% 0;
}

.card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #000;
  opacity: var(--cd, 0);
  pointer-events: none;
}

.t {
  display: flex;
  flex-direction: column;
  padding: 48px;
}

h3 {
  margin: 0 0 24px;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.t p {
  margin: 0 0 14px;
  color: var(--sx-text-2);
}

.t b {
  display: block;
  color: var(--sx-text);
  font-weight: 600;
}

.v {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
  overflow: hidden;
  background: var(--sx-panel);
}

.n {
  font-size: clamp(88px, 11vw, 150px);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.05em;
}

.n small {
  margin-left: 6px;
  font-size: 0.3em;
  letter-spacing: -0.01em;
}

.k {
  max-width: 320px;
  margin-top: 14px;
  color: var(--sx-text-2);
}

/* 截图延伸到卡片的右边和底边 */
.crop {
  position: absolute;
  inset: 32px 0 0 32px;
  overflow: hidden;
  border-radius: 14px 0 0 0;
}

.crop :deep(img) {
  object-position: left top;
}

.note {
  margin: 8px 0 0;
  color: var(--sx-text-3);
  font-size: 14px;
}

/* 窄屏、视口太矮、减少动态效果：不堆叠，高度随内容 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .card {
    position: relative;
    top: 0;
    height: auto;
    min-height: 420px;
    margin-bottom: 20px;
    transform: none;
  }

  .card::after {
    display: none;
  }
}

@media (max-width: 760px) {
  .card {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  /* 卡片内边距收到 24px，文字离屏幕约 48px */
  .t,
  .v {
    padding: 32px 24px;
  }

  .v {
    min-height: 260px;
  }

  .crop {
    inset: 24px 0 0 24px;
  }
}
</style>
