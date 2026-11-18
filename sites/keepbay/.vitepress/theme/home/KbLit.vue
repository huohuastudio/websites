<script setup lang="ts">
import { isFlat, pinProgress, seg, useScrollFrame } from '@huohuastudio/theme/showcase'
import { ref } from 'vue'

// 隐私的几句话：黑底大字（浅色、深色下都是黑底），随滚动逐句点亮。舞台不固定时全部点亮
const sentences = [
  '文件只在您自己的设备和存储上。',
  '不用注册我们的帐号，',
  '没有统计、遥测和崩溃上报。',
  '本地模型在您的设备上运行；',
  '使用云端 AI 由您决定，每次调用都有记录。',
  '家人只看得到授权给他的文件夹。',
]

const root = ref<HTMLElement>()
const lit = ref(sentences.length)

useScrollFrame((still) => {
  const p = still || isFlat() ? 1 : seg(pinProgress(root.value!), 0.05, 0.85)
  lit.value = Math.max(1, Math.ceil(p * sentences.length))
})
</script>

<template>
  <section ref="root" class="sx-pin lit">
    <div class="sx-stage">
      <div class="sx-wrap">
        <p><span v-for="(s, i) in sentences" :key="s" :class="{ on: i < lit }">{{ s }}</span></p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lit {
  height: 190vh;
  background: #000;
  color: #f5f5f7;
}

.sx-stage {
  display: flex;
  align-items: center;
}

p {
  max-width: 1000px;
  margin: 0;
  font-size: clamp(32px, 4.4vw, 60px);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.03em;
}

span {
  color: #57575c;
  transition: color 0.35s;
}

span.on {
  color: #f5f5f7;
}

@media (max-width: 760px), (max-height: 640px), (prefers-reduced-motion: reduce) {
  .lit {
    height: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  span {
    transition: none;
  }
}
</style>
