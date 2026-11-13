import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfigWithTheme, type DefaultTheme, type HeadConfig } from 'vitepress'
import { mermaidMarkdown } from './mermaid-markdown'

const REPO = 'https://github.com/huohuastudio/websites'

interface VersionLink {
  text: string
  link: string
}

export interface Versions {
  /** 导航中下拉菜单的标题，如当前版本号 */
  text: string
  current: VersionLink
  /** 旧版本：路径以 link 开头的页面顶部提示"这是旧版本的文档" */
  archived: VersionLink[]
}

export interface ThemeConfig extends DefaultTheme.Config {
  versions?: Versions
}

export interface SiteOptions {
  /** 站点地址，不带结尾斜杠，如 https://novaix.cc */
  hostname: string
  title: string
  description: string
  /** 仓库中的站点目录，如 sites/novaix，用于"编辑此页"链接 */
  dir: string
  /** public 下的标识文件，如 /logo.svg */
  logo: string
  /** public 下的分享预览图，如 /og.png */
  ogImage?: string
  /** Cloudflare Web Analytics 的令牌，留空时不加载统计脚本 */
  analyticsToken?: string
  nav?: DefaultTheme.NavItem[]
  socialLinks?: DefaultTheme.SocialLink[]
  sidebar?: DefaultTheme.Sidebar
  versions?: Versions
  /** 把 ```mermaid 代码块渲染成图表；打开后站点主题还要注册 Mermaid 组件 */
  mermaid?: boolean
}

/** 页面在站点中的地址（cleanUrls）：index.md → /，docs/index.md → /docs/，docs/a.md → /docs/a */
function pagePath(relativePath: string): string {
  return '/' + relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
}

export function defineSiteConfig(options: SiteOptions) {
  const { hostname, title, description, dir, logo, ogImage, analyticsToken, versions, mermaid } = options
  const year = new Date().getFullYear()
  // head 中写了 robots noindex 的页面（如跳转页），不进 sitemap。
  // 由 transformPageData 收集，生成 sitemap 时读取：构建时所有页面先渲染完才生成 sitemap
  const noindex = new Set<string>()

  const nav = [...(options.nav ?? [])]
  if (versions) {
    nav.push({ text: versions.text, items: [versions.current, ...versions.archived] })
  }

  return defineConfigWithTheme<ThemeConfig>({
    lang: 'zh-Hans',
    title,
    description,
    cleanUrls: true,
    lastUpdated: true,
    sitemap: {
      hostname,
      transformItems: (items) => items.filter((item) => !noindex.has('/' + item.url)),
    },

    markdown: mermaid ? { config: mermaidMarkdown } : undefined,

    head: [
      ['link', { rel: 'icon', href: logo }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: title }],
      ...(ogImage
        ? ([
            ['meta', { property: 'og:image', content: hostname + ogImage }],
            ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
          ] satisfies HeadConfig[])
        : []),
      // 嵌入模式：在首屏渲染前加上 class，避免导航栏先闪一下
      ['script', {}, `new URLSearchParams(location.search).get('embed')==='1'&&document.documentElement.classList.add('embed-mode')`],
    ],

    // 每页的规范地址和分享信息写进 frontmatter.head：站内跳转时客户端会随页面更新。
    // 页面在 frontmatter 中自己写了同名标签时以页面的为准
    transformPageData(pageData) {
      const path = pagePath(pageData.relativePath)
      const url = hostname + path
      const pageTitle = pageData.title ? `${pageData.title} | ${title}` : title
      const head: HeadConfig[] = (pageData.frontmatter.head ??= [])
      const has = (key: string) => head.some(([, attrs]) => attrs?.rel === key || attrs?.property === key)
      if (head.some(([, attrs]) => attrs?.name === 'robots' && /noindex/.test(attrs.content ?? ''))) noindex.add(path)
      const tags: HeadConfig[] = [
        ['link', { rel: 'canonical', href: url }],
        ['meta', { property: 'og:title', content: pageTitle }],
        ['meta', { property: 'og:description', content: pageData.description || description }],
        ['meta', { property: 'og:url', content: url }],
      ]
      head.push(...tags.filter(([, attrs]) => !has(attrs.rel ?? attrs.property)))
    },

    // 统计只在构建产物中加载，开发时不加载
    transformHead() {
      if (!analyticsToken) return
      return [['script', {
        defer: '',
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        'data-cf-beacon': JSON.stringify({ token: analyticsToken }),
      }]]
    },

    async buildEnd({ outDir }) {
      await writeFile(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${hostname}/sitemap.xml\n`)
    },

    themeConfig: {
      logo,
      nav,
      socialLinks: options.socialLinks,
      sidebar: options.sidebar,
      versions,

      search: {
        provider: 'local',
        options: {
          translations: {
            button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
            modal: {
              displayDetails: '显示详细列表',
              resetButtonTitle: '清除',
              backButtonTitle: '关闭搜索',
              noResultsText: '没有找到相关结果',
              footer: { selectText: '打开', navigateText: '切换', closeText: '关闭' },
            },
          },
        },
      },

      footer: { copyright: `© 2018-${year} Spark Studio` },

      editLink: {
        pattern: `${REPO}/edit/main/${dir}/:path`,
        text: '在 GitHub 上编辑此页',
      },
      lastUpdated: {
        text: '最后更新于',
        formatOptions: { dateStyle: 'medium' },
      },
      docFooter: { prev: '上一页', next: '下一页' },
      outline: { level: [2, 3], label: '本页目录' },
      notFound: {
        title: '页面不存在',
        quote: '地址可能输错了，或者页面已经移走',
        linkLabel: '返回首页',
        linkText: '返回首页',
        code: '404',
      },

      langMenuLabel: '语言',
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '外观',
      lightModeSwitchTitle: '切换到浅色',
      darkModeSwitchTitle: '切换到深色',
      skipToContentLabel: '跳到正文',
    },
  })
}
