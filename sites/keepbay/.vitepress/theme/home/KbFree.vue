<script setup lang="ts">
import { easeOut, useScrollFrame, viewProgress } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'
import KbShot from '../visuals/KbShot.vue'

// 免费版的功能：格子，每格进入视口时淡入、上移，格子中的截图从 1.15 倍收拢到原大
const root = ref<HTMLElement>()
// 用 Set：函数形式的 ref 在组件更新时会再次调用
const cellEls = new Set<HTMLElement>()

const words = [
  { title: '收集文件', text: '对方不用登录即可上传到指定的文件夹。', word: ['看不到', '已有的内容'] },
  { title: '撤销和历史版本', text: '移动、改名、删除都能撤销，编辑过的文件保留旧版本。', word: ['可以', '恢复'] },
  { title: '离线下载', text: '由服务器下载网址、磁力链接；安装 yt-dlp 后还可以下载视频网站的视频。', word: ['关机也', '继续下载'] },
  { title: '标签和智能文件夹', text: '手动打标签，把常用的搜索条件存成智能文件夹。', word: ['点一下', '就是结果'] },
]

const cell = (el: unknown) => {
  if (el) cellEls.add(el as HTMLElement)
}

useScrollFrame((still) => {
  for (const c of cellEls) {
    const p = still ? 1 : easeOut(viewProgress(c, innerHeight, innerHeight * 0.5))
    c.style.setProperty('--o', String(0.1 + p * 0.9))
    c.style.setProperty('--z', String(1.15 - p * 0.15))
  }
}, root)
</script>

<template>
  <section ref="root" class="sx-sec">
    <div class="sx-wrap">
      <div class="sx-head">
        <h2 class="sx-title">免费版就是完整的网盘</h2>
        <p class="sx-lead">不限文件夹和文件数量。下面这些功能都不收费。</p>
      </div>
      <div class="bento">
        <div :ref="cell" class="cell big">
          <div class="txt">
            <h3>照片时间线</h3>
            <p>照片和视频跨文件夹按拍摄时间排在一起，按天分组，右侧的日期条按年、月跳转。</p>
          </div>
          <div class="img sx-fade-rb" style="--op: center top; --zo: 50% 0">
            <KbShot name="photos" fit alt="照片时间线：照片按天分组排成等高的行，右侧是按年份标出的日期条" />
          </div>
        </div>
        <div :ref="cell" class="cell s2">
          <div class="txt">
            <h3>一家人共用</h3>
            <p>按文件夹授权只读或读写。</p>
          </div>
          <div class="img sx-fade-rb" style="--top: 120px">
            <KbShot name="members" fit alt="成员周晴的文件夹授权：周晴的文件、家庭相册为读写，家庭文档为只读" />
          </div>
        </div>
        <div v-for="w in words" :key="w.title" :ref="cell" class="cell s2 word">
          <div class="txt">
            <h3>{{ w.title }}</h3>
            <p>{{ w.text }}</p>
          </div>
          <div class="k">{{ w.word[0] }}<br />{{ w.word[1] }}</div>
        </div>
        <div :ref="cell" class="cell s6 word">
          <div class="txt">
            <h3>安全功能不收费</h3>
            <p>两步验证、通行密钥，以及用 Authentik、Keycloak、Google、Microsoft、GitHub 等外部帐号登录，都在免费版中。</p>
          </div>
          <div class="k" style="padding-top: 24px">两步验证　通行密钥　外部帐号</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.cell {
  position: relative;
  min-height: 380px;
  overflow: hidden;
  border-radius: 28px;
  background: var(--sx-card);
  opacity: var(--o, 1);
  transform: translateY(calc((1 - var(--o, 1)) * 48px));
}

/* 带截图的格子用面板色，免得白色截图与格子融在一起 */
.cell:has(.img) {
  background: var(--sx-panel);
}

.txt {
  position: relative;
  z-index: 1;
  padding: 30px 32px 0;
}

h3 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.txt p {
  max-width: 520px;
  margin: 8px 0 0;
  color: var(--sx-text-2);
  font-size: 16px;
}

/* 截图延伸到格子的右边和底边 */
.img {
  position: absolute;
  left: 32px;
  right: 0;
  bottom: 0;
  top: var(--top, 150px);
  overflow: hidden;
  border-radius: 14px 0 0 0;
}

.img :deep(img) {
  object-position: var(--op, left top);
  transform: scale(var(--z, 1));
  transform-origin: var(--zo, 0 0);
}

.big {
  grid-column: span 4;
  grid-row: span 2;
  min-height: 780px;
}

.s2 {
  grid-column: span 2;
}

.s6 {
  grid-column: span 6;
  min-height: 0;
}

.word {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.k {
  padding: 0 32px 30px;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.035em;
}

@media (max-width: 960px) {
  .bento {
    grid-template-columns: 1fr 1fr;
  }

  .s6,
  .big {
    grid-column: span 2;
    grid-row: auto;
    min-height: 480px;
  }
}

@media (max-width: 560px) {
  .s2 {
    grid-column: span 2;
  }
}
</style>
