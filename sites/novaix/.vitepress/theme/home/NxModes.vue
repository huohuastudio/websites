<script setup lang="ts">
import { SxShot, isFlat, pinProgress, seg, smooth, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'

// 容器和虚拟机：两张卡片随滚动向中间合拢、淡出，变成同一个实例页面的截图。
// 不固定舞台时两张卡片和截图按顺序排下来

const root = ref<HTMLElement>()
const merge = ref<HTMLElement>()
const left = ref<HTMLElement>()
const right = ref<HTMLElement>()

useScrollFrame((still) => {
  if (still || isFlat()) return
  const p = pinProgress(root.value!)
  const m = smooth(seg(p, 0.22, 0.62))
  const el = merge.value!
  // 卡片宽 48.5%，移动约自身宽度的 53% 到中线
  el.style.setProperty('--ms', String(1 - m * 0.22))
  left.value!.style.setProperty('--mx', `${m * 53}%`)
  right.value!.style.setProperty('--mx', `${-m * 53}%`)
  el.style.setProperty('--mo', String(1 - seg(m, 0.35, 0.9)))
  el.style.setProperty('--ss', String(0.72 + 0.28 * m))
  el.style.setProperty('--so', String(seg(m, 0.3, 0.95)))
  el.style.setProperty('--co', String(seg(p, 0.66, 0.78)))
}, root)
</script>

<template>
  <section id="modes" ref="root" class="sx-pin sx-alt modes">
    <div class="sx-stage">
      <div class="sx-wrap sx-head center">
        <h2 class="sx-title"><span class="nw">容器和虚拟机，</span><span class="nw">同一套界面</span></h2>
        <p class="sx-lead">同时管理 LXC 容器和 QEMU/KVM 虚拟机。创建套餐时选择类型，之后的下单、开通和管理都在同一套界面中完成。</p>
      </div>
      <div ref="merge" class="merge">
        <div ref="left" class="mcard l">
          <h3>LXC 容器</h3>
          <p class="sub">单个节点可以容纳更多实例。</p>
          <ul>
            <li>CPU 可以设为小数，如 0.5 核</li>
            <li>可以限制 CPU 使用率的上限</li>
            <li>开启动态内存后，可以使用宿主机的空闲内存</li>
            <li>在浏览器中直接打开终端</li>
          </ul>
        </div>
        <div ref="right" class="mcard r">
          <h3>QEMU/KVM 虚拟机</h3>
          <p class="sub">支持 Windows。</p>
          <ul>
            <li>TPM 2.0，可以运行 Windows 11 和 Windows Server 2025</li>
            <li>同时挂载系统 ISO 和驱动 ISO</li>
            <li>VNC 控制台，系统未启动时也能操作</li>
            <li>通过虚拟机代理重置密码、配置网络</li>
          </ul>
        </div>
        <div class="mshot">
          <div class="shotbox">
            <SxShot class="sx-fade-rb" src="/screenshots/instance" :width="2048" :height="1280" alt="实例详情页：运行状态、资源用量和常用操作" />
          </div>
          <p class="mcap"><b>LXC 容器</b>和 <b>QEMU/KVM 虚拟机</b>使用同一个实例页面：启停、重装、快照、升级、迁移、救援模式、防火墙和终端。</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.modes {
  --sx-run: 300vh;
}

.sx-stage {
  display: flex;
  flex-direction: column;
  padding-top: 60px;
}

.sx-head {
  margin-bottom: 32px;
}

.sx-lead,
.mcard li,
.mcap {
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.sx-head .sx-lead,
.mcap {
  text-wrap: balance;
}

.merge {
  position: relative;
  flex: 1;
  min-height: 0;
  width: min(1040px, calc(100vw - 48px));
  margin: 0 auto 5vh;
}

.mcard {
  position: absolute;
  top: 50%;
  z-index: 1;
  width: 48.5%;
  padding: 34px 34px 26px;
  border-radius: 28px;
  background: var(--sx-card);
  opacity: var(--mo, 1);
  transform: translateY(-50%) translateX(var(--mx, 0%)) scale(var(--ms, 1));
}

.mcard.l {
  left: 0;
}

.mcard.r {
  right: 0;
}

.mcard h3 {
  font-size: 30px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.sub {
  margin: 6px 0 18px;
  color: var(--sx-text-2);
}

.mcard ul {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 16px;
}

.mcard li {
  padding: 10px 0;
  border-top: 1px solid var(--sx-line);
}

.mshot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(100%, calc((var(--sx-vh) - 388px) * 1.6));
  opacity: var(--so, 0);
  transform: translate(-50%, -50%) scale(var(--ss, 0.7));
}

/* 截图放在面板中：左、上留边，延伸到右边和底边 */
.shotbox {
  overflow: hidden;
  padding: var(--gut, 32px) 0 0 var(--gut, 32px);
  border-radius: 22px;
  background: var(--sx-panel);
}

.shotbox :deep(img) {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  border-radius: 14px 0 0 0;
  object-fit: cover;
  object-position: left top;
}

.mcap {
  max-width: 760px;
  margin: 18px auto 0;
  color: var(--sx-text-2);
  font-size: 16px;
  text-align: center;
  opacity: var(--co, 0);
}

.mcap b {
  color: var(--sx-text);
  font-weight: 600;
}

@media (max-height: 832px) and (min-width: 761px) {
  .sx-stage {
    padding-top: 28px;
  }

  .sx-head {
    margin-bottom: 20px;
  }

  .mshot {
    width: min(100%, calc((var(--sx-vh) - 298px) * 1.6));
  }

  .shotbox {
    --gut: 22px;
  }

  .mcard {
    padding: 26px 28px 18px;
  }

  .mcard h3 {
    font-size: 26px;
  }

  .sub {
    margin-bottom: 10px;
  }

  .mcard li {
    padding: 7px 0;
    font-size: 15px;
  }
}

/* 不固定舞台：两张卡片并排（窄屏上下排），截图跟在下面 */
@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .merge {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 0;
  }

  .mcard {
    position: static;
    width: auto;
    opacity: 1;
    transform: none;
  }

  .mshot {
    position: static;
    grid-column: 1 / -1;
    width: 100%;
    margin-top: 28px;
    opacity: 1;
    transform: none;
  }

  .mcap {
    opacity: 1;
  }
}

@media (max-width: 760px) {
  .merge {
    grid-template-columns: 1fr;
  }

  .mcard {
    padding: 26px 24px 18px;
  }

  .shotbox {
    --gut: 20px;
  }
}
</style>
