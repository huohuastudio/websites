// 分享卡片的预览图（Open Graph、Twitter Card）：1200 × 630 的 public/og.png。
// 深色底，左边是标识、站名和一句介绍，右边是首屏的文件页截图（深色）。截图更新后重新运行。
//
// 用法：pnpm --filter ./sites/keepbay og
// 需要：Playwright 的 Chromium
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { imagesLoaded, site } from './keepbay.mjs'

const dataUrl = (file, type) => `data:${type};base64,${readFileSync(join(site, 'public', file)).toString('base64')}`

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: radial-gradient(ellipse 70% 80% at 85% 20%, #1d6b6655, transparent 70%), #0d1117;
    font-family: "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif; color: #f0f3f2;
  }
  .text { position: absolute; left: 72px; top: 0; bottom: 0; width: 420px; display: flex; flex-direction: column; justify-content: center; }
  .logo { width: 72px; height: 72px; margin-bottom: 32px; }
  h1 { font-size: 64px; font-weight: 700; letter-spacing: -1px; }
  p { margin-top: 16px; font-size: 30px; color: #a9b4b2; line-height: 1.5; }
  .shot {
    position: absolute; left: 540px; top: 90px; width: 820px; border-radius: 14px; overflow: hidden;
    border: 1px solid #ffffff22; box-shadow: 0 30px 80px #00000099;
  }
  .shot img { display: block; width: 100%; }
</style></head><body>
  <div class="text">
    <img class="logo" src="${dataUrl('logo.svg', 'image/svg+xml')}" alt="">
    <h1>Keepbay</h1>
    <p>自部署的私有网盘</p>
  </div>
  <div class="shot"><img src="${dataUrl('screenshots/files-dark.webp', 'image/webp')}" alt=""></div>
</body></html>`

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(html)
  await imagesLoaded(page)
  await page.screenshot({ path: join(site, 'public/og.png') })
  console.log('public/og.png')
} finally {
  await browser.close()
}
