# 升级 {#upgrade}

普通安装可以在后台在线升级，服务器无法访问更新服务器时可以离线升级；Docker 安装通过更新镜像升级。升级时会自动执行数据库迁移、重建符号链接并通知队列重启，除下文[个别版本的升级说明](#version-notes)外，不需要手动执行其他命令。

::: warning
升级前请备份数据库和站点目录。
:::

## 在线升级 {#online}

在管理后台的「系统设置」→「系统升级」页面检测新版本，按页面提示升级。

升级前请确认：

- 「系统设置」→「常规设置」中的「应用网址」和「软件授权密钥」填写正确，否则无法检测新版本
- 消息队列正常运行：升级任务在队列中执行，队列没有运行时无法完成升级，见[配置消息队列](./install#configure-queue)

## 离线升级 {#offline}

服务器无法访问更新服务器时：

1. 登录[授权中心](https://huohuastudio.com/dashboard)，在「我的授权」中下载最新的安装包
2. 把安装包重命名为 `upgrade.zip`，上传到站点的 `storage/app` 目录
3. 把 `upgrade.zip` 的所有者改为 Web 服务器的运行用户（如 `www`），否则程序可能无法读取
4. 进入后台的「系统升级」页面，按提示升级

也可以通过命令升级，安装包放在其他位置时用参数指定路径：

```shell
cd /www/wwwroot/app.com

# 使用 storage/app/upgrade.zip
sudo -u www php artisan app:upgrade

# 指定安装包路径（相对路径从站点根目录算起）
sudo -u www php artisan app:upgrade /tmp/lsky-pro.zip
```

请用 Web 服务器的运行用户执行命令（上例中的 `sudo -u www`），否则升级后生成的文件可能无法被 Web 服务器读写；安装包也要放在该用户能读取的位置，例如 `/root` 目录通常无法读取。安装包的版本低于当前版本时，程序会拒绝升级。

## Docker 升级 {#docker}

Docker 安装请不要使用后台的在线升级，而是拉取新镜像并重新创建容器：

```bash
# 使用 Docker Compose 时
docker compose -p lsky-pro pull
docker compose -p lsky-pro up -d
```

使用 `docker run` 启动的，先拉取新镜像，删除旧容器，再用原来的命令和数据目录重新创建容器。容器启动时会自动执行数据库迁移。

## 运行环境检测 {#environment}

「系统升级」页面会检测升级需要的条件，包括：

- 队列是否正常运行
- 队列进程与网站进程的运行用户是否一致
- 程序目录的所有者、是否有不可写的文件
- Zip 扩展、磁盘剩余空间

检测不通过时，页面会给出修复权限的命令。升级失败时，请先按检测结果修复，再重新升级，未完成的步骤会继续执行。

## 修复安装 {#repair}

升级中断或程序文件损坏导致站点异常时，可以在「系统升级」页面点击「修复安装」：程序会重新下载当前版本的安装包，把缺失或与官方不一致的程序文件恢复原样。

离线环境可以下载当前版本的安装包，按[离线升级](#offline)的方法放到 `storage/app/upgrade.zip`（或在命令中指定路径），然后执行：

```shell
sudo -u www php artisan app:upgrade --repair
```

::: warning
修复安装会覆盖您对程序文件做过的修改。主题请放在 `themes` 目录中开发，不要直接修改程序文件。
:::

## 个别版本的升级说明 {#version-notes}

### 从 2.3.0 以前的版本升级 {#before-v2-3-0}

2.3.0 改动较大，从更早的版本升级时，请先完整阅读以下步骤再开始：

1. 备份站点文件和数据库，并确认备份完整
2. 为 PHP 安装 SourceGuardian 扩展（宝塔面板中名为 sg16）并重启 PHP。从 2.3.0 起后端代码经过加密，没有这个扩展时升级后站点无法访问
3. 把站点根目录的 `installed.lock` **复制**到 `storage/app/installed.lock`，否则升级后程序会认为尚未安装
4. 使用 SQLite 且数据库文件在默认位置 `database/database.sqlite` 时，把它**复制**到 `storage/app/database.sqlite`；`.env` 中有 `DB_DATABASE` 的，改为新文件的绝对路径
5. 确认队列正常运行后，在线或离线升级。升级完成前站点无法访问
6. 升级后站点无法访问时，在站点根目录依次执行 `php artisan optimize:clear` 和 `php artisan migrate --force`
7. 进入后台的「主题管理」，选择默认主题并重新填写网站设置（原「系统设置」→「网站设置」已移到这里）
8. 在「系统设置」→「常规设置」中重新填写软件授权密钥

使用 Docker 部署的 2.3.0 以前版本不能在线升级，也不能直接换成新镜像：旧镜像的数据目录是 `/var/www/html/storage`、`/var/www/html/database`，端口是 80；新镜像改为 `/app/storage/app` 和 8000。请先备份数据库和数据目录，按[Docker 安装](./install#docker-installation)的方式重新部署，再把上传的文件和数据库迁移过去。需要协助时可以在交流群中咨询。

### 2.5.2 {#v2-5-2}

2.5.2 修复了一处高危安全问题，建议所有 2.x 站点尽快升级。从更早的版本升级到 2.5.2 后，请：

1. 删除 `storage/app/public/livewire-tmp` 目录中的全部文件（Docker 安装在数据目录的 `public/livewire-tmp` 中）
2. 检查 `storage/app/public` 目录中有没有不是您上传的文件

::: danger
发现异常文件时，请及时联系我们，并修改服务器、数据库等相关密码。
:::
