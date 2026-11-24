// 给截图套上 macOS 窗口的外框（标题栏、红绿灯、细边框、圆角、很轻的阴影），背景透明，用于 GitHub README 等白底或深色底的页面。
// 浅色、深色截图各生成一张；截图更新后重新运行。
//
// 用法：pnpm --filter ./sites/keepbay window-frame <截图名> <输出目录>（在站点目录中也可以 node scripts/window-frame.mjs）
//   如 node scripts/window-frame.mjs files ../../../keepbay-releases/screenshots
//   读取 public/screenshots/<截图名>-light.webp 和 -dark.webp，输出 <截图名>-window-light.webp 和 -dark.webp
// 需要：Playwright 的 Chromium、cwebp（brew install webp）
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'
import { imagesLoaded, site } from './keepbay.mjs'

const [name, outArg] = process.argv.slice(2)
if (!name || !outArg) {
  console.error('用法：node scripts/window-frame.mjs <截图名> <输出目录>')
  process.exit(1)
}
const out = resolve(outArg)

/** 截图按 2 倍图显示的宽度（原图 2048px） */
const WIDTH = 1024
/** 留给阴影的透明边距 */
const MARGIN = 24

const themes = {
  light: { bar: '#f2f2f2', line: 'rgba(0, 0, 0, 0.12)', divider: 'rgba(0, 0, 0, 0.08)', shadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.06)' },
  dark: { bar: '#2b2b2e', line: 'rgba(255, 255, 255, 0.22)', divider: 'rgba(255, 255, 255, 0.08)', shadow: '0 8px 24px rgba(0, 0, 0, 0.3)' },
}

const html = (theme, src) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  html, body { background: transparent; }
  body { display: inline-block; padding: ${MARGIN}px; }
  .window { width: ${WIDTH + 2}px; border: 1px solid ${theme.line}; border-radius: 10px; overflow: hidden; box-shadow: ${theme.shadow}; }
  .bar { height: 28px; display: flex; align-items: center; gap: 8px; padding-left: 12px; background: ${theme.bar}; border-bottom: 1px solid ${theme.divider}; }
  .bar span { width: 12px; height: 12px; border-radius: 50%; box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.15); }
  .bar span:nth-child(1) { background: #ff5f57; }
  .bar span:nth-child(2) { background: #febc2e; }
  .bar span:nth-child(3) { background: #28c840; }
  .window img { display: block; width: ${WIDTH}px; }
</style></head><body>
  <div class="window"><div class="bar"><span></span><span></span><span></span></div><img src="${src}" alt=""></div>
</body></html>`

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: WIDTH + 2 + MARGIN * 2, height: 800 }, deviceScaleFactor: 2 })
  for (const [mode, theme] of Object.entries(themes)) {
    const file = join(site, 'public', 'screenshots', `${name}-${mode}.webp`)
    const src = `data:image/webp;base64,${readFileSync(file).toString('base64')}`
    await page.setContent(html(theme, src))
    await imagesLoaded(page)
    const png = await page.locator('body').screenshot({ omitBackground: true })
    // PNG 从标准输入交给 cwebp，保留透明背景
    execFileSync('cwebp', ['-quiet', '-q', '85', '-o', join(out, `${name}-window-${mode}.webp`), '--', '-'], { input: png })
    console.log(`${name}-window-${mode}.webp`)
  }
} finally {
  await browser.close()
}
