import { defineLoader } from 'vitepress'

// 主题列表，构建时从 lsky-pro-themes 仓库读取
const REPO = 'lsky-org/lsky-pro-themes'
const INDEX = `https://raw.githubusercontent.com/${REPO}/master/index.json`
// 截图走 jsDelivr：raw.githubusercontent.com 在国内经常打不开
const SCREENSHOT = `https://cdn.jsdelivr.net/gh/${REPO}@master/themes`
// 仓库自带的示例条目，不展示
const EXCLUDED = new Set(['demo'])

export interface ThemeItem {
  id: string
  name: string
  description: string
  author: string
  tags: string[]
  repo: string
  screenshot: string
}

declare const data: ThemeItem[]
export { data }

/** 仓库地址来自第三方：只接受 http(s) 绝对地址，其余当作没有 */
function httpUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  try {
    const { protocol } = new URL(value)
    return protocol === 'https:' || protocol === 'http:' ? value : ''
  } catch {
    return ''
  }
}

export default defineLoader({
  async load(): Promise<ThemeItem[]> {
    try {
      const res = await fetch(INDEX, { signal: AbortSignal.timeout(15_000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const list: unknown = await res.json()
      if (!Array.isArray(list)) return []
      return list
        .filter((item) => item && typeof item.id === 'string' && !EXCLUDED.has(item.id))
        .map((item) => ({
          id: item.id,
          name: item.name ?? item.id,
          description: item.description ?? '',
          author: item.author ?? '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          repo: httpUrl(item.repo),
          screenshot: `${SCREENSHOT}/${encodeURIComponent(item.id)}/screenshot.png`,
        }))
    } catch (error) {
      // 取不到时主题页显示"暂无收录"，不让整个站点构建失败
      console.warn(`[themes] 读取 ${INDEX} 失败：${(error as Error).message}`)
      return []
    }
  },
})
