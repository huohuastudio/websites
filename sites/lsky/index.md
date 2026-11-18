---
layout: home
title: Lsky Pro+
titleTemplate: 图床和云端相册程序
description: Lsky Pro+ 是基于 Laravel 开发的图床和云端相册程序，安装在您自己的服务器上。图片可以存到本地或各家对象储存，提供多用户和角色组、相册和分享、图片处理、内容审核，并内置套餐、订单和在线支付。
# 首页不套文档正文样式，版式由首页组件（.vitepress/theme/home/）负责
markdownStyles: false

# 价格、对比表和常见问题的数据，由首页组件读取
plans:
  - name: 开源版
    price: ¥0
    note: 已停止更新
    # 开源版是另一个程序，不写进首页结构化数据中本产品的报价
    offer: false
    items:
      - 多用户、角色组和多种储存
      - 相册和接口
      - 批量、拖拽、粘贴上传
    action:
      text: 获取开源版
      link: https://github.com/lsky-org/lsky-pro
      theme: alt
  - name: 付费版
    price: ¥299.99
    note: 一次付费，永久使用，后续更新免费
    featured: true
    items:
      - 开源版的全部功能
      - 图片和相册分享
      - 套餐、订单、优惠券和在线支付
      - 工单、公告、举报和独立页面
      - 图片处理驱动和云处理
      - 短信、社会化登录和 AI 功能
      - 主题
    action:
      text: 购买授权
      link: https://huohuastudio.com/products/lsky-pro#plans

pricing:
  rows:
    - { name: 多用户、角色组和多种储存, values: [true, true] }
    - { name: 相册和接口, values: [true, true] }
    - { name: 图片和相册分享, values: [false, true] }
    - { name: 批量、拖拽、粘贴上传, values: [true, true] }
    - { name: 套餐、订单、优惠券和在线支付, values: [false, true] }
    - { name: 工单、公告、举报和独立页面, values: [false, true] }
    - { name: 图片处理驱动和云处理, values: [false, true] }
    - { name: 短信和社会化登录, values: [false, true] }
    - { name: AI 功能, values: [false, true] }
    - { name: 主题, values: [false, true] }
    - { name: 版本更新, values: [已停止, 免费更新] }

faq:
  - q: 支持哪些储存？
    a: 本地、AWS S3、阿里云 OSS、腾讯云 COS、七牛云、又拍云、多吉云、SFTP、FTP 和 WebDAV。兼容 S3 接口的储存（如 MinIO、Backblaze B2）使用 AWS S3 驱动接入，详见<a href="/docs/guide/storage">储存</a>。
  - q: 服务器需要什么环境？
    a: 可以用 Docker 安装，也可以在 PHP 环境中直接安装。具体的 PHP 版本、扩展和数据库要求见<a href="/docs/guide/requirement">环境要求</a>。
  - q: 购买后可以退款吗？
    a: 不可以。付费版是一次付费、永久使用的数字商品，付款后即交付安装包和授权，因此不支持退款。
  - q: 后续更新需要付费吗？
    a: 不需要。购买后可以免费升级到之后的所有版本。
  - q: 购买后怎么安装？
    a: 登录<a href="https://huohuastudio.com/dashboard" target="_blank" rel="noreferrer">授权中心</a>下载安装包，安装时填写授权密钥和已添加的域名。授权密钥与购买时的邮箱绑定，请不要泄露。安装步骤见<a href="/docs/guide/install">安装</a>。
  - q: 一个授权可以用在几个域名上？
    a: 每个授权包含 1 个域名，需要更多域名时可以在授权中心添加。
  - q: 可以拿到源码、做二次开发吗？
    a: 从 V 2.3.0 起，后端核心代码经过加密，不再提供后端源码。界面可以通过主题定制，详见<a href="/docs/advanced/theme">主题</a>。源码和安装包只限购买者本人使用，不能转发或转售。
  - q: 开源版还能用吗？
    a: 开源版已经停止更新和支持，现有站点可以继续使用。付费版内置的数据导入只适用于付费版 1.7.x，详见<a href="/docs/guide/import">从旧版本导入</a>。
---

<script setup>
import LsHome from './.vitepress/theme/home/LsHome.vue'
</script>

<LsHome>
<template #faq>

更多问题见文档中的[常见问题](./docs/guide/faq)。

</template>
<template #links>

[许可与免责声明](./docs/guide/declaration)
[正版查询](https://huohuastudio.com/verify)
[授权中心](https://huohuastudio.com/dashboard)

</template>
</LsHome>
