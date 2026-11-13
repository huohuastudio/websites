# 常见问题 {#faqs}

程序出错时，页面只显示"500 错误""服务器错误"之类的简短提示，详细原因记录在日志中，避免在页面上泄露敏感信息。排查问题时请先查看日志：

- **普通安装**：站点根目录下的 `storage/logs`
- **Docker 安装**：容器中的 `/app/storage/logs`。这个目录不在数据目录中，删除容器后日志也会删除。查看方法：

```bash
# 使用 docker run 启动（容器名 lsky-pro）
docker exec lsky-pro ls /app/storage/logs

# 使用 Docker Compose 启动（项目名 lsky-pro、服务名 lsky-pro）
docker compose -p lsky-pro exec lsky-pro ls /app/storage/logs
```

日志按天分文件，默认保留 14 天，可以在 `.env` 中用 `LOG_DAILY_DAYS` 修改。

需要在页面上看到详细错误时，可以在 `.env` 中把 `APP_DEBUG` 和 `DEBUGBAR_ENABLED` 改为 `true`，以调试模式运行。

::: danger
- 请不要在生产环境长期开启调试模式：页面会显示数据库地址、服务器路径等敏感信息
- 调试模式会跳过缓存并收集运行信息，程序会明显变慢。排查结束后请改回 `false`
:::

## 为什么配置完了以后，访问站点显示 404？ {#website-404-after-configuration}

请检查站点的运行目录是否设置为 `public`、伪静态是否已配置，见[配置伪静态](./install#configure-rewrite)。确认无误后重启 Nginx 再试。

## 能不能上传图片以外格式的文件，例如 mp4？ {#upload-non-image-formats-mp4}

不能。程序只支持图片，可以上传的格式由当前的图片处理器（Imagick 或 Libvips）支持的格式和角色组中允许的格式共同决定。

## 为什么不支持客户端直传 {#no-direct-client-transmission-support}

一是各家储存的接口差异很大，有些储存在客户端直传后，程序无法取得需要的文件信息；二是上传后还要经过图片处理、审核等流程，需要由程序接收文件。

## 我多次上传了相同的图片，图片管理中也出现了图片，这是 bug 还是 feature? {#duplicate-image-upload-bug-or-feature}

这是正常现象。程序不会拒绝重复上传，是否保存新文件取决于储存的命名规则，详见[重复上传](./storage#duplicate-upload)。

## 我的图片中，「复制图片」出错，显示 复制失败 {#copy-image-failed}

浏览器只允许 https 页面写入图片到剪贴板，图片跨域时也可能失败。请使用 https 访问站点。详见 [Clipboard API 规范](https://w3c.github.io/clipboard-apis/#dom-navigator-clipboard)。

## 更新后出现样式异常、按钮不起作用？ {#style-issues-buttons-not-working-after-update}

请清除浏览器缓存后再试。使用了 CDN 的，请刷新 CDN 缓存。

## 上传出现失败，请稍后重试？ {#upload-failed-try-again}

常见原因：

- **文件超过服务器限制**：返回 413 Request Entity Too Large 时，请调大 Nginx 的 `client_max_body_size`，以及 PHP 的 `upload_max_filesize` 和 `post_max_size`
- **储存配置错误**：例如对象储存的密钥、Bucket、地域填写错误
- **目录没有写入权限**：站点目录的文件所有者不是 Web 服务器的运行用户

程序中发生的错误会记录在 `storage/logs` 中。日志中没有相关记录时，说明错误发生在程序之外，例如 Nginx 或 CDN。

## 使用反向代理并且域名使用了 https 的情况下，程序请求静态资源、生成的链接却是 http ？ {#https-reverse-proxy-static-links-http}

程序默认信任反向代理传来的请求头，根据 `X-Forwarded-Proto` 判断访问协议。出现这个问题通常是反向代理没有传这个请求头，请在反向代理配置中加入：

```nginx configuration
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

完整示例见[反向代理配置示例](./install#proxy-configuration-example)。同时请确认后台「常规设置」中的「应用网址」和 `.env` 中的 `APP_URL` 都以 `https://` 开头。

## 能不能支持 xxxx 、xxxx 储存？ {#support-custom-storage}

目前支持 10 种储存驱动，不支持自行添加；兼容 S3、WebDAV、SFTP 或 FTP 协议的储存可以用对应驱动接入，详见[支持的储存](./storage#drivers)。需要其他储存时，可以到[论坛](https://bbs.lskypro.com)提出需求。

## 激活邮件中的激活链接，访问显示 403 INVALID SIGNATURE？ {#activation-link-403-invalid-signature}

激活链接带有签名，链接的协议、域名或参数被改动时签名会失效。请检查：

- Nginx 伪静态是否按[配置伪静态](./install#configure-rewrite)配置，特别是 `$query_string` 有没有传给 `index.php`
- 使用反向代理时，是否传了 `X-Forwarded-Proto` 等请求头，见[上一个问题](#https-reverse-proxy-static-links-http)

## 分离部署后，第三方授权登录失败？ {#third-party-login-failed-after-deployment}

通常是回调地址或「前端地址」没有设置对，详见[第三方登录 - 分离部署](./login#separate-deploy)。

## 如何连接 Backblaze B2？ {#how-to-connect-backblaze-b2}

使用 AWS S3 驱动，`Region` 填写 `auto`，在自定义配置中添加配置名 `params.ACL`、配置值留空，详见[储存 - 如何连接 Backblaze B2](./storage#how-to-connect-backblaze-b2)。
