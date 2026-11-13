import type { MarkdownRenderer } from 'vitepress'

/**
 * mermaid 代码中给节点写死浅色填充（如 style a fill:#ecfdf5）又没写文字颜色时，补上深色文字：
 * 深色模式下 mermaid 的文字是浅色，配浅色底看不清
 */
function darkTextOnLightFill(code: string): string {
  return code.replace(/^(\s*(?:style|classDef)\s+\S+\s+)(\S+)\s*$/gm, (line, head: string, styles: string) => {
    const hex = /(?:^|,)fill:#([0-9a-f]{6})(?:,|$)/i.exec(styles)?.[1]
    if (!hex || /(?:^|,)color:/.test(styles)) return line
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? `${head}${styles},color:#3c3c43` : line
  })
}

/** 把 ```mermaid 代码块改写成 <Mermaid> 组件，代码经 encodeURIComponent 编码后放进属性 */
export function mermaidMarkdown(md: MarkdownRenderer) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, idx, ...rest) => {
    const token = tokens[idx]
    if (token.info.trim() !== 'mermaid') return fence(tokens, idx, ...rest)
    return `<Mermaid code="${encodeURIComponent(darkTextOnLightFill(token.content))}" />`
  }
}
