# 环境要求 {#require}

兰空图床是基于 PHP 和 [Laravel](https://laravel.com) 开发的 Web 程序，需要运行在您有完全控制权的服务器上。使用 [Docker 安装](./install#docker-installation)时，镜像中已经包含下面列出的运行环境，服务器只需要安装 Docker；直接在服务器上安装时，请先按本页准备好环境。

::: warning
- 不支持虚拟主机：虚拟主机无法安装 PHP 扩展、运行队列进程和计划任务
- 从 V 2.3.0 起，后端代码经过加密，PHP 必须安装 SourceGuardian 扩展（宝塔面板中名为 sg16），否则程序无法运行
:::

### PHP 要求 {#php-requires}

- PHP 8.3 或以上版本（支持到 PHP 8.5）
- 以下 PHP 扩展：
  - **SourceGuardian**：运行加密的后端代码
  - **Imagick**：处理图片，另外需要在系统中安装 ImageMagick，见[下文](#image-magick)
  - **其他扩展**：Ctype、cURL、DOM、Exif、Fileinfo、Filter、Hash、Intl、Mbstring、OpenSSL、PCRE、Pcntl、PDO、Posix、Session、Tokenizer、XML、Zip，其中大部分通常已默认启用
- 以下 PHP 函数不能被禁用：`proc_open`、`proc_close`、`proc_get_status`、`proc_terminate`、`pcntl_fork`、`pcntl_wait`、`exec`、`shell_exec`、`system`、`symlink`、`readlink`

::: warning
服务器控制面板（如宝塔）默认会在 PHP 配置的 `disable_functions` 中禁用一部分函数，其中可能包括上面列出的函数。请在 PHP 配置文件中找到 `disable_functions`，把这些函数从中删除，然后重启 PHP。
:::

安装页面会检测 PHP 版本、扩展和函数，有未通过的项目时无法继续安装。

### 数据库 {#databases}

| 数据库 | 版本 | 说明 |
|---|---|---|
| MySQL | 5.7+ | PHP 需要安装 pdo_mysql 扩展 |
| MariaDB | 10.3+ | PHP 需要安装 pdo_mysql 扩展 |
| PostgreSQL | 10.0+ | PHP 需要安装 pgsql 和 pdo_pgsql 扩展 |
| SQLite | 3.35.0+ | PHP 需要安装 sqlite3 和 pdo_sqlite 扩展 |
| SQL Server | 2017+ | PHP 需要安装 sqlsrv 和 pdo_sqlsrv 扩展及其依赖（如 Microsoft ODBC Driver for SQL Server） |

除 SQLite 外，其他数据库需要在安装前创建好。上传量大或经常批量上传时，建议使用 PostgreSQL 或 MySQL；个人使用、访问量小时可以使用 SQLite，省去数据库的安装和配置。

## 服务器配置 {#server-configuration}

### Nginx {#nginx}

建议使用 Nginx 作为 Web 服务器，也可以使用 Apache。

### Supervisor {#supervisor}

生成缩略图、图片处理、发送邮件、打包下载、导出等耗时任务都在消息队列中执行。队列进程通过命令 `php artisan queue:work` 启动，需要一直在后台运行。

`queue:work` 进程可能因为超时、执行 `queue:restart` 命令等原因退出，因此需要用进程管理工具监视它，退出后自动重启。Linux 中常用的是 Supervisor，您也可以使用其他熟悉的工具。建议在安装前先看一遍下面的示例。

::: details Supervisor 安装和配置示例
#### 安装 Supervisor {#install-supervisor}

以 Ubuntu 为例：

```shell
sudo apt-get install supervisor
```

#### 配置 Supervisor {#configure-supervisor}

Supervisor 的配置文件通常放在 `/etc/supervisor/conf.d` 目录。在该目录中创建 `lsky-pro-worker.conf`：

```ini
[program:lsky-pro-worker]
process_name=%(program_name)s_%(process_num)02d
; 将路径换成您的站点根目录
command=php /www/wwwroot/app.com/artisan queue:work
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
; 使用 Web 服务器的运行用户，不要用 root
user=www
numprocs=1
redirect_stderr=true
stdout_logfile=/www/wwwroot/app.com/storage/logs/worker.log
stopwaitsecs=3600
```

`numprocs` 是同时运行的队列进程数量，上传量大时可以适当调大。

#### 启动 Supervisor {#start-supervisor}

```shell
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start "lsky-pro-worker:*"
```

更多用法请参考 [Supervisor 文档](http://supervisord.org/index.html)。
:::

### ImageMagick {#image-magick}

程序默认使用 [ImageMagick](https://github.com/ImageMagick/ImageMagick) 处理图片。需要同时安装两样东西：

- **ImageMagick**：系统中的图片处理软件
- **PHP Imagick 扩展**：让 PHP 调用 ImageMagick

两者缺一不可。

:::: details ImageMagick 安装示例

#### 检查是否已安装 {#check-imagemagick}

::: code-group

```shell [Ubuntu/Debian]
dpkg -l | grep imagemagick
```

```shell [CentOS/RHEL]
rpm -qa | grep ImageMagick
```

:::

没有输出表示未安装。

#### 安装 {#install}

::: code-group

```shell [Ubuntu/Debian]
sudo apt install imagemagick
```

```shell [CentOS/RHEL]
sudo yum install ImageMagick
```

:::

更多信息请参考 [ImageMagick 文档](https://imagemagick.org)。

::::

### Libvips <Badge type="tip" text="推荐" /> {#libvips}

[Libvips](https://github.com/libvips/libvips) 是另一个图片处理库，与 ImageMagick 相比速度更快、占用内存更少。Libvips 是可选的，有条件时建议使用。

使用 Libvips 需要：

- 在系统中安装 libvips 库
- 启用 PHP 的 FFI 扩展，并在 `php.ini` 中设置 `ffi.enable=1`（FFI 默认是禁用的）

环境准备好后，在管理后台的「系统设置」→「常规设置」页面，把「图片处理器」改为 Libvips。程序检测到 Libvips 不可用时，这个选项不会出现。

::: warning
- 切换图片处理器后，需要手动重启队列进程才会生效
- 两个处理器支持的图片格式不完全相同，切换后，角色组中已选择的部分图片格式可能失效，请检查角色组设置
:::

:::: details Libvips 安装示例

#### 安装 libvips 库 {#install-php-vips}

::: code-group

```shell [Ubuntu/Debian]
sudo apt install libvips42
```

```shell [CentOS/RHEL]
sudo yum install vips
```

:::

各系统的安装方法见 [libvips 安装说明](https://www.libvips.org/install.html)。

#### 启用 FFI 扩展 {#enable-php-ffi}

检查 FFI 是否已启用：

```shell
php -m | grep FFI
```

有输出 `FFI` 表示已经启用。没有输出时需要安装，以宝塔面板的 PHP 8.3 为例：

```shell
cd /www/server/php/83/src/ext/ffi

# 编译并安装扩展
/www/server/php/83/bin/phpize
./configure --with-php-config=/www/server/php/83/bin/php-config
make
make install
```

然后编辑 `/www/server/php/83/etc/php.ini`，加入：

```ini
extension=ffi
ffi.enable=1
```

重启 PHP 后，再次执行 `php -m | grep FFI` 确认。

::::

::: tip
Docker 镜像中已经包含 Libvips，并默认使用 Libvips 处理图片。
:::

### 总结 {#summary}

直接在服务器上安装时，需要：

- Nginx 或 Apache
- 符合要求的 PHP 版本、扩展，且必要的函数没有被禁用
- 符合要求的数据库
- ImageMagick（或 Libvips）
- Supervisor 等进程管理工具，用于运行队列
