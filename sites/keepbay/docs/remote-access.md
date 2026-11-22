# 外网访问 {#remote-access}

Keepbay 安装后监听 `8899` 端口，在家中的局域网内直接用 `http://<服务器地址>:8899` 访问即可。从外网访问需要另外配置。

**不要把 8899 端口直接映射到公网**。这个端口是普通的 HTTP，没有加密，密码、会话和文件都以明文在网上传输。登录限流和锁定无法防止传输过程中的窃听。

我们没有在程序中内置自动申请 HTTPS 证书的功能，因为家用宽带大多没有公网的 80、443 端口，内置后也无法使用。

以下三种方式任选其一，按配置难度从低到高排列。

## Tailscale {#tailscale}

配置最简单，无需开放任何端口，也无需购买域名。

在服务器和手机、电脑上安装 [Tailscale](https://tailscale.com) 并登录同一个帐号，这些设备即可组成一个虚拟局域网，用 Tailscale 分配的地址访问即可：

```
http://<服务器的 Tailscale 地址>:8899
```

Tailscale 的连接本身是加密的，因此这里可以使用 HTTP。

如需 HTTPS 地址（使用通行密钥时需要，见[下文](#passkey)），可以用 Tailscale 转发：

```bash
sudo tailscale serve --bg 8899
```

此时 `tailscale serve` 相当于一个反向代理，从本机连到 Keepbay。1.0.0-beta.15 起 Keepbay 默认信任本机地址，不用另外设置；更早的版本要按[可信代理](#trusted-proxies)一节把 `127.0.0.1,::1` 设为可信代理，否则登录时会提示"请求来源不正确"。

## NAS 自带的远程访问 {#nas}

群晖、威联通、飞牛等 NAS 都有自己的远程访问或反向代理功能，用法与下面的反向代理相同：把一个域名（或子路径）转发到 `127.0.0.1:8899`，按要求转发几个请求头，再设置可信代理。

各品牌的界面不同，请查找"反向代理"或"自定义标题"等设置项。

## 反向代理 {#reverse-proxy}

有公网 IP 和域名时，用 Caddy、nginx 等反向代理提供 HTTPS，再转发给 Keepbay。

请求经过代理的过程如下：

```mermaid
sequenceDiagram
    participant B as 浏览器
    participant P as 反向代理（HTTPS）
    participant K as Keepbay 127.0.0.1:8899
    B->>P: https://drive.example.com/...
    P->>K: http://127.0.0.1:8899/...<br/>Host: drive.example.com<br/>X-Forwarded-For: 访客 IP<br/>X-Forwarded-Proto: https
    K->>K: 连接来自可信代理？<br/>是：采信 X-Forwarded-*<br/>否：忽略这些头
    K-->>P: 响应
    P-->>B: 响应
```

代理需要满足以下要求：

1. 原样转发 `Host`，并写好 `X-Forwarded-Host`、`X-Forwarded-For`、`X-Forwarded-Proto`
2. 不限制请求体大小，至少要能容纳 16 MiB（16,777,216 字节）：网页上传时每块 16 MiB；[WebDAV](./webdav#reverse-proxy) 一次上传整个文件，要完全不限制
3. 不缓冲响应，读超时不能过短：任务进度通过 SSE 长连接推送，下载大文件也需要较长时间
4. 原样转发 Range 请求，不缓存响应：照片地图按需读取内置底图的一部分，视频播放和拖动进度条也依赖它
5. 代理在其他机器上时，在 Keepbay 中设置[可信代理](#trusted-proxies)（1.0.0-beta.14 及更早的版本，代理在本机上也要设置）

Keepbay 不使用 WebSocket，无需配置 `Upgrade` 相关的头。

### Caddy {#caddy}

Caddy 会自动申请证书，默认转发上述请求头，配置最简洁：

```
drive.example.com {
    reverse_proxy 127.0.0.1:8899
}
```

### nginx {#nginx}

```nginx
server {
    listen 443 ssl;
    server_name drive.example.com;
    # ssl_certificate 等证书配置略

    client_max_body_size 0;            # 不限制上传大小

    location ^~ / {                    # ^~：不再检查正则规则，见下文
        proxy_pass http://127.0.0.1:8899;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-For $remote_addr;   # 覆盖而不是追加，访客伪造的值传不进来
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;               # SSE 和大文件下载不要先攒在代理里
        proxy_request_buffering off;       # 上传边收边转
        proxy_cache off;                   # 不缓存，否则 Range 请求不转发，见下文
        proxy_read_timeout 1h;
        proxy_send_timeout 1h;
    }
}
```

`Host` 用 `$http_host` 而不是 `$host`：后者会丢失端口号，代理不在 443 端口时，会导致 Keepbay 计算出的来源与浏览器的不一致。

`location` 要写成 `^~ /`，不要只写 `/`。宝塔等面板生成的站点配置中有按正则匹配的规则，如禁止访问 `LICENSE`、`.env` 等敏感文件，以及图片、js、css 的缓存规则。

nginx 中正则规则优先于普通的 `location /`。只写 `/` 时，`/api/v1/license` 这类请求会被这些规则拦下，授权信息无法读取；图片、脚本等请求也可能不经过 Keepbay。加上 `^~` 后，匹配到这个 `location` 的请求不再检查正则规则，全部转发给 Keepbay。

宝塔的 nginx 全局打开了代理缓存，要在 `location` 中加 `proxy_cache off;`。否则 nginx 不把 Range 请求（只读取文件的一部分）转发给 Keepbay，[照片地图](./photos#map)无法显示，视频也只能整份读取。照片地图遇到这种情况时，会提示"服务器的反向代理没有转发 Range 请求"。

## 可信代理 {#trusted-proxies}

代理转发的请求，对 Keepbay 而言都来自代理的地址。访客的真实 IP、原始域名、是否使用 HTTPS，都记录在 `X-Forwarded-*` 请求头中。

这些请求头可以被任意伪造，因此 Keepbay 只在连接来自可信代理时才采信。

没有设置时，可信代理是本机地址（`127.0.0.0/8`、`::1`）：代理和 Keepbay 在同一台机器上、转发到 `127.0.0.1` 时，不用另外设置。这是 1.0.0-beta.15 起的默认值；1.0.0-beta.14 及更早的版本默认不信任任何代理，要按下面的方法写上 `127.0.0.1,::1`。

代理在其他机器上，或转发到本机的局域网 IP 时，要设置可信代理：

```bash
sudo systemctl edit keepbay
```

把下面两行写在打开的文件顶部两行注释之间。写在 `### Lines below this comment will be discarded` 以下的内容会被丢弃，设置不会生效。

```ini
[Service]
Environment=KEEPBAY_TRUSTED_PROXIES=192.168.1.10
```

```bash
sudo systemctl restart keepbay
```

填写代理的 IP 或网段，如 `192.168.1.10` 或 `192.168.1.0/24`。多个地址用逗号分隔，不支持主机名。

设置后以设置为准，不再默认信任本机地址。同时还有本机上的代理时，把 `127.0.0.1,::1` 一起写上。

用 frp、`ssh -R` 等 TCP 转发把外网的连接转到本机时，请求头原样来自访问者。这种情况要把 `KEEPBAY_TRUSTED_PROXIES` 设为 `none`（不信任任何代理），否则访问者可以伪造 IP，绕过登录和分享链接的限流。

采信请求头后：

真实 IP：从 `X-Forwarded-For` 的最右边向左查找，跳过可信代理，第一个不可信的地址即为访客地址。最左边的值可以由访客任意填写，因此不直接采用。登录限流、日志、分享链接限流都按这个 IP 计算。

域名和协议：取 `X-Forwarded-Host` 和 `X-Forwarded-Proto` 的最后一个值，用于跨站请求检查、Cookie 的 `Secure` 属性和通行密钥。

代理没有被信任时会出现两个问题。

一是登录、上传等操作提示"请求来源不正确"。原因是 Keepbay 认为自己的地址是 `http://127.0.0.1:8899` 这类内部地址，而浏览器发送的来源是 `https://drive.example.com`，两者不一致。1.0.0-beta.15 起，提示中会写明浏览器访问的地址和服务器收到的地址；代理不在可信代理中时会说明这一点，并在服务日志中记下代理的地址。

二是所有人的 IP 都显示为代理的地址，任何一个人多次输错密码，所有用户都会被限流。

### 宝塔面板、CDN {#baota-cdn}

宝塔的反向代理默认不发送 `X-Forwarded-Proto` 和 `X-Forwarded-Host`。用 HTTPS 访问时，Keepbay 会认为自己的地址是 http，登录提示"请求来源不正确"。要在 网站 › 反向代理 › 配置文件 的 `location` 中加上：

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $http_host;
```

"目标 URL"要填 `http://127.0.0.1:8899`（或改过的端口），不要填服务器的公网 IP、局域网 IP 或域名，否则连接不是来自本机地址，不会被信任。

网站前面还有 CDN、CDN 用 HTTP 回源时，nginx 的 `$scheme` 是 `http`，登录同样会提示"请求来源不正确"。二选一处理：

- 把 `X-Forwarded-Proto` 写成固定的 `https`：`proxy_set_header X-Forwarded-Proto https;`（网站只用 HTTPS 访问时）
- 在 CDN 中把回源协议改为 HTTPS

## 子路径 {#base-path}

如需将 Keepbay 部署在 `https://example.com/keepbay/` 这样的子路径下，再添加一行：

```ini
[Service]
Environment=KEEPBAY_TRUSTED_PROXIES=127.0.0.1,::1
Environment=KEEPBAY_BASE_PATH=/keepbay/
```

前后的斜杠可以省略，`keepbay`、`/keepbay` 都会变成 `/keepbay/`。只能包含字母、数字和 `.` `_` `~` `-`。

**代理不能去掉前缀**，请原样转发，前缀由 Keepbay 处理。

nginx 中 `proxy_pass` 的地址后面不带路径时，转发会保留前缀：

```nginx
location ^~ /keepbay/ {
    proxy_pass http://127.0.0.1:8899;
    # 其余同上
}
```

## 通行密钥 {#passkey}

通行密钥（Passkey）绑定在域名上，浏览器只在 HTTPS 或 `localhost` 下允许使用。所以：

- 用 IP 地址访问时不能使用，提示"通行密钥需要通过域名访问"
- 在局域网中使用 `http://nas.local:8899` 这类地址也不能使用，需要经过 HTTPS 代理或 `tailscale serve`
- 更换域名后，原来添加的通行密钥在新域名下无法使用，需要重新添加

密码和两步验证不受这些限制，可以在任何地址下使用。

## 备案信息 {#beian}

网站在中国大陆备案后，所有者可以在「系统设置 › 通用」中填写 ICP 备案号和公安备案号。备案号显示在登录页和分享链接访客页面的底部，登录后的页面不显示。

链接由 Keepbay 生成，不能自行修改：

| 项目 | 链接到 |
| --- | --- |
| ICP 备案号 | 工业和信息化部的备案查询网站 beian.miit.gov.cn |
| 公安备案号 | 公安部的备案查询网站 beian.mps.gov.cn，按备案号中的编号查询，前面显示公安标识 |

请按备案时取得的写法填写，如"京ICP备12345678号-1""京公网安备11010502030143号"。公安备案号中要有编号的数字，否则无法保存。不填的项不显示。

## 搜索引擎 {#robots}

Keepbay 的所有页面，包括登录页、分享链接的访客页面和接口文档，都不让搜索引擎收录，搜索结果中不会出现网盘的页面内容。

- 每个响应都带 `X-Robots-Tag: noindex, nofollow`
- 提供禁止抓取全部页面的 `robots.txt`。部署在[子路径](#base-path)下时，根路径的请求也转发给 Keepbay，根路径的 `robots.txt` 才由它提供

这项设置不能关闭。已经被其他网站引用过的地址，仍可能只以网址的形式出现在搜索结果中，不会带页面内容。
