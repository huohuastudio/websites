import { onBeforeUnmount, onMounted, type Ref } from 'vue'

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
 * 传入 target（版块的根元素）时，只在它进入视口上下各一屏（按挂载时的视口高度）的范围内才计算，离开后保持最后的状态。
 * 系统开了"减少动态效果"时不监听滚动，只调用一次，still 为 true，调用方直接显示最终状态；
 * 页面打开后切换这个设置时，随之停止或恢复监听。
 * 返回 refresh：布局变化后重新计算一次（监听滚动时排到下一帧，减少动态效果时以 still 直接调用）
 */
export function useScrollFrame(fn: (still: boolean) => void, target?: Ref<HTMLElement | undefined>) {
  let frame = 0
  let listening = false
  // 观察结果出来之前按在视口附近处理，挂载时总会算一次
  let near = true
  let lastY = 0
  // 门控的范围：视口上下各扩展 margin 像素；一次滚动超过它时，版块可能从范围外直接进入视口
  let margin = 0
  let motion: MediaQueryList | undefined
  let observer: IntersectionObserver | undefined
  /** force：不看门控，切换减少动态效果、布局变化时用 */
  const run = (force = false) => {
    frame = 0
    // 一次滚过 margin 以上（跳到锚点、按 End、拖动滚动条）时观察结果还没更新，这一帧也要算，否则会先显示一帧旧状态
    const jump = Math.abs(scrollY - lastY) > margin
    lastY = scrollY
    if (near || jump || force) fn(false)
  }
  const frameRun = () => run()
  const request = () => {
    frame ||= requestAnimationFrame(frameRun)
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
    else run(true)
  }
  const refresh = () => {
    if (listening) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => run(true))
    } else if (motion) fn(true)
  }
  onMounted(() => {
    motion = matchMedia(REDUCED_MOTION)
    motion.addEventListener('change', sync)
    if (target?.value) {
      margin = innerHeight
      observer = new IntersectionObserver(
        ([entry]) => {
          near = entry.isIntersecting
          if (near && listening) request()
        },
        { rootMargin: `${margin}px 0px` },
      )
      observer.observe(target.value)
    }
    sync()
  })
  onBeforeUnmount(() => {
    // 跳离首页时，已排队的一帧不能在组件卸载后执行
    cancelAnimationFrame(frame)
    motion?.removeEventListener('change', sync)
    observer?.disconnect()
    listen(false)
  })
  return refresh
}

/**
 * 只随元素尺寸变化的布局值（偏移、宽高）：第一次取用时计算并缓存，免得每帧读布局。
 * els 中任一元素尺寸变化（窗口缩放、字体载入）时清掉缓存并调用 onChange（通常是 useScrollFrame 返回的 refresh）
 */
export function useLayoutCache<T>(els: () => (HTMLElement | undefined)[], measure: () => T, onChange: () => void) {
  let value: T | undefined
  let observer: ResizeObserver | undefined
  onMounted(() => {
    observer = new ResizeObserver(() => {
      value = undefined
      onChange()
    })
    for (const el of els()) if (el) observer.observe(el)
  })
  onBeforeUnmount(() => observer?.disconnect())
  return () => (value ??= measure())
}
