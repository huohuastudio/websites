<template>
  <!-- 示意图里的文件夹图标，颜色跟随文字 -->
  <span class="kb-folder-icon" />
</template>

<style scoped>
.kb-folder-icon {
  position: relative;
  display: inline-block;
  flex: none;
  width: 13px;
  height: 10px;
  margin-top: 2px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.55;
}

.kb-folder-icon::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  width: 6px;
  height: 3px;
  border-radius: 1px 1px 0 0;
  background: currentColor;
}
</style>
