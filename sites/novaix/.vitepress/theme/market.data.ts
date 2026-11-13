import { defineLoader } from 'vitepress'

// 插件和主题市场的索引，构建时从 novaix-releases 仓库读取
const BASE = 'https://raw.githubusercontent.com/huohuastudio/novaix-releases/main'

export interface MarketItem {
  id: string
  name: string
  version: string
  description: string
  /** 插件类型，主题没有 */
  type?: string
  author: { name: string; url: string }
}

export interface MarketData {
  plugins: MarketItem[]
  themes: MarketItem[]
}

declare const data: MarketData
export { data }

async function fetchList(path: string, key: keyof MarketData): Promise<MarketItem[]> {
  try {
    const res = await fetch(`${BASE}/${path}`, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const list = (await res.json())[key]
    return Array.isArray(list) ? list : []
  } catch (error) {
    // 取不到时首页不显示这一块，不让整个站点构建失败
    console.warn(`[market] 读取 ${path} 失败：${(error as Error).message}`)
    return []
  }
}

export default defineLoader({
  async load(): Promise<MarketData> {
    const [plugins, themes] = await Promise.all([
      fetchList('plugins/index.json', 'plugins'),
      fetchList('themes/index.json', 'themes'),
    ])
    return { plugins, themes }
  },
})
