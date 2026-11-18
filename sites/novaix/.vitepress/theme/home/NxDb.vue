<script setup lang="ts">
import { prefersReducedMotion } from '@huohuastudio/theme/showcase'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// 数据库三选一：左边是 config.yaml 的写法，右边是适用场景和注意事项。
// 版块大半进入视口时自动轮换，选中项底部的细条按时间走完后换下一个；点击任一项后停止轮换

const DBS = [
  {
    name: 'SQLite',
    conf: ['# config.yaml', 'server:', '  port: 8080', 'database:', '  driver: sqlite    # 默认值，可以不写', '  dsn: novaix.db     # 数据库文件，在工作目录下'],
    facts: [
      ['适合', '中小规模，数百台实例以内'],
      ['准备', '无需安装，数据库文件在工作目录下'],
      ['在线更新', '更新前自动备份数据库；迁移失败时恢复备份，回滚到旧版本'],
      ['多实例部署', '不支持'],
    ],
  },
  {
    name: 'MySQL',
    conf: [
      '# config.yaml',
      'server:',
      '  port: 8080',
      'database:',
      '  driver: mysql',
      '  dsn: "novaix:your-password@tcp(127.0.0.1:3306)/novaix?charset=utf8mb4&parseTime=True"',
      '  max_open_conns: 25',
      '  max_idle_conns: 10',
      '  conn_max_lifetime: 3600',
    ],
    facts: [
      ['适合', '较大规模或高并发'],
      ['准备', 'MySQL 5.7 及以上，字符集使用 utf8mb4'],
      ['在线更新', '迁移失败时停机保留现场，等待人工恢复。请在更新前自行备份'],
      ['多实例部署', '支持'],
    ],
  },
  {
    name: 'PostgreSQL',
    conf: [
      '# config.yaml',
      'server:',
      '  port: 8080',
      'database:',
      '  driver: postgres',
      '  dsn: "host=127.0.0.1 port=5432 user=novaix password=your-password dbname=novaix sslmode=disable"',
      '  max_open_conns: 25',
      '  max_idle_conns: 10',
      '  conn_max_lifetime: 3600',
    ],
    facts: [
      ['适合', '较大规模，或偏好 PostgreSQL 生态'],
      ['准备', 'PostgreSQL 12 及以上'],
      ['在线更新', '迁移失败时停机保留现场，等待人工恢复。请在更新前自行备份'],
      ['多实例部署', '支持'],
    ],
  },
].map((db) => ({
  ...db,
  // 整行注释灰色；行尾的注释单独取出来，也用灰色
  conf: db.conf.map((line) => {
    if (line.startsWith('#')) return { code: '', note: line }
    const m = line.match(/^(.*?)(\s+#.*)$/)
    return m ? { code: m[1], note: m[2] } : { code: line, note: '' }
  }),
}))

const cur = ref(0)
/** 点击过任一项，或系统要求减少动态效果：不再自动轮换 */
const user = ref(false)
const visible = ref(false)
const hidden = ref(false)
const paused = computed(() => user.value || !visible.value || hidden.value)

const box = ref<HTMLElement>()

function pick(i: number) {
  user.value = true
  cur.value = i
}

// 进度条的动画走完换下一个（关键帧名称带 scoped 的后缀，按前缀判断）
function onAnimationEnd(e: AnimationEvent) {
  if (e.animationName.startsWith('dbfill')) cur.value = (cur.value + 1) % DBS.length
}

let observer: IntersectionObserver | undefined
const onVisibility = () => (hidden.value = document.hidden)
onMounted(() => {
  user.value = prefersReducedMotion()
  // 只在版块一半以上进入视口时轮换（回调在越过 50% 时触发，低于一半时 isIntersecting 仍为 true，所以看比例）
  observer = new IntersectionObserver(([e]) => (visible.value = e.isIntersecting && e.intersectionRatio >= 0.5), { threshold: 0.5 })
  observer.observe(box.value!)
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <section id="db" class="sx-sec sx-alt">
    <div class="sx-wrap">
      <div class="sx-head center">
        <h2 class="sx-title">数据库三选一</h2>
        <p class="sx-lead">默认使用内置的 SQLite，无需配置。预计规模较大，或需要多实例部署时，建议一开始就选择 MySQL 或 PostgreSQL。</p>
      </div>
      <div class="dbseg" :class="{ paused }" role="tablist" aria-label="数据库" @animationend="onAnimationEnd">
        <button
          v-for="(db, i) in DBS"
          :id="`dbt${i}`"
          :key="db.name"
          type="button"
          role="tab"
          :aria-controls="`dbp${i}`"
          :aria-selected="i === cur"
          @click="pick(i)"
        >
          {{ db.name }}<i />
        </button>
      </div>
      <div ref="box" class="dbbox">
        <div
          v-for="(db, i) in DBS"
          :id="`dbp${i}`"
          :key="db.name"
          class="dbpane"
          :class="{ on: i === cur }"
          role="tabpanel"
          :aria-labelledby="`dbt${i}`"
        >
          <div class="sx-term" data-title="config.yaml">
            <div v-for="(l, j) in db.conf" :key="j" :style="{ '--i': j }">{{ l.code }}<span v-if="l.note" class="c">{{ l.note }}</span></div>
          </div>
          <dl class="dbfacts">
            <div v-for="([k, v], j) in db.facts" :key="k" :style="{ '--i': j }">
              <dt>{{ k }}</dt>
              <dd>{{ v }}</dd>
            </div>
          </dl>
        </div>
      </div>
      <p class="db-note">不支持在不同数据库之间在线迁移，请在首次部署时选定。</p>
    </div>
  </section>
</template>

<style scoped>
.sx-head .sx-lead,
dd {
  text-wrap: balance;
}

.dbseg {
  display: flex;
  justify-content: center;
  gap: 4px;
  width: max-content;
  max-width: 100%;
  margin: 0 auto 32px;
  padding: 4px;
  border-radius: 980px;
  background: var(--sx-card);
}

.dbseg button {
  position: relative;
  overflow: hidden;
  padding: 8px 20px;
  border: 0;
  border-radius: 980px;
  background: none;
  color: var(--sx-text-2);
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.3s, background-color 0.3s;
}

/* 选中项与分段控件的底色相反，靠底色区分，不描边 */
.dbseg button[aria-selected='true'] {
  background: var(--sx-card-in);
  color: var(--sx-text);
  font-weight: 600;
}

/* 自动轮换的进度：选中项底部一条细轨，按时间填满；暂停时不显示 */
.dbseg button i {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 5px;
  height: 2px;
  overflow: hidden;
  border-radius: 2px;
  background: color-mix(in srgb, var(--sx-text-3) 25%, transparent);
  opacity: 0;
}

.dbseg button i::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--sx-text-2);
  transform-origin: left;
  transform: scaleX(0);
}

.dbseg button[aria-selected='true'] i {
  opacity: 1;
}

.dbseg button[aria-selected='true'] i::after {
  animation: dbfill 5s linear forwards;
}

.dbseg.paused button i {
  display: none;
}

@keyframes dbfill {
  to {
    transform: scaleX(1);
  }
}

.dbbox {
  display: grid;
  max-width: 1000px;
  margin: 0 auto;
}

.dbpane {
  display: grid;
  grid-area: 1 / 1;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
  visibility: hidden;
}

.dbpane.on {
  visibility: visible;
}

.dbpane .sx-term {
  font-size: 13.5px;
}

.sx-term div,
.dbfacts div {
  opacity: 0;
  transform: translateY(6px);
}

.dbpane.on .sx-term div {
  animation: lnin 0.5s var(--sx-ease) forwards;
  animation-delay: calc(var(--i) * 70ms);
}

.dbpane.on .dbfacts div {
  animation: lnin 0.5s var(--sx-ease) forwards;
  animation-delay: calc(120ms + var(--i) * 80ms);
}

@keyframes lnin {
  to {
    opacity: 1;
    transform: none;
  }
}

.dbfacts {
  margin: 0;
  padding: 8px 26px;
  border-radius: 18px;
  background: var(--sx-card);
}

.dbfacts div {
  display: grid;
  grid-template-columns: 6.5em 1fr;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid var(--sx-line);
  font-size: 16px;
}

.dbfacts div:first-child {
  border-top: 0;
}

dt {
  color: var(--sx-text-2);
}

dd {
  margin: 0;
}

.db-note {
  max-width: 1000px;
  margin: 24px auto 0;
  color: var(--sx-text-2);
  font-size: 14px;
  text-align: center;
}

@media (max-width: 760px) {
  .dbpane {
    grid-template-columns: 1fr;
  }

  .dbseg button {
    padding: 8px 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dbseg button i {
    display: none;
  }

  .sx-term div,
  .dbfacts div {
    opacity: 1;
    transform: none;
    animation: none !important;
  }
}
</style>
