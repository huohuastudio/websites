# WebDAV {#webdav}

Keepbay 提供 WebDAV。电脑可以把它挂载成一个网络磁盘，手机上的文件管理、相册备份 App 和 rclone 等同步工具也可以通过它读写文件。免费版可用。

WebDAV 与网页使用同一套规则：只能看到自己有权限的文件夹，只读的文件夹不能写入，删除的文件进回收站，改动记入访问记录，可以在网页上撤销。客户端直接覆盖写入文件时，原来的内容成为旧版本，可以在网页上恢复，见[历史版本](./trash#versions)。

## 连接地址 {#address}

地址是 Keepbay 的访问地址后面加 `/dav/`：

| 访问方式 | WebDAV 地址 |
| --- | --- |
| 局域网 | `http://<服务器地址>:8899/dav/` |
| 反向代理 | `https://drive.example.com/dav/` |
| 部署在子路径下 | `https://example.com/keepbay/dav/` |

「个人设置 › WebDAV」中显示本机的连接地址和您的用户名，都可以复制；下方列出各系统的连接方法和您的应用密码。

打开后的第一级是您能看到的各个文件夹，顺序与「文件夹」页相同。第一级的文件夹不能在 WebDAV 中新建、删除或改名，由所有者在「系统设置 › 存储」中管理。

## 应用密码 {#app-password}

WebDAV 客户端不使用登录密码，而是使用应用密码。

在「个人设置 › WebDAV」的「应用密码」一节点「新建应用密码」，填写名称（如"MacBook"），选择权限：

| 权限 | 能做什么 |
| --- | --- |
| 读写 | 浏览、下载、上传、修改、删除。只读文件夹和没有写权限的文件夹仍不能写入 |
| 只读 | 只能浏览和下载 |

新建时要确认身份。生成的密码只显示一次，页面上同时给出 WebDAV 地址和用户名，请当场填入客户端。忘记时撤销后重新新建。

在客户端中，用户名填 Keepbay 的用户名，密码填应用密码。应用密码输入时不分大小写，中间的 `-` 可以省略。

应用密码只能用于 WebDAV，不能登录网页，也不能调用接口。开启两步验证、只用通行密钥登录的帐号同样可以使用。

建议每台设备、每个 App 各建一个，丢失设备时只撤销对应的那一个。列表中显示每个应用密码最近使用的时间和 IP。

几点规则：

- 每人最多 50 个
- 输错应用密码与登录失败共用限流和锁定的规则
- 帐号停用、暂停后，应用密码随之失效
- 修改登录密码、退出其他设备，不会撤销应用密码，需要单独撤销
- 用命令行 `user:reset-password` 找回帐号时，这个帐号的全部应用密码一并撤销，客户端要换上新建的应用密码，见[命令行](./cli#user-reset-password)

## 各客户端的连接方法 {#clients}

### macOS 访达 {#macos}

1. 在访达中选择「前往 › 连接服务器」（⌘K）
2. 输入 WebDAV 地址，如 `https://drive.example.com/dav/`，点「连接」
3. 选择「注册用户」，填写用户名和应用密码

连接后可以像本地磁盘一样复制、改名、删除。访达生成的 `._` 开头的文件和 `.DS_Store` 不会写入您的文件夹。

### Windows 资源管理器 {#windows}

在「此电脑」中点「映射网络驱动器」，文件夹填 WebDAV 地址，如 `https://drive.example.com/dav/`，勾选「使用其他凭据连接」，再填写用户名和应用密码。

Windows 默认有两项限制：

| 限制 | 默认值 | 修改方法 |
| --- | --- | --- |
| 只能经 HTTPS 使用密码 | 不能连接 `http://` 地址 | 注册表 `BasicAuthLevel` 改为 `2` |
| 单个文件大小 | 约 47 MiB（50,000,000 字节） | 注册表 `FileSizeLimitInBytes` 改为 `ffffffff`（4 GiB，最大值） |

这两项都在注册表的 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WebClient\Parameters` 下，类型为 DWORD。修改后在「服务」中重启 `WebClient` 服务。

`BasicAuthLevel` 改为 `2` 后，在 `http://` 地址下密码以明文传输，只建议在家中的局域网内这样做。外网访问请使用 HTTPS（见[外网访问](./remote-access)）。

### Linux {#linux}

- GNOME 文件：「其他位置」底部的「连接到服务器」，HTTPS 地址写成 `davs://drive.example.com/dav/`，HTTP 地址写成 `dav://<服务器地址>:8899/dav/`
- KDE Dolphin：地址栏输入 `webdavs://drive.example.com/dav/`（HTTP 用 `webdav://`）
- davfs2：`sudo mount -t davfs https://drive.example.com/dav/ /mnt/keepbay`，按提示填写用户名和应用密码。davfs2 会把打开的文件整个缓存到本地，大文件的效率不如 rclone

### rclone {#rclone}

```bash
rclone config create keepbay webdav \
  url=https://drive.example.com/dav/ \
  vendor=owncloud \
  user=<用户名> pass=<应用密码>
```

`vendor` 要选 `owncloud`。Keepbay 支持 ownCloud 用来传递修改时间的 `X-OC-Mtime` 头，选 `owncloud` 后，上传的文件保留原来的修改时间，再次同步时按修改时间和大小比较。[远程文件夹](./remote-folders)中的文件除外：上传到存储时不保留修改时间，与网页上传相同。

选 `other` 时，修改时间是上传的时间，再次同步只比较大小，大小不变的改动会被漏掉。不要选 `nextcloud`：它的分块上传使用 Nextcloud 专用的地址，Keepbay 不支持。

常用的命令：

```bash
rclone sync ~/Documents keepbay:文档/备份   # 把本地文件夹同步到 Keepbay
rclone copy keepbay:照片/2026 ~/Pictures    # 从 Keepbay 下载
```

`rclone sync` 删除的文件进 Keepbay 的回收站，可以恢复。

### 手机 {#mobile}

iPhone 自带的「文件」App 只支持 SMB，不支持 WebDAV。请使用支持 WebDAV 的 App，如 Documents、FE File Explorer、PhotoSync；安卓可以用 Solid Explorer、CX 文件管理器、FolderSync、PhotoSync 等。

在 App 中添加 WebDAV 服务器，填写 WebDAV 地址、用户名和应用密码即可。只用来备份照片的 App，建议在 Keepbay 中为它单独建一个应用密码。

## 反向代理 {#reverse-proxy}

经反向代理访问时，除了[外网访问](./remote-access#reverse-proxy)中的要求，还要注意以下几点：

1. **放行 WebDAV 的请求方法**：`PROPFIND`、`PROPPATCH`、`MKCOL`、`COPY`、`MOVE`、`LOCK`、`UNLOCK`。nginx、Caddy 默认会转发，部分面板和防火墙（WAF）会拦截这些方法
2. **不限制请求体大小**：WebDAV 一次请求上传整个文件，不像网页那样分块。nginx 设 `client_max_body_size 0;`
3. **超时足够长**：上传、下载大文件的时间都算在一个请求内。nginx 设 `proxy_read_timeout`、`proxy_send_timeout`，并关闭 `proxy_request_buffering`
4. **不改写 `Destination` 头**：移动、复制时，客户端在这个头中给出目标地址。Keepbay 只核对其中的主机名和路径，协议和端口不同没有影响。代理去掉了路径前缀，或改了主机名时，移动、复制会失败
5. **不缓存 `/dav/` 下的响应**

使用 Cloudflare 的代理（橙色云朵）或 Tunnel 时，免费套餐的单个请求最大 100 MB，超过的文件无法通过 WebDAV 上传。可以改用 Tailscale，或者在局域网内连接。

## 与 Syncthing 配合 {#syncthing}

Syncthing 直接同步磁盘上的文件夹，不经过 WebDAV。两者的用途不同：

| | Syncthing | WebDAV |
| --- | --- | --- |
| 方式 | 两端各存一份，持续双向同步 | 按需访问 Keepbay 上的文件 |
| 适合 | 手机相册自动备份、几台电脑共用一个文件夹 | 临时取用文件、只支持 WebDAV 的 App、挂载成磁盘 |
| 离线时 | 照常使用本地的副本 | 无法访问 |

可以把 Syncthing 的同步文件夹放在 Keepbay 的文件夹中。Syncthing 写入的文件，Keepbay 会通过文件监听发现，几秒内更新索引。Syncthing 同步时的临时文件默认跳过；`.stversions` 中是文件的旧版本，照常建立索引。

需要注意两点：

- Syncthing 的删除直接发生在磁盘上，不经过 Keepbay 的回收站。建议在 Syncthing 中为这个文件夹打开「文件版本控制」
- 同一个文件夹不要同时用 Syncthing 和 WebDAV 同步工具（如 `rclone sync`）双向同步，两边各自改动时容易产生冲突

## 已知限制 {#limits}

- **锁在重启后失效**：访达、Windows 编辑文件时会加锁，锁保存在内存中。Keepbay 重启后锁失效，客户端会重新加锁。锁只约束 WebDAV 客户端，网页上的操作不受影响
- **不保存自定义属性**：WebDAV 客户端设置的自定义属性不会保存。Windows 写入文件后设置的时间等属性会回答成功，但不保存，文件的修改时间是写入时的时间。需要保留修改时间时，请使用 rclone（`vendor=owncloud`），远程文件夹中不保留
- **只支持排他锁**，不支持共享锁
- **不能写入的名称**：系统自动生成的文件（`._*`、`.DS_Store`、`Thumbs.db`、`desktop.ini` 等）回答成功，但不写入；下载到一半的文件（`*.part`、`*.crdownload`）、Office 的锁文件（`~$*`、`.~lock.*#`）不能创建。浏览器直接下载到挂载的文件夹中时，请先下载到本地再复制过去
- **离线的文件夹**：网络盘、移动硬盘离线时，可以看到文件夹本身，但不能列出其中的内容和下载，避免同步工具误以为文件已被删除
- **不支持**：通过 WebDAV 访问分享链接；日历和通讯录（CalDAV、CardDAV）
