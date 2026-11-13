// 配置文件中的包名导入会被当作外部依赖交给 Node 直接加载（无法加载 .ts），所以用相对路径
import { defineSiteConfig } from '../../../packages/theme/config'

const RELEASES = 'https://github.com/huohuastudio/novaix-releases'

export default defineSiteConfig({
  hostname: 'https://novaix.cc',
  title: 'Novaix',
  description: '面向中小型 VPS 服务商的 IDC 管理系统',
  dir: 'sites/novaix',
  logo: '/logo.svg',
  mermaid: true,
  nav: [
    { text: '文档', link: '/docs/introduce', activeMatch: '^/docs/' },
    { text: '演示', link: 'https://novaix.huohuastudio.com' },
    { text: '下载', link: `${RELEASES}/releases/latest` },
    { text: '更新日志', link: `${RELEASES}/releases` },
    { text: '购买授权', link: 'https://huohuastudio.com/products/novaix/buy' },
  ],
  socialLinks: [{ icon: 'github', link: RELEASES }],
  sidebar: {
    '/docs/': [
      {
        text: '简介',
        collapsed: false,
        items: [
          { text: '介绍', link: '/docs/introduce' },
          { text: '竞品对比', link: '/docs/comparison' },
          { text: '快速开始', link: '/docs/getting-started' },
          { text: '环境要求', link: '/docs/requirement' },
        ],
      },
      {
        text: '部署',
        collapsed: false,
        items: [
          { text: '安装', link: '/docs/install' },
          { text: '升级', link: '/docs/upgrade' },
          { text: '备份与恢复', link: '/docs/backup' },
          { text: '迁移', link: '/docs/migrate' },
        ],
      },
      {
        text: '基础设施',
        collapsed: false,
        items: [
          { text: '区域管理', link: '/docs/region' },
          { text: '节点管理', link: '/docs/node' },
          { text: '节点组管理', link: '/docs/node-group' },
          { text: '镜像管理', link: '/docs/image' },
          { text: 'ISO 管理', link: '/docs/iso' },
          { text: 'IP 池管理', link: '/docs/ip-pool' },
          { text: '共享 IP', link: '/docs/shared-ip' },
          { text: 'VPC 私有网络', link: '/docs/vpc' },
          { text: '端口转发', link: '/docs/port-forward' },
          { text: '反向 DNS', link: '/docs/rdns' },
          { text: '套餐管理', link: '/docs/plan' },
          { text: '对象存储', link: '/docs/storage' },
        ],
      },
      {
        text: '业务运营',
        collapsed: false,
        items: [
          { text: '实例管理', link: '/docs/instance' },
          { text: '流量包', link: '/docs/traffic-package' },
          { text: '用户管理', link: '/docs/user' },
          { text: '实名认证', link: '/docs/kyc' },
          { text: '订单与计费', link: '/docs/order' },
          { text: '支付配置', link: '/docs/payment' },
          { text: '优惠券', link: '/docs/coupon' },
          { text: '发票管理', link: '/docs/invoice' },
          { text: '实例转移', link: '/docs/push-transfer' },
          { text: '代理系统', link: '/docs/agent' },
          { text: '供应商转售', link: '/docs/supplier' },
        ],
      },
      {
        text: '系统功能',
        collapsed: false,
        items: [
          { text: '任务管理', link: '/docs/task' },
          { text: '工单系统', link: '/docs/ticket' },
          { text: '内容管理', link: '/docs/cms' },
          { text: '监控与告警', link: '/docs/monitoring' },
          { text: '系统设置', link: '/docs/setting' },
        ],
      },
      {
        text: '通知与登录',
        collapsed: false,
        items: [
          { text: '社会化登录', link: '/docs/oauth' },
          { text: '邮件配置', link: '/docs/mail' },
          { text: '邮件模板', link: '/docs/email-template' },
          { text: '短信服务', link: '/docs/sms' },
          { text: '多渠道通知', link: '/docs/notify' },
        ],
      },
      {
        text: '扩展',
        collapsed: false,
        items: [
          { text: '插件系统', link: '/docs/plugin' },
          { text: '主题系统', link: '/docs/theme' },
          { text: '开放接口', link: '/docs/integration' },
        ],
      },
      {
        text: '参考',
        collapsed: false,
        items: [
          { text: 'CLI 管理工具', link: '/docs/cli' },
          { text: '配置参考', link: '/docs/config' },
          { text: '常见问题', link: '/docs/faq' },
        ],
      },
    ],
  },
})
