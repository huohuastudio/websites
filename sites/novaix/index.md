---
layout: home
title: Novaix
titleTemplate: 面向中小型 VPS 服务商的 IDC 管理系统
description: Novaix 是面向中小型 VPS 服务商的 IDC 管理系统，单个可执行文件部署。LXC 容器和 KVM 虚拟机在同一套界面中管理，自带套餐、计费、在线支付和工单。免费版最多 2 个节点，授权版另有高可用、私有网络、代理商和供应商转售。
# 首页不套文档正文样式，各版块由 .vitepress/theme/home 中的组件负责
markdownStyles: false

plans:
  - name: 免费版
    price: ¥0
    note: 永久免费，无需注册
    items:
      - 最多 2 个节点
      - 实例管理
      - 套餐、订单、计费和在线支付
      - 工单和内容管理
      - 主题和在线更新
    action:
      text: 免费下载
      link: https://github.com/huohuastudio/novaix-releases/releases/latest
      theme: alt
  - name: 授权版
    price: 订阅制
    note: 不限规模，解锁全部功能
    featured: true
    items:
      - 免费版的全部功能
      - 节点数不限
      - 高可用（自动疏散）、告警通知
      - 私有网络（VPC）、共享 IP 和 NAT
      - 代理商系统、供应商转售
      - 插件、开放接口、品牌定制
    action:
      text: 购买授权
      link: https://huohuastudio.com/products/novaix#plans

pricing:
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
import { SxCta, SxFaq, SxPlans } from '@huohuastudio/theme/showcase'
import { NxDb, NxExt, NxFeatures, NxFlow, NxHa, NxHero, NxModes } from './.vitepress/theme/home'
</script>

<div class="sx">
<NxHero />
<NxFlow />
<NxHa />
<NxModes />
<NxFeatures />
<NxExt />
<NxDb />
<SxPlans
  lead="免费版部署即可使用，适合小规模运营；授权版按订阅计费，不限节点数，解锁全部功能。"
  :plans="$frontmatter.plans"
  :rows="$frontmatter.pricing.rows"
>

免费版升级为授权版不用重新部署，在管理面板中输入激活码即可，详见[免费版与授权版](./docs/getting-started#editions)。

Novaix 目前处于公测阶段，用于生产环境前请做好数据备份。

</SxPlans>
<SxFaq :items="$frontmatter.faq">
<template #header>

更多问题见文档中的[常见问题](./docs/faq)。

</template>
</SxFaq>
<SxCta
  title="开始使用"
  lead="免费版部署即可使用，无需注册。"
  :actions="[
    { text: '下载安装', link: 'https://github.com/huohuastudio/novaix-releases/releases/latest' },
    { text: '阅读文档', link: './docs/introduce', theme: 'alt' },
  ]"
>

[许可协议](./license) [服务条款](./terms) [隐私政策](./privacy)

</SxCta>
</div>
