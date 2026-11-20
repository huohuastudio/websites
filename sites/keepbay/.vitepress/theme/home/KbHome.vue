<script setup lang="ts">
import { SxCta, SxFaq, SxPlans } from '@huohuastudio/theme/showcase'
import { useData } from 'vitepress'
import KbAi from './KbAi.vue'
import KbFind from './KbFind.vue'
import KbFormats from './KbFormats.vue'
import KbFree from './KbFree.vue'
import KbHero from './KbHero.vue'
import KbHighlights from './KbHighlights.vue'
import KbInbox from './KbInbox.vue'
import KbLit from './KbLit.vue'
import KbNotify from './KbNotify.vue'
import KbPeople from './KbPeople.vue'
import KbPrivacy from './KbPrivacy.vue'
import KbRemote from './KbRemote.vue'
import KbScrub from './KbScrub.vue'
import KbSetup from './KbSetup.vue'
import KbWipe from './KbWipe.vue'
import { links } from './links'

// Keepbay 官网首页：各版块按顺序排列；价格和常见问题的数据在 index.md 的 frontmatter 中
const { frontmatter } = useData()
</script>

<template>
  <div class="sx kb-home">
    <KbHero />
    <KbHighlights />
    <KbWipe />
    <KbScrub />
    <KbFormats />
    <KbFind />
    <KbPeople />
    <KbLit />
    <KbPrivacy />
    <KbFree />
    <KbAi />
    <KbInbox />
    <KbRemote />
    <KbNotify />
    <KbSetup />
    <SxPlans
      lead="免费版是一个完整的私有网盘，不限文件夹和文件数量。专业版加上本地 AI、远程文件夹，成员不限。"
      :plans="frontmatter.plans"
      :rows="frontmatter.pricing.rows"
    >
      <p>专业版一次购买、永久使用，含 1 年更新；之后可以续费一年更新（¥79），不续费也可以继续使用，安全修复始终免费。专业版将在 1.0.0 正式版发布时开始销售。</p>
    </SxPlans>
    <SxFaq :items="frontmatter.faq">
      <template #header>
        <p>更多问题见文档中的<a href="./docs/faq">常见问题</a>，或在 <a href="https://github.com/huohuastudio/keepbay-releases/issues">GitHub</a> 上提交 Issue。</p>
      </template>
    </SxFaq>
    <SxCta
      title="先在演示站看看"
      lead="用帐号 demo 或 family 登录，密码 keepbay-demo。演示站每小时恢复一次，可以随意操作。"
      :actions="[
        { text: '打开演示站', link: links.demo },
        { text: '下载安装', link: links.download, theme: 'alt' },
      ]"
    />
  </div>
</template>

<style>
/* Keepbay 首页各版块的内容区比共用的宽（1080 → 1296），卡片和截图按 1.2 倍放大。价格、常见问题和结尾仍用共用的宽度。
   --kb-wrap 也供各版块按内容区算外侧留白 */
.kb-home {
  --kb-wrap: 1296px;
}

.kb-home > section:not(#pricing, #faq, #start) .sx-wrap {
  max-width: var(--kb-wrap);
}
</style>
