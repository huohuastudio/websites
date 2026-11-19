// 首页用的界面截图：登录演示站，按 shots 中的设置打开页面，每种尺寸各截浅色、深色两张，转成 WebP 存到 public/screenshots/，
// 截了哪几种尺寸、宽高多少写进 .vitepress/theme/screenshots.json（KbShot.vue 按它渲染）。
// 首页要推近的截图（标了 zoom）另存推近后看到的区域的高清图，区域写进清单（见 detailRegion）。
// Keepbay 的界面改了以后重新运行（W10，docs/plan.md）。在本机运行，不进 Cloudflare 的构建。
//
// 用法：pnpm --filter ./sites/keepbay shots [名称...]
// 需要：Playwright 的 Chromium（pnpm exec playwright install chromium）、cwebp（brew install webp）、ImageMagick（brew install imagemagick）；视频的截图要本机装有 Chrome
// 环境变量见 keepbay.mjs
//
// 标了 local 的截图要在本机实例上截：语义搜索会加载本地模型，演示站的内存不够；演示站也没有部署在线编辑器。
// 显示服务器上文件夹路径的页面（成员页）在演示站上截：本机实例的数据放在临时目录中，路径会带出本机的目录名
// 本机实例用演示站快照的数据（Keepbay 仓库 scripts/demo/README.md），以非演示模式启动，KEEPBAY_DEMO_URL 指向它。
// 不写名称时，演示站上截其余的，本机实例上只截 local 的
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { folderId, folderItems, imagesLoaded, newContext, onDemo, open, site } from './keepbay.mjs'

const out = join(site, 'public/screenshots')
const manifestFile = join(site, '.vitepress/theme/screenshots.json')

// 截图的尺寸（W31：卡片中的局部图，首页上界面文字的显示尺寸不小于原尺寸的 0.85，Windows 1 倍屏上才看得清；wide 大图除外，见下。docs/plan.md）：
// - wide：1280 × 800 按 1.6 倍截，得到 2048 × 1280。首屏、揭开对照、AI、亮点轮播、格式小卡片显示完整界面的大图。
//   W31 曾改为 1024 × 640，窗口太矮，侧栏底部的「设置」等被截掉，用户定改回 1280 × 800（大图的文字小于 0.85 倍，接受）
// - mobile：390 × 700 按 3 倍截，得到 1170 × 2100，在官网的手机宽度下换用这张，整页缩小后的宽屏截图看不清
// - compact：400 × 430 按 3 倍截，得到 1200 × 1290，放在首页搜索一节的结果区，界面按手机布局显示。高度正好放下搜索的前三条结果
// - panel：480 × 400 按 3 倍截，得到 1440 × 1200，放在首页搜索一节的结果区（宽屏下约 480 × 396），界面按手机布局显示
// - card：卡片中的局部图，只截与说明相关的部分。截图窗口和截取的区域在各张截图的 card 中设定（见 shots），按 2 倍截。
//   区域与卡片中截图框的宽高比相同，宽度约为截图框最大显示宽度 ÷ 0.9（见下面的 slots）。
//   截图框宽度固定的（card 中写了显示宽度 show），按显示尺寸出 1 倍、1.25 倍、2 倍三张，首页按屏幕挑选、1:1 显示，
//   不再由浏览器缩小（Windows 1 倍屏上缩小的位图文字发虚）。先按 2 倍渲染（倍数 = 2 × show ÷ 区域宽度），再用 Lanczos 缩成另两张：
//   按 0.9、1.125 这种倍数直接渲染时文字本身就画软了（W31，2026-11-18 对比后定）
const sizes = {
  wide: { suffix: '', viewport: { width: 1280, height: 800 }, scale: 1.6 },
  mobile: { suffix: '-mobile', viewport: { width: 390, height: 700 }, scale: 3 },
  compact: { suffix: '', viewport: { width: 400, height: 430 }, scale: 3 },
  panel: { suffix: '', viewport: { width: 480, height: 400 }, scale: 3 },
  card: { suffix: '', scale: 2 },
}
// 写了 show 的 card 截图，除 2 倍的主图外另出的倍数，文件名为 <名称>-<倍数>x-<主题>.webp
const densities = [1, 1.25]

// 卡片中截图框的尺寸对应的截取区域（CSS 像素），show 是截图框的显示宽度（宽屏下固定）。
// 区域按 W31 的规则取：显示宽度 ÷ 0.9，关键内容放不全或以照片为主的 ÷ 0.8（2026-11-18 定）。2026-11-19 首页的卡片按 1.2 倍放大，
// 区域不变、show 随截图框放大，界面文字约为原尺寸的 1–1.1 倍（免费版的 photos、members 写在各自的截图中）：
// - privacy：「隐私与安全」卡片的右半边，截图框 592 × 562–640，顶端对齐，矮视口下裁掉底部
const slots = {
  privacy: { width: 538, height: 587, show: 592 },
}

// 首页推近时最多放大 2 倍（zoom.ts），宽度 1000px 的截图框在 2 倍屏上推近后要约 4000 像素宽的图才清晰：
// 标了 zoom 的截图，宽屏按 3 倍截一次，缩成宽屏的尺寸作主图，推近后看到的区域从同一张图中裁出，主图和高清图出自同一个画面
const detailScale = 3

// 以下是几张截图共用的页面设置

// 京都伏见稻荷的鸟居（查看器中的照片）
const torii = [['家庭相册', '2024', '2024-10 京都'], 'IMG_20241003_071230.jpg']

// AI 调用记录。最新的记录是后台处理，一排都一样：先以林海的身份搜索两次（真实的调用，记录发起人和耗时），
// 列表上方就是这几条，再往下是后台处理的
const aiCalls = {
  local: true,
  path: async (request) => {
    for (const params of [{ q: '房租合同什么时候到期' }, { q: '京都的寺庙', kind: 'image' }]) {
      const res = await request.get(`/api/v1/search?${new URLSearchParams(params)}`)
      if (!res.ok()) throw new Error(`搜索失败：${res.status()}`)
    }
    return '/settings/ai/calls'
  },
  prepare: (page) => scrollToHeading(page, '调用记录'),
}

// 视频播放：海边的视频停在第 5 秒（浏览器原生的播放控件）。H.264 要用 Chrome 播放，Playwright 自带的 Chromium 不带这个解码器
const video = {
  chrome: true,
  path: (request) => viewerPath(request, ['家庭相册', '2025', '2025-07 海边'], 'VID_20250712_161004.mp4'),
  prepare: async (page) => {
    // 等不到跳转完成（加载或解码出错）时报错，不截出黑屏
    await page.locator('video').evaluate(
      (video) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('视频没有跳转到第 5 秒')), 15_000)
          video.addEventListener('seeked', () => (clearTimeout(timer), resolve()), { once: true })
          video.addEventListener('error', () => (clearTimeout(timer), reject(new Error('视频无法播放'))), { once: true })
          video.muted = true
          video.pause()
          video.currentTime = 5
        }),
    )
    await hideFileNav(page)
  },
}

// 照片时间线：看得到的照片和视频跨文件夹按拍摄时间排列，按天分组，右侧是日期条。
// 最前面几天是收件箱中的扫描件和票据样本，滚到 2026 年 2 月 17 日（春节的一组照片）再截
const photoDay = '2026年2月17日'
const photos = {
  path: async () => '/photos',
  // 宽屏右侧的信息栏关掉，照片占满宽度
  storage: { 'keepbay.infoPanel': 'false' },
  prepare: async (page) => {
    await page.getByText(photoDay).first().waitFor({ timeout: 10_000 })
    await page.evaluate((day) => {
      const header = [...document.querySelectorAll('div')].find((el) => el.childElementCount === 0 && el.textContent.startsWith(day))
      let scroller = header.parentElement
      while (getComputedStyle(scroller).overflowY !== 'auto') scroller = scroller.parentElement
      scroller.scrollTop += header.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    }, photoDay)
    await page.waitForTimeout(500)
    await imagesLoaded(page)
  },
}

/**
 * 要截的页面。path：按接口查到 ID 后返回页面地址；sizes：截哪几种尺寸；prepare：页面加载完、截图前的操作；
 * card：card 尺寸的截取区域的宽高（width、height）、截图窗口（viewport，不写时与区域同大）和左上角的位置（at，返回 CSS 像素的 x、y，
 * 不写时为窗口左上角；超出窗口时移回窗口内）；
 * zoom：首页推近到哪一部分，返回它在页面上的范围（见 bounds）；
 * view：文件夹的视图（Keepbay 存在浏览器本地，键为 keepbay.views.<用户 ID>）；storage：写进 localStorage 的项；session：按接口查到后写进 sessionStorage 的项；
 * local：只在本机实例上截。
 * 首页上同一个界面放在不同大小的格子中时，各截一张（名称不同），每张按自己的格子取景
 */
const shots = [
  // 以下是显示完整界面的大图：首屏、揭开对照、AI
  {
    name: 'files',
    sizes: ['wide', 'mobile'],
    path: async (request) => `/files/${await folderId(request, ['家庭相册', '2025', '日常'])}`,
    // 按名称倒序（照片名 IMG_ 后面就是拍摄时间，视频 VID_ 排在照片前面）：演示数据每天只有一两张，按时间排序会按天分组、照片挤在左边，
    // 不分组时按原比例排满每一行
    view: { view: 'grid', sort: 'name', desc: true, dirsFirst: true, iconSize: 160, square: false },
    // 宽屏右侧的信息栏关掉（开关记在浏览器本地），照片占满宽度
    storage: { 'keepbay.infoPanel': 'false' },
    // 首页揭开对照一节推近到侧栏的文件夹列表（「文件夹」标题和其下的各个文件夹）
    zoom: (page) => bounds(page.getByRole('navigation', { name: '导航' }).getByText('文件夹', { exact: true }).locator('..')),
  },
  {
    // AI 桌面中问保修期的对话（快照中预先问好的，不调用模型）
    name: 'desk',
    sizes: ['wide', 'mobile'],
    path: async () => '/?view=desk',
    session: async (request) => ({ 'keepbay.chat': await conversationId(request, '家里哪些电器还在保修期内') }),
    // 输入框处演示站专有的说明不进截图（本机实例上没有这一行）
    prepare: (page) => onDemo && page.getByText('演示站点不能和 AI 对话').evaluate((el) => el.remove()),
    // 推近到回答中的保修期限表（电器、剩余保修期限和对应的文件）
    zoom: (page) => bounds(page.locator('table')),
  },
  {
    // 重要日期提醒（快照中预先找好的）。收件箱的 AI 建议在快照中写成了"虚构的样本"，不用
    name: 'reminders',
    sizes: ['wide', 'mobile'],
    path: async () => '/reminders',
    // 推近到最前面的三条提醒（到期日和原文摘录）
    zoom: (page) => bounds(page.getByRole('list').first().locator(':scope > li:nth-child(-n+3)')),
  },
  {
    name: 'ai-calls',
    sizes: ['wide', 'mobile'],
    ...aiCalls,
    // 推近到最前面的三条记录（两次搜索和一条后台处理，标明本地处理、未发送到云端）
    zoom: (page) => bounds(page.locator('section').filter({ has: page.getByRole('heading', { name: '调用记录', exact: true }) }).locator('ul > li:nth-child(-n+3)')),
  },
  {
    // 按画面搜照片，只看图片
    name: 'search',
    local: true,
    sizes: ['compact'],
    path: async () => `/search?${new URLSearchParams({ q: '京都的寺庙', kind: 'image' })}`,
    // 搜索结果只有列表，缩略图很小，画面上突出查询词和"画面相符"：「存为智能文件夹」和大小列不进截图（只隐藏，不改动布局）。
    // Keepbay 的界面改了、找不到这些元素时报错，不截出没处理的图
    prepare: (page) =>
      page.getByRole('listbox').evaluate((list) => {
        const button = (root, text) => [...root.querySelectorAll('button')].find((b) => b.textContent.trim() === text)
        const hidden = [
          button(document, '存为智能文件夹'),
          button(list.previousElementSibling, '大小'),
          ...[...list.querySelectorAll('[role="option"]')].map((row) => row.lastElementChild),
        ]
        if (hidden.length < 3 || hidden.some((el) => !el)) throw new Error('搜索页上找不到要隐藏的按钮或大小列')
        for (const el of hidden) el.style.visibility = 'hidden'
      }),
  },
  {
    // 按画面搜照片后，在结果页上打开一张横向的照片：照片占画面的大部分，下方的缩略图条列出全部结果。
    // 结果页上打开的查看器按结果的顺序翻页，标题栏显示第几项
    name: 'search-viewer',
    local: true,
    sizes: ['panel'],
    path: async (request) => {
      const params = { q: '京都的寺庙', kind: 'image' }
      const res = await request.get(`/api/v1/search?${new URLSearchParams(params)}`)
      if (!res.ok()) throw new Error(`搜索失败：${res.status()}`)
      const item = (await res.json()).items?.find((it) => it.name === 'IMG_20241004_100844.jpg')
      if (!item) throw new Error('搜索结果中没有 IMG_20241004_100844.jpg')
      return `/search?${new URLSearchParams({ ...params, view: item.id })}`
    },
    prepare: async (page) => {
      // 缩略图条在手机布局下默认收起
      await page.getByRole('button', { name: '显示缩略图' }).click()
      await page.getByRole('button', { name: '隐藏缩略图' }).waitFor()
      await imagesLoaded(page)
      await hideFileNav(page)
    },
  },
  // 以下是「了解亮点」轮播的卡片：卡片较宽（816 × 510），放完整界面，与首屏一样按 wide 截（用户定，W31）。第 6 张用上面的 desk
  {
    // 查看器中的照片（京都伏见稻荷的鸟居）
    name: 'viewer',
    sizes: ['wide'],
    path: (request) => viewerPath(request, ...torii),
  },
  {
    // 音乐播放器：《晚风》的封面和滚动歌词。从第 5 行歌词开始播放（点歌词的一行就跳过去播放），画面上有正在唱的一行
    name: 'music',
    sizes: ['wide'],
    path: (request) => viewerPath(request, ['家庭文档', '音乐'], '晚风.mp3'),
    prepare: async (page) => {
      const lines = page.locator('.kb-lyric').filter({ has: page.locator('.kb-lyric-text') })
      if ((await lines.count()) < 5) throw new Error('音乐播放器上没有歌词')
      await lines.nth(4).click()
      await page.locator('.kb-lyric[data-on]').waitFor()
      await hideFileNav(page)
      // 等歌词滚动到位
      await page.waitForTimeout(1200)
    },
  },
  {
    name: 'video',
    sizes: ['wide'],
    ...video,
  },
  {
    // 在线编辑：在 ONLYOFFICE 中编辑演示文稿。演示站没有部署编辑器，在本机实例上截（本机实例要先在系统设置中接好 ONLYOFFICE）。
    name: 'slides',
    local: true,
    sizes: ['wide'],
    path: (request) => viewerPath(request, ['林海的工作', '项目'], '2026 Q4 项目计划.pptx'),
    prepare: (page) => openEditor(page, { spell: true }),
  },
  {
    // 打开分享链接看到的页面（京都相册，带水印）。演示站的分享链接只给登录了演示帐号的浏览器看，页面与访客看到的相同。
    // 手机截图放在首屏的手机画面中
    name: 'share',
    sizes: ['wide', 'mobile'],
    path: async (request) => {
      const shares = await (await request.get('/api/v1/shares')).json()
      const share = shares.find((s) => s.title === '2024-10 京都')
      if (!share) throw new Error('没有京都相册的分享链接')
      return `/s/${share.token}`
    },
    // 链接失效、改了密码等情况下页面上没有相册，等不到时报错
    prepare: async (page) => {
      await page.getByText('2024-10 京都').first().waitFor({ timeout: 10_000 })
      await page.getByRole('button', { name: '全部下载' }).waitFor({ timeout: 10_000 })
    },
  },
  // 以下是「在网页中直接打开」的五张小卡片：完整界面（1280 × 800，按 1.6 倍），看得出是在网页中打开的（2026-11-19 用户定）。
  // 照片、视频与亮点轮播的查看器、视频大图用不同的文件，首页上不出现同样的画面。表格、Word 用查看器自带的预览（演示站没有部署在线编辑器）
  {
    // 照片时间线：滚到春节的一组照片
    name: 'format-photos',
    sizes: ['wide'],
    ...photos,
  },
  {
    // Excel 表格：表格画出来以后上方显示单元格的提示
    name: 'format-sheet',
    sizes: ['wide'],
    path: (request) => viewerPath(request, ['家庭文档', '家庭'], '2025 年家庭开支.xlsx'),
    prepare: async (page) => {
      await page.getByText('点单元格查看完整内容').waitFor({ timeout: 15_000 })
      await page.waitForTimeout(500)
    },
  },
  {
    // 视频：日常中的另一段视频，停在第 5 秒
    name: 'format-video',
    sizes: ['wide'],
    ...video,
    path: (request) => viewerPath(request, ['家庭相册', '2025', '日常'], 'VID_20251003_091237.mp4'),
  },
  {
    // Word 文档：在沙箱 iframe 中渲染，等到其中有内容
    name: 'format-doc',
    sizes: ['wide'],
    path: (request) => viewerPath(request, ['林海的工作', '项目'], '周报-2026-第45周.docx'),
    prepare: async (page) => {
      await page.frameLocator('iframe[title="周报-2026-第45周.docx"]').locator('body *').first().waitFor({ timeout: 15_000 })
      await page.waitForTimeout(1000)
    },
  },
  {
    // 查看器中的照片：京都的另一张
    name: 'format-raw',
    sizes: ['wide'],
    path: (request) => viewerPath(request, ['家庭相册', '2024', '2024-10 京都'], 'IMG_20241005_154709.jpg'),
  },
  // 以下是「免费版就是完整的网盘」的格子
  {
    // 照片时间线：截取区域放在图标栏（56px，768–1023px 宽时侧栏收成图标栏）右边。
    // 格子约 649 × 630，按 0.8 倍截，多放照片；手机宽度下换用手机截图（首屏的手机画面也用它）
    name: 'photos',
    sizes: ['card', 'mobile'],
    card: { viewport: { width: 56 + 811, height: 787 }, width: 811, height: 787, show: 793, at: () => ({ x: 56, y: 0 }) },
    ...photos,
  },
  {
    // 成员 family（周晴）的授权：两个文件夹读写、一个只读，没授权的看不到。格子约 299 × 260，窗口设成截取区域的大小，界面按手机布局显示
    name: 'members',
    sizes: ['card'],
    card: { width: 332, height: 289, show: 371 },
    path: async (request) => `/settings/members/${await userId(request, 'family')}`,
    // 滚到「文件夹」一节（上面的资料一节不进截图），标题上方留一点空。
    // 突出文件夹和只读、读写：标题下的说明、服务器上的路径和复制路径的按钮不进截图（每个文件夹都要找到，否则报错）
    prepare: (page) =>
      page.getByRole('heading', { name: '文件夹', exact: true }).evaluate((el) => {
        const list = el.closest('section').querySelector('ul')
        const count = list.querySelectorAll('li').length
        const paths = [...list.querySelectorAll('.font-mono')].map((path) => path.parentElement)
        const buttons = [...list.querySelectorAll('button[aria-label^="复制"]')]
        if (el.nextElementSibling?.tagName !== 'P' || !count || paths.length !== count || buttons.length !== count) {
          throw new Error('成员页上找不到要去掉的说明、路径或复制按钮')
        }
        for (const node of [el.nextElementSibling, ...paths, ...buttons]) node.remove()
        el.style.scrollMarginTop = '16px'
        el.scrollIntoView({ block: 'start' })
      }),
  },
  // 以下证明隐私一节的说法
  {
    // AI 调用记录：窗口设成截取区域的大小，界面按手机布局显示，每条记录的状态都在画面内
    name: 'ai-calls-card',
    sizes: ['card'],
    card: slots.privacy,
    ...aiCalls,
  },
  {
    // 成员周晴能用的功能：会让数据离开设备的三项默认关闭，所有者给周晴开了分享链接。窗口设成截取区域的大小，界面按手机布局显示。
    // 「功能」是页面的最后一节，滚不到顶部：去掉上面的资料、文件夹两节，功能一节接在页头（成员的名字）下面
    name: 'member-features',
    sizes: ['card'],
    card: slots.privacy,
    path: async (request) => `/settings/members/${await userId(request, 'family')}`,
    prepare: (page) =>
      page.evaluate(() => {
        const sections = (names) => [...document.querySelectorAll('section')].filter((s) => names.includes(s.querySelector('h2, h3')?.textContent.trim()))
        const hidden = sections(['资料', '文件夹'])
        if (hidden.length !== 2 || sections(['功能']).length !== 1) throw new Error('成员页上找不到资料、文件夹或功能一节')
        for (const s of hidden) s.remove()
      }),
  },
]

/** locator 选中的元素合起来在页面上的范围（CSS 像素）。一个也没有选中时报错（Keepbay 的界面改了） */
async function bounds(locator) {
  const rects = await locator.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))
  if (!rects.length) throw new Error('页面上找不到要推近或截取的部分')
  const x = Math.min(...rects.map((r) => r.left))
  const y = Math.min(...rects.map((r) => r.top))
  return { x, y, width: Math.max(...rects.map((r) => r.right)) - x, height: Math.max(...rects.map((r) => r.bottom)) - y }
}

/** 截取的范围（CSS 像素）：左上角按 at 算出（不写时为窗口左上角），超出窗口时移回窗口内 */
async function clipOf(page, { viewport, clip: { width, height }, at }) {
  const { x, y } = (await at?.(page)) ?? { x: 0, y: 0 }
  const fit = (v, length, total) => Math.round(Math.min(Math.max(v, 0), total - length))
  return { x: fit(x, width, viewport.width), y: fit(y, height, viewport.height), width, height }
}

/** 尺寸 name 的截图窗口、倍数和截取区域（card 按截图中的设置，其余截整个窗口）。 */
function sizeOf(shot, name) {
  if (name !== 'card') return { ...sizes[name], clip: sizes[name].viewport }
  const { width, height, viewport = { width, height }, at, show } = shot.card
  if (width > viewport.width || height > viewport.height) throw new Error(`${shot.name} 的截取区域比窗口大`)
  return { ...sizes.card, viewport, clip: { width, height }, at, show, scale: show ? (sizes.card.scale * show) / width : sizes.card.scale }
}

/** 在线编辑器（ONLYOFFICE）所在的 iframe：查看器中的 iframe 里再嵌一层 */
function editorFrame(page) {
  return page.frameLocator('iframe').frameLocator('iframe')
}

/**
 * 推近后看到的区域：要推近的部分 rect 放在中间，四周各留画面的 2%，宽高占画面的百分比相同（与画面同比例），
 * 至少占画面的一半（最多放大 2 倍），不超出画面。返回裁剪 width × height 的截图用的像素范围 [x, y, 宽, 高]
 */
function detailRegion(rect, viewport, width, height) {
  const pct = (v, total) => (v / total) * 100
  const size = Math.min(100, Math.max(50, pct(rect.width, viewport.width) + 4, pct(rect.height, viewport.height) + 4))
  const start = (from, length, total) => Math.min(Math.max(pct(from + length / 2, total) - size / 2, 0), 100 - size)
  return [
    Math.round((start(rect.x, rect.width, viewport.width) / 100) * width),
    Math.round((start(rect.y, rect.height, viewport.height) / 100) * height),
    Math.round((size / 100) * width),
    Math.round((size / 100) * height),
  ]
}

/** 把设置页中的一节滚到顶部，标题上方留一点空（name 是这一节的标题，页面顶部的标题栏不算）。 */
function scrollToHeading(page, name) {
  return page
    .locator('section')
    .getByRole('heading', { name, exact: true })
    .evaluate((el) => {
      el.style.scrollMarginTop = '16px'
      el.scrollIntoView({ block: 'start' })
    })
}

/** 在查看器中打开文件夹（names 是名称路径）中的文件 name 的页面地址。 */
async function viewerPath(request, names, name) {
  const folder = await folderId(request, names)
  return `/files/${folder}?view=${await fileId(request, folder, name)}`
}

/**
 * 在查看器中点「编辑」，等在线编辑器（ONLYOFFICE）加载完：编辑区已画出、没有加载中的遮罩，等不到时报错。
 * spell：文档中的中文被拼写检查标上红色波浪线，要关掉（编辑器状态栏中的开关，只在这个浏览器中生效，不改文档），找不到开关时报错
 */
async function openEditor(page, { spell = false } = {}) {
  await page.getByRole('button', { name: '编辑', exact: true }).click()
  const editor = editorFrame(page)
  await editor.locator('#editor_sdk canvas, #ws-canvas').first().waitFor({ timeout: 60_000 })
  await editor.locator('.asc-loadmask').waitFor({ state: 'hidden', timeout: 60_000 })
  if (spell) {
    const toggle = editor.locator('#btn-doc-spell')
    if (!(await toggle.count())) throw new Error('编辑器中找不到拼写检查的开关')
    if (await toggle.locator('.active').count()) await toggle.click()
  }
  // 编辑器画完文档内容
  await page.waitForTimeout(3000)
}

/** 隐藏查看器两侧切换上一项、下一项的按钮：鼠标移过时出现，在手机宽度下会压住内容。找不到时报错（界面改了） */
async function hideFileNav(page) {
  const hidden = await page.evaluate(() => {
    const buttons = document.querySelectorAll('[aria-label="上一项"], [aria-label="下一项"]')
    for (const el of buttons) el.style.visibility = 'hidden'
    return buttons.length
  })
  if (!hidden) throw new Error('查看器中找不到上一项、下一项按钮')
}

/** 按文件名找到文件夹中文件的 ID。 */
async function fileId(request, folder, name) {
  const items = await folderItems(request, folder)
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

/** 页面加载前把 items 写进 localStorage 或 sessionStorage（kind）。 */
function seed(context, kind, items) {
  return context.addInitScript(
    ([kind, items]) => {
      for (const [key, value] of Object.entries(items)) window[kind].setItem(key, value)
    },
    [kind, items],
  )
}

const maxBuffer = 256 * 1024 * 1024

/** 卡片的截图存成 WebP：界面图无损压缩通常更小，照片多的图有损（质量 90）更小，两种都试，存较小的一种 */
function cardWebp(name, png) {
  const encode = (args) => execFileSync('cwebp', ['-quiet', ...args, '-o', '-', '--', '-'], { input: png, maxBuffer })
  const lossless = encode(['-lossless', '-z', '9'])
  const lossy = encode(['-q', '90'])
  writeFileSync(join(out, `${name}.webp`), lossless.length <= lossy.length ? lossless : lossy)
}

/** 截一张。返回文件名；推近用的高清图另存为 <名称>-detail-<主题>.webp，同时返回推近后看到的区域占画面的百分比 [x, y, 宽, 高] */
async function shoot(browser, shot, sizeName, scheme) {
  const size = sizeOf(shot, sizeName)
  const detail = shot.zoom && sizeName === 'wide'
  const scale = detail ? detailScale : size.scale
  const context = await newContext(browser, { viewport: size.viewport, scale, scheme, view: shot.view })
  try {
    const path = await shot.path(context.request)
    if (shot.storage) await seed(context, 'localStorage', shot.storage)
    if (shot.session) await seed(context, 'sessionStorage', await shot.session(context.request))
    const page = await context.newPage()
    await open(page, path, scheme)
    // 演示站的提示条不进截图
    await page.evaluate(() => document.querySelector('p[role="note"]')?.remove())
    await shot.prepare?.(page)
    await page.mouse.move(0, size.viewport.height - 1)
    await page.waitForTimeout(300)
    const file = `${shot.name}${size.suffix}-${scheme}`
    const png = await page.screenshot({ clip: await clipOf(page, size) })
    // PNG 从标准输入交给 cwebp
    const webp = (name, args = []) => execFileSync('cwebp', ['-quiet', '-q', '82', ...args, '-o', join(out, `${name}.webp`), '--', '-'], { input: png })
    if (sizeName === 'card') {
      cardWebp(file, png)
      if (size.show) {
        // 主图是 2 倍，按百分比缩小，宽度正好是 show × d，与主图同比例
        for (const d of densities) {
          const resized = execFileSync('magick', ['png:-', '-filter', 'Lanczos', '-resize', `${d * 50}%`, 'png:-'], { input: png, maxBuffer })
          cardWebp(`${shot.name}-${d}x-${scheme}`, resized)
        }
      }
      return { file }
    }
    if (!detail) {
      webp(file)
      return { file }
    }
    // 按 k 倍截图的宽高（像素）
    const pixels = (k) => [size.viewport.width, size.viewport.height].map((v) => Math.round(v * k))
    const [width, height] = pixels(scale)
    const crop = detailRegion(await shot.zoom(page), size.viewport, width, height)
    webp(file, ['-resize', ...pixels(size.scale).map(String)])
    webp(`${shot.name}-detail-${scheme}`, ['-crop', ...crop.map(String)])
    // 按裁剪的像素换算回百分比（保留三位小数），与高清图的范围完全一致
    const [x, y, w, h] = crop
    const region = [x / width, y / height, w / width, h / height].map((v) => Math.round(v * 1e5) / 1e3)
    return { file, region }
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
// 标了 chrome 的截图用本机安装的 Chrome，用到时才启动
const browsers = {}
async function browserFor(shot) {
  const key = shot.chrome ? 'chrome' : 'chromium'
  browsers[key] ??= await chromium.launch(shot.chrome ? { channel: 'chrome' } : {})
  return browsers[key]
}
// 推近后看到的区域（按名称）：浅色、深色的界面布局相同，两次算出的区域不同时报错
const regions = {}
try {
  for (const shot of selected) {
    for (const size of shot.sizes) {
      for (const scheme of ['light', 'dark']) {
        const { file, region } = await shoot(await browserFor(shot), shot, size, scheme)
        console.log(`${file}.webp`)
        if (!region) continue
        if (regions[shot.name] && `${regions[shot.name]}` !== `${region}`) {
          throw new Error(`${shot.name} 浅色、深色推近的区域不同：${regions[shot.name]}、${region}`)
        }
        regions[shot.name] = region
        console.log(`  推近区域 ${region.join(', ')}`)
      }
    }
  }
} finally {
  await Promise.all(Object.values(browsers).map((b) => b.close()))
}

// 尺寸清单：只更新这次截了的，按 shots 中的顺序排列，去掉 shots 中已经没有的。推近的区域记在 detail 中
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))
for (const shot of selected) {
  manifest[shot.name] = Object.fromEntries(
    shot.sizes.map((name) => {
      const { clip, scale } = sizeOf(shot, name)
      return [name, [Math.round(clip.width * scale), Math.round(clip.height * scale)]]
    }),
  )
  if (regions[shot.name]) manifest[shot.name].detail = regions[shot.name]
  // 另出的倍数（KbShot 按它写 srcset）
  if (shot.card?.show) manifest[shot.name].dpr = densities
}
const lines = shots.filter((s) => manifest[s.name]).map((s) => `  ${JSON.stringify(s.name)}: ${JSON.stringify(manifest[s.name])}`)
writeFileSync(manifestFile, `{\n${lines.join(',\n')}\n}\n`)
