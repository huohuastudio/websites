// 配置文件中的包名导入会被当作外部依赖交给 Node 直接加载（无法加载 .ts），所以用相对路径
import { defineSiteConfig } from '../../../packages/theme/config.ts'

export default defineSiteConfig({
  hostname: 'https://keepbay.app',
  title: 'Keepbay',
  description: '自部署的私有网盘',
  dir: 'sites/keepbay',
  logo: '/logo.svg',
  mermaid: true,
  nav: [
    { text: '文档', link: '/docs/introduce', activeMatch: '^/docs/' },
    { text: '演示', link: 'https://demo.keepbay.app' },
  ],
  sidebar: {
    '/docs/': [
      {
        text: '开始使用',
        collapsed: false,
        items: [
          { text: '介绍', link: '/docs/introduce' },
          { text: '安装', link: '/docs/install' },
          { text: '首次设置', link: '/docs/setup' },
          { text: '升级', link: '/docs/upgrade' },
          { text: '外网访问', link: '/docs/remote-access' },
        ],
      },
      {
        text: '参考',
        collapsed: false,
        items: [
          { text: '命令行', link: '/docs/cli' },
          { text: '技术架构', link: '/docs/architecture' },
          { text: '隐私与安全', link: '/docs/privacy' },
          { text: '常见问题', link: '/docs/faq' },
        ],
      },
    ],
  },
})
