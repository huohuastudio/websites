# 用 Docker 安装 {#docker}

Keepbay 提供 Docker 镜像 `0xxb/keepbay`，支持 x86_64 和 arm64，已带 ffmpeg（视频缩略图、HEIC 照片）。不需要 `--privileged`，在 Docker 默认的安全配置下沙箱正常可用。

不用 Docker 时，按[安装](./install)一页直接安装。

## 用 Docker Compose 安装（推荐） {#compose}

```sh
sudo mkdir -p /opt/keepbay && cd /opt/keepbay
# 把下面的 compose.yaml 保存到这个目录，修改其中标明的几行
sudo docker compose up -d
sudo docker logs keepbay    # 日志中有首次设置的令牌
```

```yaml
services:
  keepbay:
    image: 0xxb/keepbay:<版本>   # 修改：最新的版本号
    container_name: keepbay
    restart: unless-stopped
    ports:
      - "8899:8899"
    environment:
      TZ: Asia/Shanghai
      PUID: "1000"        # 修改：文件夹属主的用户 ID 和组 ID
      PGID: "1000"
      KEEPBAY_OFFICE_EDITOR: http://192.168.1.10:9980   # 修改：这台服务器的局域网地址或域名
      KEEPBAY_OFFICE_HOST: http://keepbay:8899
    volumes:
      - ./data:/data
      - /srv/files:/files # 修改：你的文件夹

  collabora:
    image: collabora/code
    container_name: keepbay-collabora
    restart: unless-stopped
    ports:
      - "9980:9980"
    environment:
      aliasgroup1: http://keepbay:8899
      extra_params: --o:ssl.enable=false
```

`<版本>` 换成最新的版本号，在 [Docker Hub](https://hub.docker.com/r/0xxb/keepbay/tags) 上查看。内测期间只发布带完整版本号的镜像，没有 `latest`。

然后在浏览器中打开 `http://<服务器地址>:8899`，输入日志中的设置令牌，创建所有者帐号。之后在 设置 › 存储 中添加文件夹，填写容器内的路径（如 `/files/photos`），页面上会列出挂载进容器的目录供选择。

`collabora` 一段用于在线编辑 Word、Excel、PowerPoint，不需要时删掉它和两个 `KEEPBAY_OFFICE_` 变量。编辑器地址和编辑器访问网盘的地址由这两个变量预设，也可以在 系统设置 › 网络 › 在线编辑 中修改，在页面上保存过以后以页面上的为准。换用 ONLYOFFICE、经反向代理用 HTTPS 访问时，见[在线编辑](./office#deploy)。

不用 Compose 时：

```sh
sudo docker run -d --name keepbay --restart unless-stopped -p 8899:8899 \
  -e TZ=Asia/Shanghai -e PUID=1000 -e PGID=1000 \
  -v /opt/keepbay/data:/data -v /srv/files:/files \
  0xxb/keepbay:<版本>
```

## 数据在哪里 {#data}

容器本身不存需要保留的数据，删除、重建、升级容器都不会丢数据。数据都在宿主机上，分两类：

| 数据 | 位置 | 说明 |
|---|---|---|
| 你的文件 | 挂载进容器的文件夹 | 原样留在原处。回收站 `.keepbay-trash` 也在各文件夹中 |
| Keepbay 的数据 | 挂载到 `/data` 的目录 | 数据库、缩略图和预览图、`secret.key` 和授权证书、日志、本地模型和 ONNX Runtime、yt-dlp、上传和离线下载的临时文件 |

建议把 `/data` 挂到宿主机上明确的路径（如上面的 `/opt/keepbay/data`），不用匿名卷，方便查看和备份。备份 Keepbay 就是备份这个目录（先停止容器，或用 `keepbay db:backup` 备份数据库）。

`/data` 和容器的 `/tmp` 不能以 `noexec` 挂载：Keepbay 自己下载的 yt-dlp、Deno 要从这里运行。

**在 macOS、Windows 上**（Docker Desktop、OrbStack 等），`/data` 建议用命名卷，不挂载宿主机的目录：

```yaml
services:
  keepbay:
    volumes:
      - keepbay-data:/data
      - /Users/alice/Pictures:/files   # 你的文件夹仍挂载宿主机的目录
volumes:
  keepbay-data:
```

这些系统上的容器运行在一个 Linux 虚拟机中，宿主机的目录要经过跨虚拟机的文件共享才能进入容器。数据库依赖的文件锁和内存映射在共享目录上不可靠，可能报"数据库被锁定"，甚至导致数据库损坏；缩略图等大量小文件的读写也会明显变慢。这时系统设置 › 关于 中的数据目录会提示"在 FUSE 挂载上"。

命名卷存在虚拟机自己的磁盘上，没有这些问题。代价是在访达、资源管理器中看不到其中的文件，备份时先用 `docker exec keepbay keepbay db:backup` 备份数据库（存在卷中的 `/data/backups/`），再用 `docker cp keepbay:/data/backups <宿主机上的目录>` 复制出来。你的文件夹只做普通的读写，仍挂载宿主机的目录。Linux 上没有虚拟机，`/data` 按上面的建议挂到宿主机的路径即可。

## 挂载文件夹 {#folders}

容器只能看到挂载进去的路径。推荐挂载一个放资料的总目录（如 `/volume1:/files`），之后在 Keepbay 中添加其中任意子文件夹、以及以后在其中新建的文件夹，都不用改 compose.yaml；添加上级目录以外的位置（如另一块硬盘）时，才要在 compose.yaml 中加一行挂载，再运行 `docker compose up -d`。

| 做法 | 写法 | 添加新文件夹 | 只读 |
|---|---|---|---|
| 挂载一个上级目录（推荐） | `/volume1:/files` | 不用改 compose | 添加时选"只读"，由 Keepbay 保证 |
| 读写和只读各挂一个上级目录 | `/volume1/data:/files`<br>`/volume1/archive:/archive:ro` | 不用改 compose | 只读的一组由系统保证，Keepbay 写不进去 |
| 每个文件夹单独挂载 | `/volume1/photos:/photos` | 每次都要改 compose 并重建容器 | 单独加 `:ro` |

不要挂载根目录 `/`。Keepbay 只读写在程序中添加的文件夹，所有路径都经过校验，不会访问其外的文件；挂载范围越小，出问题时影响越小。

## PUID 和 PGID {#puid}

Keepbay 在容器中以 `PUID`、`PGID`（默认 1000）这个用户读写文件。设成你的文件的属主（在宿主机上运行 `id` 或 `ls -n` 查看），Keepbay 新建的文件也属于这个用户。

- 添加文件夹时提示没有权限：在宿主机上给这个用户文件夹的权限，或者把 `PUID`、`PGID` 改为文件夹属主的 ID，再运行 `docker compose up -d`
- 启动时 `/data` 不属于这个用户（新建的目录、改了 `PUID`）：自动把 `/data` 和其中的文件改为这个用户，不改动挂载进来的文件夹
- 也可以用 `user: "1000:1000"`（`docker run --user`）指定，这时 `PUID`、`PGID` 不起作用，`/data` 要事先属于这个用户

## 专业版和更换设备 {#license}

专业版的证书绑定这台设备：设备 ID 由安装 ID 和机器指纹（数据目录所在的文件系统等信息的哈希值）得出。重建容器、升级镜像、宿主机重启，一般都不会改变它。

容器中默认只有数据目录这一项信息。把 `/data` 搬到另一台机器、另一块磁盘，或者从备份恢复到新建的目录后，Keepbay 启动时会自动联网重新激活，占用一个设备名额。连不上授权中心时，14 天内照常使用。见[专业版](./pro#rebind)。

可以把宿主机的 machine-id 以只读方式挂载进来，多一项信息；使用 host 网络时，物理网卡也算一项。激活时信息达到 3 项及以上的，之后只变了其中一项（如把 `/data` 挪到另一块磁盘）仍算同一台设备。建议在激活之前加上；已经激活的，加上这一行后仍按激活时记下的信息判断：

```yaml
    volumes:
      - /etc/machine-id:/etc/machine-id:ro
```

宿主机上要有 `/etc/machine-id` 这个文件（使用 systemd 的 Linux 都有）。没有时不要加这一行，否则 Docker 会在宿主机上建一个同名的空目录。

## 常用命令 {#commands}

在容器中运行 `keepbay` 命令，自动以 `PUID` 这个用户运行：

| 要做什么 | 命令 |
|---|---|
| 状态、版本 | `docker exec keepbay keepbay status` |
| 检查依赖、沙箱和权限 | `docker exec keepbay keepbay doctor` |
| 日志 | `docker logs -f keepbay` |
| 首次设置的令牌 | `docker exec keepbay keepbay setup:token` |
| 备份数据库 | `docker exec keepbay keepbay db:backup` |
| 重设密码（先停止服务） | `docker compose stop keepbay`<br>`docker compose run --rm -it keepbay user:reset-password <用户名>`<br>`docker compose start keepbay` |

容器内看到的地址和端口不一定是浏览器访问的地址，以 compose.yaml 中的 `ports` 为准。

## 升级 {#upgrade}

把 compose.yaml 中 `image` 的版本号改为新版本，然后：

```sh
cd /opt/keepbay
sudo docker compose pull
sudo docker compose up -d
```

新版本启动时自动升级数据库，升级前在 `/data/backups/` 中留一份备份。系统设置 › 维护 中有新版本时提示，在 Docker 中不能在网页上更新。回到旧版本时改回原来的版本号，再用 `keepbay db:restore` 恢复升级前的备份。

## 外网访问 {#remote-access}

与直接安装相同（见[外网访问](./remote-access)），只是[可信代理](./remote-access#trusted-proxies)写在 compose.yaml 的 `environment` 中，而且使用默认的桥接网络时一定要设置（容器中的本机地址只有容器自己；使用 host 网络时规则同直接安装）：`KEEPBAY_TRUSTED_PROXIES` 的值是反向代理连到容器时的来源地址。代理在宿主机上时，是 Docker 网络的网关（`docker network inspect <网络名>` 中的 `Gateway`，如 `172.18.0.1`）；代理也是容器、在同一个 Docker 网络中时，是代理容器的地址。

部署在子路径下时在 `environment` 中加 `KEEPBAY_BASE_PATH: /keepbay/`。监听端口、子路径等都用环境变量设置，不要改容器的启动命令（`command`）：健康检查按环境变量连接服务，改了启动命令的参数会被判为不健康。

## 国内拉取镜像 {#mirror}

镜像只发布在 Docker Hub。从国内拉取慢或失败时，在 `/etc/docker/daemon.json` 中配置镜像加速地址（由所用的云服务商、NAS 系统提供），然后重启 Docker：

```json
{ "registry-mirrors": ["https://<镜像加速地址>"] }
```
