# 迁移 {#migrate}

把普通安装的兰空图床从一台服务器（下称旧服务器）迁移到另一台服务器（下称新服务器）时，需要转移站点文件和数据库，然后在新服务器上重建符号链接、配置运行环境。Docker 安装的迁移见[本页末尾](#docker)。

::: warning
授权绑定的是域名。迁移后如果更换了域名，请先在[授权中心](https://huohuastudio.com/dashboard)更换授权域名，并在后台修改「应用网址」。
:::

## 创建新站点 {#create-new-website}

在新服务器上按[环境要求](./requirement)准备好运行环境，并创建一个新站点。

## 移除符号链接 {#delete-symbolic}

本节和下一节的命令都在旧服务器的站点根目录中执行。

`public` 目录中有程序生成的符号链接（指向本地储存的目录和主题资源）。打包前请先删除它们，原因是：

- 打包工具可能会把符号链接指向的文件一起打包，压缩包会变得很大
- 新服务器的目录结构与旧服务器不同时，迁过去的符号链接会失效

```shell
# 查看符号链接（可选）
find public -type l

# 删除符号链接
find public -type l -exec rm -f {} +
```

删除后旧站点的图片会暂时无法访问。如果旧站点在迁移期间还要继续使用，可以在打包后执行以下命令恢复：

```shell
php artisan storage:link --force --relative && php artisan symlinks:rebuild
```

## 打包文件 {#packaging-files}

打包站点根目录中的所有文件：

```shell
tar -czvf lsky-pro.tar.gz ./
```

然后把 `lsky-pro.tar.gz` 上传到新服务器的站点根目录。

如果本地储存的储存目录不在站点目录中（例如站点目录是 `/www/wwwroot/app.com`，储存目录是 `/mnt/data`），还需要把储存目录单独打包，转移到新服务器上。

## 迁移数据库 {#migrate-database}

- **SQLite**：数据库文件默认是 `storage/app/database.sqlite`，已经包含在上一步的压缩包中。如果改过文件位置，请把文件单独转移到新服务器
- **MySQL、PostgreSQL 等**：从旧数据库导出 SQL 文件，导入到新服务器的数据库（或其他远程数据库）

::: warning
数据库使用了外键约束。用第三方工具备份时，部分工具可能因为外键约束导致数据表导出不全，建议使用 `mysqldump`、`pg_dump`、Navicat 或 phpMyAdmin 导出。
:::

## 恢复安装 {#restoring-installation}

本节的命令都在新服务器的站点根目录中执行。

解压文件：

```shell
tar -xzvf lsky-pro.tar.gz
```

使用 SQLite 时，`.env` 中的 `DB_DATABASE` 是数据库文件的绝对路径。新站点的目录与旧站点不同时（即使没有改过文件位置），请把它改为新的路径，例如 `DB_DATABASE=/www/wwwroot/new.com/storage/app/database.sqlite`。

使用其他数据库时，编辑 `.env`，把数据库配置改为新服务器的数据库：

```ini
DB_CONNECTION=mysql   # 数据库类型
DB_HOST=127.0.0.1     # 数据库地址
DB_PORT=3306          # 端口
DB_DATABASE=lsky_pro  # 数据库名称
DB_USERNAME=root      # 用户名
DB_PASSWORD=root      # 密码
```

重新生成符号链接：

```shell
php artisan storage:link --force --relative && php artisan symlinks:rebuild
```

然后按[安装](./install)中的步骤[配置站点运行目录和伪静态](./install#configure-rewrite)，并把站点目录中所有文件的所有者改为 Web 服务器的运行用户（如 `www` 或 `www-data`）：

```shell
chown -R www:www /www/wwwroot/app.com
```

## 更改配置 {#change-configuration}

登录管理后台，检查以下配置：

- **本地储存的储存目录**：如果新服务器上的路径变了，请修改为新的路径。路径没变也请编辑每个本地储存并重新保存一次，以生成符号链接
- **云处理驱动的「云处理缓存目录」**：确认路径正确
- **图片安全驱动的「违规图片转移目录」**：设置过的，确认路径正确

## 配置消息队列和计划任务 <Badge type="danger" text="重要" /> {#configure-queue-and-schedule}

请不要跳过这一步：按[安装](./install)中的步骤[配置消息队列](./install#configure-queue)和[配置计划任务](./install#configure-schedule)。没有配置时，缩略图、邮件、图片删除等功能都不能正常工作。

完成后，通过新站点的域名访问并测试上传、浏览等功能。

## Docker 安装的迁移 {#docker}

Docker 安装需要迁移的数据有：映射到 `/app/storage/app` 的数据目录（包括 `.env` 和 SQLite 数据库）、映射到 `/app/themes` 的主题目录（如果有），以及 MySQL 等数据库。

使用宿主机目录映射时（如 `~/data`、`./data`）：

1. 停止旧服务器上的容器
2. 打包数据目录、主题目录和 `docker-compose.yml`；使用 MySQL 等数据库的，同时导出数据库，见[备份和恢复](./install#backup-restore)
3. 在新服务器上解压到相同的位置，导入数据库，用原来的命令启动容器

使用 Docker 卷时（如编排文件中的 `storage`、`themes` 卷），数据不在普通目录中：

1. 在旧服务器上用临时容器分别打包 `storage` 和 `themes` 卷，方法见[备份和恢复](./install#backup-restore)
2. 在新服务器上先执行 `docker compose -p lsky-pro create` 创建容器和空卷（不会启动），再用临时容器把压缩包解压到对应的卷中，例如：

```bash
docker run --rm -v lsky-pro_storage:/data -v "$(pwd)":/backup alpine \
    tar -xzf /backup/lsky-storage-20261113.tar.gz -C /data
```

3. 使用 MySQL 等数据库的，先只启动数据库服务（如 `docker compose -p lsky-pro up -d mysql`），等数据库可以连接后导入 SQL 文件
4. 执行 `docker compose -p lsky-pro up -d` 启动全部服务

容器启动时会自动重建符号链接，队列和计划任务也已内置。之后同样需要按[更改配置](#change-configuration)检查后台的目录配置。
