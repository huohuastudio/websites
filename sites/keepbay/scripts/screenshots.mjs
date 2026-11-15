// 首页用的界面截图：登录演示站，按 shots 中的设置打开页面，每种尺寸各截浅色、深色两张，转成 WebP 存到 public/screenshots/，
// 截了哪几种尺寸、宽高多少写进 .vitepress/theme/screenshots.json（KbShot.vue 按它渲染）。
// Keepbay 的界面改了以后重新运行（W10，docs/plan.md）。在本机运行，不进 Cloudflare 的构建。
//
// 用法：pnpm --filter ./sites/keepbay shots [名称...]
// 需要：Playwright 的 Chromium（pnpm exec playwright install chromium）、cwebp（brew install webp）
// 环境变量见 keepbay.mjs
//
// 标了 local 的截图（语义搜索）要在本机实例上截：语义搜索会加载本地模型，演示站的内存不够。
// 本机实例用演示站快照的数据（Keepbay 仓库 scripts/demo/README.md），以非演示模式启动，KEEPBAY_DEMO_URL 指向它。
// 不写名称时，演示站上截其余的，本机实例上只截 local 的（成员页等会显示本机的文件夹路径）
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { folderId, newContext, onDemo, open, site } from './keepbay.mjs'

const out = join(site, 'public/screenshots')
const manifestFile = join(site, '.vitepress/theme/screenshots.json')

// 截图的尺寸：
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
 * view：文件夹的视图（Keepbay 存在浏览器本地，键为 keepbay.views.<用户 ID>）；session：按接口查到后写进 sessionStorage 的项；
 * local：只在本机实例上截。
 */
const shots = [
  {
    name: 'files',
    sizes: ['wide', 'mobile'],
    path: async (request) => `/files/${await folderId(request, ['家庭相册', '2025', '日常'])}`,
    view: { view: 'grid', sort: 'taken', desc: true, dirsFirst: true, iconSize: 160, square: false },
  },
  {
    // 查看器中的照片（京都伏见稻荷的鸟居）
    name: 'viewer',
    sizes: ['wide', 'mobile'],
    path: async (request) => {
      const folder = await folderId(request, ['家庭相册', '2024', '2024-10 京都'])
      return `/files/${folder}?view=${await fileId(request, folder, 'IMG_20241003_071230.jpg')}`
    },
  },
  {
    // AI 桌面中问保修期的对话（快照中预先问好的，不调用模型）
    name: 'desk',
    sizes: ['wide', 'mobile'],
    path: async () => '/?view=desk',
    session: async (request) => ({ 'keepbay.chat': await conversationId(request, '家里哪些电器还在保修期内') }),
    // 输入框处演示站专有的说明不进截图（本机实例上没有这一行）
    prepare: (page) => onDemo && page.getByText('演示站点不能和 AI 对话').evaluate((el) => el.remove()),
  },
  {
    // 重要日期提醒（快照中预先找好的）。收件箱的 AI 建议在快照中写成了"虚构的样本"，不用
    name: 'reminders',
    sizes: ['wide', 'mobile'],
    path: async () => '/reminders',
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

/** 按文件名找到文件夹中文件的 ID。 */
async function fileId(request, folder, name) {
  const { items } = await (await request.get(`/api/v1/folders/${folder}/items`)).json()
  const item = items.find((it) => !it.dir && it.name === name)
  if (!item) throw new Error(`文件夹 ${folder} 中没有文件 ${name}`)
  return item.id
}

/** 按标题的开头找到 AI 桌面中的对话。 */
async function conversationId(request, title) {
  const { items } = await (await request.get('/api/v1/assistant/conversations')).json()
  const item = items.find((c) => c.title.startsWith(title))
  if (!item) throw new Error(`没有对话 ${title}`)
  return String(item.id)
}

/** 按用户名找到成员的 ID。 */
async function userId(request, username) {
  const users = await (await request.get('/api/v1/users')).json()
  const user = users.find((u) => u.username === username)
  if (!user) throw new Error(`没有成员 ${username}`)
  return user.id
}

async function shoot(browser, shot, size, scheme) {
  const context = await newContext(browser, { viewport: size.viewport, scale: size.scale, scheme, view: shot.view })
  try {
    const path = await shot.path(context.request)
    if (shot.session) {
      await context.addInitScript((items) => {
        for (const [key, value] of Object.entries(items)) sessionStorage.setItem(key, value)
      }, await shot.session(context.request))
    }
    const page = await context.newPage()
    await open(page, path, scheme)
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

// 尺寸清单：只更新这次截了的，按 shots 中的顺序排列，去掉 shots 中已经没有的
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))
for (const shot of selected) {
  manifest[shot.name] = Object.fromEntries(
    shot.sizes.map((name) => {
      const { viewport, scale } = sizes[name]
      return [name, [Math.round(viewport.width * scale), Math.round(viewport.height * scale)]]
    }),
  )
}
const lines = shots.filter((s) => manifest[s.name]).map((s) => `  ${JSON.stringify(s.name)}: ${JSON.stringify(manifest[s.name])}`)
writeFileSync(manifestFile, `{\n${lines.join(',\n')}\n}\n`)
