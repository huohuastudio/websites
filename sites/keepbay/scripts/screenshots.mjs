// 首页用的界面截图：登录演示站，按 shots 中的设置打开页面，每种尺寸各截浅色、深色两张，转成 WebP 存到 public/screenshots/。
// Keepbay 的界面改了以后重新运行（W10，docs/plan.md）。在本机运行，不进 Cloudflare 的构建。
//
// 用法：pnpm --filter ./sites/keepbay shots [名称...]
// 需要：Playwright 的 Chromium（pnpm exec playwright install chromium）、cwebp（brew install webp）
// 环境变量：KEEPBAY_DEMO_URL（默认 https://demo.keepbay.app）、KEEPBAY_DEMO_USER、KEEPBAY_DEMO_PASSWORD（默认演示帐号）
//
// 标了 local 的截图（语义搜索）要在本机实例上截：语义搜索会加载本地模型，演示站的内存不够。
// 本机实例用演示站快照的数据（Keepbay 仓库 scripts/demo/README.md），以非演示模式启动，KEEPBAY_DEMO_URL 指向它。
// 不写名称时，演示站上截其余的，本机实例上只截 local 的（成员页等会显示本机的文件夹路径）
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const site = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(site, 'public/screenshots')
const demo = 'https://demo.keepbay.app'
const base = process.env.KEEPBAY_DEMO_URL ?? demo
const onDemo = new URL(base).origin === demo
// 演示帐号（公开写在演示站的登录页上）
const account = {
  username: process.env.KEEPBAY_DEMO_USER ?? 'demo',
  password: process.env.KEEPBAY_DEMO_PASSWORD ?? 'keepbay-demo',
}

// 截图的尺寸（KbShot.vue 中的宽高与这里一致）：
// - wide：1280 × 800 按 1.6 倍截，得到 2048 × 1280（与 Novaix 首页的截图一致）
// - mobile：390 × 700 按 3 倍截，得到 1170 × 2100，在官网的手机宽度下换用这张，整页缩小后的宽屏截图看不清
// - compact：400 × 500 按 3 倍截，得到 1200 × 1500，放在首页三列的格子里（只有 300–520px 宽），界面按手机布局显示，文字接近原大
const sizes = {
  wide: { suffix: '', viewport: { width: 1280, height: 800 }, scale: 1.6 },
  mobile: { suffix: '-mobile', viewport: { width: 390, height: 700 }, scale: 3 },
  compact: { suffix: '', viewport: { width: 400, height: 500 }, scale: 3 },
}

/**
 * 要截的页面。path：按接口查到 ID 后返回页面地址；sizes：截哪几种尺寸；prepare：页面加载完、截图前的操作；
 * view：文件夹的视图（Keepbay 存在浏览器本地，键为 keepbay.views.<用户 ID>）；local：只在本机实例上截。
 */
const shots = [
  {
    name: 'files',
    sizes: ['wide', 'mobile'],
    path: async (request) => `/files/${await folderId(request, ['家庭相册', '2025', '日常'])}`,
    view: { view: 'grid', sort: 'taken', desc: true, dirsFirst: true, iconSize: 160, square: false },
  },
  {
    // 按画面搜照片，只看图片
    name: 'search',
    local: true,
    sizes: ['compact'],
    path: async () => `/search?${new URLSearchParams({ q: '京都的寺庙', kind: 'image' })}`,
  },
  {
    // 成员 family（周晴）的授权：两个文件夹读写、一个只读，没授权的看不到
    name: 'members',
    sizes: ['compact'],
    path: async (request) => `/settings/members/${await userId(request, 'family')}`,
    // 滚到「文件夹」一节（上面的资料一节不进截图），标题上方留一点空
    prepare: (page) =>
      page.getByRole('heading', { name: '文件夹', exact: true }).evaluate((el) => {
        el.style.scrollMarginTop = '16px'
        el.scrollIntoView({ block: 'start' })
      }),
  },
]

/** 按名称路径找到文件夹的 ID。 */
async function folderId(request, names) {
  const mounts = await (await request.get('/api/v1/mounts')).json()
  const mount = mounts.find((m) => m.name === names[0])
  if (!mount) throw new Error(`没有文件夹 ${names[0]}`)
  let id = mount.rootFolder
  for (const name of names.slice(1)) {
    const { items } = await (await request.get(`/api/v1/folders/${id}/items`)).json()
    const item = items.find((it) => it.dir && it.name === name)
    if (!item) throw new Error(`没有文件夹 ${names.join('/')}`)
    id = item.id
  }
  return id
}

/** 按用户名找到成员的 ID。 */
async function userId(request, username) {
  const users = await (await request.get('/api/v1/users')).json()
  const user = users.find((u) => u.username === username)
  if (!user) throw new Error(`没有成员 ${username}`)
  return user.id
}

async function shoot(browser, shot, size, scheme) {
  const context = await browser.newContext({
    baseURL: base,
    viewport: size.viewport,
    deviceScaleFactor: size.scale,
    colorScheme: scheme,
    locale: 'zh-CN',
  })
  try {
    const login = await context.request.post('/api/v1/auth/login', { headers: { 'X-Keepbay-Request': '1' }, data: account })
    if (!login.ok()) throw new Error(`登录失败：${login.status()}`)
    const path = await shot.path(context.request)
    if (shot.view) {
      const me = await (await context.request.get('/api/v1/auth/me')).json()
      await context.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [`keepbay.views.${me.id}`, JSON.stringify({ base: shot.view, folders: [] })],
      )
    }
    // 演示帐号是共用的，访客可能存了固定的浅色或深色：读偏好时去掉外观设置，按 colorScheme 显示（不改帐号上存的）
    await context.route('**/api/v1/me/prefs', async (route) => {
      if (route.request().method() !== 'GET') return route.continue()
      const response = await route.fetch()
      const prefs = await response.json()
      delete prefs.appearance
      await route.fulfill({ response, json: prefs })
    })
    const page = await context.newPage()
    // 缩略图加载失败时 Keepbay 换成文件类型图标，页面上看不出来，要从请求判断
    const failed = []
    page.on('response', (r) => {
      if (r.url().includes('/thumb') && !r.ok()) failed.push(r.url())
    })
    page.on('requestfailed', (r) => {
      if (r.url().includes('/thumb')) failed.push(r.url())
    })
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.waitForFunction((theme) => document.documentElement.dataset.theme === theme, scheme)
    await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0))
    if (failed.length) throw new Error(`${failed.length} 张缩略图没有加载：${failed[0]}`)
    // 演示站的提示条不进截图
    await page.evaluate(() => document.querySelector('p[role="note"]')?.remove())
    await shot.prepare?.(page)
    await page.mouse.move(0, size.viewport.height - 1)
    await page.waitForTimeout(300)
    const file = `${shot.name}${size.suffix}-${scheme}`
    // PNG 从标准输入交给 cwebp
    execFileSync('cwebp', ['-quiet', '-q', '82', '-o', join(out, `${file}.webp`), '--', '-'], { input: await page.screenshot() })
    return file
  } finally {
    await context.close()
  }
}

const wanted = process.argv.slice(2)
const selected = wanted.length ? shots.filter((s) => wanted.includes(s.name)) : shots.filter((s) => (onDemo ? !s.local : s.local))
if (!selected.length) throw new Error(`没有这些截图：${wanted.join('、')}`)
const local = onDemo ? selected.filter((s) => s.local) : []
if (local.length) throw new Error(`${local.map((s) => s.name).join('、')} 要在本机实例上截，请把 KEEPBAY_DEMO_URL 指向本机实例`)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
try {
  for (const shot of selected) {
    for (const size of shot.sizes) {
      for (const scheme of ['light', 'dark']) {
        console.log(`${await shoot(browser, shot, sizes[size], scheme)}.webp`)
      }
    }
  }
} finally {
  await browser.close()
}
