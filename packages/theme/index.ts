import type { Theme } from 'vitepress'
import { onContentUpdated } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import mediumZoom, { type Zoom } from 'medium-zoom'

import Layout from './components/Layout.vue'
import HomeActions from './components/home/HomeActions.vue'
import HomeCell from './components/home/HomeCell.vue'
import HomeCells from './components/home/HomeCells.vue'
import HomeFaq from './components/home/HomeFaq.vue'
import HomeFeatureList from './components/home/HomeFeatureList.vue'
import HomeHero from './components/home/HomeHero.vue'
import HomePlans from './components/home/HomePlans.vue'
import HomePricing from './components/home/HomePricing.vue'
import HomeSection from './components/home/HomeSection.vue'
import HomeShowcase from './components/home/HomeShowcase.vue'
import HomeWindow from './components/home/HomeWindow.vue'
import './styles/base.css'
import './styles/home.css'

// 文档中的图片点击放大；放在链接里的图片和加了 no-zoom 的图片除外。
// 首页不套 .vp-doc，窗口框里的截图和界面一览的截图另外列出
const ZOOM_SELECTOR = ['.vp-doc', '.home-window', '.showcase-panel']
  .map((scope) => `${scope} img:not(a img):not(.no-zoom)`)
  .join(', ')

export default {
  extends: DefaultTheme,
  Layout,
  // 官网首页的通用模块，在各站点的 index.md 中直接使用
  enhanceApp({ app }) {
    app.component('HomeActions', HomeActions)
    app.component('HomeCell', HomeCell)
    app.component('HomeCells', HomeCells)
    app.component('HomeFaq', HomeFaq)
    app.component('HomeFeatureList', HomeFeatureList)
    app.component('HomeHero', HomeHero)
    app.component('HomePlans', HomePlans)
    app.component('HomePricing', HomePricing)
    app.component('HomeSection', HomeSection)
    app.component('HomeShowcase', HomeShowcase)
    app.component('HomeWindow', HomeWindow)
  },
  setup() {
    let zoom: Zoom | undefined

    // 正文每次渲染或更新后重新绑定
    onContentUpdated(() => {
      zoom ??= mediumZoom({ background: 'var(--vp-c-bg)' })
      zoom.detach()
      zoom.attach(ZOOM_SELECTOR)
    })
  },
} satisfies Theme
