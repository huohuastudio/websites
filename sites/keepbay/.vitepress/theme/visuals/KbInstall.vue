<template>
  <!-- 安装的示意：终端里的关键命令（节选自安装文档） -->
  <HomeWindow>
    <pre class="home-terminal"><span class="c"># 解压到 /opt/keepbay，创建专用用户（略）</span>
<span class="p">$</span> sudo /opt/keepbay/keepbay setup --user keepbay
<span class="c"># 按提示填写数据目录、端口和所有者帐号，安装为系统服务并启动</span>

<span class="p">$</span> sudo -u keepbay /opt/keepbay/keepbay doctor
<span class="c"># 检查权限、端口和各项依赖</span>

<span class="c"># 然后在浏览器中打开 http://&lt;服务器地址&gt;:8899</span></pre>
  </HomeWindow>
</template>
