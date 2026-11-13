---
layout: home
title: Lsky Pro+
titleTemplate: 图床和云端相册程序

hero:
  name: Lsky Pro+
  text: 自己搭建的图床和云端相册
  tagline: 基于 Laravel 开发。图片可以存到本地或各家对象储存，带多用户、角色组、图片处理、内容审核、套餐和在线支付。
  image:
    src: /logo.png
    alt: Lsky Pro+
  actions:
    - theme: brand
      text: 购买授权
      link: https://huohuastudio.com/products/lsky-pro#plans
    - theme: alt
      text: 在线演示
      link: https://v2.lskypro.com
    - theme: alt
      text: 阅读文档
      link: /docs/guide/introduce

features:
  - title: 多种储存
    details: 本地、AWS S3、阿里云 OSS、腾讯云 COS、七牛云、又拍云、多吉云、SFTP、FTP、WebDAV，兼容 S3 接口的 MinIO、Backblaze B2 也能接入。
  - title: 角色组
    details: 按角色组分配可用的储存、容量、上传频率和各项功能，不同用户使用不同的规则。
  - title: 图片处理
    details: 上传时缩放、裁剪、加水印、转换格式；云处理通过地址参数取得同一张图片的不同尺寸和效果。
  - title: 运营功能
    details: 套餐、订单、优惠券、在线支付、工单、公告和举报管理，可以直接对外提供图床服务。

screenshots:
  - src: /screenshots/upload.webp
    title: 上传
    desc: 批量上传和上传队列
    width: 1600
    height: 1000
  - src: /screenshots/photos.webp
    title: 图片管理
    desc: 按日期分组浏览图片
    width: 1600
    height: 1000
  - src: /screenshots/albums.webp
    title: 相册
    desc: 相册管理
    width: 1600
    height: 1000
  - src: /screenshots/storage.webp
    title: 储存
    desc: 多个储存：本地、OSS、COS、S3 等
    width: 1600
    height: 1000
  - src: /screenshots/dashboard.webp
    title: 管理后台
    desc: 管理后台的仪表盘
    width: 1600
    height: 1000

featureGroups:
  - title: 上传与管理
    items:
      - name: 多种上传方式
        desc: 批量上传、拖拽上传、粘贴上传，带上传队列
      - name: 相册
        desc: 按相册整理图片，相册可以设置访问密码
      - name: 分享
        desc: 分享相册或图片，分享链接可以加密码
      - name: 广场和用户主页
        desc: 展示公开的图片和相册
      - name: 打包下载
        desc: 管理员可以把指定用户的全部图片打包下载
  - title: 储存与处理
    items:
      - name: 储存
        desc: 一个站点可以创建多个储存，每个储存选择一种驱动
      - name: 图片处理
        desc: 缩放、裁剪、水印、格式转换，支持 Imagick 和 libvips；上传时同步或异步处理，已有图片可以重新处理
      - name: 云处理
        desc: 在图片地址后加参数，按需生成不同尺寸、裁剪和滤镜效果
      - name: AI
        desc: 图片润色、自动打标签、自动生成描述，对接多家大模型服务
  - title: 安全与审核
    items:
      - name: 图片审核
        desc: 支持阿里云、腾讯云、百度、NSFW.js、ModerateContent 和 AI 大模型审核，违规图片可以删除或标记
      - name: 社会化登录
        desc: GitHub、QQ，以及通用 OAuth2 / OIDC（Keycloak、Authentik、Gitea 等）
      - name: 短信和邮件
        desc: 国内外 30 多种短信服务；邮件支持 SMTP、Mailgun、Postmark 和 Amazon SES
  - title: 运营
    items:
      - name: 套餐和订单
        desc: 出售会员（角色组）套餐和容量套餐，支持优惠券
      - name: 在线支付
        desc: 支付宝、微信支付、银联、PayPal、Stripe 和易支付
      - name: 工单和反馈
        desc: 工单、意见反馈、举报管理和违规记录
      - name: 站内内容
        desc: 公告和独立页面
      - name: 开放接口
        desc: 100 多个接口，可以开发客户端或对接其他系统

pricing:
  plans:
    - name: 开源版
      price: ¥0
      note: 已停止更新
      action:
        text: 获取开源版
        link: https://github.com/lsky-org/lsky-pro
        theme: alt
    - name: 付费版
      price: ¥299.99
      note: 一次付费，永久使用，后续更新免费
      action:
        text: 购买授权
        link: https://huohuastudio.com/products/lsky-pro#plans
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

## 界面一览 {#screenshots}

<HomeShowcase :items="$frontmatter.screenshots" />

## 功能 {#features}

<HomeFeatureList :groups="$frontmatter.featureGroups" />

## 主题 {#themes}

付费版从 V 2.3.0 起支持主题，可以替换前台界面，也可以自己开发。已收录的主题见[主题列表](./themes)，开发方法见[主题](./docs/advanced/theme)。

## 价格 {#pricing}

开源版已经停止更新；付费版一次付费、永久使用，购买后可以免费升级到之后的所有版本。

<HomePricing :plans="$frontmatter.pricing.plans" :rows="$frontmatter.pricing.rows" />

## 常见问题 {#faq}

<HomeFaq :items="$frontmatter.faq" />

## 开始使用 {#start}

<HomeActions :actions="[
  { text: '购买授权', link: 'https://huohuastudio.com/products/lsky-pro#plans' },
  { text: '阅读文档', link: '/docs/guide/introduce', theme: 'alt' },
]">

[许可与免责声明](./docs/guide/declaration) · [正版查询](https://huohuastudio.com/verify) · [授权中心](https://huohuastudio.com/dashboard)

</HomeActions>
