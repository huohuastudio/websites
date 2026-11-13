// 配置文件中的包名导入会被当作外部依赖交给 Node 直接加载（无法加载 .ts），所以用相对路径
import { defineSiteConfig } from '../../../packages/theme/config.ts'

const DOCS_HOME = '/docs/guide/introduce'
const FREE_V1 = '/docs/archive/free/v1/'
const FREE_V2 = '/docs/archive/free/v2/'
const PRO_V1 = '/docs/archive/enterprise/v1/'

export default defineSiteConfig({
  hostname: 'https://www.lsky.pro',
  title: 'Lsky Pro+',
  description: '图床和云端相册程序',
  dir: 'sites/lsky',
  logo: '/logo.png',
  nav: [
    { text: '文档', link: DOCS_HOME, activeMatch: '^/docs/(?!archive/)' },
    { text: '接口文档', link: 'https://lsky-pro.apifox.cn' },
  ],
  versions: {
    text: 'V2.x',
    current: { text: '付费版 V2.x（当前）', link: DOCS_HOME },
    archived: [
      { text: '付费版 V1.x', link: PRO_V1 },
      { text: '开源版 V2.x', link: FREE_V2 },
      { text: '开源版 V1.x', link: FREE_V1 },
    ],
  },
  sidebar: {
    [FREE_V1]: [
      {
        text: '开源版 V1.x',
        items: [
          { text: '首页', link: FREE_V1 },
          { text: '安装', link: `${FREE_V1}install` },
          { text: '环境变量', link: `${FREE_V1}env` },
        ],
      },
      {
        text: '存储策略',
        collapsed: false,
        items: [
          { text: '总览', link: `${FREE_V1}storage/` },
          { text: '本地', link: `${FREE_V1}storage/local` },
          { text: '阿里云 OSS', link: `${FREE_V1}storage/aliyun-oss` },
          { text: '腾讯云 COS', link: `${FREE_V1}storage/tencent-cos` },
          { text: '又拍云 USS', link: `${FREE_V1}storage/upyun-uss` },
          { text: '七牛云 KODO', link: `${FREE_V1}storage/qiniu-kodo` },
          { text: 'FTP', link: `${FREE_V1}storage/ftp` },
        ],
      },
      {
        text: '系统参数配置',
        collapsed: false,
        items: [
          { text: '总览', link: `${FREE_V1}settings/` },
          { text: '基础配置', link: `${FREE_V1}settings/basic` },
          { text: '上传配置', link: `${FREE_V1}settings/upload` },
          { text: '用户配置', link: `${FREE_V1}settings/user` },
          { text: '邮件配置', link: `${FREE_V1}settings/mail` },
          { text: '其他配置', link: `${FREE_V1}settings/other` },
          { text: '图片鉴黄', link: `${FREE_V1}settings/image-audit` },
        ],
      },
      {
        text: '其他',
        collapsed: false,
        items: [
          { text: '水印功能', link: `${FREE_V1}watermark` },
          { text: '系统升级', link: `${FREE_V1}upgrade` },
          { text: '常见问题', link: `${FREE_V1}faq` },
          { text: '更新日志', link: `${FREE_V1}changelog` },
        ],
      },
    ],
    [FREE_V2]: [
      { text: '开源版 V2.x', items: [{ text: '首页', link: FREE_V2 }] },
      {
        text: '快速开始',
        collapsed: false,
        items: [
          { text: '安装', link: `${FREE_V2}quick-start/installation` },
          { text: '升级', link: `${FREE_V2}quick-start/upgrade` },
          { text: '迁移', link: `${FREE_V2}quick-start/migration` },
          { text: '常见问题', link: `${FREE_V2}quick-start/questions` },
        ],
      },
      {
        text: '储存',
        collapsed: false,
        items: [
          { text: '介绍', link: `${FREE_V2}storage/intro` },
          { text: '常见问题', link: `${FREE_V2}storage/faq` },
        ],
      },
      {
        text: '角色组',
        collapsed: false,
        items: [
          { text: '基础', link: `${FREE_V2}group/basic` },
          { text: '水印', link: `${FREE_V2}group/watermark` },
          { text: '原图保护', link: `${FREE_V2}group/original-protection` },
          { text: '图片审核', link: `${FREE_V2}group/picture-review` },
        ],
      },
      {
        text: '进阶',
        collapsed: false,
        items: [
          { text: '缓存', link: `${FREE_V2}advanced/cache` },
          { text: 'Octane', link: `${FREE_V2}advanced/octane` },
        ],
      },
    ],
    [PRO_V1]: [
      { text: '付费版 V1.x', items: [{ text: '首页', link: PRO_V1 }] },
      {
        text: '快速开始',
        collapsed: false,
        items: [
          { text: '安装', link: `${PRO_V1}quick-start/installation` },
          { text: '基础', link: `${PRO_V1}quick-start/basic` },
          { text: '升级', link: `${PRO_V1}quick-start/upgrade` },
          { text: '迁移', link: `${PRO_V1}quick-start/migration` },
          { text: '常见问题', link: `${PRO_V1}quick-start/questions` },
        ],
      },
      {
        text: '功能',
        collapsed: false,
        items: [
          { text: '角色组', link: `${PRO_V1}features/core/group` },
          { text: '储存策略', link: `${PRO_V1}features/core/strategy` },
          { text: '套餐', link: `${PRO_V1}features/basic/plan` },
          { text: '优惠券', link: `${PRO_V1}features/basic/coupon` },
          { text: '页面', link: `${PRO_V1}features/basic/page` },
          {
            text: '支付',
            collapsed: false,
            items: [
              { text: '支付宝', link: `${PRO_V1}features/basic/payment/alipay` },
              { text: '微信', link: `${PRO_V1}features/basic/payment/wechat` },
              { text: 'PayPal', link: `${PRO_V1}features/basic/payment/paypal` },
            ],
          },
        ],
      },
      {
        text: '其他',
        collapsed: false,
        items: [
          { text: '常用命令', link: `${PRO_V1}others/commands` },
          { text: 'Imagick', link: `${PRO_V1}others/imagick` },
          { text: '免费升级', link: `${PRO_V1}others/free-upgrade` },
          { text: '优化', link: `${PRO_V1}others/optimization` },
        ],
      },
    ],
    '/docs/': [
      {
        text: '简介',
        collapsed: false,
        items: [
          { text: '介绍', link: DOCS_HOME },
          { text: '快速开始', link: '/docs/guide/getting-started' },
          { text: '环境要求', link: '/docs/guide/requirement' },
          { text: '免责声明', link: '/docs/guide/declaration' },
        ],
      },
      {
        text: '入门',
        collapsed: false,
        items: [
          { text: '安装', link: '/docs/guide/install' },
          { text: '升级', link: '/docs/guide/upgrade' },
          { text: '迁移', link: '/docs/guide/migrate' },
          { text: '常见问题', link: '/docs/guide/faq' },
          { text: '从旧版本导入', link: '/docs/guide/import' },
        ],
      },
      {
        text: '核心功能',
        collapsed: false,
        items: [
          { text: '储存', link: '/docs/guide/storage' },
          { text: '角色组', link: '/docs/guide/group' },
          { text: '支付', link: '/docs/guide/payment' },
          { text: '云处理', link: '/docs/guide/process' },
          { text: '图片处理', link: '/docs/guide/handle' },
          { text: 'AI', link: '/docs/guide/ai' },
        ],
      },
      {
        text: '进阶',
        collapsed: false,
        items: [
          { text: '主题', link: '/docs/advanced/theme' },
          { text: '分离部署', link: '/docs/advanced/separate-deploy' },
          { text: '缓存', link: '/docs/advanced/cache' },
          { text: '自定义储存', link: '/docs/advanced/storage' },
          { text: '接口文档', link: '/docs/advanced/openapi' },
          { text: '常用命令', link: '/docs/advanced/command' },
        ],
      },
    ],
  },
})
