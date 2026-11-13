// 配置文件中的包名导入会被当作外部依赖交给 Node 直接加载（无法加载 .ts），所以用相对路径
import { defineSiteConfig } from '../../../packages/theme/config'

export default defineSiteConfig({
  hostname: 'https://novaix.cc',
  title: 'Novaix',
  description: '面向中小型 VPS 服务商的 IDC 管理系统',
  dir: 'sites/novaix',
  logo: '/logo.svg',
  nav: [{ text: '文档', link: '/docs/', activeMatch: '^/docs/' }],
  sidebar: {
    '/docs/': [{ text: '简介', items: [{ text: '介绍', link: '/docs/' }] }],
  },
})
