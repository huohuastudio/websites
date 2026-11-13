---
layout: home
title: Novaix
titleTemplate: 面向中小型 VPS 服务商的 IDC 管理系统

hero:
  name: Novaix
  text: 面向中小型 VPS 服务商的 IDC 管理系统
  tagline: 单个可执行文件部署，内置数据库，开箱即用。容器和虚拟机统一管理，自带计费、工单和内容管理。
  image:
    src: /logo.svg
    alt: Novaix
  actions:
    - theme: brand
      text: 下载安装
      link: https://github.com/huohuastudio/novaix-releases/releases/latest
    - theme: alt
      text: 在线演示
      link: https://novaix.huohuastudio.com
    - theme: alt
      text: 阅读文档
      link: /docs/introduce

features:
  - title: 单文件部署
    details: 前端、接口和命令行工具编译在一个可执行文件里，默认使用内置的 SQLite，也支持 MySQL 和 PostgreSQL。
  - title: 容器和虚拟机
    details: 同时管理 LXC 容器和 QEMU/KVM 虚拟机，支持 Windows 虚拟机的 TPM、双 ISO 挂载和密码重置。
  - title: 完整的业务流程
    details: 套餐、订单、计费、支付、工单、实名认证和发票，覆盖从用户下单到售后的全过程。
  - title: 插件和主题
    details: 支付、登录、短信、通知、人机验证都可以用插件扩展；前端源码开放，可以自己做主题。

screenshots:
  - src: /screenshots/dashboard.webp
    title: 仪表盘
    desc: 管理面板首页：收入、订单、实例和节点的概况
    width: 2048
    height: 1280
  - src: /screenshots/instance.webp
    title: 实例详情
    desc: 单个实例的运行状态、资源用量和常用操作
    width: 2048
    height: 1280
  - src: /screenshots/node-stats.webp
    title: 节点监控
    desc: 节点的 CPU、内存、磁盘、网络和负载曲线
    width: 2048
    height: 1280
  - src: /screenshots/orders.webp
    title: 订单
    desc: 新购、续费、升级订单的列表和筛选
    width: 2048
    height: 1280
  - src: /screenshots/users.webp
    title: 用户
    desc: 用户列表、余额、实名状态和分组
    width: 2048
    height: 1280
  - src: /screenshots/vpc.webp
    title: 私有网络
    desc: VPC 私有网络和子网
    width: 2048
    height: 1280
  - src: /screenshots/cms.webp
    title: 内容管理
    desc: 公告、文章、帮助中心、FAQ 等前台内容
    width: 2048
    height: 1280
  - src: /screenshots/plugins.webp
    title: 插件
    desc: 已安装的插件和插件市场
    width: 2048
    height: 1280

featureGroups:
  - title: 基础设施
    items:
      - name: VPC 私有网络
        desc: 基于 OVN 的二层隔离网络，支持子网划分和安全组
      - name: IP 池
        desc: IPv4 和 IPv6 的分配与回收，支持纯 IPv6 套餐
      - name: 共享 IP 和 NAT
        desc: 普通和独享两种模式，用户可以自助购买独立出口 IP
      - name: 资源超开
        desc: CPU、内存、磁盘分别设置超开比例
      - name: 动态内存
        desc: 容器可以使用宿主机的空闲内存，提高利用率
      - name: 高可用
        desc: 节点故障时，开启了高可用保护的实例自动疏散到同组的健康节点
  - title: 用户运营
    items:
      - name: 内容管理
        desc: 公告、文章、帮助中心、FAQ、数据中心等前台内容
      - name: 发票
        desc: 用户自助申请，管理员审核、录入，用户在线查看和下载
      - name: 实例转移
        desc: 用户之间凭转移码转移实例，可以收费、要求实名或人工审批
      - name: 优惠券
        desc: 适用于新购、续费和升级订单，可以设置使用条件
      - name: 代理分销
        desc: 按代理商分组设置返佣比例和分销折扣
      - name: 供应商转售
        desc: 对接上游服务商，把上游的产品作为自己的套餐出售
  - title: 运维工具
    items:
      - name: 在线更新
        desc: 在管理面板一键升级并自动迁移数据库；使用 SQLite 时自动备份，失败时自动回滚
      - name: 命令行工具
        desc: 重置密码，管理插件、主题和设置，查看系统信息
      - name: 任务中心
        desc: 按状态筛选任务，查看实时日志
      - name: 监控与告警
        desc: 节点资源监控，告警可推送到 Telegram、钉钉、企业微信或 Webhook
      - name: 操作日志
        desc: 记录所有操作，可以按用户和类型筛选
  - title: 开放集成
    items:
      - name: 开放接口
        desc: RESTful 接口，附 Swagger 和 Scalar 文档
      - name: Webhook
        desc: 实例操作和任务状态变化时主动推送
      - name: 前端源码开放
        desc: 前端在 novaix-ui 仓库中开源，可以在此基础上开发主题
      - name: 三种数据库
        desc: SQLite 无需配置；MySQL 和 PostgreSQL 适合较大规模和多实例部署
      - name: 邮件
        desc: 支持 SMTP、Mailgun 和 Resend 三种发送方式

pricing:
  plans:
    - name: 免费版
      price: ¥0
      note: 永久免费，无需注册
      action:
        text: 免费下载
        link: https://github.com/huohuastudio/novaix-releases/releases/latest
        theme: alt
    - name: 授权版
      price: 订阅制
      note: 不限规模，解锁全部功能
      action:
        text: 购买授权
        link: https://huohuastudio.com/products/novaix/buy
  rows:
    - { name: 节点数, values: [最多 2 个, 不限] }
    - { name: 实例管理, values: [true, true] }
    - { name: 套餐、订单和计费, values: [true, true] }
    - { name: 在线支付, values: [true, true] }
    - { name: 工单, values: [true, true] }
    - { name: 内容管理, values: [true, true] }
    - { name: 主题, values: [true, true] }
    - { name: 在线更新, values: [true, true] }
    - { name: 高可用（自动疏散）, values: [false, true] }
    - { name: 告警通知, values: [false, true] }
    - { name: 私有网络（VPC）, values: [false, true] }
    - { name: 代理商系统, values: [false, true] }
    - { name: 共享 IP 和 NAT, values: [false, true] }
    - { name: 插件, values: [false, true] }
    - { name: 品牌定制（团队成员、品牌素材）, values: [false, true] }
    - { name: 开放接口, values: [false, true] }
    - { name: 供应商转售, values: [false, true] }

faq:
  - q: Novaix 是免费的吗？
    a: 有永久免费版，部署即可使用，无需注册。免费版包含实例管理、套餐计费、工单、内容管理等核心功能，最多支持 2 个节点。需要不限节点、高可用、私有网络、代理商、供应商转售等功能时，在管理面板中输入激活码即可升级为授权版，详见<a href="/docs/getting-started#editions">免费版与授权版</a>。
  - q: 可以部署在什么系统上？
    a: Novaix 是单个可执行文件，支持 Linux 的 x86_64 和 ARM64 架构，推荐 Ubuntu 24.04 或 Debian 12。节点服务器支持 Ubuntu、Debian、CentOS/RHEL、Fedora、openSUSE 等主流发行版，详见<a href="/docs/requirement">环境要求</a>。
  - q: 支持容器还是虚拟机？
    a: 两者都支持。LXC 容器和 QEMU/KVM 虚拟机通过同一套界面管理，虚拟机也支持 Windows（TPM、双 ISO 挂载、密码重置、网络配置）。
  - q: 默认使用 SQLite，性能够用吗？
    a: 中小规模（数百台实例以内）用 SQLite 就够了。如果预计规模较大或需要高可用部署，建议一开始就选择 MySQL 或 PostgreSQL，因为之后从 SQLite 切换需要手动迁移数据。
  - q: 支持哪些支付方式？
    a: 支持支付宝、微信支付、Stripe、PayPal 和易支付（兼容彩虹易支付、ZPAY），也可以用插件接入其他渠道。详见<a href="/docs/payment">支付配置</a>。
  - q: 数据安全怎么保障？
    a: 使用 SQLite 时，每次在线更新前会自动备份数据库，迁移失败自动回滚。使用 MySQL 或 PostgreSQL 时，迁移失败不会自动回滚，系统会停机等待人工恢复，所以请在更新前自行备份，并另外设置定时备份。备份和恢复的方法见<a href="/docs/backup">备份与恢复</a>。
  - q: 可以自定义前台界面吗？
    a: 可以。前端源码在 <a href="https://github.com/huohuastudio/novaix-ui" target="_blank" rel="noreferrer">novaix-ui</a> 仓库中开源，您可以在默认主题的基础上修改，也可以从主题市场安装主题，切换时不需要重启。详见<a href="/docs/theme">主题系统</a>。
  - q: 怎么和已有的系统对接？
    a: Novaix 提供开放接口（Provisioning API）和 Webhook 回调，可以和任何支持 HTTP 的系统对接。在管理面板中配置集成方，管理回调地址和密钥。详见<a href="/docs/integration">开放接口</a>。
  - q: 节点服务器需要准备什么？
    a: 一台装好 Linux 的服务器，并且能通过 SSH 连接。节点上不需要安装 Novaix，添加节点后执行「初始化」，系统会自动安装和配置运行环境。
  - q: 支持高可用部署吗？
    a: 支持（需要授权版）。节点组启用集群模式和高可用后，组内节点故障时，开启了「高可用保护」的实例会自动疏散到组内其他健康节点，详见<a href="/docs/node-group#ha">高可用与自动疏散</a>。Novaix 本身也可以多实例部署，这时需要使用 MySQL 或 PostgreSQL，详见<a href="/docs/faq#ha-setup">常见问题</a>。
  - q: 和其他 IDC 管理系统有什么区别？
    a: Novaix 是单文件部署、自带完整计费的一体化方案，同时支持容器和虚拟机，并提供私有网络安全组、高可用自动疏散等功能。和常见产品的逐项对比见<a href="/docs/comparison">竞品对比</a>。
---

<script setup>
import Market from './.vitepress/theme/Market.vue'
import { data as market } from './.vitepress/theme/market.data'
</script>

## 界面一览 {#screenshots}

<HomeShowcase :items="$frontmatter.screenshots" />

## 一个文件完成部署 {#deploy}

Novaix 编译为单个可执行文件，不需要另外安装 Docker、Node.js 或数据库。下载、解压、运行即可，生产环境的守护进程和反向代理配置见[安装](./docs/install)。

```bash
# ARM 服务器把 amd64 换成 arm64
wget https://github.com/huohuastudio/novaix-releases/releases/latest/download/novaix_linux_amd64.tar.gz
tar -xzf novaix_linux_amd64.tar.gz
./novaix_linux_amd64/novaix
```

首次运行会在当前目录生成默认的 `config.yaml`，并在终端输出初始管理员密码。之后可以在管理面板中一键在线更新，使用 SQLite 时更新前自动备份，使用 MySQL 或 PostgreSQL 时请在大版本更新前自行备份数据库。

## 功能 {#features}

<HomeFeatureList :groups="$frontmatter.featureGroups" />

<div v-if="market.plugins.length || market.themes.length">

## 插件和主题 {#market}

在管理面板的「插件管理」和「主题管理」页面切换到市场，点击「安装」即可。开发者可以向 [novaix-releases](https://github.com/huohuastudio/novaix-releases) 提交自己的插件和主题。

<Market />

</div>

## 价格 {#pricing}

免费版部署即可使用，适合小规模运营；授权版按订阅计费，不限节点数，解锁全部功能。

<HomePricing :plans="$frontmatter.pricing.plans" :rows="$frontmatter.pricing.rows" />

## 常见问题 {#faq}

<HomeFaq :items="$frontmatter.faq" />

## 开始使用 {#start}

<HomeActions :actions="[
  { text: '下载安装', link: 'https://github.com/huohuastudio/novaix-releases/releases/latest' },
  { text: '阅读文档', link: '/docs/introduce', theme: 'alt' },
]">

[许可协议](./license) · [服务条款](./terms) · [隐私政策](./privacy)

</HomeActions>
