# 外网访问 {#remote-access}

Keepbay 装好后监听 `8899` 端口，在家里的局域网中直接用 `http://<服务器地址>:8899` 访问就行。出了门想看看家里的照片，就要多做一步。

先说结论：**不要把 8899 端口直接映射到公网**。这个端口是普通的 HTTP，没有加密，密码、会话和文件都以明文在网上跑。登录限流和锁定防不了传输过程中被窃听。

我们没有在程序里内置自动申请 HTTPS 证书：家用宽带大多没有公网的 80、443 端口，内置了也用不上。下面三种方式任选一种，按配置难度从简单到复杂排列。

## Tailscale {#tailscale}

最简单的办法，不用开放任何端口，也不用买域名。服务器和手机、电脑都装上 [Tailscale](https://tailscale.com) 并登录同一个帐号，它们就像在同一个局域网里，用 Tailscale 分配的地址访问即可：

```
http://<服务器的 Tailscale 地址>:8899
```

Tailscale 的连接本身是加密的，所以这里用 HTTP 也没问题。想要一个 HTTPS 地址（用通行密钥需要它，见[下文](#passkey)），可以让 Tailscale 帮忙转发：

```bash
sudo tailscale serve --bg 8899
```

这时 `tailscale serve` 就是一个反向代理，要按[可信代理](#trusted-proxies)一节把 `127.0.0.1,::1` 设为可信代理，否则登录时会提示"请求来源不正确"。

## NAS 自带的远程访问 {#nas}

群晖、威联通、飞牛等 NAS 都有自己的远程访问或反向代理功能，用法和下面的反向代理一样：把一个域名（或子路径）转发到 `127.0.0.1:8899`，按要求转发几个请求头，再设置可信代理。各家界面不同，找"反向代理"或"自定义标题"之类的设置项。

## 反向代理 {#reverse-proxy}

有公网 IP 和域名时，用 Caddy、nginx 等反向代理提供 HTTPS，再转发给 Keepbay。一个请求经过代理时是这样的：

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

对代理有这几点要求：

1. 原样转发 `Host`，并写好 `X-Forwarded-Host`、`X-Forwarded-For`、`X-Forwarded-Proto`
2. 不限制请求体大小，至少要能容纳 16 MiB（16,777,216 字节）：网页上传时每块 16 MiB
3. 不缓冲响应，读超时不要太短：任务进度通过 SSE 长连接推送，下载大文件也要很久
4. 在 Keepbay 中设置[可信代理](#trusted-proxies)

Keepbay 不使用 WebSocket，不用配置 `Upgrade` 相关的头。

### Caddy {#caddy}

Caddy 会自动申请证书，默认就转发了上面这些头，配置最短：

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

    location / {
        proxy_pass http://127.0.0.1:8899;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-For $remote_addr;   # 覆盖而不是追加，访客伪造的值传不进来
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;               # SSE 和大文件下载不要先攒在代理里
        proxy_request_buffering off;       # 上传边收边转
        proxy_read_timeout 1h;
        proxy_send_timeout 1h;
    }
}
```

`Host` 用 `$http_host` 而不是 `$host`：后者会丢掉端口号，代理不在 443 端口时，Keepbay 算出的来源就和浏览器的对不上了。

## 可信代理 {#trusted-proxies}

代理转发过来的请求，在 Keepbay 看来都来自 `127.0.0.1`。访客的真实 IP、原来的域名、是不是 HTTPS，都写在 `X-Forwarded-*` 请求头里。但这些头谁都能伪造，所以 Keepbay 默认一个都不信，只有连接来自您指定的可信代理时才采信。

```bash
sudo systemctl edit keepbay
```

写入下面两行，保存后重启：

```ini
[Service]
Environment=KEEPBAY_TRUSTED_PROXIES=127.0.0.1,::1
```

```bash
sudo systemctl restart keepbay
```

代理和 Keepbay 在同一台机器上时就填 `127.0.0.1,::1`；代理在别的机器上时填它的 IP 或网段，如 `192.168.1.10` 或 `192.168.1.0/24`，多个用逗号分开，不支持主机名。

设好之后：

- **真实 IP**：从 `X-Forwarded-For` 的最右边往左数，跳过可信代理，第一个不可信的地址就是访客。最左边的值访客可以随便填，所以不直接取它。登录限流、访问记录、分享链接限流都按这个 IP 计算
- **域名和协议**：取 `X-Forwarded-Host` 和 `X-Forwarded-Proto` 的最后一个值，用于跨站请求检查、Cookie 的 `Secure` 属性和通行密钥

没有设置可信代理就经代理访问，会出现两个症状：登录、上传等操作提示"请求来源不正确，请刷新页面后重试"（Keepbay 以为自己在 `http://127.0.0.1:8899`，浏览器却说来自 `https://drive.example.com`，对不上）；所有人的 IP 都显示为代理的地址，一个人输错密码，全家一起被限流。

## 子路径 {#base-path}

想把 Keepbay 放在 `https://example.com/keepbay/` 这样的子路径下，再加一行：

```ini
[Service]
Environment=KEEPBAY_TRUSTED_PROXIES=127.0.0.1,::1
Environment=KEEPBAY_BASE_PATH=/keepbay/
```

前后的斜杠可以省略，`keepbay`、`/keepbay` 都会变成 `/keepbay/`；只能包含字母、数字和 `.` `_` `~` `-`。

**代理不要去掉前缀**，原样转发，前缀由 Keepbay 自己处理。nginx 中 `proxy_pass` 的地址后面不带路径，转发时就会保留前缀：

```nginx
location /keepbay/ {
    proxy_pass http://127.0.0.1:8899;
    # 其余同上
}
```

## 通行密钥 {#passkey}

通行密钥（Passkey）绑定在域名上，浏览器只在 HTTPS 或 `localhost` 下允许使用。所以：

- 用 IP 地址访问时不能使用，提示"通行密钥需要通过域名访问"
- 在局域网里用 `http://nas.local:8899` 这类地址也不行，要经过 HTTPS 的代理或 `tailscale serve`
- 换了域名后，原来添加的通行密钥在新域名下用不了，要重新添加

密码和两步验证不受这些限制，在哪里都能用。
