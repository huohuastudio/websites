<script setup lang="ts">
import KbFolderIcon from './KbFolderIcon.vue'

// "一家人共用"的示意图：每个文件夹给每位家人的权限，没有授权的显示为看不到
const members = ['我', '爱人', '孩子']
const rows = [
  { folder: '照片', access: ['读写', '读写', '只读'] },
  { folder: '家庭文档', access: ['读写', '读写', ''] },
  { folder: '证件', access: ['读写', '', ''] },
  { folder: '孩子的作业', access: ['读写', '读写', '读写'] },
]
</script>

<template>
  <div
    class="kb-family"
    role="img"
    aria-label="示意图：按文件夹给家人授权。照片全家可见，孩子只读；家庭文档孩子看不到；证件只有自己能看到；孩子的作业全家读写"
  >
    <div class="home-card card">
      <table>
        <thead>
          <tr>
            <th>文件夹</th>
            <th v-for="member in members" :key="member">{{ member }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.folder">
            <th><span class="folder"><KbFolderIcon />{{ row.folder }}</span></th>
            <td v-for="(access, i) in row.access" :key="i">
              <span v-if="access" class="access" :class="{ write: access === '读写' }">{{ access }}</span>
              <span v-else class="hidden">看不到</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.card {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th,
td {
  padding: 11px 8px;
  text-align: center;
  white-space: nowrap;
}

thead th {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
}

tbody tr {
  border-top: 1px solid var(--vp-c-divider);
}

tbody th {
  padding-left: 14px;
  font-weight: 500;
  text-align: left;
  color: var(--vp-c-text-1);
}

.folder {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

thead th:first-child {
  padding-left: 14px;
  text-align: left;
}

.access {
  padding: 2px 7px;
  border-radius: 10px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}

.access.write {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.hidden {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
