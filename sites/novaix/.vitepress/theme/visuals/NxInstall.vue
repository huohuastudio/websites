<template>
  <!-- 部署的示意：终端里的下载、解压、运行三条命令 -->
  <HomeWindow>
    <pre class="home-terminal"><span class="c"># ARM 服务器把 amd64 换成 arm64</span>
<span class="p">$</span> wget https://github.com/huohuastudio/novaix-releases/releases/latest/download/novaix_linux_amd64.tar.gz
<span class="p">$</span> tar -xzf novaix_linux_amd64.tar.gz
<span class="p">$</span> ./novaix_linux_amd64/novaix
<span class="c"># 首次运行生成 config.yaml，并在终端输出初始管理员密码</span></pre>
  </HomeWindow>
</template>
