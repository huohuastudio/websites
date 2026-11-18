<script setup lang="ts">
import { SxShot, easeOut, seg, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import NxMarket from './NxMarket.vue'

// 插件和主题：插件类型依次翻入，插件管理的截图从中间展开；下面是插件、主题的说明和市场中的实际列表

const TYPES = [
  ['支付', 'USDT、虚拟货币支付等'],
  ['人机验证', '极验、reCAPTCHA、hCaptcha、Turnstile 等'],
  ['社会化登录', '第三方聚合登录平台'],
  ['身份认证', '第三方人脸识别、实名核验'],
  ['短信', '自定义短信平台'],
  ['邮件', '自定义邮件发送 API'],
  ['通知', '自定义推送服务'],
  ['扩展', 'Telegram 机器人、外部系统同步等'],
]

const root = ref<HTMLElement>()
const types = ref<HTMLElement>()
const shot = ref<HTMLElement>()
/** 每个类型的翻入进度 0–1；服务端渲染时为 1 */
const turn = ref(TYPES.map(() => 1))
/** 截图四周裁掉的比例，单位 % */
const clip = ref(0)

useScrollFrame((still) => {
  // 减少动态效果：直接显示最终状态（页面打开后才切换这个设置时，可能停在中间状态）
  if (still) {
    turn.value = TYPES.map(() => 1)
    clip.value = 0
    return
  }
  const p = viewProgress(types.value!, innerHeight * 0.95, innerHeight * 0.4)
  turn.value = TYPES.map((_, i) => easeOut(seg(p, i * 0.06, i * 0.06 + 0.45)))
  clip.value = (1 - easeOut(viewProgress(shot.value!, innerHeight, innerHeight * 0.45))) * 12
}, root)
</script>

<template>
  <section id="ext" ref="root" class="sx-sec">
    <div class="sx-wrap">
      <div class="sx-head">
        <h2 class="sx-title">插件和主题</h2>
        <p class="sx-lead">支付、登录、短信、通知、人机验证都可以用插件扩展。插件和主题可以从市场安装，也可以自己开发。</p>
      </div>
      <div class="ext">
        <div ref="types" class="types">
          <div v-for="([name, desc], i) in TYPES" :key="name" class="ty" :style="{ '--t': turn[i] }">
            <b>{{ name }}</b><span>{{ desc }}</span>
          </div>
        </div>
        <div ref="shot" class="ext-shot" :style="{ '--ci': `${clip}%` }">
          <SxShot class="sx-fade-rb" src="/screenshots/plugins" :width="2048" :height="1280" alt="插件管理：已安装的插件和插件市场" />
        </div>
      </div>
      <div class="ext-note">
        <div>
          <h3>插件<span class="sx-badge sm">授权版</span></h3>
          <p>插件用 JavaScript 编写，无需修改系统源代码。在管理面板的「插件管理」页面切换到市场，点击「安装」即可。</p>
        </div>
        <div>
          <h3>主题</h3>
          <p>前端源码在 <a href="https://github.com/huohuastudio/novaix-ui" target="_blank" rel="noreferrer">novaix-ui</a> 仓库中开源，可以在默认主题的基础上修改。切换主题无需重启服务。</p>
        </div>
      </div>
      <NxMarket />
    </div>
  </section>
</template>

<style scoped>
.sx-lead,
.ext-note p,
.ty span {
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.ty span {
  text-wrap: balance;
}

.ext {
  display: grid;
  gap: 32px;
}

/* 八个类型：宽屏 4 列 2 行，较窄时 2 列 */
.types {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  perspective: 900px;
}

.ty {
  padding: 16px 20px 15px;
  border-radius: 16px;
  background: var(--sx-card);
  opacity: var(--t, 1);
  transform-origin: 50% 0;
  transform: rotateX(calc((1 - var(--t, 1)) * -80deg));
}

.ty b {
  display: block;
  font-size: 16px;
  font-weight: 600;
}

.ty span {
  display: block;
  margin-top: 2px;
  color: var(--sx-text-2);
  font-size: 14px;
  line-height: 1.45;
}

.ext-shot {
  overflow: hidden;
  padding: var(--gut, 32px) 0 0 var(--gut, 32px);
  border-radius: 22px;
  background: var(--sx-panel);
  clip-path: inset(var(--ci, 0%) round 22px);
}

.ext-shot :deep(img) {
  width: 100%;
  height: auto;
  border-radius: 14px 0 0 0;
}

.ext-note {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 48px;
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid var(--sx-line);
}

.ext-note h3 {
  margin: 0 0 6px;
  font-size: 19px;
  font-weight: 600;
}

.ext-note p {
  margin: 0;
  color: var(--sx-text-2);
  font-size: 16px;
}

@media (max-width: 900px) {
  .types {
    grid-template-columns: 1fr 1fr;
  }

  .ext-note {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .ext-shot {
    --gut: 20px;
  }
}

@media (max-width: 480px) {
  .ty {
    padding: 12px 14px;
  }

  .ty span {
    font-size: 13px;
  }
}
</style>
