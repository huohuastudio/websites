---
title: 主题
sidebar: false
aside: false
editLink: false
---

<script setup>
import Themes from './.vitepress/theme/Themes.vue'
</script>

# 主题 {#themes}

Lsky Pro+ 从 V 2.3.0 起支持主题。下面是 [lsky-pro-themes](https://github.com/lsky-org/lsky-pro-themes) 仓库收录的主题：把主题放到程序的 `themes` 目录，就能在管理后台的「主题管理」页面中选择和配置。

<Themes />

## 提交主题 {#submit}

开发主题的方法见[主题](./docs/advanced/theme)。开发完成后，可以通过 Pull Request 提交到 lsky-pro-themes 仓库，收录后会显示在这一页：

1. Fork [lsky-pro-themes](https://github.com/lsky-org/lsky-pro-themes) 仓库
2. 新建 `themes/<主题 ID>/` 目录，放入 `manifest.json` 和截图 `screenshot.png`
3. 在根目录的 `index.json` 中按已有格式添加主题信息（ID、名称、简介、作者、标签、仓库地址）
4. 提交 Pull Request，在说明中写清主题的特点和功能
