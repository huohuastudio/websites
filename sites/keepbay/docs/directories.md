# 目录和文件 {#directories}

本页列出 Keepbay 在服务器上、在您添加的文件夹中、在远程存储上创建的全部目录和文件，以及每一项的作用和能否手动删除。

Keepbay 创建的内容集中在以下位置：安装目录、数据目录、系统服务文件、您设置的备份目录，以及文件夹和远程存储中以 `.keepbay-` 开头的项。除此之外，Keepbay 不在其他位置写入。

## 安装目录 {#install-dir}

程序安装在 `/opt/keepbay` 中，安装步骤见[安装](./install#layout)。

```
/opt/keepbay/
├── versions/                                  # 各个版本的程序
│   ├── keepbay_0.1.0-beta.2_linux_amd64/      # 上一个版本，用于回滚
│   ├── keepbay_0.1.0-beta.3_linux_amd64/      # 正在用的版本
│   ├── .download-<版本>                        # 在线更新：下载中的安装包
│   └── .staging-<版本>/                        # 在线更新：解压中的新版本
├── current -> versions/keepbay_0.1.0-beta.3_linux_amd64
├── .current-new                               # 在线更新：切换 current 时的临时链接
└── keepbay -> current/keepbay                 # 命令行使用这个路径
```

| 项目 | 作用 | 能否删除 |
|---|---|---|
| `versions/` | 每个版本一个子目录，包含程序及其依赖的库。在线更新成功后，只保留新版本和上一个版本 | 不要删除正在使用的版本和 `current` 指向的版本 |
| `current`、`keepbay` | 指向正在使用的版本。服务文件使用 `/opt/keepbay/current/keepbay`，命令行使用 `/opt/keepbay/keepbay`，更换版本时都不用修改 | 不能删除 |
| `.download-*`、`.staging-*`、`.current-new` | 在线更新过程中的临时文件，更新结束后自动清理 | 更新中断后残留的可以删除，更新进行中请勿改动 |

## 数据目录 {#data-dir}

默认是 `/var/lib/keepbay`，首次设置时可以更改位置。目录权限 `0700`，只有运行服务的用户能访问。

您的文件不会长期存放在这里。远程文件夹的中转上传、解压、离线下载会在这里临时暂存。

```
/var/lib/keepbay/
├── keepbay.db                 # 数据库（另有 keepbay.db-wal、keepbay.db-shm）
├── secret.key                 # 加密敏感配置的密钥
├── license.cert               # 专业版的授权证书
├── keepbay.lock               # 进程锁
├── keepbay.sock               # 命令行与服务之间的控制通道
├── thumbs/                    # 缩略图和大图预览
├── avatars/                   # 用户头像
├── models/                    # 本地 AI 模型和 ONNX Runtime
├── downloads/                 # 视频离线下载的工作目录
├── stage/                     # 远程文件夹的暂存
├── tmp/                       # 临时文件
├── backups/                   # 数据库备份
├── update/                    # 在线更新的状态
└── logs/                      # 日志和崩溃信息
```

| 项目 | 作用 | 能否删除 |
|---|---|---|
| `keepbay.db` | 数据库：索引、标签、设置、成员、分享链接等全部数据。全文索引和向量索引也在其中 | 不能删除。`-wal`、`-shm` 两个文件是数据库的一部分，同样不能删除 |
| `secret.key` | 加密 API Key、两步验证密钥、远程存储的访问密钥和密码，以及其他各种密码 | 不能删除。备份数据库时需要另外保存，见[备份和维护](./backup#secret-key) |
| `license.cert` | 专业版的授权证书，在本地验证 | 不要删除，删除后需要重新激活专业版 |
| `keepbay.lock`、`keepbay.sock` | 防止两个进程同时打开同一个数据库；命令行通过 sock 与运行中的服务通信 | 服务运行时不能删除 |
| `thumbs/` | 缩略图和大图预览，按哈希分两级子目录存放 | 不要删除。大图预览删除后会在打开时重新生成；缩略图删除后不会自动重新生成，列表中无法显示 |
| `avatars/` | 用户上传的头像 | 删除后头像会丢失 |
| `models/` | 下载的本地 AI 模型和 ONNX Runtime。下载中的文件在 `.partial/` 中 | 可以删除，需要时重新下载 |
| `downloads/` | 视频网站离线下载（yt-dlp）的工作目录，每个任务一个子目录 | 下载进行中不要删除 |
| `stage/` | 远程文件夹的暂存，每个远程文件夹一个子目录：中转上传，以及解压、离线下载到远程文件夹的临时文件夹（其中的 `.keepbay-publish` 记录上传到存储后的名称）。中断后重启会继续传输 | 运行中不要删除。移除远程文件夹时自动删除对应的子目录 |
| `tmp/` | 临时文件：处理内容时从存储下载的副本、编辑图片的结果、远程文件夹上传的记录（S3 分片上传的 `s3-parts/`，WebDAV 上传的 `webdav-up/`） | 停止服务后可以删除，`s3-parts/` 和 `webdav-up/` 除外：它们记录存储上未完成的上传，删除后 Keepbay 无法清理存储上残留的分片或临时文件，这些内容会继续占用存储空间 |
| `backups/` | 数据库备份。文件名以 `keepbay-auto-`（自动备份）、`keepbay-manual-`（手动备份）、`pre-migrate-`（升级数据库前）、`before-restore-`（恢复前）开头。在「备份」中设置了其他备份目录的，自动和手动备份写在那个目录中。写到一半的备份名称以 `.keepbay-partial-` 开头，下次备份前自动清理 | 旧的备份可以删除，最近的建议保留 |
| `keepbay.db.restore-tmp`、`.secret.key-*`、`.license.cert-*` | 恢复数据库、保存密钥和证书时的临时文件，完成后改为正式名称 | 正常情况下不会留下。进程异常退出后残留的，停止服务后可以删除 |
| `update/` | 在线更新的状态，以及更新前的数据库副本 | 更新进行中不要删除 |
| `logs/` | `keepbay.log` 和轮换出来的旧日志，`crash.log` 记录崩溃信息 | 可以删除 |

迁移到新设备时，把整个数据目录复制过去即可。

## 系统服务文件 {#service}

`keepbay setup` 安装为系统服务时，创建 `/etc/systemd/system/keepbay.service`，并设为开机启动（systemd 会在 `/etc/systemd/system/multi-user.target.wants/` 中创建一个指向它的链接）。以当前用户安装的，对应 `~/.config/systemd/user/keepbay.service` 和 `~/.config/systemd/user/default.target.wants/` 中的链接。

Keepbay 不创建系统用户，不修改 sudoers，除了上面的服务文件和链接，也不在 `/etc` 下写入其他文件。运行服务的 `keepbay` 用户由您在安装时创建，见[安装](./install#user)。

`mount:grant` 给文件夹授权时只修改文件夹的权限，不创建文件，见[安装](./install#permissions)。

## 您添加的文件夹中 {#in-folders}

Keepbay 在您的文件夹中创建的项目，名称都以 `.keepbay-` 开头。扫描时跳过它们，Keepbay 的文件列表中也不显示。

```
/srv/photos/                       # 您添加的文件夹
├── .keepbay-trash/                # 回收站
│   └── <编号>/                     # 每次删除一个子目录
├── .keepbay-op-<编号>.part        # 复制中的临时文件
├── .keepbay-rename-<编号>         # 改名、移动中的临时名称
├── .keepbay-unpack-<编号>/        # 解压中的临时文件夹
└── .keepbay-dl-<编号>/            # 离线下载中的临时文件夹（BT 的数据也在其中）
```

| 项目 | 作用 | 能否删除 |
|---|---|---|
| `.keepbay-trash/` | 回收站。放在您添加的文件夹的根目录，如 `/srv/photos/.keepbay-trash/`；文件夹中另外挂载的磁盘，回收站在那块磁盘挂载点的根目录 | 不要手动改动。清空回收站请在 Keepbay 中操作，见[回收站和撤销](./trash#location) |
| `.keepbay-op-*`、`.keepbay-rename-*` | 复制、上传、改名、移动过程中的临时名称，完成后改为正式名称 | 操作进行中请勿改动。操作中断后，Keepbay 下次启动时自动处理 |
| `.keepbay-unpack-*`、`.keepbay-dl-*` | 解压、离线下载的临时文件夹，完成后改为正式名称 | 任务进行中或暂停时不要删除。确认任务已经删除后，残留的可以删除 |

以只读方式添加的文件夹，Keepbay 不写入任何内容，以上各项都不会出现。

## 远程存储上 {#in-remote}

[远程文件夹](./remote-folders)所在的存储上，Keepbay 创建以下对象。

```
<存储桶>/<前缀>/（S3）或 <地址>/<文件夹>/（WebDAV）
├── .keepbay-trash/            # 回收站
├── .keepbay-probe/<随机名称>/  # 测试连接时的临时文件，测完删除
└── .keepbay-up-<编号>          # WebDAV 上传中的临时文件，在上传的目标文件夹中
```

| 项目 | 作用 | 能否删除 |
|---|---|---|
| `.keepbay-trash/` | 远程文件夹的回收站，占用存储空间并照常计费 | 不要在存储的控制台或其他程序中手动改动 |
| `.keepbay-probe/` | 测试连接时写入、复制、删除的几个小文件，测完删除 | 测试中断后残留的可以删除 |
| `.keepbay-up-` 开头的文件 | WebDAV 上传中的临时文件，见[远程文件夹](./remote-folders#local-space) | 中断后残留的，Keepbay 在之后向这个存储上传时自动清理 |
| 以 `/` 结尾的空对象 | S3 上空文件夹的标记。对象存储没有实际的文件夹，用它记录空文件夹 | 删除后空文件夹会消失 |

中转上传先暂存在本机的 `stage/` 中，再传到存储。S3 的分片上传中断后，存储上未完成的上传由 Keepbay 自动取消。

## 卸载时删除什么 {#uninstall}

`keepbay service:uninstall` 只停止服务、取消开机启动、删除服务文件。

安装目录、数据目录，以及文件夹和存储上的 `.keepbay-*`，都不会删除。如需彻底清理，请按[安装](./install#uninstall)中的步骤手动删除。
