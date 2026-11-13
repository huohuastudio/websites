// 配置文件中的包名导入会被当作外部依赖交给 Node 直接加载（无法加载 .ts），所以用相对路径
import { defineSiteConfig } from '../../../packages/theme/config'

export default defineSiteConfig({
  hostname: 'https://keepbay.app',
  title: 'Keepbay',
  description: '自部署的私有网盘',
  dir: 'sites/keepbay',
  logo: '/logo.svg',
  nav: [{ text: '文档', link: '/docs/', activeMatch: '^/docs/' }],
  sidebar: {
    '/docs/': [{ text: '开始使用', items: [{ text: '文档整理中', link: '/docs/' }] }],
  },
})
