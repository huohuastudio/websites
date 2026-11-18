import type { DefaultTheme } from 'vitepress'

/** 首页 frontmatter 中价格卡片的一项（SxPlans 的数据），这里只用到名称和价格 */
interface Plan {
  name: string
  price: string
  /** 为 false 时不写进结构化数据的报价（如另一款程序的版本） */
  offer?: boolean
}

interface Faq {
  q: string
  a: string
}

export interface AppInfo {
  /** schema.org 的 applicationCategory，如 BusinessApplication */
  category: string
  /** 运行的系统，如 Linux */
  os: string
}

interface Context {
  hostname: string
  title: string
  description: string
  /** 分享图的完整地址 */
  image?: string
  app?: AppInfo
  sidebar?: DefaultTheme.Sidebar
}

interface Page {
  /** 页面在站点中的地址，如 / 或 /docs/install */
  path: string
  title: string
  description: string
  frontmatter: Record<string, any>
}

const stripTags = (html: string) => html.replace(/<[^>]*>/g, '').trim()

/** 价格写成"¥199"一类时取出数字；"订阅制"等没有具体金额的不算报价 */
function offers(plans: Plan[]) {
  return plans.flatMap((plan) => {
    const amount = /^¥\s*([\d,]+(?:\.\d+)?)$/.exec(plan.price)?.[1]
    if (plan.offer === false || !amount) return []
    return [{ '@type': 'Offer', name: plan.name, price: amount.replace(/,/g, ''), priceCurrency: 'CNY' }]
  })
}

/** 侧栏链接的归一化，与 VitePress 判断当前页面的规则一致：去掉查询和锚点，a.md、a.html → a，dir/index、dir/index.md → dir/ */
const normalize = (link: string) => link.replace(/[?#].*$/, '').replace(/(?:(^|\/)index)?(?:\.(?:md|html))?$/, '$1')

/** 取页面所在的侧栏：多侧栏时按路径前缀匹配，段数多的优先，段数相同时按配置顺序（与 VitePress 的规则一致） */
function sidebarOf(sidebar: DefaultTheme.Sidebar | undefined, path: string): DefaultTheme.SidebarItem[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar
  const key = Object.keys(sidebar)
    .sort((a, b) => b.split('/').length - a.split('/').length)
    .find((dir) => path.startsWith(dir.startsWith('/') ? dir : '/' + dir))
  if (!key) return []
  const value = sidebar[key]
  // 本仓库的侧栏不用 base，这里不处理
  return Array.isArray(value) ? value : value.items
}

/** 在侧栏中找到页面，返回从最外层分组到页面本身的条目；找不到时返回空 */
function trailOf(items: DefaultTheme.SidebarItem[], path: string): DefaultTheme.SidebarItem[] {
  for (const item of items) {
    if (item.link && normalize(item.link) === path) return [item]
    const inner = item.items ? trailOf(item.items, path) : []
    if (inner.length) return [item, ...inner]
  }
  return []
}

/** 分组的地址：分组自己有链接时用它，否则用组内第一个页面 */
function firstLink(item: DefaultTheme.SidebarItem): string | undefined {
  if (item.link) return normalize(item.link)
  for (const child of item.items ?? []) {
    const link = firstLink(child)
    if (link) return link
  }
}

/** 文档页的面包屑：站点首页 → 侧栏中的各级分组 → 页面。分组的地址与页面相同时省略这一级 */
function breadcrumb(ctx: Context, page: Page) {
  const trail = trailOf(sidebarOf(ctx.sidebar, page.path), page.path)
  if (!trail.length) return
  const crumbs = [{ name: ctx.title, path: '/' }]
  for (const group of trail.slice(0, -1)) {
    const link = firstLink(group)
    if (link && link !== page.path && group.text) crumbs.push({ name: stripTags(group.text), path: link })
  }
  crumbs.push({ name: page.title, path: page.path })
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: ctx.hostname + crumb.path,
    })),
  }
}

/**
 * 页面的 JSON-LD（schema.org）：每页都有发布者（Organization）和站点（WebSite）；
 * 首页另有软件介绍（SoftwareApplication，报价取 frontmatter 的 plans）和常见问题（FAQPage，取 frontmatter 的 faq）；
 * 文档页另有面包屑（BreadcrumbList，按侧栏分组）
 */
export function structuredData(ctx: Context, page: Page): string {
  const { hostname, title } = ctx
  const org = { '@id': `${hostname}/#organization` }
  const graph: Record<string, unknown>[] = [
    { '@type': 'Organization', ...org, name: 'Spark Studio' },
    {
      '@type': 'WebSite',
      '@id': `${hostname}/#website`,
      url: hostname + '/',
      name: title,
      description: ctx.description,
      inLanguage: 'zh-Hans',
      publisher: org,
    },
  ]

  if (page.path === '/') {
    const { plans = [], faq = [] } = page.frontmatter as { plans?: Plan[]; faq?: Faq[] }
    if (ctx.app) {
      const list = offers(plans)
      graph.push({
        '@type': 'SoftwareApplication',
        name: title,
        description: page.description,
        url: hostname + '/',
        applicationCategory: ctx.app.category,
        operatingSystem: ctx.app.os,
        image: ctx.image,
        publisher: org,
        offers: list.length ? list : undefined,
      })
    }
    if (faq.length) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: stripTags(a) },
        })),
      })
    }
  } else {
    const crumbs = breadcrumb(ctx, page)
    if (crumbs) graph.push(crumbs)
  }

  // 脚本内容按原样输出到 HTML 中，把 < 转义，免得文字中的 </script> 提前结束标签
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
}
