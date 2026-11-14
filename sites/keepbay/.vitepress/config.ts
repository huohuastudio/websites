// 配置文件中的包名导入会被当作外部依赖交给 Node 直接加载（无法加载 .ts），所以用相对路径
import { defineSiteConfig } from '../../../packages/theme/config.ts'

// 侧栏中专业版功能的标记（侧栏文字按 HTML 渲染，不能用 Badge 组件）
const pro = '<span class="VPBadge tip">专业版</span>'

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
          { text: '外网访问', link: '/docs/remote-access' },
          { text: '升级', link: '/docs/upgrade' },
        ],
      },
      {
        text: '存储',
        collapsed: false,
        items: [
          { text: '文件夹', link: '/docs/folders' },
          { text: `远程文件夹 ${pro}`, link: '/docs/remote-folders' },
          { text: '云盘', link: '/docs/cloud-storage' },
          { text: '备份和维护', link: '/docs/backup' },
        ],
      },
      {
        text: '文件管理',
        collapsed: false,
        items: [
          { text: '浏览和预览', link: '/docs/files' },
          { text: '上传和下载', link: '/docs/upload' },
          { text: '搜索', link: '/docs/search' },
          { text: '回收站和撤销', link: '/docs/trash' },
          { text: '离线下载', link: '/docs/offline-download' },
        ],
      },
      {
        text: 'AI 功能',
        collapsed: false,
        items: [
          { text: `模型设置 ${pro}`, link: '/docs/ai-models' },
          { text: `AI 桌面 ${pro}`, link: '/docs/ai-desk' },
          { text: `语义搜索 ${pro}`, link: '/docs/semantic-search' },
          { text: `AI 标签 ${pro}`, link: '/docs/ai-tags' },
          { text: '收件箱', link: '/docs/inbox' },
          { text: `日期提醒 ${pro}`, link: '/docs/reminders' },
        ],
      },
      {
        text: '成员与分享',
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
          { text: '目录和文件', link: '/docs/directories' },
          { text: '常见问题', link: '/docs/faq' },
          { text: '技术架构', link: '/docs/architecture' },
        ],
      },
    ],
  },
})
