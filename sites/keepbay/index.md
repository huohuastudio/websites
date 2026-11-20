---
layout: home
title: Keepbay
titleTemplate: 自部署的私有网盘
description: Keepbay 是自部署的私有网盘，安装在您自己的服务器或 NAS 上，直接管理已有的文件夹。提供文件预览、照片时间线、分享和收集文件、家庭成员权限，专业版另有在本地运行的 AI 搜索和整理。文件和数据不经过我们。
# 首页不套文档正文样式，版式由 .vitepress/theme/home/ 中的首页组件负责
markdownStyles: false

# 价格卡片（共用主题的 SxPlans）：每个版本只列各自的要点，逐项对比在下面的 pricing 中
plans:
  - name: 免费版
    price: ¥0
    note: 永久免费
    items:
      - 不限文件夹和文件数量
      - 文件管理、预览、搜索、分享
      - 照片时间线、地点和照片地图
      - 收集文件、历史版本、离线下载、通知
      - 两步验证、通行密钥、外部帐号登录
      - 家庭成员最多 2 人（含所有者）
    action:
      text: 下载安装
      link: https://github.com/huohuastudio/keepbay-releases/releases
      theme: alt
  - name: 专业版
    price: ¥199
    note: 永久使用，含 1 年更新
    featured: true
    items:
      - 免费版的全部功能
      - 语义搜索、以图搜图、识别图片中的文字
      - 认识的人、宠物
      - AI 桌面、收件箱、AI 标签、日期提醒
      - 证件照水印、远程文件夹
      - 家庭成员不限
    action:
      text: 了解专业版
      link: ./docs/pro

# 价格下方折叠的完整对比
pricing:
  rows:
    - { name: 文件管理、预览、上传下载、回收站, values: [true, true] }
    - { name: 收藏、最近、照片时间线、历史版本, values: [true, true] }
    - { name: 按地点浏览照片、照片地图, values: [true, true] }
    - { name: 文件名和全文搜索, values: [true, true] }
    - { name: 标签和智能文件夹, values: [true, true] }
    - { name: 分享链接、收集文件, values: [true, true] }
    - { name: 通知（Bark、邮件、企业微信、钉钉、飞书、Telegram）, values: [true, true] }
    - { name: 离线下载, values: [true, true] }
    - { name: 两步验证、通行密钥、外部帐号登录, values: [true, true] }
    - { name: 日志、自动备份、在线更新, values: [true, true] }
    - { name: 家庭成员, values: [最多 2 人（含所有者）, 不限] }
    - { name: 语义搜索、以图搜图、识别图片中的文字, values: [false, true] }
    - { name: 认识的人、宠物, values: [false, true] }
    - { name: AI 桌面, values: [false, true] }
    - { name: 收件箱自动整理, values: [false, true] }
    - { name: AI 标签, values: [false, true] }
    - { name: 重要日期提醒, values: [false, true] }
    - { name: 证件照水印, values: [false, true] }
    - { name: 远程文件夹（S3 兼容存储、WebDAV、SFTP）, values: [false, true] }

faq:
  - q: 和普通网盘有什么不一样？
    a: 大多数网盘会把文件导入自己的存储，转换成专有的存储结构。Keepbay 不移动文件，您的文件夹保持原样，Keepbay 只读取文件、建立索引，并在此基础上提供管理、搜索和分享。NAS 自带的文件管理和其他程序在 Keepbay 之外做的改动，Keepbay 会发现并更新索引。详见<a href="/docs/introduce#folders-first">为什么以文件夹为准</a>。
  - q: Keepbay 会改动我文件夹里的东西吗？
    a: 只在以下情况下改动：您执行上传、新建、改名、移动、删除，您确认 AI 桌面列出的计划，或者收件箱按您的设置整理其中的文件（开启自动模式时，命中规则的文件会直接移动，不再逐个确认）。Keepbay 不会主动整理收件箱以外的文件夹。以只读方式添加的文件夹，Keepbay 不做任何写入。详见<a href="/docs/faq#modify-files">常见问题</a>。
  - q: 卸载了 Keepbay，文件还在吗？
    a: 在。卸载只删除程序和数据目录（索引、缩略图、设置），文件夹中的文件保持不变。
  - q: 我的文件会传到你们那里吗？
    a: 不会。无需注册我们的帐号，文件和数据都在您自己的服务器上（用了远程文件夹的，文件在您自己选的远程存储上）。Keepbay 主动联网的只有检查和安装更新、激活和续期专业版、下载本地模型，以及您自己配置的云端 AI、远程存储、外部登录、通知、离线下载、在线地图、测试代理和自定义的模型清单。每种情况发送什么，见<a href="/docs/privacy#outbound">Keepbay 什么时候联网</a>。
  - q: AI 会把我的文件发到云端吗？
    a: 默认不会。语义搜索、按画面搜图、识别图片中的文字都有本地模型，其中按画面搜图和识别文字只能用本地模型，照片不会发送到云端；认识的人和宠物也只用本地模型，人脸不会发送到云端。是否使用云端模型由您决定，界面上写明每项功能会发送什么。自动整理、AI 标签、日期提醒这三项后台功能，还要逐项再允许一次；语义搜索选了云端的向量模型时，建立索引会把文件中的文字发给厂商。详见<a href="/docs/privacy#ai">隐私与安全</a>。
  - q: 文件是加密存储的吗？
    a: 没有做端到端加密。服务端要给文件生成缩略图、提取文字、交给 AI 分析，加密后这些功能都无法实现。因此我们不使用"零知识""只有您能看到"这类说法。服务器本身的安全，比如系统更新、防火墙、磁盘加密，仍需由您负责。
  - q: 免费版有什么限制？
    a: 不限文件夹和文件数量，文件管理、预览、照片时间线和地图、搜索、标签、分享、离线下载都能用。家庭成员最多 2 人（含所有者），AI 功能（包括认识的人和宠物）、证件照水印和远程文件夹属于专业版。已经免费的功能，以后不会改成收费。
  - q: 专业版是订阅制吗？
    a: 不是。购买专业版后，已安装的版本可以永久使用。价格中含 1 年更新，1 年后如需安装新的功能版本，可以续费一年更新（¥79）；不续费也可以继续使用，安全修复始终免费。详见<a href="/docs/pro#license-model">永久使用，含 1 年更新</a>。
  - q: 一个授权能装几台？
    a: 每个授权包含 3 个设备名额，比如家里的主机、NAS，再加一台备用的。需要更多时，可以在授权中心网站用积分添加。换设备时，在授权中心网站把旧设备换绑为新设备即可，见<a href="/docs/pro#transfer">换设备</a>。
  - q: 需要什么样的设备？
    a: 一台装 Linux 的服务器、NAS 或小主机，x86_64 或 arm64 架构，glibc 2.28 及以上（Debian 10、Ubuntu 20.04、RHEL 8 起）。能 SSH 登录、满足这些条件的 NAS 也可以装，部分群晖机型有限制，见<a href="/docs/install#nas">NAS</a>。
  - q: 有 Docker 镜像、Windows 版或手机 App 吗？
    a: 有 Docker 镜像（x86_64、arm64），见<a href="/docs/docker">Docker 安装</a>。Windows 版和手机 App 暂时没有：如果家中只有 Windows 或 Mac 电脑，可以安装在 NAS、软路由或一台小主机上。网页可以在手机浏览器上正常使用，支持上传、预览和分享。
  - q: 能管理 S3、WebDAV、SFTP、百度网盘、阿里云盘上的文件吗？
    a: S3 兼容的对象存储、WebDAV（坚果云、Nextcloud、群晖等）和 SFTP，专业版可以直接添加为<a href="/docs/remote-folders">远程文件夹</a>。国内网盘不能直接连接，可以先添加到 OpenList，再经它的 WebDAV 接入，或者用 rclone 同步到本地或挂载，详见<a href="/docs/cloud-storage">云盘</a>。
---

<script setup>
import KbHome from './.vitepress/theme/home/KbHome.vue'
</script>

<KbHome />
