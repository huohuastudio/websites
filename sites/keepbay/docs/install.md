# 安装 {#install}

Keepbay 由一个程序和一个 `lib/` 目录组成，解压即可运行，无需另外安装数据库或运行环境。

本页按我们建议的方式安装：

- 程序放在 `/opt/keepbay`
- 数据放在 `/var/lib/keepbay`
- 用专用的 `keepbay` 用户运行
- 由 systemd 开机启动

整个过程约需十分钟。

## 运行环境 {#requirements}

| 项目 | 要求 |
|---|---|
| 系统 | Linux，glibc 2.28 及以上：Debian 10、Ubuntu 20.04、RHEL 8 及兼容系统起 |
| 架构 | x86_64（安装包 `amd64`）或 arm64（安装包 `arm64`） |
| 内核 | 建议支持 seccomp（Linux 3.17 起），用来隔离处理照片和视频的子进程，见 [NAS](#nas)；内核 7.0 及以上另外启用 Landlock |
| 开机启动 | systemd；没有 systemd 的系统（部分 NAS）使用自带的任务计划，见 [NAS](#nas) |

处理照片用的 libvips、libraw、librsvg 等库都已打包在 `lib/` 中，无需另外安装。

视频缩略图、HEIC 照片、下载视频网站的视频需要系统中的 ffmpeg 和 yt-dlp。不安装也不影响其他功能，见[可选组件](#optional)。

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

主程序按相对路径加载同级的 `lib/`，两者必须放在同一个目录中，不能分开存放。

## 目录布局 {#layout}

```
/opt/keepbay/
├── versions/
│   ├── keepbay_0.1.0-beta.2_linux_amd64/   # 上一个版本
│   └── keepbay_0.1.0-beta.3_linux_amd64/   # 正在用的版本
├── current -> versions/keepbay_0.1.0-beta.3_linux_amd64
└── keepbay -> current/keepbay               # 命令行使用这个路径

/var/lib/keepbay/                            # 数据目录，见下文
```

设置 `versions/` 目录和两个链接，是为了支持在网页上更新：新版本解压到 `versions/` 中，再将 `current` 指向新版本；新版本无法启动时，将 `current` 指回旧版本即可回滚。

服务文件使用 `/opt/keepbay/current/keepbay`，命令行使用 `/opt/keepbay/keepbay`，这两个路径在更换版本时保持不变，因此服务文件无需修改。更新的过程见[升级](./upgrade#online)。

Keepbay 创建的全部目录和文件，包括在您的文件夹中和远程存储上的，见[目录和文件](./directories)。

## 安装步骤 {#steps}

### 1. 核对并解压 {#unpack}

先用 `uname -m` 查看架构：输出 `x86_64` 用 `amd64` 的安装包，`aarch64` 用 `arm64` 的安装包。

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

处理照片的子进程虽然运行在沙箱中，但调用 ffmpeg 时仍能读取运行用户有权读取的文件。使用专用用户运行，Keepbay 能访问的只有您授权的文件夹和它自己的数据目录。

### 3. 首次设置 {#setup}

```bash
sudo /opt/keepbay/keepbay setup --user keepbay
```

终端中会依次询问数据目录（默认 `/var/lib/keepbay`）、端口（默认 `8899`）、所有者的用户名和密码，最后安装为系统服务并启动。

如果希望在浏览器中创建帐号，可以将这一步改为只安装服务，再按[首次设置](./setup#token)获取设置令牌：

```bash
sudo /opt/keepbay/keepbay service:install --user keepbay
```

### 4. 检查环境 {#doctor}

```bash
sudo -u keepbay /opt/keepbay/keepbay doctor
```

该命令会检查数据目录的权限、端口和各项依赖，各项的含义见[命令行](./cli#doctor)。

其中"沙箱"一项显示"正常"或"部分可用"都不影响使用。显示"不可用"时，默认不生成缩略图、不识别图片中的文字，只有浏览器能直接显示的图片和视频可以预览，原因见 [NAS](#nas)。

各项检查正常后，在浏览器中打开 `http://<服务器地址>:8899` 即可看到登录页。

如果开启了防火墙，请放行 8899 端口：

```bash
sudo ufw allow 8899/tcp          # Debian、Ubuntu

sudo firewall-cmd --permanent --add-port=8899/tcp   # RHEL 系
sudo firewall-cmd --reload
```

::: danger 不要把 8899 端口直接开放到公网
8899 端口是 HTTP，没有加密，密码和文件都以明文传输。需要从外网访问时，请按[外网访问](./remote-access)使用 Tailscale 或反向代理。
:::

## 给文件夹权限 {#permissions}

Keepbay 只能访问 `keepbay` 用户有权限的文件夹，这是安装时最常见的问题。

因此我们将授权设计为一条命令，在网页上添加文件夹前运行：

```bash
sudo /opt/keepbay/keepbay mount:grant /srv/photos               # 读写
sudo /opt/keepbay/keepbay mount:grant --read-only /srv/photos   # 只读，添加时选"只读"
```

该命令会设置文件夹中全部文件的权限，之后新建的文件也会自动获得权限。

文件夹在 `/home/alice` 这样的目录下面，每一级上级目录如果缺少进入权限，也会一并补上。

无需另外安装 acl，也不改动文件的所有者和原有权限，不影响您和其他程序的正常使用。

如果未执行这一步，在「系统设置 › 存储」添加文件夹时会提示没有权限，并显示已填好路径的这条命令，复制到服务器上运行即可。

几点说明：

- 默认给数据目录的所有者授权，即运行 Keepbay 的用户。要给其他用户授权，加 `--user`
- 只支持 Linux，要以 root 运行。根目录和 `/etc`、`/usr` 等系统目录不能授权
- 文件夹中另外挂载的磁盘不会一并设置，需要时对其单独运行一次
- 用 `tar`、`cp -p`、`rsync -a` 复制进来的文件会保留原有权限，复制完成后请再运行一次
- FAT、exFAT、NTFS 磁盘不支持这种权限，要在挂载时把所有者设为 `keepbay`（挂载参数 `uid=`、`gid=`）。SMB、NFS 等网络盘用它们自己的权限设置；rclone 挂载的云盘见[云盘](./cloud-storage#add-to-keepbay)

## 远程文件夹 {#remote}

文件存放在 Amazon S3、Cloudflare R2、阿里云 OSS、腾讯云 COS、MinIO 等 S3 兼容的对象存储上，或坚果云、Nextcloud、群晖 NAS 等 WebDAV 上时，专业版可以在「系统设置 › 存储」中直接添加，位置选"远程存储"。

远程文件夹无需运行上面的授权命令，Keepbay 用您填写的访问密钥或 WebDAV 帐号连接存储。文件留在存储上，Keepbay 只保存索引和处理结果。

安装时请注意两点：

- 解压、离线下载到远程文件夹时，文件先暂存在数据目录中，完成后再上传，请确保数据目录所在的磁盘有足够的空间。经 Keepbay 中转的上传（WebDAV 的上传都是）也是如此
- S3 兼容存储默认由浏览器直接连接存储上传和下载，请确保浏览器能访问存储的地址；通过 https 访问 Keepbay 时，存储也需要使用 https

帐号和密钥的权限、跨域设置、费用等，见[远程文件夹](./remote-folders)。

## 数据目录 {#data-dir}

数据目录存放数据库、缩略图、设置和日志，您的文件不会长期放在这里（远程文件夹的中转上传、解压、离线下载会临时暂存）。默认是 `/var/lib/keepbay`，权限 `0700`。

里面每个文件和子目录的作用、能否删除，见[目录和文件](./directories#data-dir)。

迁移到新设备时，建议复制整个数据目录。

如果只用备份恢复数据库，请另外复制 `secret.key`，原因见[备份和维护](./backup#secret-key)。

## 可选组件 {#optional}

视频缩略图、视频时长、HEIC 照片都依赖 ffmpeg，用系统的包管理器安装即可。HEIC 需要 7.1 及以上、带 HEVC 解码器的版本。

HEVC 解码涉及专利授权，因此 Keepbay 不附带 ffmpeg。未安装时 HEIC 文件显示为普通文件，仍可下载。安装后在「系统设置 › 媒体处理」中点击「重新检测」，无需重启。

yt-dlp 用于离线下载视频网站的视频。Keepbay 在 PATH 中查找它，也可以在「系统设置 › 离线下载」中填写路径。

本地 AI 模型属于专业版。语义搜索、以图搜图、识别图片中的文字用的模型，以及运行它们的 ONNX Runtime，都在「系统设置 › AI 模型」中按需下载，不占安装包的体积。

## NAS {#nas}

支持 SSH 登录且满足运行环境要求的 NAS 都可以安装。请先运行 `./keepbay version` 和 `./keepbay doctor`，确认程序能运行，并查看沙箱一项是否可用，再继续安装。

程序和数据目录建议放在存储空间里（如 `/volume1/keepbay/`），不要放在空间很小的系统盘上。

NAS 大多没有 systemd，`setup` 不会安装服务。此时请使用 NAS 自带的任务计划，在开机时以专用用户运行：

```bash
/volume1/keepbay/keepbay serve --data-dir /volume1/keepbay/data
```

群晖需要注意两点：

- 不支持 DSM 7.2 以下的系统
- DS918+、DS920+ 这类 Apollo Lake、Gemini Lake 平台的机型，内核不支持 seccomp，沙箱不可用

Keepbay 默认不在没有隔离的情况下解码照片和视频。因此在这些机型上没有缩略图和文字识别，只有浏览器能直接显示的图片和视频可以预览，文件可以正常浏览和下载。

文件来源可信时，所有者可以在「系统设置 › 媒体处理」中打开「照样处理照片和视频」，打开后 `doctor` 的沙箱一项显示"部分可用"。这样做的风险见[隐私与安全](./privacy#sandbox)。

## 常用操作 {#operations}

| 要做什么 | 命令 |
|---|---|
| 状态、地址、版本 | `sudo -u keepbay /opt/keepbay/keepbay status` |
| 查看日志 | `sudo journalctl -u keepbay -f` |
| 停止、启动、重启 | `sudo systemctl stop keepbay`（`start`、`restart`） |
| 立即备份数据库 | `sudo -u keepbay /opt/keepbay/keepbay db:backup` |
| 忘记密码（先停止服务） | `sudo -u keepbay /opt/keepbay/keepbay user:reset-password <用户名>` |
| 全部命令 | `/opt/keepbay/keepbay help` |

数据目录不是 `/var/lib/keepbay` 时，命令需要加 `--data-dir <目录>`。全部命令见[命令行](./cli)。

## 卸载 {#uninstall}

```bash
sudo /opt/keepbay/keepbay service:uninstall
sudo rm -rf /opt/keepbay
```

请确认不再需要数据目录后再删除。

您的文件夹不受任何影响。其中的 `.keepbay-trash/`（在文件夹或其中各块磁盘的根目录）是 Keepbay 的回收站，可以一并删除。

文件夹和远程存储上其他以 `.keepbay-` 开头的项也由 Keepbay 创建，清单见[目录和文件](./directories#in-folders)。
