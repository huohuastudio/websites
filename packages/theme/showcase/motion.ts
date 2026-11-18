import { onBeforeUnmount, onMounted } from 'vue'

// 首页随滚动联动的版块共用的计算。
// 固定舞台的结构：外层 .sx-pin 给出滚动距离（高度为若干个视口），内层 .sx-stage 用 sticky 钉在视口中，
// 外层滚过时由进度 0–1 驱动舞台中的变化。窄屏或视口太矮时（isFlat）舞台不固定，内容按顺序排下来

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** p 在 [a, b] 区间内的进度，0–1。 */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

/** 先快后慢。 */
export const easeOut = (t: number) => 1 - (1 - t) ** 3

/** 两头慢、中间匀速。 */
export const smooth = (t: number) => t * t * (3 - 2 * t)

/** 舞台钉住的位置（px）：宽屏时是固定导航栏的下沿；导航栏不固定的宽度下是 0（见 showcase.css 的 --sx-nav）。
 * el 是外层 .sx-pin，取内层 .sx-stage 计算后的 top */
export function stageTop(el: HTMLElement) {
  const stage = el.querySelector<HTMLElement>('.sx-stage')
  return (stage && parseFloat(getComputedStyle(stage).top)) || 0
}

/** 固定舞台的进度：舞台钉住时从 0 到 1。el 是外层 .sx-pin。 */
export function pinProgress(el: HTMLElement) {
  const top = stageTop(el)
  return clamp01((top - el.getBoundingClientRect().top) / Math.max(1, el.offsetHeight - (innerHeight - top)))
}

/** 元素顶边从视口中的 start 位置移到 end 位置的进度；默认从进入视口底部到完全离开顶部。 */
export function viewProgress(el: HTMLElement, start = innerHeight, end = -el.offsetHeight) {
  return clamp01((start - el.getBoundingClientRect().top) / (start - end))
}

/** 舞台不固定、按顺序排下来：窄屏，或视口太矮（与 showcase.css 中的媒体查询一致）。 */
export function isFlat() {
  return innerWidth <= 760 || innerHeight <= 640
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
  return matchMedia(REDUCED_MOTION).matches
}

/**
 * 挂载后在滚动和窗口大小变化时调用 fn，每帧最多一次；卸载时解除。
 * 系统开了"减少动态效果"时不监听滚动，只调用一次，still 为 true，调用方直接显示最终状态；
 * 页面打开后切换这个设置时，随之停止或恢复监听
 */
export function useScrollFrame(fn: (still: boolean) => void) {
  let frame = 0
  let listening = false
  let motion: MediaQueryList | undefined
  const run = () => {
    frame = 0
    fn(false)
  }
  const request = () => {
    frame ||= requestAnimationFrame(run)
  }
  const listen = (on: boolean) => {
    if (on === listening) return
    listening = on
    const method = on ? addEventListener : removeEventListener
    method('scroll', request, { passive: true })
    method('resize', request)
  }
  const sync = () => {
    cancelAnimationFrame(frame)
    frame = 0
    const still = motion!.matches
    listen(!still)
    if (still) fn(true)
    else run()
  }
  onMounted(() => {
    motion = matchMedia(REDUCED_MOTION)
    motion.addEventListener('change', sync)
    sync()
  })
  onBeforeUnmount(() => {
    // 跳离首页时，已排队的一帧不能在组件卸载后执行
    cancelAnimationFrame(frame)
    motion?.removeEventListener('change', sync)
    listen(false)
  })
}
