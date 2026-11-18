// 首页用的界面截图：登录 setup.sh 搭的演示环境，每页截浅色、深色两张，缩到 1600×1000 转成 WebP 存到 public/screenshots/（SxShot 按主题显示）。
// Lsky Pro+ 的界面改了以后重新运行（W24，docs/plan.md）。在本机运行，不进 Cloudflare 的构建。
//
// 用法：pnpm --filter ./sites/lsky shots <照片目录> [名称...]
// 需要：Playwright 的 Chromium（pnpm exec playwright install chromium）、cwebp（brew install webp）；演示环境在 18064 端口
//
// 前台（上传、图片、相册）用 linhao 登录，视口 1440×900；后台用 admin 登录。
// 后台除仪表板外只截内容区：视口加宽一个侧栏的宽度，截图时裁掉侧栏，内容区 1600×1000（列多的表格也能完整显示）。
// 同时打印每页的前 160 个字，用文字确认页面加载正常
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'

const base = 'http://127.0.0.1:18064'
const out = join(import.meta.dirname, '../public/screenshots')
const [photos, ...only] = process.argv.slice(2)
mkdirSync(out, { recursive: true })

const pick = (...keys) => keys.map((k) => join(photos, readdirSync(photos).find((f) => f.startsWith(`${k}-`))))

const SHOTS = [
  // 前台
  {
    name: 'upload', side: 'user', path: '/',
    before: async (page) => {
      await page.locator('input[type="file"]').first().setInputFiles(pick('02', '07', '15', '20', '27', '31', '36', '44'))
      await page.waitForTimeout(2500)
    },
  },
  { name: 'photos', side: 'user', path: '/user/photos' },
  { name: 'albums', side: 'user', path: '/user/albums' },
  // 后台
  { name: 'dashboard', side: 'admin', path: '/admin' },
  { name: 'orders', side: 'admin', path: '/admin/orders', main: true },
  { name: 'payments', side: 'admin', path: '/admin/payment-drivers', main: true },
  { name: 'ticket', side: 'admin', path: '/admin/tickets/1', main: true },
].filter((s) => !only.length || only.includes(s.name))

async function login(page, side) {
  const [path, email, password] = side === 'admin' ? ['/admin/login', 'admin@example.com', 'admin123'] : ['/login', 'linhao@example.com', 'demo1234']
  await page.goto(base + path)
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('input[type="password"]').press('Enter')
  await page.waitForURL((u) => !u.pathname.endsWith('/login'))
}

const browser = await chromium.launch()
const errors = []
for (const scheme of ['light', 'dark']) {
  for (const side of ['user', 'admin']) {
    const list = SHOTS.filter((s) => s.side === side)
    if (!list.length) continue
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'zh-CN', colorScheme: scheme })
    // 前台和后台都把主题存在 localStorage 的 theme 中
    await ctx.addInitScript((s) => localStorage.setItem('theme', s), scheme)
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    await login(page, side)
    const sw = side === 'admin' ? Math.round(await page.locator('.fi-sidebar').first().evaluate((el) => el.getBoundingClientRect().width)) : 0
    for (const s of list) {
      await page.setViewportSize(s.main ? { width: 1600 + sw, height: 1000 } : { width: 1440, height: 900 })
      await page.goto(base + s.path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      if (s.before) await s.before(page)
      await page.mouse.move(s.main ? 1599 + sw : 1439, s.main ? 999 : 899) // 鼠标移出可交互区域，避免悬停态
      await page.waitForTimeout(800)
      const png = await page.screenshot({ clip: s.main ? { x: sw, y: 0, width: 1600, height: 1000 } : undefined })
      // PNG 从标准输入交给 cwebp
      execFileSync('cwebp', ['-quiet', '-q', '82', '-resize', '1600', '1000', '-o', join(out, `${s.name}-${scheme}.webp`), '--', '-'], { input: png })
      const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 160)
      console.log('✓', s.name, scheme, '|', text)
    }
    await ctx.close()
  }
}
await browser.close()
console.log('页面错误', errors.length, errors.slice(0, 3))
