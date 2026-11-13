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
          { text: '隐私与安全', link: '/docs/privacy' },
          { text: '安装', link: '/docs/install' },
          { text: '首次设置', link: '/docs/setup' },
          { text: '升级', link: '/docs/upgrade' },
          { text: '外网访问', link: '/docs/remote-access' },
        ],
      },
      {
        text: '文件管理',
        collapsed: false,
        items: [
          { text: '浏览和预览', link: '/docs/files' },
          { text: '上传和下载', link: '/docs/upload' },
          { text: '回收站和撤销', link: '/docs/trash' },
          { text: '离线下载', link: '/docs/offline-download' },
          { text: '搜索和智能文件夹', link: '/docs/search' },
        ],
      },
      {
        text: '家庭成员与分享',
        collapsed: false,
        items: [
          { text: '成员和权限', link: '/docs/members' },
          { text: '外部帐号登录', link: '/docs/sso' },
          { text: '分享和水印', link: '/docs/share' },
        ],
      },
      {
        text: '系统设置',
        collapsed: false,
        items: [
          { text: '文件夹', link: '/docs/folders' },
          { text: '云盘和对象存储', link: '/docs/cloud-storage' },
          { text: '备份和维护', link: '/docs/backup' },
          { text: '通知', link: '/docs/notifications' },
          { text: '网络代理', link: '/docs/proxy' },
          { text: '访问记录', link: '/docs/access-log' },
        ],
      },
      {
        text: '参考',
        collapsed: false,
        items: [
          { text: '专业版', link: '/docs/pro' },
          { text: '命令行', link: '/docs/cli' },
          { text: '技术架构', link: '/docs/architecture' },
          { text: '常见问题', link: '/docs/faq' },
        ],
      },
    ],
  },
})
