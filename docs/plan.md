# 工作室产品站点：计划

工作室三个产品（Keepbay、Novaix、Lsky Pro+）的官网和文档合并到这一个仓库，每个产品一个 VitePress 站点（官网首页 + 文档），共用一个主题包。

## 已定的决策（2026-11-13）

- **一个仓库、三个站点**：pnpm 工作区；共用主题放 `packages/theme`，各站点放 `sites/<产品>`，只放自己的内容和配置
- **域名**：每个产品的官网和文档用同一个域名，文档在 `/docs/` 下：
  - Keepbay：`keepbay.app`、`keepbay.app/docs/`
  - Novaix：`novaix.cc`、`novaix.cc/docs/`
  - Lsky Pro+：`www.lsky.pro`、`www.lsky.pro/docs/`
- **托管**：Cloudflare，每个站点一个项目，都连这个仓库，各自设根目录和构建监听路径（站点目录或共用主题变了才构建）；不用 GitHub Actions
- **按 VitePress 的惯例做**：不再有"产品切换"（每个产品一个站点）；版本切换做成顶部导航中的下拉菜单，每个版本有自己的路径和侧栏
- **外观沿用 VitePress 默认主题**（2026-11-13 用户定）：不按工作室设计规范改颜色、字体、阴影，只设各站点的品牌色和标识
- **保留**旧文档站右上角切换浅色/深色的圆形扩散动效（View Transitions，减少动态效果时直接切换）
- **官网取长补短，不照搬**：交互展台（Novaix 的机柜动画、仪表盘、产品展台）改用真实界面的截图；去掉过期活动、虚构的用户评价、过大的视频、强制跳转域名的代码
- **统计**：Cloudflare Web Analytics（不用 Cookie、不跟踪个人），去掉 Google Analytics
- **站点之间不互相链接**：页脚只保留版权一行「© 2018-当前年份 Spark Studio」（2026-11-13 用户定）；共用主题中不写任何产品名，各产品的内容只在自己的站点目录中
- **另外两个产品的代码不动**：两个官网只借鉴，文档从 `huohuastudio-docs` 拆分迁入
- **Keepbay 先只做官网**：文档的菜单先约定好，暂不写内容，等内测反馈后补
- **开发流程与 Keepbay 相同**：分批开发，每批代码审查和截图审查、修复复审、精简后提交推送，进度推送到手机
- **上线由用户操作**：W5 的 Cloudflare 项目、域名、DNS、停旧部署都由用户在网页上操作；这里准备好步骤和对照表，到时提醒用户

### Novaix（2026-11-13 用户定）

- **公测提示**：放在介绍、快速开始、安装三页的概述之后（`:::warning`），不做全站横条
- **Incus**：常见问题中排查用的 `incus` 命令和套餐管理中的一处说明保持旧文档原样（其余地方仍不写 Incus）
- **截图**：用 `novaix/_testing/site-shots-060/out/` 中 v0.6.0 的 8 张官网截图
- **价格**：沿用旧官网写法，授权版不写金额，写"订阅制，不限规模"，按钮链到 huohuastudio.com/products/novaix#plans（原写的 `/products/novaix/buy` 在工作室网站上不存在，W3 改正）
- **隐私政策**：统计相关段落改成 Cloudflare Web Analytics（不用 Cookie），生效日期改为 2026 年 11 月 13 日，其余条款不动
- **旧官网文案**：去掉首屏数字条、"~30MB"体积和 FAQ 中其他产品安全漏洞的说法；竞品问题只写 Novaix 自身特点并链到文档的竞品对比页
- **法律三页入口**：首页最后的行动按钮区下方放一行小字链接，页脚仍只有版权
- **导航**：文档、演示、下载、更新日志、购买授权，右侧 GitHub 图标链到 novaix-releases
- **内嵌帮助**：已发布的后台 CSP 只允许 iframe 加载 docs.huohuastudio.com，所以旧文档站上线后保留一段时间供内嵌帮助使用（内容不再更新），普通访问再跳转；下个 Novaix 版本把帮助地址和 CSP 改到 novaix.cc（只提醒，不改产品代码）

## 目录结构

```
packages/theme/        共用主题（继承 VitePress 默认主题）
  components/          主题切换动效、版本下拉、页脚、下载按钮、截图展示、价格表、FAQ 等
  search.ts            本地搜索的中文分词
  index.ts             导出主题和公共配置（defineSiteConfig）
sites/keepbay/         .vitepress/config.ts、index.md（官网首页）、docs/、public/
sites/novaix/
sites/lsky/
package.json           pnpm 工作区；VitePress 等依赖锁定精确版本
```

## 共用主题要做的

- **样式**：沿用默认主题，每个站点只设自己的品牌色和标识
- **主题切换动效**：从旧文档站的 `theme/Layout.vue` 迁来（`provide('toggle-appearance')` + `startViewTransition` 圆形扩散，300ms；不支持或减少动态效果时直接切换）
- **中文搜索**：本地搜索配置中文分词（`Intl.Segmenter`），默认按空格分词时中文整句搜不到
- **版本下拉**：导航中的标准下拉菜单（Lsky Pro+ 的旧版本用），旧版本页面顶部提示"这是旧版本的文档"并链到当前版本
- **嵌入模式**：`?embed=1` 时隐藏导航、侧栏、页脚，按 Esc 向父页面发 `help-doc-close`（Novaix 后台在 iframe 中内嵌帮助，已发布的版本依赖它）
- **图片放大**（medium-zoom）、mermaid（只在需要的站点打开）
- **页脚**：只有「© 2018-当前年份 Spark Studio」，年份构建时自动取当前年
- **搜索引擎和分享**：sitemap、robots、每页描述、canonical、分享预览图（OG）
- **严格检查链接**：`ignoreDeadLinks` 关闭（旧站打开了它，藏着十几个坏链）

## 各站点

### Novaix（novaix.cc）
- 文档：`huohuastudio-docs/docs/novaix/` 49 页迁到 `/docs/`，侧栏沿用 8 组（简介、部署、基础设施、业务运营、系统功能、通知与登录、扩展、参考）；修好依赖根路径的链接（如 `/novaix/shared-ip`）和图片路径；文档中不能出现 "Incus"（旧仓库的写作规范）
- 官网首页：一句话介绍、截图、单文件部署说明、功能、插件和主题市场（构建时取 novaix-releases 的 index.json）、价格（免费版和授权版对比）、FAQ、行动按钮；保留许可、条款、隐私三页
- 下载、更新日志链到 GitHub Releases；演示站链 novaix.huohuastudio.com

### Lsky Pro+（www.lsky.pro）
- 文档：当前版（guide 15 页、advanced 6 页）迁到 `/docs/`；旧版本（free v1、free v2、enterprise v1）放到 `/docs/archive/...`，导航中用版本下拉切换；文件名统一为小写（旧版本中有大小写混用），修好已经失效的链接；约 25 张挂在外站（box.kancloud.cn 等）的图片下载到本地
- 官网首页：介绍、功能、价格（免费版已停更，付费版）、FAQ、行动按钮；主题列表页 `/themes`（构建时取 lsky-pro-themes 的 index.json）；去掉过期活动横条、36 MB 视频（换成截图或压缩过的短视频）、`useDomainCheck`
- 导航保留演示、社区、正版查询、授权中心等外链
- **W3a 做法**：
  - 文档来源用 `lsky-docs/src/zh`（docs.lsky.pro 的仓库），不用 `huohuastudio-docs/docs/lsky-pro`：后者是从 Docusaurus 转回来的，标题的自定义锚点（`{#configure-queue}` 等）被去掉、`::: code-group` 被注释掉，正文其余部分相同
  - 路径：当前版 `docs/guide/*`、`docs/advanced/*`，旧版本 `docs/archive/{free/v1,free/v2,enterprise/v1}/*`，与旧站的子目录结构一致；`/docs/` 跳到 `/docs/guide/introduce`
  - 开源版 V1.x 的文件名改为小写（对照见"旧地址跳转"），其他版本本来就是小写
  - 图片放在各版本的 `images/` 目录（`docs/guide/images`、`docs/archive/<版本>/images`），旧版本之间不共用；外站图片 25 张下载到本地（box.kancloud.cn 要带 Referer 才能下载），开源版 V1.x 首页的标识用旧仓库的 `public/archive/logo.png`
  - 侧栏：当前版一个侧栏四组（简介、入门、核心功能、进阶）；每个旧版本一个侧栏；导航"文档""接口文档"（apifox）+ 版本下拉（标题 V2.x）
  - 旧版本页面只在 frontmatter 写了 title 的，补了一级标题；正文、锚点保持原样（旧链接中的中文锚点仍然有效）
  - 当前版：缺锚点的标题补了锚点；修好失效链接（`/guide/requirement`、`/advanced/theme#create-theme`、`./install#第四步-配置消息队列` 等）；"购买"链到 huohuastudio.com/products/lsky-pro#plans；"遇到问题"一段原来让读者到已经 404 的 www.lsky.pro/serves 找 QQ 群号，改为直接写 QQ 交流群 731983303（工作室网站产品页上的群号）、Telegram 群组和论坛；开源版 V1.x 中失效的 0xxb/lsky-pro 仓库链接改到 lsky-org/lsky-pro（v1.6.4 标签）；删掉云处理页中机器翻译遗留的一句
- **W3b 做法**：
  - 首页：首屏（购买授权、在线演示、阅读文档）、四个特点、界面一览、分组功能、主题、价格、常见问题、开始使用；功能清单按产品仓库 v2.5.2 的代码核对（储存、审核、支付、登录、短信、邮件驱动），不照搬旧官网
  - 截图：工作室网站 Lsky 产品页上的 5 张（1600×1000 WebP），放 `public/screenshots/`
  - 价格：开源版 ¥0（已停止更新）、付费版 ¥299.99（一次付费、永久使用、免费更新），与工作室产品页一致；购买按钮链到 huohuastudio.com/products/lsky-pro#plans
  - 常见问题按产品页现状改写：V 2.3.0 起后端核心代码加密；每个授权含 1 个域名；去掉旧官网中已被划掉的说法
  - 主题页 `/themes`：构建时读取 lsky-pro-themes 的 index.json，过滤掉仓库自带的 `demo` 示例条目；截图走 jsDelivr（raw.githubusercontent.com 在国内经常打不开）；没有主题时显示"暂无收录"，下面写投稿步骤
  - 导航：文档、主题、接口文档、演示、社区（论坛、Telegram 群组）、授权（购买授权、授权中心、正版查询）、版本下拉，右侧 GitHub 图标链到开源版仓库
  - 首页底部小字链接：许可与免责声明（文档中的页面）、正版查询、授权中心；Lsky 没有单独的条款和隐私页

### Keepbay（keepbay.app）
- 官网首页：介绍（平实文案）、截图、演示站入口（demo.keepbay.app）、主要功能、隐私承诺、下载（链到授权中心）、价格、FAQ
- 文档菜单先约定（下面是草案，开工时再确认），暂不写内容；导航中的"文档"先指向一页"文档整理中"
  - 开始使用：介绍、安装、首次设置、从旧版本升级
  - 文件管理：浏览和预览、上传和下载、回收站和撤销、收件箱
  - AI 功能：AI 桌面、语义搜索和以图搜图、AI 标签、自动整理、重要日期提醒、本地模型和云端模型
  - 家庭成员与分享：成员和权限、分享链接和水印
  - 系统设置：存储文件夹、备份与恢复、更新、通知、网络与代理、访问记录
  - 命令行
  - 隐私与安全、常见问题

## 旧地址跳转（不能断）

- `docs.huohuastudio.com/novaix/*` → `novaix.cc/docs/*`（参数原样带上，Novaix 后台的内嵌帮助跟着跳转）
- `docs.huohuastudio.com/lsky-pro/*` → `www.lsky.pro/docs/*`（旧版本路径另做对照表）
- `docs.lsky.pro/*` → `www.lsky.pro/docs/*`：2026-11-13 确认，docs.lsky.pro 是 `lsky-docs` 仓库发布到 GitHub Pages 的独立文档站（CNAME 在其工作流中写入），路径为 `/guide/xxx`、`/advanced/xxx`、`/archive/...`（没有 `/lsky-pro` 前缀），页面顶部有横幅提示迁到 docs.huohuastudio.com/lsky-pro
- `docs.huohuastudio.com/` → 工作室主页
- **Lsky 对照**（docs.huohuastudio.com 去掉 `/lsky-pro` 前缀后与 docs.lsky.pro 相同）：
  - `/lsky-pro/`、docs.lsky.pro 的 `/` → `/docs/guide/introduce`
  - `guide/*`、`advanced/*`、`archive/free/v2/*`、`archive/enterprise/v1/*` → `/docs/` 下同名路径
  - `archive/free/v1/` 下改了名的页面（其余同名）：

    | 旧路径 | 新路径 |
    |---|---|
    | `Install` | `install` |
    | `StorageStrategy` | `storage/` |
    | `SS/Local`、`SS/AliyunOSS`、`SS/TencentCloudCOS`、`SS/UpyunUSS`、`SS/KODO`、`SS/FTP` | `storage/local`、`storage/aliyun-oss`、`storage/tencent-cos`、`storage/upyun-uss`、`storage/qiniu-kodo`、`storage/ftp` |
    | `SystemParameters` | `settings/` |
    | `SP/BasicConf`、`SP/UploadConf`、`SP/UserConf`、`SP/MailConf`、`SP/OtherConf`、`SP/ImgSex` | `settings/basic`、`settings/upload`、`settings/user`、`settings/mail`、`settings/other`、`settings/image-audit` |
    | `Watermark`、`SystemUpdate`、`CommonQ`、`UpdateLog` | `watermark`、`upgrade`、`faq`、`changelog` |

  - 锚点：当前版沿用 docs.lsky.pro 的自定义锚点；docs.huohuastudio.com 上的版本没有自定义锚点，从那里复制的带中文锚点的链接跳过来后停在页面顶部
- 用 Cloudflare 的批量跳转或各站点的 `_redirects` 实现；从旧站生成一份新旧地址对照表，上线前逐条验证

## 批次

| 批次 | 内容 | 状态 |
|---|---|---|
| W1 | 仓库骨架、共用主题（主题切换动效、中文搜索、版本下拉、嵌入模式、页脚、SEO）、仓库规范 | 已完成 |
| W2 | Novaix 文档迁移 + 官网 | 已完成 |
| W3 | Lsky Pro+ 文档迁移（含旧版本）+ 官网 + 主题页 | 已完成 |
| W3c-1 | Lsky 当前版文档按 2.5.x 更新和改写：简介和入门（介绍、快速开始、环境要求、安装、升级、迁移、导入、常见问题、许可与免责声明） | 已完成 |
| W3c-2 | Lsky 当前版文档按 2.5.x 更新和改写：核心功能和进阶（储存、角色组、图片处理、云处理、AI、支付、缓存、命令、接口、分离部署、自定义储存、主题） | 未开始 |
| W4 | Keepbay 官网 + 文档菜单（在 Keepbay 演示站上线之后，要用演示站的入口和截图） | 未开始 |
| W5 | 上线：Cloudflare 项目、域名、旧地址跳转、停掉旧部署（DNS 和旧部署由用户操作，这里写好步骤） | 未开始 |

## 已知局限

- **Lsky 产品的导入命令有两个 bug（W3c-1 审查发现，产品仓库 lsky-pro-enterprise 的 `app/Console/Commands/ImportCommand.php`，本仓库不改产品代码，已告知用户）**：文档按现状写成"系统设置无法迁移""导入的分享请删除后重建"，产品修复后再改文档
  - 系统设置不会写入：`$configData` 是数字索引的数组，`Arr::undot` 后组名是 0、1……，永远不等于 `app`，`fill` 不会执行（约 207–225 行）
  - 分享关联错误：每个图片分享都关联旧库 `share_images` 整张表的图片，相册分享取整张 `share_albums` 表中的第一个相册，没有按分享 ID 筛选，可能把别人分享的图片暴露出去（约 525–535 行）

- 首页 FAQ 的回答是 frontmatter 中的 HTML（`HomeFaq` 用 v-html 输出），其中的站内链接不经过 markdown，构建时的坏链检查查不到；文档页改名或删除时，要同时搜一遍各站点 `index.md` 中的 `href="/docs/`

- Lsky 开源版 V1.x 腾讯云 COS 页中的一张补充截图（img.cdn.chs.pub）已失效，删掉图片，改成一句文字说明

- Lsky 主题页直接加载主题仓库中的原尺寸 `screenshot.png`；主题多了以后可以要求投稿时提交压缩过的 WebP
- Novaix 的 `market.data.ts` 和 Lsky 的 `themes.data.ts` 各有一份"取 JSON、超时、失败返回空"的逻辑，卡片样式也各一份；第三个站点也需要时再抽到共用主题

## 待确认

- **Lsky 许可与免责声明（W3c-1 发现，法律文本未改，待用户决定）**：
  - "购买须知"第 1 条写付款后提供"前端完整源码"，但产品打包脚本 `compile.sh` 排除了 `web/` 目录，安装包中没有前端源码；首页常见问题和快速开始都没有承诺前端源码
  - "许可证权利"写"在购买许可证的设备数量范围内安装"，授权实际按域名（每个授权含 1 个域名，含子域名）；"在许可证有效期内获得更新和技术支持"与"一次付费、永久使用、免费更新"的说法容易混淆

## 已确认（2026-11-13 用户定）

- **Novaix 法律条款**：许可协议 2.1、第 4 条一项、5.3 和隐私政策 6.3 改为与产品行为一致（免费版无需许可证；宽限期结束后降级为免费版；只有主题故障恢复会设置 `_novaix_fallback` 功能性 Cookie），已提交 03a87f6
- **先后顺序**：先做 W3c（Lsky 文档），W4 等 Keepbay 演示站上线（2026-11-13 时 demo.keepbay.app 返回 525）
- **上线时机**：先在 Cloudflare 的预览地址上验收，用户确认后由用户切 DNS、停旧部署（Lsky 官网的 Deployer 部署、Novaix 官网和旧文档站的 GitHub Pages）
- **Lsky W3a、W3b 的暂定项全部确认**：版本下拉标题"V2.x"及四个菜单项；首页用工作室产品页的 5 张截图；主题页过滤 `demo` 示例条目；价格表对比行按代码重写
- **Lsky 当前版文档另做一批（W3c）**：按 2.5.x 更新事实并按写作规范改写语气，见下"W3c 做法"

## W3c 做法

- 范围：只改当前版（`docs/guide/*`、`docs/advanced/*`），旧版本不动；页面路径和已有锚点不变（旧地址跳转、站内链接依赖它们）
- 事实来源：lsky-pro-enterprise 仓库（v2.5.2）的代码、`CHANGELOG.md`、`lang/zh_CN`、`.env.example`、`docker/`；文档与代码不一致时以代码为准
- 已知要改的：快速开始"未加密的完整源码"（V 2.3.0 起后端核心代码加密）、"一个主域名和三个子域名"（每个授权含 1 个域名）；AI 供应商 6 家 → 19 家并补 AI 大模型审核；支付补 Stripe；2.5.x 新增的命令、运行环境检测、修复安装、主题导入默认禁用等补进对应页面
- 语气按本仓库的文档写作规范：用"您"、去掉"帅气站长""虚心请教"之类的口语和营销用语
- 许可与免责声明（`declaration.md`）是法律文本：只核对事实，不改写语气
- W3c-2 改写 storage.md 时：把支持的储存驱动列表、兼容 S3 的储存（MinIO、Backblaze B2 的 `Region`、`params.ACL`）、命名规则与重复上传的行为写进储存页，常见问题中的对应条目只留结论并链接过去（W3c-1 精简时定）
