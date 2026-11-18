<script setup lang="ts">
import { SxCta, SxFaq, SxPlans, type SxFaqItem, type SxPlan, type SxPricingRow } from '@huohuastudio/theme/showcase'
import { useData } from 'vitepress'
import { computed } from 'vue'
import LsAi from './LsAi.vue'
import LsAlbum from './LsAlbum.vue'
import LsCloud from './LsCloud.vue'
import LsHandle from './LsHandle.vue'
import LsHero from './LsHero.vue'
import LsMod from './LsMod.vue'
import LsMore from './LsMore.vue'
import LsOps from './LsOps.vue'
import LsStore from './LsStore.vue'
import { BUY_URL, DOCS_URL } from './links'

// Lsky Pro+ 官网首页。价格和常见问题的数据在 index.md 的 frontmatter 中；
// 插槽 faq 放常见问题标题下的说明，links 放结尾按钮下的小字链接（写在 Markdown 中，构建时检查坏链）

interface HomeFrontmatter {
  plans: SxPlan[]
  pricing: { rows: SxPricingRow[] }
  faq: SxFaqItem[]
}

const { frontmatter } = useData()
const fm = computed(() => frontmatter.value as HomeFrontmatter)
</script>

<template>
  <div class="sx ls">
    <LsHero />
    <LsAlbum />
    <LsStore />
    <LsHandle />
    <LsCloud />
    <LsAi />
    <LsMod />
    <LsOps />
    <LsMore />
    <SxPlans
      lead="开源版已经停止更新；付费版一次付费、永久使用，购买后可以免费升级到之后的所有版本。"
      :plans="fm.plans"
      :rows="fm.pricing.rows"
    >
      <p>每个授权包含 1 个域名，绑定后该域名的所有子域名也在授权范围内。付费版是一次付费、永久使用的数字商品，购买后不支持退款。</p>
    </SxPlans>
    <SxFaq :items="fm.faq">
      <template #header><slot name="faq" /></template>
    </SxFaq>
    <SxCta
      title="开始使用"
      lead="购买后登录授权中心下载安装包，按文档完成安装。购买前可以先在演示站中了解程序是否符合您的需求。"
      :actions="[
        { text: '购买授权', link: BUY_URL },
        { text: '阅读文档', link: DOCS_URL, theme: 'alt' },
      ]"
    >
      <slot name="links" />
    </SxCta>
  </div>
</template>

<style>
/* 首页自己用到的颜色。不加 scoped：价格、常见问题、结尾这几个共用组件也要用 */
.sx.ls {
  /* 演示用的大面板：品牌色比 --sx-panel 更淡；卡片中放截图的面板仍用 --sx-panel */
  --ls-panel-soft: color-mix(in srgb, var(--vp-c-brand-3) 5%, #f5f5f7);
  --ls-ok: #248a3d;
  --ls-bad: #d70015;
  --ls-warn: #b25000;
}

/* 深色下链接和描边按钮用更亮的品牌色，在纯黑底上更清楚 */
.dark .sx.ls {
  --sx-link: #c7d2fe;
  --ls-panel-soft: color-mix(in srgb, var(--vp-c-brand-3) 12%, #1c1c1e);
  --ls-ok: #30d158;
  --ls-bad: #ff6961;
  --ls-warn: #ffb340;
}


/* 标题只在词组之间断行 */
.ls .ph {
  display: inline-block;
}
</style>
