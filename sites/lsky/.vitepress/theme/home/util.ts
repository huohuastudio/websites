// 首页各版块共用的小工具（通用的滚动进度计算在 @huohuastudio/theme/showcase 中）

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** 按进度截取文字，用于逐字输入 */
export const typed = (s: string, t: number) => s.slice(0, Math.round(t * s.length))
