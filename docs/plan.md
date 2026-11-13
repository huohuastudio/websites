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
- **价格**：沿用旧官网写法，授权版不写金额，写"订阅制，不限规模"，按钮链到 huohuastudio.com/products/novaix/buy
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
- `docs.lsky.pro/*` → `www.lsky.pro/docs/*`（开工时先确认它现在指向哪里）
- `docs.huohuastudio.com/` → 工作室主页
- 用 Cloudflare 的批量跳转或各站点的 `_redirects` 实现；从旧站生成一份新旧地址对照表，上线前逐条验证

## 批次

| 批次 | 内容 | 状态 |
|---|---|---|
| W1 | 仓库骨架、共用主题（主题切换动效、中文搜索、版本下拉、嵌入模式、页脚、SEO）、仓库规范 | 已完成 |
| W2 | Novaix 文档迁移 + 官网（W2a 文档和 mermaid 已完成，W2b 官网进行中） | 进行中 |
| W3 | Lsky Pro+ 文档迁移（含旧版本）+ 官网 + 主题页 | 未开始 |
| W4 | Keepbay 官网 + 文档菜单（在 Keepbay 演示站上线之后，要用演示站的入口和截图） | 未开始 |
| W5 | 上线：Cloudflare 项目、域名、旧地址跳转、停掉旧部署（DNS 和旧部署由用户操作，这里写好步骤） | 未开始 |

## 待确认

- 先后顺序——按推荐项暂定：先完成 Keepbay 20b2，再做 W1–W3，W4 在 Keepbay 演示站上线之后
- 上线时机：先在 Cloudflare 的预览地址上验收，用户确认后由用户切 DNS、停旧部署（Lsky 官网的 Deployer 部署、Novaix 官网和旧文档站的 GitHub Pages）
