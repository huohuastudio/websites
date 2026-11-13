---
layout: home
title: Keepbay
titleTemplate: 自部署的私有网盘

hero:
  name: Keepbay
  text: 自部署的私有网盘
  tagline: 装在您自己的服务器或 NAS 上，给您和家人用。文件留在原来的文件夹里，AI 默认在您自己的设备上运行。
  image:
    src: /logo.svg
    alt: Keepbay
  actions:
    - theme: brand
      text: 下载安装
      link: /docs/install
    - theme: alt
      text: 在线演示
      link: https://demo.keepbay.app
    - theme: alt
      text: 阅读文档
      link: /docs/introduce

features:
  - title: 文件留在原处
    details: Keepbay 只建立索引，不搬动文件，也不改目录结构。NAS 的共享、Jellyfin、Syncthing 照常用，哪天卸载了，文件一个都不少。
  - title: 数据不经过我们
    details: 不用注册我们的帐号。程序里没有统计、遥测和崩溃上报，网页不加载任何第三方的脚本、字体或图片。
  - title: AI 默认在本地
    details: 语义搜索、按画面搜图、识别图片中的文字都有本地模型。用不用云端模型由您决定，照片从来不会发给云端。
  - title: 一家人共用
    details: 按文件夹给家人授权只读或读写。没有授权的文件夹，家人看不到，也不知道它们存在。

privacy:
  - title: 数据在哪里
    items:
      - name: 只在您自己的设备上
        desc: 文件在您的硬盘上，索引、缩略图、设置存在您的服务器上
      - name: 不收集任何数据
        desc: 没有统计、遥测和崩溃上报
      - name: 联网有清单
        desc: 检查更新、激活专业版、下载本地模型，以及您自己配置的服务，每种情况发送什么都写在文档里
  - title: AI
    items:
      - name: 能在本地做的就在本地做
        desc: 本地模型在您的设备上运行，什么都不发出去
      - name: 云端由您决定
        desc: 界面上写明每项功能发送什么；后台自动处理文件的三项功能，还要逐项再允许一次
      - name: 每次调用都有记录
        desc: 谁发起的、哪项功能、发送了哪类数据、花了多少钱
  - title: 家人和访客
    items:
      - name: 按文件夹授权
        desc: 成员只看得到授权给他的文件夹
      - name: 让数据离开的事默认关闭
        desc: 创建分享链接、使用云端 AI、离线下载，要所有者按人打开
      - name: 访问记录
        desc: 登录、下载、分享链接的打开和下载都有记录，保留 180 天
      - name: 分享有期限
        desc: 分享链接默认 7 天后失效，可以设密码、下载次数和限速
  - title: 登录和文件处理
    items:
      - name: 安全功能不收费
        desc: 两步验证、通行密钥、外部帐号登录都在免费版中
      - name: 照片在隔离的进程中解码
        desc: 这个进程不能联网、不能打开其他文件，特制的图片攻破了解码器，也读不到数据库和密钥；视频和 HEIC 交给 ffmpeg，可以只读打开文件，但不能联网、不能写文件

featureGroups:
  - title: 文件管理
    items:
      - name: 浏览和预览
        desc: 列表和网格视图，十万个文件的文件夹照样流畅；预览图片（包括相机 RAW）、视频、音频、PDF、Office 文档、文本和代码
      - name: 上传和下载
        desc: 上传支持断点续传，可以打包下载
      - name: 撤销和回收站
        desc: 移动、复制、改名、移到回收站都能撤销；删除的文件默认先进回收站
      - name: 离线下载
        desc: 让服务器去下载网址、磁力链接，装了 yt-dlp 还能下载视频网站的视频
  - title: 搜索
    items:
      - name: 文件名和全文
        desc: 按文件名搜索，支持拼音首字母；有文字层的文档可以搜全文
      - name: 标签和智能文件夹
        desc: 手动打标签，把常用的搜索条件存成智能文件夹
      - name: 语义搜索（专业版）
        desc: 按意思搜文档，按画面搜照片，搜照片里的文字
  - title: AI 整理（专业版）
    items:
      - name: AI 桌面
        desc: 用聊天的方式找文件、整理文件；要动文件时先列出计划，您确认了才执行
      - name: 收件箱自动整理
        desc: 收件箱中的文件按您定的规则或 AI 的建议归档，每次移动都能撤销
      - name: AI 标签
        desc: 从您建的标签中挑合适的，自动打到文件上
      - name: 重要日期提醒
        desc: 从护照、合同、保单中读出到期日，确认后通过 Bark 或邮件提醒
  - title: 家人和分享
    items:
      - name: 成员和权限
        desc: 按文件夹授权只读或读写；免费版最多 2 人（含所有者），专业版不限
      - name: 外部帐号登录
        desc: 用 Authentik、Keycloak、Google、Microsoft、GitHub 等帐号登录
      - name: 分享链接
        desc: 可以设密码、有效期、下载次数和限速；分享带拍摄地点的照片时会提醒
      - name: 证件照水印（专业版）
        desc: 分享证件照片时加上"仅用于某某用途"的水印，访客拿不到原图
  - title: 维护
    items:
      - name: 自动备份
        desc: 每天备份一次数据库，保留最近 7 份
      - name: 在线更新
        desc: 在网页上检查和安装新版本
      - name: 命令行
        desc: 重置密码、解锁帐号、检查环境、备份和恢复数据库

pricing:
  plans:
    - name: 免费版
      price: ¥0
      note: 永久免费
      action:
        text: 下载安装
        link: /docs/install
        theme: alt
    - name: 专业版
      price: ¥199
      note: 永久使用，含 1 年更新
      action:
        text: 了解专业版
        link: /docs/pro
  rows:
    - { name: 文件管理、预览、上传下载、回收站, values: [true, true] }
    - { name: 文件名和全文搜索, values: [true, true] }
    - { name: 标签和智能文件夹, values: [true, true] }
    - { name: 分享链接, values: [true, true] }
    - { name: 离线下载, values: [true, true] }
    - { name: 两步验证、通行密钥、外部帐号登录, values: [true, true] }
    - { name: 访问记录、自动备份、在线更新, values: [true, true] }
    - { name: 家庭成员, values: [最多 2 人（含所有者）, 不限] }
    - { name: 语义搜索、以图搜图、识别图片中的文字, values: [false, true] }
    - { name: AI 桌面, values: [false, true] }
    - { name: 收件箱自动整理, values: [false, true] }
    - { name: AI 标签, values: [false, true] }
    - { name: 重要日期提醒, values: [false, true] }
    - { name: 证件照水印, values: [false, true] }

faq:
  - q: 和普通网盘有什么不一样？
    a: 大多数网盘会把文件导入自己的存储，换成只有它认得的结构。Keepbay 不搬文件，您的文件夹原样不动，它只读一遍、建立索引，在此基础上做管理、搜索和分享。NAS 自带的文件管理和其他程序在外面做的改动，Keepbay 会发现并更新索引。详见<a href="/docs/introduce#folders-first">为什么以文件夹为准</a>。
  - q: Keepbay 会改动我文件夹里的东西吗？
    a: 只在您让它改的时候改：上传、新建、改名、移动、删除，您确认了 AI 桌面列出的计划，或者收件箱按您的设置整理其中的文件（开了自动模式时，命中规则的文件直接移过去，不再逐个确认）。它不会自己去"整理"收件箱以外的文件夹。以只读方式添加的文件夹，Keepbay 不做任何写入。详见<a href="/docs/faq#modify-files">常见问题</a>。
  - q: 卸载了 Keepbay，文件还在吗？
    a: 在，一个都不少。卸载只删程序和数据目录（索引、缩略图、设置），文件夹里的文件原样不动。
  - q: 我的文件会传到你们那里吗？
    a: 不会。不用注册我们的帐号，文件和数据都在您自己的服务器上。Keepbay 主动联网的只有检查和安装更新、激活和续期专业版、下载本地模型，以及您自己配置的云端 AI、外部登录、通知、离线下载、测试代理和自定义的模型清单。每种情况发送什么，见<a href="/docs/privacy#outbound">Keepbay 什么时候联网</a>。
  - q: AI 会把我的文件发到云端吗？
    a: 默认不会。语义搜索、按画面搜图、识别图片中的文字都有本地模型，其中按画面搜图和识别文字只能用本地模型，照片从来不会发给云端。用不用云端模型由您决定，界面上写明每项功能会发送什么。自动整理、AI 标签、日期提醒这三项后台功能，还要逐项再允许一次；语义搜索选了云端的向量模型时，建立索引会把文件中的文字发给厂商。详见<a href="/docs/privacy#ai">隐私与安全</a>。
  - q: 文件是加密存储的吗？
    a: 没有做端到端加密。服务端要给文件生成缩略图、提取文字、交给 AI 分析，加密了这些都做不了。所以我们不说"零知识""只有您能看到"这类话，服务器本身的安全，比如系统更新、防火墙、磁盘加密，仍然要靠您来照顾。
  - q: 免费版有什么限制？
    a: 不限文件夹和文件数量，文件管理、预览、搜索、标签、分享、离线下载都能用。家庭成员最多 2 人（含所有者），AI 功能和证件照水印属于专业版。已经免费的功能，以后不会改成收费。
  - q: 专业版是订阅制吗？
    a: 不是。买了专业版，已经装的版本永久可以用。价格中含 1 年更新，1 年后想装新的功能版本，再续一年更新（¥79）；不续也照常使用，安全修复始终免费。详见<a href="/docs/pro#license-model">永久使用，含 1 年更新</a>。
  - q: 一个授权能装几台？
    a: 每个授权最多激活 3 台设备，比如家里的主机、NAS，再加一台备用的。换设备时在授权中心解绑旧设备即可，见<a href="/docs/pro#devices">设备</a>。
  - q: 需要什么样的设备？
    a: 一台装 Linux 的服务器、NAS 或小主机，x86_64 或 arm64 架构，glibc 2.28 及以上（Debian 10、Ubuntu 20.04、RHEL 8 起）。能 SSH 登录、满足这些条件的 NAS 也可以装，部分群晖机型有限制，见<a href="/docs/install#nas">NAS</a>。
  - q: 有 Docker 镜像、Windows 版或手机 App 吗？
    a: 目前都没有。内测期只提供 Linux 安装包，Docker 镜像以后会考虑。家里只有 Windows 或 Mac 的，可以装在 NAS、软路由或一台小主机上。网页在手机浏览器上可以正常使用，上传、预览、分享都没问题。
  - q: 能管理 S3、百度网盘、阿里云盘上的文件吗？
    a: Keepbay 不直接连接云存储，但可以先把它们变成服务器上的文件夹：用 rclone 同步到本地或者挂载，国内网盘再经 OpenList 转一下。详见<a href="/docs/cloud-storage">云盘和对象存储</a>。
---

::: warning 内测阶段
Keepbay 目前处于内测阶段（0.1.0-beta），功能和界面还会调整，暂时只提供 Linux 安装包。用于存放重要资料前，请先做好备份。
:::

## 先看看效果 {#demo}

打开演示站 [demo.keepbay.app](https://demo.keepbay.app)，用帐号 `demo` 或 `family` 登录，密码 `keepbay-demo`。

演示站每小时恢复一次，不用担心改坏了什么。

## 文件留在原来的文件夹里 {#folders-first}

很多网盘会把文件导入自己的存储。程序出了问题，或者想换一个时，文件不容易取出来。

Keepbay 不这么做。您的文件夹原样不动，名字和目录结构都不变，Keepbay 只是读一遍、建立索引。

NAS 自带的文件管理、SMB 共享、Jellyfin、相册程序、Syncthing 照常工作，它们在外面做的改动，Keepbay 会发现并更新索引。

AI 也遵守这个原则：它不会自己去整理您已有的文件夹，只给文件打标签。一家人共用的文件夹被 AI 擅自整理后，其他人就找不到东西了。

Keepbay 替您移动文件，只有两种情况：您指定为收件箱的文件夹，其中的文件按您定的规则或 AI 的建议归档；或者您在 AI 桌面确认了它列出的计划。每一次移动都有记录，可以撤销。

## 隐私与安全 {#privacy}

照片、证件、合同、病历，家里最私密的东西都会放进网盘。所以隐私与安全是我们做 Keepbay 时最先考虑的事。

<HomeFeatureList :groups="$frontmatter.privacy" />

也要说清楚我们没做的：Keepbay 没有端到端加密，因为服务端要生成缩略图、提取文字、交给 AI 分析。服务器本身的安全，比如系统更新、防火墙、磁盘加密，仍然要靠您来照顾。

每种情况发送什么、密钥怎么保存、请求经过哪些检查，见[隐私与安全](./docs/privacy)。

## 功能 {#features}

<HomeFeatureList :groups="$frontmatter.featureGroups" />

## 安装 {#install}

Keepbay 是一个程序加一个 `lib/` 目录，解压就能运行，不用另装数据库、Web 服务器或运行环境。

需要一台 Linux 服务器、NAS 或小主机：x86_64 或 arm64，glibc 2.28 及以上（Debian 10、Ubuntu 20.04、RHEL 8 起）。

按[安装](./docs/install)一步步来，全程大约十分钟。

## 价格 {#pricing}

免费版是一个完整的私有网盘，不限文件夹和文件数量。专业版加上 AI 整理和搜索，成员不限。

专业版一次购买、永久使用，含 1 年更新。之后想装新的功能版本，续一年更新 ¥79；不续也照常使用，安全修复始终免费。

我们没有做订阅制：资料放在 Keepbay 里，不续费就停功能，会让人不安。

专业版将在 1.0.0 正式版发布时开始销售，价格以届时的购买页为准。正式版发布后 3 个月内首发价 ¥129。每个授权最多激活 3 台设备。

<HomePricing :plans="$frontmatter.pricing.plans" :rows="$frontmatter.pricing.rows" />

## 常见问题 {#faq}

<HomeFaq :items="$frontmatter.faq" />

更多问题见[常见问题](./docs/faq)。没找到答案的，欢迎发邮件到 support@huohuastudio.com。

## 开始使用 {#start}

<HomeActions :actions="$frontmatter.hero.actions" />
