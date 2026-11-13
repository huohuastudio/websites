# 安装 Lsky Pro+ {#install}

兰空图床有两种安装方式：

- **[Docker 安装](#docker-installation)**：镜像中已包含运行环境、消息队列和计划任务，不需要另外配置。熟悉 Docker 时建议使用这种方式
- **[普通安装](#normal-installation)**：在服务器上自行准备 PHP 运行环境，需要另外配置消息队列和计划任务

## Docker 安装 <Badge type="tip" text="推荐" /> {#docker-installation}

::: tip
也可以在[宝塔](https://www.bt.cn)的 Docker 应用商店中一键安装：搜索 `lsky pro`，名称为 `Lsky Pro+` 的是付费版。
:::

Docker 镜像与普通安装的区别：

- 使用 [FrankenPHP](https://frankenphp.dev) 作为 Web 服务器，容器内监听 8000 端口
- 默认使用 Libvips 处理图片（普通安装默认使用 Imagick）
- 内置消息队列和计划任务，打包下载的上传任务使用单独的队列进程
- 已安装的站点每次启动容器时会自动执行数据库迁移、清理缓存，更新镜像后不需要手动执行命令

下面以把数据保存在宿主机的 `~/data` 目录为例。

### 创建持久化数据目录 {#create-data-dirs}

```shell
mkdir -p ~/data
```

::: warning
容器首次启动时会在这个目录中创建一个空的 `.env` 文件，请不要往里面写内容。首次打开安装页面时，程序检测到 `.env` 是空文件才会写入配置；如果 `.env` 已有内容，程序会直接使用它。安装完成后，您可以通过修改 `~/data/.env` 调整环境变量。
:::

### Docker 容器启动 {#docker-container}

```shell
docker run -d --name lsky-pro -p 8000:8000 \
    -v ~/data:/app/storage/app \
    -v ~/data/themes:/app/themes \
    0xxb/lsky-pro:latest
```

所有可用的版本标签见 [Docker Hub](https://hub.docker.com/r/0xxb/lsky-pro)。

| 参数 | 说明 |
|---|---|
| `-p 8000:8000` | 必须。前一个是宿主机端口，可以按需修改；后一个是容器内的端口，固定为 8000 |
| `-v ~/data:/app/storage/app` | 必须。保存上传的文件、缩略图、缓存、`.env` 和 SQLite 数据库，删除容器后数据仍在宿主机上 |
| `-v ~/data/themes:/app/themes` | 可选。保存第三方主题和自己开发的主题，放到这个目录的主题会出现在后台的「主题管理」中，详见[创建主题](../advanced/theme#create-theme) |

启动后，在浏览器中访问 `http://服务器IP:8000`，按安装页面的提示填写站点信息和数据库。选择 SQLite 时，数据库文件默认保存在 `~/data/database.sqlite`。

### Docker Compose 编排启动 {#docker-compose}

需要同时运行数据库、Redis 等容器时，可以使用 Docker Compose。以下是几种常见的配置，选择一种保存为 `docker-compose.yml`，并把其中的密码改成您自己的，然后按[编排启动](#docker-compose-up)启动。

#### MySQL 版本 {#docker-compose-mysql}

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root-password
      - MYSQL_DATABASE=lsky
      - MYSQL_USER=lsky
      - MYSQL_PASSWORD=lsky-password
    volumes:
      - mysql-data:/var/lib/mysql
    restart: unless-stopped

  lsky-pro:
    image: 0xxb/lsky-pro:latest
    depends_on:
      - mysql
    ports:
      - "8000:8000"
    volumes:
      - storage:/app/storage/app
      - themes:/app/themes
    restart: unless-stopped

volumes:
  mysql-data:
  storage:
  themes:
```

#### PostgreSQL 版本 {#docker-compose-pgsql}

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=lsky
      - POSTGRES_USER=lsky
      - POSTGRES_PASSWORD=lsky-password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

  lsky-pro:
    image: 0xxb/lsky-pro:latest
    depends_on:
      - postgres
    ports:
      - "8000:8000"
    volumes:
      - storage:/app/storage/app
      - themes:/app/themes
    restart: unless-stopped

volumes:
  postgres-data:
  storage:
  themes:
```

#### 1Panel 外部 MySQL 挂载卷版本 {#docker-compose-mysql-with-volume}

连接 1Panel 中已安装的 MySQL，数据保存在 Docker 卷中：

```yaml
services:
  lsky-pro:
    image: 0xxb/lsky-pro:latest
    ports:
      - "8000:8000"
    volumes:
      - storage:/app/storage/app
      - themes:/app/themes
    restart: unless-stopped

networks:
  default:
    external: true
    name: 1panel-network

volumes:
  storage:
  themes:
```

#### 1Panel 外部 MySQL 本机目录版本 {#docker-compose-mysql-with-local}

连接 1Panel 中已安装的 MySQL，数据保存在宿主机的 `/www/lsky` 目录：

```yaml
services:
  lsky-pro:
    image: 0xxb/lsky-pro:latest
    ports:
      - "8000:8000"
    volumes:
      - /www/lsky:/app/storage/app
      - /www/lsky/themes:/app/themes
    restart: unless-stopped

networks:
  default:
    external: true
    name: 1panel-network
```

#### MySQL + Redis 完整版本 {#docker-compose-mysql-redis}

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root-password
      - MYSQL_DATABASE=lsky
      - MYSQL_USER=lsky
      - MYSQL_PASSWORD=lsky-password
    volumes:
      - mysql-data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass "redis-password"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  lsky-pro:
    image: 0xxb/lsky-pro:latest
    depends_on:
      - mysql
      - redis
    ports:
      - "8000:8000"
    volumes:
      - storage:/app/storage/app
      - themes:/app/themes
    restart: unless-stopped

volumes:
  mysql-data:
  redis-data:
  storage:
  themes:
```

#### 本机目录映射完整版本 {#docker-compose-local-complete}

所有数据保存在 `docker-compose.yml` 所在目录的子目录中，便于直接查看和备份：

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root-password
      - MYSQL_DATABASE=lsky
      - MYSQL_USER=lsky
      - MYSQL_PASSWORD=lsky-password
    volumes:
      - ./mysql-data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass "redis-password"
    volumes:
      - ./redis-data:/data
    restart: unless-stopped

  lsky-pro:
    image: 0xxb/lsky-pro:latest
    depends_on:
      - mysql
      - redis
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/storage/app
      - ./data/themes:/app/themes
    restart: unless-stopped
```

::: tip
安装页面只配置数据库。要使用 Redis 作为缓存、会话或队列，请在安装完成后修改 `.env`，见[环境变量配置说明](#env-configuration)。
:::

#### Traefik 反向代理版本 {#docker-compose-traefik}

使用 Traefik 作为反向代理时，不需要映射端口。把 `your-domain.com` 和 `myresolver` 换成您的域名和 Traefik 中配置的证书解析器：

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root-password
      - MYSQL_DATABASE=lsky
      - MYSQL_USER=lsky
      - MYSQL_PASSWORD=lsky-password
    volumes:
      - mysql-data:/var/lib/mysql
    restart: unless-stopped
    networks:
      - lsky-internal

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass "redis-password"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - lsky-internal

  lsky-pro:
    image: 0xxb/lsky-pro:latest
    depends_on:
      - mysql
      - redis
    volumes:
      - storage:/app/storage/app
      - themes:/app/themes
    restart: unless-stopped
    networks:
      - lsky-internal
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.lsky.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.lsky.entrypoints=websecure"
      - "traefik.http.routers.lsky.tls.certresolver=myresolver"
      - "traefik.http.services.lsky.loadbalancer.server.port=8000"
      - "traefik.docker.network=traefik"

volumes:
  mysql-data:
  redis-data:
  storage:
  themes:

networks:
  lsky-internal:
    driver: bridge
  traefik:
    external: true
```

#### PostgreSQL + Redis 完整版本 {#docker-compose-pgsql-redis}

数据库和 Redis 通过健康检查后才启动程序容器：

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=lsky
      - POSTGRES_USER=lsky
      - POSTGRES_PASSWORD=lsky-password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lsky -d lsky"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass "redis-password"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis-password", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  lsky-pro:
    image: 0xxb/lsky-pro:latest
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - storage:/app/storage/app
      - themes:/app/themes
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  storage:
  themes:
```

#### 编排启动 {#docker-compose-up}

在 `docker-compose.yml` 所在目录执行：

```bash
docker compose -p lsky-pro up -d
```

::: warning
在安装页面填写数据库地址时，请填写编排文件中的服务名（如 `mysql`、`postgres`），不要填写 `127.0.0.1`：容器中的 `127.0.0.1` 指向程序容器本身。

```yaml
services:
  mysql: # 数据库地址填写 mysql // [!code focus]
    image: mysql:8.0
```
:::

### Docker 运维管理 {#docker-maintenance}

以下命令都在 `docker-compose.yml` 所在目录执行。

#### 查看容器状态和日志 {#container-logs}

```bash
# 查看所有容器的状态
docker compose -p lsky-pro ps

# 查看程序容器的日志
docker compose -p lsky-pro logs -f lsky-pro

# 查看数据库容器的日志（服务名按您的编排文件填写）
docker compose -p lsky-pro logs -f mysql
```

程序的错误日志位置和查看方法见[常见问题](./faq)。

#### 容器重启和更新 {#container-restart}

```bash
# 重启所有服务
docker compose -p lsky-pro restart

# 只重启程序容器
docker compose -p lsky-pro restart lsky-pro
```

更新镜像的方法见[Docker 升级](./upgrade#docker)。

#### 备份和恢复 {#backup-restore}

备份数据库（以 MySQL 为例）：

```bash
# 备份
docker compose -p lsky-pro exec -T mysql mysqldump -u lsky -plsky-password lsky > backup.sql

# 恢复
docker compose -p lsky-pro exec -T mysql mysql -u lsky -plsky-password lsky < backup.sql
```

备份程序数据目录（上传的文件、`.env`、SQLite 数据库等）：

```bash
# 使用本机目录映射时（如 ./data），直接打包该目录
docker compose -p lsky-pro stop
tar -czf lsky-backup-$(date +%Y%m%d).tar.gz data/ docker-compose.yml
docker compose -p lsky-pro start

# 使用 Docker 卷时，通过临时容器打包卷中的文件
docker run --rm -v lsky-pro_storage:/data -v "$(pwd)":/backup alpine \
    tar -czf /backup/lsky-storage-$(date +%Y%m%d).tar.gz -C /data .
```

::: tip
- 备份前停止容器，可以避免备份到写了一半的文件
- 使用 Docker 卷时，卷名为"项目名_卷名"，可以用 `docker volume ls` 查看
- 如果储存使用的是对象储存，图片文件不在这些目录中，请在对象储存的控制台中另行备份
:::

### 环境变量配置说明 {#env-configuration}

安装页面会把站点和数据库配置写入 `.env`。之后可以修改 `.env` 调整以下常用配置：

```bash
# 应用配置
APP_URL=https://your-domain.com    # 站点地址
APP_DEBUG=false                    # 调试模式，生产环境必须为 false
APP_ENV=production                 # 运行环境

# 数据库配置（MySQL 示例）
DB_CONNECTION=mysql                # 数据库类型：mysql、mariadb、pgsql、sqlsrv、sqlite
DB_HOST=mysql                      # 数据库地址，Docker Compose 中填写服务名
DB_PORT=3306                       # 端口，MySQL 默认 3306，PostgreSQL 默认 5432
DB_DATABASE=lsky                   # 数据库名称
DB_USERNAME=lsky                   # 用户名
DB_PASSWORD=lsky-password          # 密码

# Redis 配置
REDIS_HOST=redis                   # Redis 地址，Docker Compose 中填写服务名
REDIS_PASSWORD=redis-password      # Redis 密码
REDIS_PORT=6379                    # Redis 端口

# 缓存、会话、队列（安装后默认都使用数据库，可以改为 redis）
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

::: warning
- 修改 `.env` 后，Docker 安装请重启容器；普通安装请重启队列进程，如果执行过 `php artisan config:cache`，还需要执行 `php artisan config:clear`
- 普通安装使用 Redis 时，PHP 需要安装 redis 扩展
:::

### 反向代理配置示例 {#proxy-configuration-example}

通过 Nginx 把域名转发到容器的 8000 端口：

```nginx configuration
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

程序默认信任所有反向代理传来的 `X-Forwarded-*` 请求头，配置了 `X-Forwarded-Proto` 后，使用 https 访问时生成的链接也是 https。

## 普通安装 {#normal-installation}

开始前请确认已经按[环境要求](./requirement)准备好运行环境。下面的步骤以没有安装服务器控制面板的环境为例，使用控制面板时操作方式会有所不同。

### 第一步，创建站点 {#create-website}

在 Web 服务器中创建一个新站点。使用 MySQL、PostgreSQL 等数据库时，还需要创建好数据库；本例使用 SQLite，不需要另外创建数据库。

::: tip 应该使用哪种数据库？
上传量大或经常批量上传时，建议使用 PostgreSQL 或 MySQL；个人使用时 SQLite 就够用。
:::

:::: details 安装 SQLite（使用其他数据库请跳过）

检查是否已安装：

```shell
sqlite3 --version
```

未安装时执行：

::: code-group

```shell [Debian/Ubuntu]
sudo apt install sqlite3 libsqlite3-dev
```

```shell [CentOS/RHEL]
sudo yum install sqlite sqlite-devel
```

:::

PHP 还需要安装 sqlite3 扩展。

::::

把安装包上传到站点根目录。下面假设站点根目录为 `/www/wwwroot/app.com`，安装包为 `lsky-pro.zip`。

通过 SSH 登录服务器，进入站点根目录解压，并把文件的所有者改为 Web 服务器的运行用户（如 `www` 或 `www-data`），否则程序无法写入文件：

```shell
cd /www/wwwroot/app.com
unzip lsky-pro.zip
chown -R www:www /www/wwwroot/app.com
```

### 第二步，配置伪静态 {#configure-rewrite}

把站点的运行目录设置为 `public`，即 Nginx 配置中的 `root` 指向 `/www/wwwroot/app.com/public`：

```nginx configuration
server {
    listen 80;
    listen [::]:80;
    server_name app.com;
    root /www/wwwroot/app.com/public; # [!code focus]

    # ...
}
```

::: warning
请不要把 `public/index.php` 移到站点根目录、或者把运行目录设为站点根目录，否则 `.env` 等包含密码的文件可以被直接访问。
:::

然后配置伪静态。规则在程序的 `public/nginx.conf` 文件中，把它的内容添加到站点的 Nginx 伪静态配置中：

```nginx configuration
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ ^/livewire {
    expires off;
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ .*\.(jpg|jpeg|webp|avif|bmp|gif|png|tif|tiff|jp2|j2k|jpf|jpm|jpg2|j2c|jpc|jpx|heic|heif)$ {
    try_files $uri $uri/ /index.php?$query_string;
}
```

使用云处理的 X-Sendfile 功能时，还需要追加云处理的伪静态规则，详见[云处理](./process#x-sendfile)。

### 第三步，开始安装 {#start-installation}

站点绑定域名后访问该域名，程序会自动打开安装页面。按页面提示依次完成阅读许可协议、环境检测、授权验证和配置安装（站点信息、数据库、管理员账号）即可。

安装完成后，再次访问安装页面会显示 404。如需重新安装，请删除 `storage/app/installed.lock` 文件。

::: warning
如果安装时提示"请求授权服务器失败，请稍后再试。"或"授权服务器连接失败，请检查网络。"，请检查服务器能否正常解析域名：

```shell
nslookup huohuastudio.com
# 或指定 DNS 服务器
nslookup huohuastudio.com 8.8.8.8
```

无法解析时，请联系服务器提供商放行 53 端口（UDP 和 TCP）的出站流量，或在安全组中添加相应的出站规则。
:::

### 第四步，配置消息队列 {#configure-queue}

生成缩略图、图片处理、发送邮件、打包下载、导出等耗时任务都在消息队列中执行。队列进程用 `php artisan queue:work` 启动，安装成功的页面上也会显示适用于您服务器的完整命令，请以页面显示的为准。

关闭 SSH 窗口后，直接运行的队列进程会退出，因此需要用 Supervisor 等进程管理工具让它常驻运行。在 `/etc/supervisor/conf.d` 目录中创建 `lsky-pro-worker.conf`：

```ini
[program:lsky-pro-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /www/wwwroot/app.com/artisan queue:work ; [!code warning]
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www ; [!code warning]
numprocs=1
redirect_stderr=true
stdout_logfile=/www/wwwroot/app.com/storage/logs/worker.log ; [!code warning]
stopwaitsecs=3600
```

请按您的环境修改高亮的三行：

- **`command`**：站点根目录下 `artisan` 文件的路径
- **`user`**：Web 服务器的运行用户（如 `www` 或 `www-data`）。不要使用 `root`：队列以 `root` 运行时，生成的文件 Web 服务器可能无法读写；一旦程序被攻击，`root` 权限也会危及整个服务器
- **`stdout_logfile`**：队列日志的保存位置

查看 Web 服务器运行用户的方法：

::: code-group

```shell [Nginx]
grep "user" /etc/nginx/nginx.conf
```

```shell [Apache]
grep -E "^User|^Group" /etc/httpd/conf/httpd.conf
```

:::

保存后，让 Supervisor 加载配置并启动队列：

```shell
sudo supervisorctl reread && sudo supervisorctl update && sudo supervisorctl start "lsky-pro-worker:*"
```

::: details 打包下载使用单独的队列（可选）
后台的「打包下载」会把压缩包上传到云端储存，大文件上传可能长时间占用队列进程。如果希望它不影响其他任务，可以在 `.env` 中设置：

```bash
PHOTO_EXPORT_UPLOAD_QUEUE=photo-export-upload
```

设置后，默认的 `queue:work` 不会处理这个队列，需要在 Supervisor 中再添加一个进程：

```ini
[program:lsky-pro-photo-export]
command=php /www/wwwroot/app.com/artisan queue:work --queue=photo-export-upload
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www
numprocs=1
redirect_stderr=true
stdout_logfile=/www/wwwroot/app.com/storage/logs/worker-photo-export.log
stopwaitsecs=3600
```

不设置时，打包上传在默认队列中执行，不需要额外的进程。
:::

### 第五步，配置计划任务 {#configure-schedule}

部分功能需要定时执行，例如清理过期的导出文件、删除会员到期用户的图片等。请在服务器的计划任务中每分钟执行一次 `schedule:run`：

```shell
* * * * * cd /www/wwwroot/app.com && php artisan schedule:run >> /dev/null 2>&1
```

::: tip
- 安装成功的页面上也会显示完整的计划任务命令，请以页面显示的为准
- 使用宝塔面板时，可以在「计划任务」页面添加，执行用户建议选择 `www`
- 可以用 `crontab -u www -e` 为 `www` 用户添加计划任务
:::

完成以上步骤后，安装就完成了。如果队列或计划任务没有正常运行，会出现缩略图不生成、邮件发不出、图片删不掉等问题，可以在后台的「系统设置」→「系统升级」页面中查看运行环境检测结果。
