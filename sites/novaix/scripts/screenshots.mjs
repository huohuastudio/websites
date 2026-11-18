// Novaix 官网首页的截图：浅色、深色各一套，输出到 public/screenshots/<名称>-<light|dark>.webp，尺寸写进 .vitepress/theme/screenshots.json
// 用法：pnpm --filter ./sites/novaix shots [名称...]，不写名称时截全部
// 需要：Playwright 的 Chromium（pnpm exec playwright install chromium）、cwebp（brew install webp）、ImageMagick（brew install imagemagick）
// 演示环境在 novaix 仓库的 _testing/ 中（不进 git）：site-shots-060/prepare.sh 用当前代码构建、填充演示数据并启动在 18062 端口，
// 然后执行 site-shots-w24/seed.sql（节点组、工单、支付、发票、VPC）和 polish.py（公网地址换成文档网段、名称和时间更像真实运营），
// 重启服务。账号 admin / admin123。测试环境没有真实节点：实例运行状态、节点监控用模拟数据（见 mock）
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bounds, clipOf, corner, save, sizeOf, writeManifest } from '../../../scripts/shots-lib.mjs'

const base = process.env.NOVAIX_URL ?? 'http://127.0.0.1:18062'
const site = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(site, 'public/screenshots')
const manifestFile = join(site, '.vitepress/theme/screenshots.json')

// 截图的尺寸（W31：首页上界面文字的显示尺寸不小于原尺寸的 0.85，Windows 1 倍屏上才看得清，见 docs/plan.md）。
// 每张截图在 card 中写截取区域的宽高（width、height，CSS 像素）、截图窗口（viewport）和左上角（at）：
// - 首屏的仪表盘、插件是完整界面：窗口 1024 × 640（后台按宽屏布局显示的最小宽度），截整个窗口
// - 其余是卡片中的局部图，只截与说明相关的部分，区域与首页上截图框的宽高比相同，宽度为截图框显示宽度 ÷ 0.9（见 slots）
// 首页上显示宽度固定的（写了显示宽度 show），按显示尺寸出 1 倍、1.25 倍、2 倍三张，首页按屏幕挑选、1:1 显示，
// 不再由浏览器缩小（Windows 1 倍屏上缩小的位图文字发虚）。先按 2 倍渲染（倍数 = 2 × show ÷ 区域宽度），再用 Lanczos 缩成另两张：
// 按 0.9、1.125 这种倍数直接渲染时文字本身就画软了（W31，2026-11-18 对比后定）。
// 在固定舞台中缩放显示的（仪表盘、实例）做不到 1:1，按 2 倍截一张。出图的做法见 scripts/shots-lib.mjs
const wide = { width: 1024, height: 640 }

// 首页上截图框的尺寸对应的截取区域（CSS 像素），show 是截图框的显示宽度（宽屏下固定）。
// 截图框铺满（object-fit: cover，左上对齐），区域的高度按 show 换算后不小于截图框的高度：
// - flow：「从下单到售后」的截图面板，截图框 569 × 343
// - modes：「容器和虚拟机」的实例页面，截图框 589–710 × 368–444（随视口高度，固定舞台中缩放），按最小时不低于 0.85 算
// - vpc、nodeStats、users、cms：「基础设施、运营和集成」的截图格，截图框 649 × 550、474 × 300、474 × 270、649 × 290
const slots = {
  flow: { width: 632, height: 382, show: 569 },
  modes: { width: 690, height: 431 },
  vpc: { width: 721, height: 612, show: 649 },
  nodeStats: { width: 527, height: 334, show: 474 },
  users: { width: 527, height: 301, show: 474 },
  cms: { width: 721, height: 323, show: 649 },
}

const GB = 1024 ** 3
const ok = (data) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, message: 'ok', data }) })

/** 测试环境没有真实节点：实例运行状态（管理端和用户端）、5 号节点的监控数据用模拟数据 */
async function mock(page) {
  await page.route(/\/api\/v1\/(admin|portal)\/instances\/\d+\/state$/, (r) => r.fulfill(ok({
    status: 'Running', cpu_usage: 2_400_000_000, mem_used: Math.round(816.2 * 1024 ** 2), mem_total: 2 * GB,
    disk_used: 3 * GB, disk_total: 40 * GB, net_rx: Math.round(1.2 * GB), net_tx: Math.round(610.4 * 1024 ** 2),
    pid: 18432, processes: 142, uptime: '3天14小时',
  })))
  await page.route(/\/api\/v1\/admin\/nodes\/5$/, async (r) => {
    const res = await r.fetch()
    const json = await res.json()
    if (json.data) json.data.monitor_enabled = true
    await r.fulfill({ response: res, json })
  })
  await page.route(/\/api\/v1\/admin\/nodes\/5\/metrics/, (r) => {
    let seed = 20261020
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31)
    const now = Date.now()
    const points = []
    for (let i = 59; i >= 0; i--) {
      const k = 59 - i
      const spike = k === 9 ? 17 : k === 55 ? 10 : 0
      const netSpike = k === 6 || k === 23 ? 9 : 0
      points.push({
        timestamp: new Date(now - i * 60_000).toISOString(), cpu_cores: 32,
        cpu_usage: +(13.5 + rand() * 3 + spike).toFixed(1),
        mem_total: 64 * GB, mem_used: Math.round((0.655 + rand() * 0.012) * 64 * GB),
        disk_total: 1024 * GB, disk_used: Math.round(449.1 * GB),
        net_rx: Math.round((0.6 + rand() * 1.2 + netSpike) * 1024 ** 2), net_tx: Math.round((0.4 + rand() * 0.8 + netSpike * 0.6) * 1024 ** 2),
        load1: +(2.2 + rand() * 1.6 + (k === 41 ? 7 : 0)).toFixed(2), load5: +(2.6 + rand() * 0.6).toFixed(2), load15: +(2.8 + rand() * 0.3).toFixed(2),
      })
    }
    return r.fulfill(ok(points))
  })
}

// 首次使用引导的高亮和弹层
const hideGuide = '[data-tour="setup-guide"],.driver-popover,.driver-overlay{display:none!important}'

/** 表格中列名为 name 的表头 */
const th = (page, name) => page.locator('main th').filter({ hasText: new RegExp(`^${name}$`) })

/** locator 选中的元素所在的卡片（bg-card 的外框） */
const cardOf = (locator) => locator.locator('xpath=ancestor::div[contains(@class, "bg-card")][1]')

// 表格页的窗口：表格的列不挤在一起，也不出现横向滚动
const desktop = { width: 1440, height: 900 }

/** 表格页的截取区域：从列名为 col 的一列起，连同表头 */
const table = (slot, col) => ({ viewport: desktop, ...slot, at: (page) => corner(th(page, col), 8, 16) })

// 截图前把所有滚动区域滚回顶部（工单详情会把对话滚到底部，连带页面标题滚出窗口）
const scrollTop = (page) => page.evaluate(() => document.querySelectorAll('*').forEach((el) => { if (el.scrollTop) el.scrollTop = 0 }))

/**
 * 每张截图：name 文件名，path 页面，expanded 展开侧栏（默认收起），portal 以实例所有者（2 号用户）的身份打开用户端，before 截图前的操作，
 * area 截取区域：宽高（width、height）、截图窗口（viewport）、首页上的显示宽度（show，见 slots）和左上角（at，返回 CSS 像素的 x、y，不写时为窗口左上角）
 */
const all = [
  // 首屏：完整界面，侧栏展开
  { name: 'dashboard', path: '/admin', expanded: true, wait: 2000, area: { viewport: wide, ...wide } },
  // 从下单到售后
  { name: 'plans', path: '/admin/plans', area: table(slots.flow, '分组') },
  { name: 'orders', path: '/admin/orders', area: table(slots.flow, '类型') },
  { name: 'payments', path: '/admin/payments', area: table(slots.flow, '用户') },
  // 用户端实例详情的连接信息（IP、用户名、密码、SSH 命令）：窗口较窄，整张卡片放得下
  {
    name: 'instance-access', path: '/portal/servers/1', portal: true,
    area: { viewport: { width: 664, height: 900 }, ...slots.flow, at: (page) => corner(page.getByRole('button', { name: '概览' }), 12, 12) },
  },
  // 从面包屑起
  {
    name: 'lifecycle', path: '/admin/settings/lifecycle',
    area: { viewport: { width: 1024, height: 900 }, ...slots.flow, at: (page) => corner(page.locator('main').getByRole('link', { name: '设置', exact: true }), 16, 14) },
  },
  // 窗口较窄时工单属性排成两栏，关联实例和它的 IP 都在区域内
  {
    name: 'ticket', path: '/admin/tickets/1', before: scrollTop,
    area: { viewport: { width: 700, height: 900 }, ...slots.flow, at: async (page) => ({ x: 16, y: (await bounds(page.locator('main h1'))).y - 12 }) },
  },
  { name: 'invoices', path: '/admin/invoices', area: table(slots.flow, '用户') },
  // 容器和虚拟机：实例页顶部的名称、状态、操作按钮、页签和运行状态。窗口 780 宽时操作按钮排成两行，都在区域内；下边不截到「资源配额」
  { name: 'instance', path: '/admin/instances/1', area: { viewport: { width: 780, height: 900 }, ...slots.modes, at: (page) => corner(page.locator('main h1'), 16, 24) } },
  // 基础设施、运营和集成
  // 从网段等信息起，子网和挂载实例两张表完整，下边不截到安全组
  {
    name: 'vpc', path: '/admin/vpcs/1',
    area: { viewport: { width: 1024, height: 1000 }, ...slots.vpc, at: (page) => corner(page.locator('main').getByText('网段', { exact: true }).first(), 16, 12) },
  },
  // CPU 趋势图：窗口 1200 宽时图表约 530 宽，正好放得下。图表比区域矮，截图前隐藏下一行的两张图表，免得露出半张
  {
    name: 'node-stats', path: '/admin/nodes/5/stats',
    before: async (page) => {
      for (const title of ['网络流量', '系统负载']) await cardOf(page.locator('h4', { hasText: title })).first().evaluate((el) => { el.style.visibility = 'hidden' })
    },
    area: { viewport: { width: 1200, height: 1000 }, ...slots.nodeStats, at: (page) => corner(cardOf(page.locator('h4', { hasText: 'CPU 趋势' })), 8, 8) },
  },
  { name: 'users', path: '/admin/users', area: table(slots.users, '角色') },
  // 窗口 1160 宽时，前两列入口正好在区域内，第三列在区域外；从页面标题起，下边不截到「营销素材」
  { name: 'cms', path: '/admin/cms', area: { viewport: { width: 1160, height: 900 }, ...slots.cms, at: (page) => corner(page.locator('main h1'), 16, 8) } },
  // 插件：完整界面，首页上显示 1000px 宽
  { name: 'plugins', path: '/admin/plugins', area: { viewport: wide, ...wide, show: 1000 } },
]
const names = process.argv.slice(2)
const unknown = names.filter((n) => !all.some((s) => s.name === n))
if (unknown.length) throw new Error(`没有这些截图：${unknown.join('、')}`)
const shots = names.length ? all.filter((s) => names.includes(s.name)) : all

/** 登录管理面板；portal 时再以 2 号用户的身份进入用户端（管理员的「以该用户身份登录」） */
async function login(page, portal) {
  await page.goto(base + '/admin/login')
  await page.locator('input[type=password]').waitFor()
  await page.locator('input').first().fill('admin')
  await page.locator('input[type=password]').fill('admin123')
  await page.locator('input[type=password]').press('Enter')
  await page.waitForURL(/\/admin\/?$/)
  if (!portal) return
  const ticket = await page.evaluate(async () => {
    const res = await fetch('/api/v1/admin/users/2/login-as', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    return (await res.json()).data?.ticket
  })
  if (!ticket) throw new Error('取不到用户端的登录凭证')
  await page.goto(`${base}/portal/impersonate?ticket=${ticket}`)
  await page.waitForURL(/\/portal\/?$/)
}

// 截取区域比窗口大时，在启动浏览器之前报错
const sizes = new Map(shots.map((shot) => [shot, sizeOf(shot)]))

mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  for (const [shot, size] of sizes) {
    // 每张截图一个浏览器上下文：窗口和倍数各不相同，用户端的登录状态也不带到下一张
    const context = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.scale, locale: 'zh-CN', colorScheme: scheme })
    try {
      const page = await context.newPage()
      await mock(page)
      // 页面出错时不保存（可能截到空白或报错的页面）
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      await login(page, shot.portal)
      await page.goto(base + shot.path, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2500) // 页面有轮询，不能等 networkidle
      await page.addStyleTag({ content: hideGuide })
      const sidebar = page.locator('[data-slot="sidebar"][data-state]').first()
      if ((await sidebar.count()) && ((await sidebar.getAttribute('data-state')) === 'expanded') !== !!shot.expanded) {
        await page.locator('[data-sidebar="trigger"]').first().click()
      }
      await shot.before?.(page)
      await page.mouse.move(size.viewport.width - 1, size.viewport.height - 1) // 鼠标移出可交互区域，避免悬停态
      await page.waitForTimeout(1200 + (shot.wait ?? 0))
      const png = await page.screenshot({ clip: await clipOf(page, size) })
      if (errors.length) throw new Error(`${shot.name} 的页面出错：${errors.join('；')}`)
      save(out, shot.name, scheme, png, size.show)
      console.log('✓', shot.name, scheme)
    } finally {
      await context.close()
    }
  }
}
await browser.close()

// 清单：只更新这次截了的（NxShot 按它写 srcset）
writeManifest(manifestFile, all, sizes)
