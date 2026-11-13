<template>
  <!-- 安装的示意：终端里的关键命令（节选自安装文档） -->
  <div class="kb-install">
    <HomeWindow>
      <pre class="terminal"><span class="c"># 解压到 /opt/keepbay，建一个专用用户（略）</span>
<span class="p">$</span> sudo /opt/keepbay/keepbay setup --user keepbay
<span class="c"># 按提示填数据目录、端口和所有者帐号，装成系统服务并启动</span>

<span class="p">$</span> sudo -u keepbay /opt/keepbay/keepbay doctor
<span class="c"># 检查权限、端口和各项依赖</span>

<span class="c"># 然后在浏览器中打开 http://&lt;服务器地址&gt;:8899</span></pre>
    </HomeWindow>
  </div>
</template>

<style scoped>
.terminal {
  margin: 0;
  padding: 18px 20px;
  overflow-x: auto;
  background: var(--vp-code-block-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.8;
  color: var(--vp-c-text-1);
  /* 窄的时候长注释折行，不出横向滚动条 */
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.c {
  color: var(--vp-c-text-2);
}

.p {
  color: var(--vp-c-brand-1);
  user-select: none;
}
</style>
