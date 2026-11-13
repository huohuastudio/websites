import type { Theme } from 'vitepress'
import BaseTheme from '@huohuastudio/theme'
import Mermaid from '@huohuastudio/theme/mermaid'
import './brand.css'

export default {
  extends: BaseTheme,
  enhanceApp({ app }) {
    app.component('Mermaid', Mermaid)
  },
} satisfies Theme
