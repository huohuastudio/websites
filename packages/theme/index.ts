import type { Theme } from 'vitepress'
import { onContentUpdated } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import mediumZoom, { type Zoom } from 'medium-zoom'

import Layout from './components/Layout.vue'
import HomeActions from './components/home/HomeActions.vue'
import HomeFaq from './components/home/HomeFaq.vue'
import HomeFeatureList from './components/home/HomeFeatureList.vue'
import HomePricing from './components/home/HomePricing.vue'
import HomeShowcase from './components/home/HomeShowcase.vue'
import './styles/base.css'

// 文档中的图片点击放大；放在链接里的图片和加了 no-zoom 的图片除外
const ZOOM_SELECTOR = '.vp-doc img:not(a img):not(.no-zoom)'

export default {
  extends: DefaultTheme,
  Layout,
  // 官网首页的通用模块，在各站点的 index.md 中直接使用
  enhanceApp({ app }) {
    app.component('HomeActions', HomeActions)
    app.component('HomeFaq', HomeFaq)
    app.component('HomeFeatureList', HomeFeatureList)
    app.component('HomePricing', HomePricing)
    app.component('HomeShowcase', HomeShowcase)
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
