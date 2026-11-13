import type { Theme } from 'vitepress'
import { onContentUpdated } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import mediumZoom, { type Zoom } from 'medium-zoom'

import Layout from './components/Layout.vue'
import './styles/base.css'

// 文档中的图片点击放大；放在链接里的图片和加了 no-zoom 的图片除外
const ZOOM_SELECTOR = '.vp-doc img:not(a img):not(.no-zoom)'

export default {
  extends: DefaultTheme,
  Layout,
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
