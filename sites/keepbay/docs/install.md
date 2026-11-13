# 安装 {#install}

Keepbay 是一个程序加一个 `lib/` 目录，解压就能运行，不用另装数据库或运行环境。

本页按我们推荐的方式安装：

- 程序放在 `/opt/keepbay`
- 数据放在 `/var/lib/keepbay`
- 用一个专门的 `keepbay` 用户运行
- 由 systemd 开机启动

全程大约十分钟。

## 运行环境 {#requirements}

| 项目 | 要求 |
|---|---|
| 系统 | Linux，glibc 2.28 及以上：Debian 10、Ubuntu 20.04、RHEL 8 及兼容系统起 |
| 架构 | x86_64（安装包 `amd64`）或 arm64（安装包 `arm64`） |
| 内核 | 支持 seccomp（Linux 3.17 起），用来隔离处理照片和视频的子进程；内核 7.0 及以上另外启用 Landlock |
| 开机启动 | systemd；没有 systemd 的系统（部分 NAS）用自带的任务计划，见 [NAS](#nas) |

处理照片用的 libvips、libraw、librsvg 等库都打包在 `lib/` 中了，不用另装。

视频缩略图、HEIC 照片、下载视频网站的视频要用到系统中的 ffmpeg 和 yt-dlp。不装也能用，见[可选组件](#optional)。

::: warning 内测阶段
内测期间只提供 Linux 安装包，暂不提供 Docker 镜像和 NAS 应用中心的安装包。
:::

## 安装包 {#package}

安装包的文件名是 `keepbay_<版本>_linux_<架构>.tar.gz`，另有一份 `keepbay_<版本>_checksums.txt` 列出每个安装包的 SHA256。

解压后是一个同名目录：

```
keepbay_0.1.0-beta.3_linux_amd64/
├── keepbay        # 主程序，前端页面已经编译在里面
├── lib/           # libvips 等动态库和字体配置
├── INSTALL.md     # 安装说明
├── LICENSE
├── NOTICE
└── licenses/      # 第三方组件的许可证
```

主程序按相对位置加载旁边的 `lib/`，两者要待在同一个目录里，不能拆开放。

## 目录布局 {#layout}

```
/opt/keepbay/
├── versions/
│   ├── keepbay_0.1.0-beta.2_linux_amd64/   # 上一个版本
│   └── keepbay_0.1.0-beta.3_linux_amd64/   # 正在用的版本
├── current -> versions/keepbay_0.1.0-beta.3_linux_amd64
└── keepbay -> current/keepbay               # 服务和命令都用这个路径

/var/lib/keepbay/                            # 数据目录，见下文
```

多了 `versions/` 和两个链接，是为了在网页上更新：新版本解压到 `versions/` 中，再把 `current` 指过去；新版本起不来时指回去就是回滚。

`/opt/keepbay/keepbay` 这个路径永远不变，服务文件也就不用改。更新的过程见[升级](./upgrade#online)。

## 安装步骤 {#steps}

### 1. 核对并解压 {#unpack}

先用 `uname -m` 看看架构：输出 `x86_64` 用 `amd64` 的安装包，`aarch64` 用 `arm64` 的安装包。

```bash
# 输出的 SHA256 与 checksums.txt 中的一致才继续
sha256sum keepbay_<版本>_linux_amd64.tar.gz

sudo mkdir -p /opt/keepbay/versions
sudo tar -xzf keepbay_<版本>_linux_amd64.tar.gz -C /opt/keepbay/versions --no-same-owner
sudo ln -sfn versions/keepbay_<版本>_linux_amd64 /opt/keepbay/current
sudo ln -sfn current/keepbay /opt/keepbay/keepbay

# 能输出版本号，说明系统满足要求
/opt/keepbay/keepbay version
```

### 2. 建专用用户 {#user}

```bash
# 这个用户不能登录，只用来运行 Keepbay
sudo useradd --system --home-dir /var/lib/keepbay --shell /usr/sbin/nologin keepbay

# 让 Keepbay 能在网页上更新自己；不需要的话跳过，以后手动升级
sudo chown -R keepbay: /opt/keepbay
```

请不要用 root 运行 Keepbay。

处理照片的子进程虽然关在沙箱里，但调用 ffmpeg 时仍能读到运行用户有权读的文件。用专用用户运行，它能碰到的就只有您授权的文件夹和它自己的数据目录。

### 3. 首次设置 {#setup}

```bash
sudo /opt/keepbay/keepbay setup --user keepbay
```

终端里会依次问您数据目录（默认 `/var/lib/keepbay`）、端口（默认 `8899`）、所有者的用户名和密码，最后安装为系统服务并启动。

更想在浏览器中创建帐号的，把这一步换成只安装服务，再按[首次设置](./setup#token)取设置令牌：

```bash
sudo /opt/keepbay/keepbay service:install --user keepbay
```

### 4. 检查环境 {#doctor}

```bash
sudo -u keepbay /opt/keepbay/keepbay doctor
```

它会检查数据目录的权限、端口和各项依赖，各项的含义见[命令行](./cli#doctor)。

其中"沙箱"一项显示"正常"或"部分可用"都不影响使用。显示"用不了"时，不生成缩略图、不识别图片中的文字，只有浏览器能直接显示的图片和视频可以预览，原因见 [NAS](#nas)。

一切正常的话，在浏览器中打开 `http://<服务器地址>:8899` 就能看到登录页了。

开着防火墙的，记得放行 8899 端口：

```bash
sudo ufw allow 8899/tcp          # Debian、Ubuntu

sudo firewall-cmd --permanent --add-port=8899/tcp   # RHEL 系
sudo firewall-cmd --reload
```

::: danger 不要把 8899 端口直接开放到公网
8899 端口是 HTTP，没有加密，密码和文件都以明文传输。想在外面访问，请按[外网访问](./remote-access)使用 Tailscale 或反向代理。
:::

## 给文件夹权限 {#permissions}

Keepbay 只能访问 `keepbay` 用户有权限的文件夹，这也是新手最容易卡住的地方。

在网页上添加文件夹前，先用 ACL 给它授权（Debian、Ubuntu 先 `sudo apt install acl`）：

```bash
# 读写；只读时把 rwX 改成 rX，添加文件夹时选"只读"
sudo setfacl -R -m u:keepbay:rwX /srv/photos

# 以后新建的文件也有同样的权限
sudo setfacl -R -d -m u:keepbay:rwX /srv/photos

# 每一级上级目录都要能进入，比如文件夹在 /home/alice 下
sudo setfacl -m u:keepbay:x /home/alice
```

用 `tar`、`cp -p`、`rsync -a` 复制进来的文件会保留原来的权限，复制完再运行一次第一条命令。

## 数据目录 {#data-dir}

数据目录存放数据库、缩略图、设置和日志，您的文件不会放进来。默认是 `/var/lib/keepbay`，权限 `0700`。

| 项目 | 用途 |
|---|---|
| `keepbay.db` | 数据库（另有 `-wal`、`-shm` 两个文件） |
| `secret.key` | 加密 API Key、两步验证密钥、各种密码的密钥 |
| `license.cert` | 专业版的授权证书 |
| `keepbay.lock` | 进程锁，防止两个进程同时打开同一个数据库 |
| `keepbay.sock` | 命令行与服务之间的控制通道 |
| `thumbs/` | 缩略图，删了会重新生成 |
| `avatars/` | 头像 |
| `models/` | 下载的本地 AI 模型和 ONNX Runtime |
| `downloads/` | 离线下载的中间文件 |
| `backups/` | 数据库备份 |
| `update/` | 在线更新的状态 |
| `logs/` | 日志和崩溃信息 |
| `tmp/` | 临时文件 |

搬到新设备时，把整个数据目录复制过去最省事。

只用备份恢复数据库的话，记得另外带上 `secret.key`，原因见[备份和维护](./backup#secret-key)。

## 可选组件 {#optional}

视频缩略图、视频时长、HEIC 照片都靠 ffmpeg，用系统的包管理器安装即可。HEIC 要 7.1 及以上、带 HEVC 解码器的版本。

HEVC 解码涉及专利授权，所以 Keepbay 自己不附带 ffmpeg。没有时 HEIC 文件显示为普通文件，照样能下载。装好后在「系统设置 › 媒体处理」中点「重新检测」，不用重启。

yt-dlp 在离线下载视频网站的视频时用。Keepbay 在 PATH 中找它，也可以在「系统设置 › 离线下载」中填写路径。

本地 AI 模型属于专业版。语义搜索、以图搜图、识别图片中的文字用的模型，以及运行它们的 ONNX Runtime，都在「系统设置 › AI 模型」中按需下载，不占安装包的体积。

## NAS {#nas}

能 SSH 登录、满足运行环境的 NAS 都可以装。先运行 `./keepbay version` 和 `./keepbay doctor`，确认能运行、沙箱可用，再往下走。

程序和数据目录建议放在存储空间里（比如 `/volume1/keepbay/`），不要放在空间很小的系统盘上。

NAS 大多没有 systemd，`setup` 不会安装服务。这时用 NAS 自带的任务计划，在开机时以专用用户运行：

```bash
/volume1/keepbay/keepbay serve --data-dir /volume1/keepbay/data
```

群晖要注意两件事：

- DSM 7.2 以下的系统太旧，跑不起来
- DS918+、DS920+ 这类 Apollo Lake、Gemini Lake 平台的机型，内核不支持 seccomp，沙箱用不了

Keepbay 不会在没有隔离的情况下解码照片和视频。所以在这些机型上没有缩略图和文字识别，只有浏览器能直接显示的图片和视频可以预览，文件照常浏览和下载。

## 常用操作 {#operations}

| 要做什么 | 命令 |
|---|---|
| 状态、地址、版本 | `sudo -u keepbay /opt/keepbay/keepbay status` |
| 查看日志 | `sudo journalctl -u keepbay -f` |
| 停止、启动、重启 | `sudo systemctl stop keepbay`（`start`、`restart`） |
| 立即备份数据库 | `sudo -u keepbay /opt/keepbay/keepbay db:backup` |
| 忘记密码（先停止服务） | `sudo -u keepbay /opt/keepbay/keepbay user:reset-password <用户名>` |
| 全部命令 | `/opt/keepbay/keepbay help` |

数据目录不是 `/var/lib/keepbay` 时，命令要加 `--data-dir <目录>`。全部命令见[命令行](./cli)。

## 卸载 {#uninstall}

```bash
sudo /opt/keepbay/keepbay service:uninstall
sudo rm -rf /opt/keepbay
```

数据目录确认不要了再删。

您的文件夹不受任何影响。其中的 `.keepbay-trash/`（在文件夹或其中各块磁盘的根目录）是 Keepbay 的回收站，可以一并删掉。
