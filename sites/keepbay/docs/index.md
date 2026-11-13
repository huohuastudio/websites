---
layout: page
sidebar: false
title: 文档
head:
  - - meta
    - name: robots
      content: noindex
---

<script setup>
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'

// /docs/ 没有内容，跳到介绍页；地址参数（如嵌入模式的 embed=1）和锚点原样带上
const router = useRouter()
onMounted(() => router.go(withBase('/docs/introduce') + location.search + location.hash, { replace: true }))
</script>

<div style="padding: 4rem 2rem; text-align: center;">
  <p>正在跳转到 <a href="./introduce">Keepbay 文档</a>……</p>
</div>
