# 在线编辑 Office 文档 {#office}

从 1.0.0-beta.8 起，Keepbay 可以对接自己部署的 Office 编辑器，在网页中编辑 Word、Excel、PowerPoint 等文档，多人可以同时编辑同一个文档。免费版可用。

Keepbay 不自带编辑器。支持两种，任选其一：

| 编辑器 | 说明 |
| --- | --- |
| Collabora Online | 推荐。免费的开发版 CODE 适合家庭使用 |
| ONLYOFFICE Docs | 社区版免费，界面与 Microsoft Office 接近 |

不部署编辑器时，Keepbay 照常预览 Office 文档，只是不能编辑。

文档由编辑器服务器读取和保存。编辑器部署在自己的设备上时，文件不离开自己的网络。

## 启用 {#enable}

所有者在「系统设置 › 网络 › 在线编辑」中设置：

1. 在「编辑器地址」中填写编辑器的网址，如 `https://office.example.com`
2. 点「测试连接」。成功时列出能编辑和只能查看的格式，以及请求签名是否启用
3. 编辑器访问网盘的地址与浏览器访问的不同时，填写「编辑器访问网盘的地址」，见[两个地址](#addresses)
4. 点「保存」

停用时点「停用在线编辑」。正在编辑的文档将无法保存。

修改编辑器地址后，已经打开的网页要刷新一次才能打开新的编辑器。

## 使用 {#use}

右键文档，在「打开方式」中选「在 Collabora 中编辑」（ONLYOFFICE 为「在 ONLYOFFICE 中编辑」）。编辑器在查看器中打开，占满内容区。在查看器中查看 Word、Excel、PowerPoint 文档时，也可以点顶栏的「编辑」切换到编辑器。

默认的打开方式仍是轻量预览。希望双击直接进入编辑器时，在「选择其他方式…」中勾选"始终使用此方式打开"，或在「个人设置 › 打开方式」中按扩展名设置。快速查看（空格键）始终用轻量预览。

新建菜单和 ⌘K 中有「Word 文档」「Excel 表格」「PowerPoint 演示文稿」，新建后直接用编辑器打开。这几项只在编辑器能编辑这种格式时出现。

没有修改权限的成员、只读的文件夹中的文档，用同一个入口打开时是只读的。

### 同时编辑 {#co-editing}

多人打开同一个文档时，进入同一个编辑会话，能看到彼此的光标和修改。

### 保存 {#save}

| 编辑器 | 什么时候保存到 Keepbay |
| --- | --- |
| Collabora | 点保存（⌘S）时，以及编辑期间每隔几分钟自动保存 |
| ONLYOFFICE | 所有人关闭文档后几秒内。编辑期间 Keepbay 中的文件不变 |

保存时，原来的内容作为旧版本放进回收站，可以撤销或从回收站找回。连续编辑时，30 分钟内自动保存的中间版本不保留，回收站中保留打开前的版本。

在 Collabora 中有未保存的修改时，关闭查看器或切换到其他文件前，Keepbay 会先让编辑器保存。

在编辑器中「另存为」时，新文件保存在原文件所在的文件夹中。

文档打开期间，文件在别处被修改过（WebDAV、同步工具、直接在磁盘上修改）时：

- Collabora 提示文档已在存储位置被更改，可以选择覆盖、丢弃或保存为新文档
- ONLYOFFICE 照常保存，被修改的版本进回收站

编辑器访问不到 Keepbay 时（Keepbay 重启、网络中断），编辑器提示无法保存。恢复后再保存即可，修改不会丢失。

## 部署编辑器 {#deploy}

下面用 Docker 部署，编辑器只监听本机端口，由反向代理提供 HTTPS。

### 两个地址 {#addresses}

| 地址 | 谁访问 | 设置项 |
| --- | --- | --- |
| 编辑器地址 | 浏览器、Keepbay | 「编辑器地址」 |
| 网盘地址 | 编辑器服务器 | 「编辑器访问网盘的地址」（选填），不填时用浏览器访问网盘的地址 |

编辑器在 Docker 中、Keepbay 直接装在宿主机上时，容器中的 `127.0.0.1` 指向容器自己，要填宿主机的局域网地址（如 `http://192.168.1.10:8899`）。两者在同一个 Docker 网络中时，填容器名（如 `http://keepbay:8899`）。这个地址只有编辑器服务器使用，可以是 http。

### HTTPS 和反向代理 {#https}

网盘用 HTTPS 访问时，编辑器也要用 HTTPS，否则浏览器会拦截编辑器的页面。设置页在这种情况下会提示。

编辑器经反向代理时要转发 WebSocket，超时设长。nginx 示例：

```nginx
location / {
    proxy_pass http://127.0.0.1:9980;    # ONLYOFFICE 为 8080
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_read_timeout 36000s;
    client_max_body_size 0;
}
```

### Collabora Online {#collabora}

```sh
# 请求签名用的密钥（容器以 UID 1001 运行）；不需要签名时跳过这一步和下面的 -v
sudo mkdir -p /opt/collabora
sudo ssh-keygen -q -t rsa -b 2048 -N "" -m PEM -f /opt/collabora/proof_key
sudo chown 1001 /opt/collabora/proof_key && sudo chmod 600 /opt/collabora/proof_key

docker run -d --name collabora --restart unless-stopped -p 127.0.0.1:9980:9980 \
  -e "aliasgroup1=https://drive.example.com:443" \
  -e "extra_params=--o:ssl.enable=false --o:ssl.termination=true" \
  -v /opt/collabora/proof_key:/etc/coolwsd/proof_key:ro \
  collabora/code
```

| 参数 | 说明 |
| --- | --- |
| `aliasgroup1` | 允许使用这个编辑器的网盘地址，写全协议和端口。填了「编辑器访问网盘的地址」时写那个地址。不在其中的网盘打不开文档 |
| `extra_params` | 由反向代理提供 HTTPS 时如上。在局域网内直接用 http 访问编辑器时改为 `--o:ssl.enable=false` |
| `proof_key` | 编辑器用它给请求签名，Keepbay 据此确认请求来自这个编辑器。没有时「测试连接」显示请求签名"未启用"，Keepbay 只凭访问令牌验证 |

### ONLYOFFICE Docs {#onlyoffice}

ONLYOFFICE 默认不访问内网地址，要写明网盘的主机名或 IP（与编辑器访问网盘的地址一致）：

```sh
sudo mkdir -p /opt/onlyoffice
sudo tee /opt/onlyoffice/local-production-linux.json > /dev/null <<'EOF'
{"services": {"CoAuthoring": {"ipfilter": {"rules": [
  {"address": "192.168.1.10", "allowed": true},
  {"address": "*", "allowed": true}
]}}}}
EOF

docker run -d --name onlyoffice --restart unless-stopped -p 127.0.0.1:8080:80 \
  -e WOPI_ENABLED=true \
  -v /opt/onlyoffice/local-production-linux.json:/etc/onlyoffice/documentserver/local-production-linux.json:ro \
  onlyoffice/documentserver
```

ONLYOFFICE 自带请求签名，不需要另外设置。

## 限制 {#limits}

- 编辑器打开文档期间，在网页或 WebDAV 中替换了这个文件的内容后，编辑器中的修改不能再保存，请用编辑器的「另存为」
- 编辑器的锁与 WebDAV 的锁互不感知
- 分享链接的访客不能在线编辑
