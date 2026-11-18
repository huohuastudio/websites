import manifest from '../screenshots.json'

/** 截图中要推近的区域：占整张图的百分比 [x, y, 宽, 高]。 */
export type Box = readonly [number, number, number, number]

/** 截图推近后看到的区域，由 scripts/screenshots.mjs 按页面上的元素算出，与推近用的高清图（KbShot 的 detail）范围一致。 */
export function detailBox(name: keyof typeof manifest): Box {
  const { detail } = manifest[name] as { detail?: readonly number[] }
  if (detail?.length !== 4) throw new Error(`截图 ${name} 没有推近的区域`)
  return detail as Box
}

/**
 * 把铺满容器的截图推近到 box，k 为 0–1 的推近程度（0 为完整显示）。
 * el 是包住截图的 .zoom 层（transform-origin 为左上角），最多放大 2 倍（截图脚本的 detailRegion 按同一上限计算区域），推近后不露出截图以外的部分
 */
export function focus(el: HTMLElement, box: Box, k: number) {
  const [x, y, w, h] = box
  const s = Math.min(2, 100 / w, 100 / h)
  const ox = Math.min(Math.max(x + w / 2 - 50 / s, 0), 100 - 100 / s)
  const oy = Math.min(Math.max(y + h / 2 - 50 / s, 0), 100 - 100 / s)
  el.style.setProperty('--zs', String(1 + (s - 1) * k))
  el.style.setProperty('--zx', `${-ox * k}%`)
  el.style.setProperty('--zy', `${-oy * k}%`)
}
