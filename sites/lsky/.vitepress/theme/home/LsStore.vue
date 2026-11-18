<script setup lang="ts">
import { isFlat, pinProgress, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'

// 储存：驱动名称环绕中心，随滚动转动；中心的说明跟着左侧的步骤切换

const steps = [
  { title: ['图片存到本地', '或对象储存'], text: '支持 10 种储存驱动。一个站点可以创建多个储存，每个储存选择一种驱动。' },
  { title: ['兼容 S3 的储存', '也能接入'], text: 'MinIO、Backblaze B2 等兼容 S3 接口的储存，选择 AWS S3 驱动，填写服务商提供的 Endpoint、Region、Bucket 和密钥即可。' },
  { title: ['按角色组分配，', '按储存处理'], text: '每个角色组可以关联多个储存，用户上传时切换使用。每个储存还可以分别关联图片安全、图片处理和云处理驱动。' },
]
const drivers = ['本地', 'AWS S3', '阿里云 OSS', '腾讯云 COS', '七牛云 Kodo', '又拍云 USS', '多吉云', 'SFTP', 'FTP', 'WebDAV']
/** AWS S3 在第二步高亮 */
const S3 = 1
const hubs = [
  { title: '10 种驱动', lines: ['一个站点，多个储存'] },
  { title: 'AWS S3 驱动', lines: ['MinIO', 'Backblaze B2', '其他兼容 S3 的储存'] },
  { title: '每个储存', lines: ['图片安全', '图片处理', '云处理'] },
]

const sec = ref<HTMLElement>()
const orb = ref<HTMLElement>()
const step = ref(0)

useScrollFrame((still) => {
  const pinned = !still && !isFlat()
  const p = pinned ? pinProgress(sec.value!) : 0
  orb.value!.style.setProperty('--rot', `${-p * 144}deg`)
  step.value = !pinned ? 0 : p < 0.36 ? 0 : p < 0.68 ? 1 : 2
}, sec)
</script>

<template>
  <section id="store" ref="sec" class="sx-pin sx-alt store">
    <div class="sx-stage">
      <div class="side">
        <div class="steps">
          <div v-for="(s, i) in steps" :key="i" class="s" :class="{ on: i === step }">
            <h2 class="sx-title"><span v-for="t in s.title" :key="t" class="ph">{{ t }}</span></h2>
            <p>{{ s.text }}</p>
          </div>
        </div>
        <div class="ticks" aria-hidden="true"><i v-for="(s, i) in steps" :key="i" :class="{ on: i === step }" /></div>
      </div>
      <div ref="orb" class="orb">
        <div class="ring" />
        <div class="ring in" />
        <ul class="sats">
          <li v-for="(d, i) in drivers" :key="d" :class="{ on: i === S3 && step === 1 }" :style="{ '--i': i }">{{ d }}</li>
        </ul>
        <div class="hub" aria-hidden="true">
          <div v-for="(h, i) in hubs" :key="i" :class="{ on: i === step }">
            <img v-if="i === 0" src="/logo.png" alt="" />
            <b>{{ h.title }}</b>
            <template v-for="(l, j) in h.lines" :key="j"><br v-if="j" />{{ l }}</template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.store {
  --sx-run: 250vh;
}

.sx-stage {
  display: grid;
  grid-template-columns: 5fr 6fr;
  gap: 48px;
  align-items: center;
  padding-inline: max(24px, calc((100vw - 1080px) / 2));
}

/* 分步文字：同一位置叠放，当前一步显示 */
.steps {
  position: relative;
  min-height: 250px;
}

.s {
  position: absolute;
  inset: 0 0 auto;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.5s, transform 0.5s var(--sx-ease);
}

.s.on {
  opacity: 1;
  transform: none;
}

.s .sx-title {
  font-size: clamp(30px, 3.2vw, 44px);
}

.s p {
  margin: 16px 0 0;
  color: var(--sx-text-2);
}

.ticks {
  display: flex;
  gap: 8px;
  margin-top: 36px;
}

.ticks i {
  width: 28px;
  height: 3px;
  border-radius: 3px;
  background: var(--sx-line);
  transition: background-color 0.4s;
}

.ticks i.on {
  background: var(--sx-text);
}

/* 驱动名称排成一圈，整圈随滚动转动，名称保持水平 */
.orb {
  --S: min(560px, 44vw, calc(var(--sx-vh) - 98px));
  position: relative;
  justify-self: center;
  width: var(--S);
  height: var(--S);
}

.ring {
  position: absolute;
  inset: 10%;
  border: 1px dashed color-mix(in srgb, var(--sx-text-3) 60%, transparent);
  border-radius: 50%;
}

.ring.in {
  inset: 27%;
  border-style: solid;
  border-color: var(--sx-line);
}

.sats {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sats li {
  --ang: calc(var(--i) * 36deg + var(--rot, 0deg) - 90deg);
  position: absolute;
  left: 50%;
  top: 50%;
  padding: 7px 14px;
  border-radius: 980px;
  background: var(--sx-card);
  color: var(--sx-text);
  font-size: clamp(12px, 1.05vw, 15px);
  white-space: nowrap;
  transform: translate(-50%, -50%) rotate(var(--ang)) translateX(calc(var(--S) * 0.41)) rotate(calc(-1 * var(--ang)));
  transition: background-color 0.4s, color 0.4s;
}

.sats li.on {
  background: var(--sx-text);
  color: var(--sx-bg);
}

.hub {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  place-items: center;
  width: 40%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--sx-card);
  text-align: center;
  transform: translate(-50%, -50%);
}

.hub img {
  width: 26%;
  margin: 0 auto 6px;
}

.hub > div {
  grid-area: 1 / 1;
  padding: 0 12%;
  color: var(--sx-text-2);
  font-size: clamp(12px, 1.1vw, 15px);
  line-height: 1.45;
  opacity: 0;
  transition: opacity 0.5s;
}

.hub > div.on {
  opacity: 1;
}

.hub b {
  display: block;
  color: var(--sx-text);
  font-size: 1.2em;
  font-weight: 600;
}

@media (max-width: 900px) and (min-width: 761px) {
  .sx-stage {
    gap: 28px;
  }

  .orb {
    --S: min(560px, 50vw, calc(var(--sx-vh) - 98px));
  }

  .sats li {
    padding: 6px 10px;
    font-size: 12px;
  }
}

/* 矮视口：标题收紧 */
@media (max-height: 832px) and (min-width: 761px) {
  .s .sx-title {
    font-size: clamp(30px, 5.2vh, 42px);
  }
}

/* 不固定舞台：步骤依次排开，驱动名称排成一行行标签 */
@media (max-width: 760px), (max-height: 640px) {
  .sx-stage {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}

@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .steps {
    min-height: 0;
  }

  .s {
    position: static;
    margin-bottom: 24px;
    opacity: 1;
    transform: none;
    transition: none;
  }

  .ticks {
    display: none;
  }
}

@media (max-width: 760px), (max-height: 640px) {
  .orb {
    justify-self: stretch;
    width: auto;
    height: auto;
  }

  .ring,
  .hub {
    display: none;
  }

  .sats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sats li {
    position: static;
    transform: none;
  }
}
</style>
