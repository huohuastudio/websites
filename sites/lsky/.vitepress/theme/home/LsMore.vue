<script setup lang="ts">
import { easeOut, seg, smooth, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'

// 登录、接口、主题、安装：卡片按位置淡入，登录按钮依次滑入，主题卡片展开

const logins = ['使用 GitHub 登录', '使用 QQ 登录', '使用 Keycloak 登录']
// 展开后的三张主题卡片：横向偏移、旋转角度、顶部色块的颜色；中间的一张放在最上层
const fanCards = [
  { dx: '-62%', r: '-8deg', c: 'color-mix(in srgb, var(--sx-text-3) 30%, transparent)' },
  { dx: '62%', r: '8deg', c: 'color-mix(in srgb, var(--sx-text-3) 45%, transparent)' },
  { dx: '0%', r: '0deg', c: 'var(--sx-panel)' },
]

const cards: HTMLElement[] = []
const loginEls: HTMLElement[] = []
const root = ref<HTMLElement>()
const fan = ref<HTMLElement>()

useScrollFrame((still) => {
  for (const q of cards) q.style.setProperty('--o', String(still ? 1 : easeOut(viewProgress(q, innerHeight, innerHeight * 0.8))))
  loginEls.forEach((l, i) => {
    const t = still ? 1 : easeOut(seg(viewProgress(l, innerHeight * 0.95, innerHeight * 0.45), i * 0.15, 0.6 + i * 0.15))
    l.style.setProperty('--lo', String(t))
  })
  fan.value!.style.setProperty('--f', String(still ? 1 : smooth(viewProgress(fan.value!, innerHeight * 0.95, innerHeight * 0.45))))
}, root)
</script>

<template>
  <section id="more" ref="root" class="sx-sec sx-alt">
    <div class="sx-wrap">
      <div class="sx-head">
        <h2 class="sx-title"><span class="ph">登录、接口、</span><span class="ph">主题和安装</span></h2>
      </div>
      <div class="quad">
        <div :ref="(el) => (cards[0] = el as HTMLElement)" class="q4">
          <div>
            <h3>社会化登录</h3>
            <p>GitHub、QQ，以及通用 OAuth2 / OIDC（Keycloak、Authentik、Gitea 等）。也可以通过聚合登录接入微信、支付宝、微博等平台。</p>
          </div>
          <div class="v logins" aria-hidden="true">
            <span v-for="(l, i) in logins" :key="l" :ref="(el) => (loginEls[i] = el as HTMLElement)">{{ l }}</span>
          </div>
        </div>
        <div :ref="(el) => (cards[1] = el as HTMLElement)" class="q4">
          <div>
            <h3>开放接口</h3>
            <p>100 多个接口，可以开发客户端，也可以对接其他系统。接口定义遵循 OpenAPI 规范。</p>
          </div>
          <pre class="sx-term v"><div class="c"># 在用户中心的「API令牌」页面创建令牌</div><div>curl https://example.com/api/v2/&lt;接口路径&gt; \</div><div>  -H "Authorization: Bearer &lt;令牌&gt;" \</div><div>  -H "Accept: application/json"</div></pre>
        </div>
        <div :ref="(el) => (cards[2] = el as HTMLElement)" class="q4">
          <div>
            <h3>主题</h3>
            <p>付费版从 V 2.3.0 起支持主题，可以替换前台界面，也可以自己开发：用 Blade 渲染页面，或做成调用接口的单页应用。</p>
          </div>
          <div ref="fan" class="v fan" aria-hidden="true">
            <div v-for="(c, i) in fanCards" :key="i" :style="{ '--dx': c.dx, '--r': c.r, '--c': c.c }"><i class="h" /><i /><i class="s" /></div>
          </div>
        </div>
        <div :ref="(el) => (cards[3] = el as HTMLElement)" class="q4">
          <div>
            <h3>Docker 安装</h3>
            <p>镜像中已包含运行环境、消息队列和计划任务。也可以在 PHP 8.3 及以上的环境中直接安装。</p>
          </div>
          <pre class="sx-term v"><div class="c"># 数据保存在宿主机的 ~/data 目录</div><div>docker run -d --name lsky-pro -p 8000:8000 \</div><div>  -v ~/data:/app/storage/app \</div><div>  -v ~/data/themes:/app/themes \</div><div>  0xxb/lsky-pro:latest</div><div class="c"># 在浏览器中打开 http://服务器IP:8000</div></pre>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.quad {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.q4 {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 32px;
  border-radius: 28px;
  background: var(--sx-tile);
  opacity: calc(0.35 + var(--o, 1) * 0.65);
  transform: translateY(calc((1 - var(--o, 1)) * 40px));
}

.q4 h3 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.q4 p {
  margin: 8px 0 0;
  color: var(--sx-text-2);
  font-size: 16px;
}

/* 示意内容贴卡片底部 */
.q4 .v {
  margin-top: auto;
}

.logins {
  display: grid;
  gap: 10px;
  max-width: 360px;
}

.logins span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px;
  border-radius: 12px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  font-size: 15px;
  opacity: var(--lo, 1);
  transform: translateX(calc((1 - var(--lo, 1)) * -24px));
}

/* 命令行示例：卡片较窄，内边距比默认的小 */
.sx-term {
  padding: 20px 22px;
}

.sx-term div {
  white-space: pre-wrap;
  word-break: break-all;
}

/* 主题：三张卡片随滚动展开成扇形 */
.fan {
  position: relative;
  height: 190px;
}

.fan > div {
  position: absolute;
  left: 50%;
  bottom: 0;
  display: grid;
  align-content: start;
  gap: 8px;
  width: min(220px, 46%);
  height: 160px;
  padding: 14px;
  border-radius: 14px;
  background: var(--sx-tile);
  box-shadow: 0 0 0 1px var(--sx-edge);
  transform: translateX(-50%) translateX(calc(var(--f, 1) * var(--dx))) rotate(calc(var(--f, 1) * var(--r)));
  transform-origin: 50% 100%;
}

.fan i {
  display: block;
  height: 8px;
  border-radius: 4px;
  background: var(--sx-line);
}

.fan i.h {
  height: 40px;
  border-radius: 8px;
  background: var(--c);
}

.fan i.s {
  width: 60%;
}

@media (max-width: 760px) {
  .quad {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .q4 {
    padding: 24px;
  }

  .fan > div {
    width: min(180px, 42%);
  }
}
</style>
