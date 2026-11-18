// Lsky Pro+ 官网首页的截图：浅色、深色各一套，输出到 public/screenshots/<名称>-<light|dark>.webp，尺寸写进 .vitepress/theme/screenshots.json
// 用法：pnpm --filter ./sites/lsky shots <照片目录> [名称...]，不写名称时截全部
// 需要：Playwright 的 Chromium（pnpm exec playwright install chromium）、cwebp（brew install webp）、ImageMagick（brew install imagemagick）；
// 演示环境由 setup.sh 搭建，在 18064 端口。前台（上传、图片、相册）用 linhao 登录，后台用 admin 登录
import { chromium } from 'playwright'
import { mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { bounds, clipOf, corner, save, sizeOf, writeManifest } from '../../../scripts/shots-lib.mjs'

const base = 'http://127.0.0.1:18064'
const site = join(import.meta.dirname, '..')
const out = join(site, 'public/screenshots')
const manifestFile = join(site, '.vitepress/theme/screenshots.json')
const [photos, ...names] = process.argv.slice(2)
if (!photos) throw new Error('请写明照片目录')

// 截图的尺寸（W31：首页上界面文字的显示尺寸不小于原尺寸的 0.85，Windows 1 倍屏上才看得清，见 docs/plan.md）。出图的做法见 scripts/shots-lib.mjs：
// - 首屏的上传、图片和后台的仪表板是完整界面：窗口 1280 × 800，按 1.6 倍截整个窗口。1024 宽时前台的上传队列遮住首页的入口，
//   后台的统计卡片挤压、金额显示不全
// - 其余是卡片中的局部图，只截与说明相关的部分，区域与首页上截图框的宽高比相同，宽度为截图框显示宽度 ÷ 0.9（相册以照片为主，÷ 0.8），见 slots
const wide = { viewport: { width: 1280, height: 800 }, width: 1280, height: 800, scale: 1.6 }

// 首页上截图框的尺寸对应的截取区域（CSS 像素），show 是截图框的显示宽度（宽屏下固定）。
// 截图框铺满（object-fit: cover，左上对齐），区域的高度按 show 换算后不小于截图框的高度：
// - albums：「相册和分享」的截图，截图框 557 × 348
// - card：「对外提供图床服务」的截图卡片，截图框 448 × 263–488（随视口高度）
const slots = {
  albums: { width: 696, height: 436, show: 557 },
  card: { width: 498, height: 543, show: 448 },
}

const pick = (...keys) => keys.map((k) => join(photos, readdirSync(photos).find((f) => f.startsWith(`${k}-`))))

/** 表格中列名为 name 的表头 */
const th = (page, name) => page.locator('main th').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) })

/** 用表格的「列管理」隐藏 names 中的列 */
async function hideColumns(page, names) {
  await page.getByRole('button', { name: '列管理' }).click()
  const apply = page.getByRole('button', { name: '应用列设置' })
  await apply.waitFor()
  for (const name of names) {
    const box = page.locator('.fi-dropdown-panel label:visible').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).locator('input')
    if (!(await box.count())) throw new Error(`列管理中没有：${name}`)
    await box.first().uncheck()
  }
  await apply.click()
  await page.waitForTimeout(1500)
}

/**
 * 每张截图：name 文件名，side 前台（user）或后台（admin），path 页面，before 截图前的操作，
 * area 截取区域：宽高（width、height）、截图窗口（viewport）、首页上的显示宽度（show，见 slots）和左上角（at，返回 CSS 像素的 x、y，不写时为窗口左上角）
 */
const all = [
  // 首屏：前台首页选了 8 张图片后的上传队列
  {
    name: 'upload', side: 'user', path: '/',
    before: async (page) => {
      await page.locator('input[type="file"]').first().setInputFiles(pick('02', '07', '15', '20', '27', '31', '36', '44'))
      await page.waitForTimeout(2500)
    },
    area: wide,
  },
  { name: 'photos', side: 'user', path: '/user/photos', area: wide },
  // 相册：窗口 696 宽时相册排成两列，正好占满区域。从「创建相册」按钮起，截第一排两个相册，隐藏后面几排（不露出半截）
  {
    name: 'albums', side: 'user', path: '/user/albums',
    before: (page) => page.evaluate(() => {
      // 相册卡片：含「N 个项目」的元素往上找，直到父元素中有不止一个相册
      const leaves = [...document.querySelectorAll('body *')].filter((el) => !el.children.length && /个项目$/.test(el.textContent.trim()))
      const cards = leaves.map((leaf) => {
        let el = leaf
        while (el.parentElement && leaves.filter((l) => el.parentElement.contains(l)).length === 1) el = el.parentElement
        return el
      })
      if (cards.length < 3) throw new Error('相册不足三个')
      cards.slice(2).forEach((el) => { el.style.visibility = 'hidden' })
    }),
    area: { viewport: { width: 696, height: 900 }, ...slots.albums, at: async (page) => ({ x: 0, y: (await bounds(page.getByRole('button', { name: '创建相册' }))).y - 12 }) },
  },
  // 后台
  { name: 'dashboard', side: 'admin', path: '/admin', wait: 2000, area: wide },
  // 订单：用「列管理」只留套餐名称、金额、支付方式和状态，隐藏逐列搜索的一行；从表头起
  {
    name: 'orders', side: 'admin', path: '/admin/orders',
    before: async (page) => {
      await hideColumns(page, ['订单号', '用户信息', '支付时间', '取消时间', '下单时间'])
      const search = page.locator('main .fi-ta-individual-search-row')
      if (!(await search.count())) throw new Error('找不到逐列搜索的一行')
      await search.evaluateAll((rows) => rows.forEach((tr) => { tr.style.display = 'none' }))
    },
    area: { viewport: { width: 640, height: 900 }, ...slots.card, at: (page) => corner(th(page, '套餐名称'), 12, 8) },
  },
  // 支付驱动：6 种都在列表中；用「列管理」隐藏创建时间，从表头起
  {
    name: 'payments', side: 'admin', path: '/admin/payment-drivers',
    before: (page) => hideColumns(page, ['创建时间']),
    area: { viewport: { width: 640, height: 900 }, ...slots.card, at: (page) => corner(th(page, '驱动名称'), 12, 8) },
  },
  // 工单：窗口 506 宽时对话记录一节正好放进区域，左右各留 12px，从这一节的标题行起。工单属性排成一列，对话记录在页面较下方，窗口设高。
  // 区域下边正好切过回复框下方的「提交回复」按钮，截图前隐藏它，免得露出半个
  {
    name: 'ticket', side: 'admin', path: '/admin/tickets/1',
    before: (page) => page.getByRole('button', { name: '提交回复' }).evaluate((el) => { el.style.visibility = 'hidden' }),
    area: { viewport: { width: 506, height: 1600 }, ...slots.card, at: (page) => corner(page.getByText('对话记录', { exact: true }).locator('xpath=..'), 12, 12) },
  },
]
const unknown = names.filter((n) => !all.some((s) => s.name === n))
if (unknown.length) throw new Error(`没有这些截图：${unknown.join('、')}`)
const shots = names.length ? all.filter((s) => names.includes(s.name)) : all

async function login(page, side) {
  const [path, email, password] = side === 'admin' ? ['/admin/login', 'admin@example.com', 'admin123'] : ['/login', 'linhao@example.com', 'demo1234']
  await page.goto(base + path)
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('input[type="password"]').press('Enter')
  // 只等地址改变：登录后的页面偶尔迟迟不触发 load（内置服务器的进程被占满），随后就打开要截的页面
  await page.waitForURL((u) => !u.pathname.endsWith('/login'), { waitUntil: 'commit' })
}

// 截取区域比窗口大时，在启动浏览器之前报错
const sizes = new Map(shots.map((shot) => [shot, sizeOf(shot)]))

mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  for (const [shot, size] of sizes) {
    // 每张截图一个浏览器上下文：窗口和倍数各不相同
    const context = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.scale, locale: 'zh-CN', colorScheme: scheme })
    try {
      // 前台和后台都把主题存在 localStorage 的 theme 中
      await context.addInitScript((s) => localStorage.setItem('theme', s), scheme)
      const page = await context.newPage()
      // 页面出错时不保存（可能截到空白或报错的页面）
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      await login(page, shot.side)
      await page.goto(base + shot.path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      await shot.before?.(page)
      await page.mouse.move(size.viewport.width - 1, size.viewport.height - 1) // 鼠标移出可交互区域，避免悬停态
      await page.waitForTimeout(800 + (shot.wait ?? 0))
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

// 清单：只更新这次截了的（LsShot 按它写 srcset）
writeManifest(manifestFile, all, sizes)
