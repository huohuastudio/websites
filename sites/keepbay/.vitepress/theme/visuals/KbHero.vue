<script setup lang="ts">
import KbShot from './KbShot.vue'
</script>

<template>
  <!-- 首屏：Keepbay 的文件页面（演示站的截图），底部标出这个文件夹在磁盘上的位置（文件留在原处） -->
  <HomeWindow address="nas.local:8899">
    <KbShot name="files" mobile alt="Keepbay 的文件页面：照片按拍摄日期分组显示，右侧是日期条" />
    <div class="disk">
      <span class="label">磁盘上的位置</span>
      <code>/srv/nas/家庭相册/2025/日常</code>
    </div>
  </HomeWindow>
</template>

<style scoped>
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
</style>
