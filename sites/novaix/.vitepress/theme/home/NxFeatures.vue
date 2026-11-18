<script setup lang="ts">
import { easeOut, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'

// 基础设施、运营和集成：上面是格子（截图格和大字格），下面是按四组列出的全部功能。
// 格子和功能条目按各自的位置随滚动上移淡入；减少动态效果时直接显示

const GROUPS = [
  {
    title: '基础设施',
    items: [
      ['VPC 私有网络', '基于 OVN 的二层隔离网络，支持子网划分和安全组'],
      ['IP 池', 'IPv4 和 IPv6 的分配与回收，支持纯 IPv6 套餐'],
      ['共享 IP 和 NAT', '普通和独享两种模式，用户可以自助购买独立出口 IP'],
      ['资源超开', 'CPU、内存、磁盘分别设置超开比例'],
      ['动态内存', '容器可以使用宿主机的空闲内存，提高利用率'],
      ['高可用', '节点故障时，开启了高可用保护的实例自动疏散到同组的健康节点'],
    ],
  },
  {
    title: '用户运营',
    items: [
      ['内容管理', '公告、文章、帮助中心、FAQ、数据中心等前台内容'],
      ['发票', '用户自助申请，管理员审核、录入，用户在线查看和下载'],
      ['实例转移', '用户之间凭转移码转移实例，可以收费、要求实名或人工审批'],
      ['优惠券', '适用于新购、续费和升级订单，可以设置使用条件'],
      ['代理分销', '按代理商分组设置返佣比例和分销折扣'],
      ['供应商转售', '对接上游服务商，把上游的产品作为自己的套餐出售'],
    ],
  },
  {
    title: '运维工具',
    items: [
      ['在线更新', '在管理面板一键升级并自动迁移数据库；使用 SQLite 时自动备份，失败时自动回滚'],
      ['命令行工具', '重置密码，管理插件、主题和设置，查看系统信息'],
      ['任务中心', '按状态筛选任务，查看实时日志'],
      ['监控与告警', '节点资源监控，告警可推送到 Telegram、钉钉、企业微信或 Webhook'],
      ['操作日志', '记录所有操作，可以按用户和类型筛选'],
    ],
  },
  {
    title: '开放集成',
    items: [
      ['开放接口', 'RESTful 接口，附 Swagger 和 Scalar 文档'],
      ['Webhook', '实例操作和任务状态变化时主动推送'],
      ['前端源码开放', '前端在 novaix-ui 仓库中开源，可以在此基础上开发主题'],
      ['三种数据库', 'SQLite 无需配置；MySQL 和 PostgreSQL 适合较大规模和多实例部署'],
      ['邮件', '支持 SMTP、Mailgun 和 Resend 三种发送方式'],
    ],
  },
]

const root = ref<HTMLElement>()
// 格子和条目在挂载后不变，只查一次
let cells: HTMLElement[] | undefined
let items: HTMLElement[] | undefined

useScrollFrame((still) => {
  const el = root.value!
  cells ??= [...el.querySelectorAll<HTMLElement>('.cell')]
  items ??= [...el.querySelectorAll<HTMLElement>('.it')]
  for (const c of cells) {
    c.style.setProperty('--o', still ? '1' : String(0.1 + 0.9 * easeOut(viewProgress(c, innerHeight, innerHeight * 0.55))))
  }
  for (const it of items) {
    it.style.setProperty('--o', still ? '1' : String(easeOut(viewProgress(it, innerHeight * 0.98, innerHeight * 0.8))))
  }
})
</script>

<template>
  <section id="features" ref="root" class="sx-sec sx-alt">
    <div class="sx-wrap">
      <div class="sx-head">
        <h2 class="sx-title"><span class="nw">基础设施、</span><span class="nw">运营和集成</span></h2>
        <p class="sx-lead">网络、节点、用户和前台内容，都在同一个管理面板中管理。</p>
      </div>
      <div class="bento">
        <div class="cell big shot">
          <div class="txt">
            <h3>VPC 私有网络<span class="sx-badge sm">授权版</span></h3>
            <p>基于 OVN 的二层隔离网络。同一 VPC 内的实例通过内网 IP 互相通信，不同 VPC 之间完全隔离。支持子网划分和安全组。</p>
          </div>
          <div class="img sx-fade-rb" style="--top: 190px; --zw: 125%">
            <img src="/screenshots/vpc.webp" width="2048" height="1280" alt="VPC 私有网络和子网" loading="lazy" />
          </div>
        </div>
        <div class="cell s2 word">
          <div class="txt">
            <h3>IP 池</h3>
            <p>IPv4 和 IPv6 的分配与回收，支持纯 IPv6 套餐。</p>
          </div>
          <div class="k">IPv4<br />IPv6</div>
        </div>
        <div class="cell s2 word">
          <div class="txt">
            <h3>资源超开</h3>
            <p>CPU、内存、磁盘分别设置超开比例。例如 32 核的服务器，CPU 超开 300% 后：</p>
          </div>
          <div class="k">可分配<br />128 核</div>
        </div>
        <div class="cell s3 shot">
          <div class="txt">
            <h3>节点监控</h3>
            <p>节点的 CPU、内存、磁盘、网络和负载曲线。</p>
          </div>
          <div class="img sx-fade-rb" style="--top: 140px; --zw: 150%">
            <img src="/screenshots/node-stats.webp" width="2048" height="1280" alt="节点的 CPU、内存、磁盘、网络和负载曲线" loading="lazy" />
          </div>
        </div>
        <div class="cell s3 shot">
          <div class="txt">
            <h3>用户</h3>
            <p>用户列表、余额、实名状态和分组。实名认证支持二要素验证和人脸识别。</p>
          </div>
          <div class="img sx-fade-rb" style="--top: 170px; --zw: 150%">
            <img src="/screenshots/users.webp" width="2048" height="1280" alt="用户列表、余额、实名状态和分组" loading="lazy" />
          </div>
        </div>
        <div class="cell s4 shot">
          <div class="txt">
            <h3>内容管理</h3>
            <p>公告、文章、帮助中心、FAQ、数据中心等前台内容，默认主题内置对应的页面。</p>
          </div>
          <div class="img sx-fade-rb" style="--top: 170px; --zw: 125%">
            <img src="/screenshots/cms.webp" width="2048" height="1280" alt="内容管理：公告、文章、帮助中心、FAQ" loading="lazy" />
          </div>
        </div>
        <div class="cell s2 word">
          <div class="txt">
            <h3>共享 IP 和 NAT<span class="sx-badge sm">授权版</span></h3>
            <p>多个实例共享公网 IP，用户可以自助购买独享的出口 IP。端口有两种分配方式：</p>
          </div>
          <div class="k">固定端口段<br />按需选端口</div>
        </div>
        <div class="cell s6 word">
          <div class="txt">
            <h3>告警通知<span class="sx-badge sm">授权版</span></h3>
            <p>节点离线，或 CPU、内存、磁盘超过阈值时发出告警。CPU、内存、磁盘的默认阈值都是 90%。</p>
          </div>
          <div class="row6"><div class="k">Telegram　钉钉　企业微信　Webhook</div></div>
        </div>
      </div>

      <div class="groups">
        <div v-for="g in GROUPS" :key="g.title">
          <h3>{{ g.title }}</h3>
          <div v-for="[name, desc] in g.items" :key="name" class="it"><b>{{ name }}</b><span>{{ desc }}</span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sx-lead,
.cell p,
.it span {
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.sx-head .sx-lead {
  text-wrap: balance;
}

.bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

/* 截图格用面板色，大字格用卡片色 */
.cell {
  position: relative;
  overflow: hidden;
  min-height: 360px;
  border-radius: 28px;
  background: var(--sx-alt);
  opacity: var(--o, 1);
  transform: translateY(calc((1 - var(--o, 1)) * 40px));
}

.cell.shot {
  background: var(--sx-panel);
}

.cell.word {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--sx-tile);
}

.txt {
  position: relative;
  z-index: 1;
  padding: 30px 32px 0;
}

.cell h3 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.cell p {
  max-width: 460px;
  margin: 8px 0 0;
  color: var(--sx-text-2);
  font-size: 16px;
}

/* 裁切框：左、上留边，延伸到右边和底边并渐隐；截图在框内按 --zw 放大取景 */
.img {
  position: absolute;
  inset: var(--top, 160px) 0 0 var(--gut, 32px);
  overflow: hidden;
  border-radius: 14px 0 0 0;
  transform: translateY(calc((1 - var(--o, 1)) * 36px));
}

.img img {
  width: var(--zw, 100%);
  max-width: none;
  height: auto;
}

.cell.big {
  grid-column: span 4;
  grid-row: span 2;
  min-height: 740px;
}

.cell.s2 {
  grid-column: span 2;
}

.cell.s3 {
  grid-column: span 3;
  min-height: 440px;
}

.cell.s4 {
  grid-column: span 4;
  min-height: 460px;
}

.cell.s6 {
  grid-column: span 6;
  min-height: 0;
}

.k {
  padding: 24px 32px 30px;
  font-size: clamp(34px, 3.6vw, 44px);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.035em;
  text-wrap: pretty;
}

.row6 {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 8px 32px;
  padding: 32px 32px 30px;
}

.row6 .k {
  padding: 0;
}

/* 全部功能：四组 */
.groups {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 40px 32px;
  margin-top: 110px;
}

.groups h3 {
  margin: 0 0 6px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.it {
  padding: 13px 0;
  border-top: 1px solid var(--sx-line);
  opacity: var(--o, 1);
  transform: translateY(calc((1 - var(--o, 1)) * 16px));
}

.it b {
  display: block;
  font-size: 16px;
  font-weight: 600;
}

.it span {
  display: block;
  margin-top: 2px;
  color: var(--sx-text-2);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .bento {
    grid-template-columns: 1fr 1fr;
  }

  .cell.big,
  .cell.s3,
  .cell.s4,
  .cell.s6 {
    grid-column: span 2;
    grid-row: auto;
  }

  .cell.big,
  .cell.s3,
  .cell.s4 {
    min-height: 460px;
  }

  .groups {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .cell {
    --gut: 20px;
  }

  .cell.s2 {
    grid-column: span 2;
    min-height: 0;
  }

  .txt {
    padding: 26px 24px 0;
  }

  .k {
    padding-inline: 24px;
  }

  .row6 {
    padding-inline: 24px;
  }

  .groups {
    grid-template-columns: 1fr;
    margin-top: 80px;
  }
}
</style>
