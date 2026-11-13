<script setup lang="ts">
import KbFolderIcon from './KbFolderIcon.vue'
import KbPhoto from './KbPhoto.vue'

// 首屏示意图：Keepbay 的文件页面，底部标出这个文件夹在磁盘上的位置（文件留在原处）
const folders = ['照片', '证件', '家庭文档', '收件箱', '回收站']
const files = [
  { name: 'IMG_2041.HEIC', tone: 'sea' },
  { name: 'IMG_2042.HEIC', tone: 'dusk' },
  { name: 'DSC_0815.ARW', tone: 'hill' },
  { name: 'IMG_2047.HEIC', tone: 'sea' },
  { name: 'VID_2048.MP4', tone: 'night', video: true },
  { name: 'IMG_2050.HEIC', tone: 'dusk' },
  { name: 'DSC_0822.ARW', tone: 'hill' },
  { name: 'IMG_2053.HEIC', tone: 'night' },
] as const
</script>

<template>
  <div
    class="kb-hero"
    role="img"
    aria-label="示意图：Keepbay 的文件页面正在浏览照片文件夹，页面底部显示这个文件夹在磁盘上的原始路径"
  >
    <HomeWindow address="nas.local:8899">
      <div class="app">
        <nav class="side">
          <div v-for="(folder, i) in folders" :key="folder" class="folder" :class="{ active: i === 0 }">
            <KbFolderIcon />{{ folder }}
          </div>
        </nav>
        <div class="main">
          <div class="toolbar">
            <span class="crumbs">照片<b>/</b>2024<b>/</b>七月海边</span>
            <span class="search">搜索</span>
          </div>
          <div class="files">
            <div v-for="file in files" :key="file.name" class="file">
              <span class="thumb">
                <KbPhoto :tone="file.tone" />
                <i v-if="'video' in file" class="play" />
              </span>
              <span class="name">{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="disk">
        <span class="label">磁盘上的位置</span>
        <code>/srv/nas/照片/2024/七月海边</code>
      </div>
    </HomeWindow>
  </div>
</template>

<style scoped>
.kb-hero {
  container-type: inline-size;
}

.app {
  display: grid;
  grid-template-columns: 116px 1fr;
  font-size: 13px;
}

.side {
  padding: 14px 8px;
  border-right: 1px solid var(--vp-c-divider);
}

.folder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.folder.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.main {
  min-width: 0;
  padding: 14px 16px 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.crumbs {
  overflow: hidden;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.crumbs b {
  margin: 0 6px;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.search {
  flex: none;
  width: 30%;
  min-width: 64px;
  padding: 3px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.files {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px 10px;
  margin-top: 14px;
}

.file {
  min-width: 0;
}

.thumb {
  position: relative;
  display: block;
}

/* 视频的播放标记 */
.play {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 11px solid rgba(255, 255, 255, 0.9);
  transform: translate(-40%, -50%);
}

.name {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  font-size: 12px;
  line-height: 16px;
  color: var(--vp-c-text-2);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.disk {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  padding: 10px 16px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-brand-soft);
  font-size: 12px;
}

.label {
  color: var(--vp-c-text-2);
}

.disk code {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
}

/* 窄的时候收起左侧文件夹栏，缩略图改成三列 */
@container (max-width: 440px) {
  .app {
    grid-template-columns: 1fr;
  }

  .side {
    display: none;
  }

  .files {
    grid-template-columns: repeat(2, 1fr);
  }

  .file:nth-child(n + 5) {
    display: none;
  }
}
</style>
