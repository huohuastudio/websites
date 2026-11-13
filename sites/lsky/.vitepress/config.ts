// 配置文件中的包名导入会被当作外部依赖交给 Node 直接加载（无法加载 .ts），所以用相对路径
import { defineSiteConfig } from '../../../packages/theme/config.ts'

export default defineSiteConfig({
  hostname: 'https://www.lsky.pro',
  title: 'Lsky Pro+',
  description: '图床和云端相册程序',
  dir: 'sites/lsky',
  logo: '/logo.png',
  nav: [{ text: '文档', link: '/docs/', activeMatch: '^/docs/(?!archive/)' }],
  versions: {
    text: '版本',
    current: { text: '当前版本', link: '/docs/' },
    archived: [{ text: '开源版 V1.x', link: '/docs/archive/free/v1/' }],
  },
  sidebar: {
    '/docs/archive/free/v1/': [{ text: '开源版 V1.x', items: [{ text: '介绍', link: '/docs/archive/free/v1/' }] }],
    '/docs/': [{ text: '指南', items: [{ text: '介绍', link: '/docs/' }] }],
  },
})
