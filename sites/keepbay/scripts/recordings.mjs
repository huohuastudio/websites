// 首页「文件留在原来的文件夹里」的短录屏：在 Keepbay 的文件页面上叠一个终端样式的面板，逐字打出命令，
// 回车时在本机真正执行这条命令（把手机相册中的三张照片移进这个文件夹），Keepbay 监听到文件夹的变化后，页面上随即出现这三张照片。
// 浅色、深色各录一段，编码成 WebM（VP9）和 MP4（H.264），首帧（加载前显示）和照片出现后的结果帧（减少动态效果时显示）存成 WebP，存到 public/recordings/；
// 宽高写进 .vitepress/theme/recordings.json（KbClip.vue 按它预留位置）。
// Keepbay 的界面改了以后重新运行（W10d，docs/plan.md）。在本机运行，不进 Cloudflare 的构建。
//
// 用法：KEEPBAY_DEMO_URL=http://127.0.0.1:18903 pnpm --filter ./sites/keepbay recordings
// 需要：Playwright 的 Chromium、ffmpeg（带 libvpx-vp9、libx264）、cwebp
// 录屏要改动文件，只能在本机实例上录，不能用演示站：用演示站快照数据的副本（见 screenshots.mjs 开头的说明），不要用快照的源数据。
// 照片暂存在挂载文件夹旁边的 .keepbay-recording/手机相册 中（命令中的 ~ 指 .keepbay-recording，与数据副本在一起，不留在系统临时目录），
// 录完放回原处；出错或按 Ctrl+C 中断时也放回，没放回的下次运行会接着用
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { chromium } from 'playwright'
import { folderId, imagesLoaded, mount, newContext, onDemo, open, site } from './keepbay.mjs'

const out = join(site, 'public/recordings')
const manifestFile = join(site, '.vitepress/theme/recordings.json')
const name = 'folders'
// 界面按手机布局显示：格子在手机上只有 300px 左右宽，宽屏下最宽 560px（放大 1.17 倍，按 2.5 倍录仍然清晰），各种宽度共用这一段。1200 × 1100
const viewport = { width: 480, height: 440 }
const scale = 2.5
const view = { view: 'grid', sort: 'taken', desc: true, dirsFirst: true, iconSize: 96, square: false }
const folder = ['家庭相册', '2025', '2025-07 海边']
const photos = ['IMG_20250713_101150.jpg', 'IMG_20250713_102531.jpg', 'IMG_20250713_103112.jpg']
const command = 'mv ~/手机相册/*.jpg .'

// 节奏（毫秒）：开头停一下再打字；照片出现、缩略图加载完后停 HOLD，最后 FADE 淡回首帧，循环播放时首尾衔接
const LEAD = 600
const KEY = 60
const ENTER = 300
const HOLD = 1500
const FADE = 500
const FPS = 30

/** 等 Keepbay 把文件夹同步成 count 项（监听到变化后，目录 3 秒没有新变化才核对）。 */
async function waitForCount(request, id, count) {
  const start = Date.now()
  for (;;) {
    const { items } = await (await request.get(`/api/v1/folders/${id}/items`)).json()
    if (items.length === count) return
    if (Date.now() - start > 30000) throw new Error(`文件夹 ${folder.join('/')} 30 秒内没有同步成 ${count} 项（现在 ${items.length} 项）`)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

/** 把照片从 from 移到 to；已经在 to 中的跳过。两边都没有、两边都有（不覆盖）时报错 */
function move(from, to) {
  for (const photo of photos) {
    const [source, target] = [join(from, photo), join(to, photo)]
    if (existsSync(source) && existsSync(target)) throw new Error(`${from} 和 ${to} 中都有 ${photo}，请手动处理`)
    if (existsSync(source)) renameSync(source, target)
    else if (!existsSync(target)) throw new Error(`${from} 和 ${to} 中都没有 ${photo}`)
  }
}

/** 终端面板：逐字打出命令，回车时调用 Node 中的 keepbayRun 执行，再显示新的提示符。在页面中运行 */
function terminal({ prompt, command, lead, key, enter }) {
  const style = document.createElement('style')
  style.textContent = `
    #kb-term { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 2147483647; overflow: hidden;
      border: 1px solid rgb(255 255 255 / 0.1); border-radius: 10px; background: #1f2328; color: #e6edf3;
      box-shadow: 0 12px 32px rgb(0 0 0 / 0.3); font: 16px/26px Menlo, monospace; }
    #kb-term .bar { display: flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; background: #2d333b;
      font: 12px/1 -apple-system, sans-serif; color: #9198a1; }
    #kb-term .bar i { width: 10px; height: 10px; border-radius: 50%; background: #545d68; }
    #kb-term .bar span { margin-left: 8px; }
    #kb-term .body { box-sizing: content-box; height: 52px; padding: 10px 14px 12px; white-space: pre; }
    #kb-term .prompt { color: #7ee787; }
    #kb-term .caret { display: inline-block; width: 0.6em; height: 19px; vertical-align: -3px; background: #e6edf3; }
    #kb-term .caret.blink { animation: kb-blink 1s steps(1) infinite; }
    @keyframes kb-blink { 50% { opacity: 0; } }`
  document.head.append(style)
  const panel = document.createElement('div')
  panel.id = 'kb-term'
  panel.innerHTML = '<div class="bar"><i></i><i></i><i></i><span>终端</span></div><div class="body"></div>'
  document.body.append(panel)
  const body = panel.querySelector('.body')
  const caret = document.createElement('span')
  caret.className = 'caret blink'
  const line = (text) => {
    const div = document.createElement('div')
    const span = document.createElement('span')
    span.className = 'prompt'
    span.textContent = prompt
    const typed = document.createTextNode(text)
    div.append(span, typed)
    body.append(div)
    return typed
  }
  const typed = line('')
  typed.after(caret)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  return async () => {
    await sleep(lead)
    caret.classList.remove('blink')
    for (const char of command) {
      typed.data += char
      await sleep(key)
    }
    await sleep(enter)
    await window.keepbayRun()
    line('').after(caret)
    caret.classList.add('blink')
  }
}

/** 按时间戳把帧合成固定帧率，结尾淡回首帧，编码成 WebM 和 MP4；首帧、最后一帧（照片已出现）存成 WebP。 */
function encode(frames, end, file) {
  const dir = mkdtempSync(join(tmpdir(), 'keepbay-frames-'))
  try {
    const png = (i) => join(dir, `${String(i).padStart(4, '0')}.png`)
    const [first, last] = [png(0), png(frames.length - 1)]
    const list = frames.map((frame, i) => {
      writeFileSync(png(i), Buffer.from(frame.data, 'base64'))
      const next = frames[i + 1]?.time ?? end
      return `file '${png(i)}'\nduration ${(next - frame.time).toFixed(4)}`
    })
    // concat 会忽略最后一帧的 duration，再写一次最后一帧
    list.push(`file '${last}'`)
    writeFileSync(join(dir, 'list.txt'), list.join('\n'))
    const length = end - frames[0].time
    const input = ['-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-loop', '1', '-t', String(FADE / 1000), '-i', first]
    const filter = [
      '-filter_complex',
      `[0]fps=${FPS},format=yuv420p,settb=AVTB[a];[1]fps=${FPS},format=yuv420p,settb=AVTB[b];` +
        `[a][b]xfade=transition=fade:duration=${FADE / 1000}:offset=${(length - FADE / 1000).toFixed(3)},split[webm][mp4]`,
    ]
    // 一次合成，分成两路分别编码。输出指定 yuv420p：PNG 是 RGB，不指定时编码成 4:4:4，Safari 等浏览器播不了
    const output = (stream, ...args) => ['-map', stream, '-an', '-pix_fmt', 'yuv420p', ...args]
    execFileSync('ffmpeg', [
      '-v', 'error', '-y', ...input, ...filter,
      ...output('[webm]', '-c:v', 'libvpx-vp9', '-crf', '28', '-b:v', '0', '-row-mt', '1', join(out, `${file}.webm`)),
      ...output('[mp4]', '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', join(out, `${file}.mp4`)),
    ])
    for (const [name, frame] of [[file, first], [`${file}-end`, last]]) {
      execFileSync('cwebp', ['-quiet', '-q', '82', '-o', join(out, `${name}.webp`), '--', frame])
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function record(browser, scheme, id, dir, home) {
  const context = await newContext(browser, { viewport, scale, scheme, view })
  try {
    // 照片先放回手机相册，等 Keepbay 同步后再打开页面
    move(dir, join(home, '手机相册'))
    const { items } = await (await context.request.get(`/api/v1/folders/${id}/items`)).json()
    const before = items.filter((it) => !photos.includes(it.name)).length
    await waitForCount(context.request, id, before)
    const page = await context.newPage()
    await page.exposeFunction('keepbayRun', () => {
      execFileSync('/bin/sh', ['-c', command], { cwd: dir, env: { ...process.env, HOME: home } })
    })
    await open(page, `/files/${id}`, scheme)
    const run = await page.evaluateHandle(terminal, { prompt: `${basename(dir)} % `, command, lead: LEAD, key: KEY, enter: ENTER })
    await page.mouse.move(0, viewport.height - 1)
    await page.waitForTimeout(300)

    // 页面上已显示的缩略图数量，不到 min 时返回 false（供 waitForFunction 判断）
    const thumbs = (min) => {
      const count = [...document.querySelectorAll('img[src*="/thumb"]')].filter((img) => img.complete && img.naturalWidth > 0).length
      return count >= min && count
    }
    const shown = await page.evaluate(thumbs, 0)
    const cdp = await context.newCDPSession(page)
    const frames = []
    cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
      frames.push({ data, time: metadata.timestamp })
      cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
    })
    await cdp.send('Page.startScreencast', { format: 'png', maxWidth: viewport.width * scale, maxHeight: viewport.height * scale })
    await page.evaluate((run) => run(), run)
    // 新照片的缩略图都显示出来后再停 HOLD
    await page.waitForFunction(thumbs, shown + photos.length, { timeout: 30000 })
    await imagesLoaded(page)
    const appeared = frames.at(-1).time
    // 多录 200 毫秒，保证 end 之前的帧都收到
    await page.waitForTimeout(HOLD + 200)
    await cdp.send('Page.stopScreencast')
    const end = appeared + HOLD / 1000
    const kept = frames.filter((frame) => frame.time < end)
    const file = `${name}-${scheme}`
    encode(kept, end, file)
    console.log(`${file}：${(end - kept[0].time).toFixed(1)} 秒，${kept.length} 帧，照片在第 ${(appeared - kept[0].time).toFixed(1)} 秒出现`)
  } finally {
    await context.close()
  }
}

if (onDemo) throw new Error('录屏要改动文件，不能在演示站上录，请把 KEEPBAY_DEMO_URL 指向本机实例')
mkdirSync(out, { recursive: true })
// CDP 录屏收到的帧按 CSS 像素算（480 × 440），不随 deviceScaleFactor 放大；启动参数中指定缩放后才是 1200 × 1100
const browser = await chromium.launch({ args: [`--force-device-scale-factor=${scale}`] })
let restore
try {
  const setup = await newContext(browser, { viewport, scale, scheme: 'light' })
  const root = (await mount(setup.request, folder[0])).path
  const id = await folderId(setup.request, folder)
  await setup.close()
  const dir = join(root, ...folder.slice(1))
  if (!existsSync(dir)) throw new Error(`本机没有 ${dir}：录屏只能在本机实例上录`)
  const home = join(dirname(root), '.keepbay-recording')
  const phone = join(home, '手机相册')
  mkdirSync(phone, { recursive: true })
  // 照片放回原处，暂存目录空了就删掉
  restore = () => {
    move(phone, dir)
    if (readdirSync(phone).length === 0) rmSync(home, { recursive: true })
  }
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      restore()
      process.exit(130)
    })
  }
  for (const scheme of ['light', 'dark']) await record(browser, scheme, id, dir, home)
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {}
  manifest[name] = [viewport.width * scale, viewport.height * scale]
  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`)
} finally {
  await browser.close()
  restore?.()
}
