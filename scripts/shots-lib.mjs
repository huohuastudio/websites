// 首页截图脚本共用的出图工具：截取区域和倍数、存 WebP、按显示尺寸缩出倍数图、写截图清单（W31，docs/plan.md）。
// Novaix、Lsky 的截图脚本引入；Keepbay 的脚本中另有一份，以后再接。
// 每张截图在 area 中写截图窗口（viewport）、截取区域的宽高（width、height，CSS 像素）、首页上的显示宽度（show）、没有 show 时的倍数（scale，默认 2）
// 和左上角（at，返回 CSS 像素的 x、y，不写时为窗口左上角）
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// 写了 show 的截图，除 2 倍的主图外另出的倍数，文件名为 <名称>-<倍数>x-<主题>.webp
const densities = [1, 1.25]

const maxBuffer = 256 * 1024 * 1024

/**
 * 截图的区域和倍数：写了 show 的按 2 倍显示尺寸渲染（倍数 = 2 × show ÷ 区域宽度），其余按 scale（默认 2 倍）。
 * 按 0.9、1.125 这种倍数直接渲染时文字本身就画软了，所以先出 2 倍的主图，另两张由主图缩小
 */
export function sizeOf(shot) {
  const { area } = shot
  if (area.width > area.viewport.width || area.height > area.viewport.height) throw new Error(`${shot.name} 的截取区域比窗口大`)
  return { ...area, scale: area.show ? (2 * area.show) / area.width : (area.scale ?? 2) }
}

/** locator 选中的第一个元素在窗口中的位置（CSS 像素） */
export async function bounds(locator) {
  const box = await locator.first().boundingBox()
  if (!box) throw new Error(`找不到元素：${locator}`)
  return box
}

/** 截取区域的左上角：locator 选中的元素左上角再向左 dx、向上 dy（CSS 像素） */
export async function corner(locator, dx, dy) {
  const { x, y } = await bounds(locator)
  return { x: x - dx, y: y - dy }
}

/** 截取的范围（CSS 像素）：左上角按 at 算出，超出窗口时移回窗口内 */
export async function clipOf(page, { viewport, width, height, at }) {
  const { x, y } = (await at?.(page)) ?? { x: 0, y: 0 }
  const fit = (v, length, total) => Math.round(Math.min(Math.max(v, 0), total - length))
  return { x: fit(x, width, viewport.width), y: fit(y, height, viewport.height), width, height }
}

/** 存成 WebP：界面图无损压缩通常更小，色块和渐变多的有损（质量 90）更小，两种都试，存较小的一种 */
function webp(file, png) {
  const encode = (args) => execFileSync('cwebp', ['-quiet', ...args, '-o', '-', '--', '-'], { input: png, maxBuffer })
  const lossless = encode(['-lossless', '-z', '9'])
  const lossy = encode(['-q', '90'])
  writeFileSync(file, lossless.length <= lossy.length ? lossless : lossy)
}

/** 存一张截图：主图 <名称>-<主题>.webp；写了 show 的另出 1 倍、1.25 倍图（按百分比缩小主图，宽度正好是 show × 倍数） */
export function save(out, name, scheme, png, show) {
  webp(join(out, `${name}-${scheme}.webp`), png)
  if (!show) return
  for (const d of densities) {
    const resized = execFileSync('magick', ['png:-', '-filter', 'Lanczos', '-resize', `${d * 50}%`, 'png:-'], { input: png, maxBuffer })
    webp(join(out, `${name}-${d}x-${scheme}.webp`), resized)
  }
}

/**
 * 更新截图清单：名称 → 主图的像素宽高（浅色、深色相同）和另出的倍数（首页按它写 srcset）。
 * sizes 是这次截了的截图（shot → sizeOf 的结果），按 all 中的顺序排列，去掉已经没有的
 */
export function writeManifest(file, all, sizes) {
  const manifest = JSON.parse(readFileSync(file, 'utf8'))
  for (const [shot, { width, height, scale, show }] of sizes) {
    manifest[shot.name] = { width: Math.round(width * scale), height: Math.round(height * scale), ...(show && { dpr: densities }) }
  }
  const lines = all.filter((s) => manifest[s.name]).map((s) => `  ${JSON.stringify(s.name)}: ${JSON.stringify(manifest[s.name])}`)
  writeFileSync(file, `{\n${lines.join(',\n')}\n}\n`)
}
