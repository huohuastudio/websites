#!/usr/bin/env bash
# 首页截图用的 Lsky Pro+ 演示环境（W24，docs/plan.md）。在本机运行，不进 Cloudflare 的构建。
#
# 把源码仓库复制到工作目录中另起一套：独立的 .env、SQLite 数据库和储存目录，不碰源码仓库的 .env、开发数据库和 storage。
# 然后按安装流程迁移、初始化、创建管理员（admin@example.com / admin123），用 seed-demo.php 填充演示数据，
# 在 18064 端口启动 PHP 内置服务器（主进程和子进程的 PID 写在 <工作目录>/server.pids，用完按 PID 结束）。
#
# 用法：bash scripts/setup.sh <工作目录>
# 需要：PHP 8.5（pdo_sqlite、gd）、sqlite3、rsync；照片先用 fetch-photos.py 下载到 <工作目录>/photos
# 本机 PHP 没有 Imagick 扩展：副本中的图片驱动改为 GD
set -euo pipefail

SRC=${LSKY_SRC:-$HOME/Develop/Projects/lsky-pro-enterprise}
PORT=18064
HERE=$(cd "$(dirname "$0")" && pwd)
W=$(mkdir -p "$1" && cd "$1" && pwd)
A=$W/app

echo "== 复制源码（不含 .git、node_modules、.env 和 storage 中的数据）"
rsync -a --delete --exclude=/.git --exclude=/node_modules --exclude=/web/node_modules --exclude=/.env \
  --exclude=/public/storage --exclude=/public/uploads1 --exclude='/storage/app/*' --exclude='/storage/logs/*' \
  --exclude='/storage/framework/cache/*' --exclude='/storage/framework/sessions/*' --exclude='/storage/framework/views/*' \
  --exclude=/lsky-pro.sg "$SRC/" "$A/"
# 排除的路径不受 --delete 影响：清掉上一次留下的数据（含安装锁），重新搭时从空库开始
rm -rf "$A/storage/app" "$A/storage/logs" "$A/storage/framework" "$A/public/storage"
mkdir -p "$A/storage/app/public" "$A/storage/app/uploads" "$A/storage/framework/"{cache,sessions,views} "$A/storage/logs"
rm -f "$A/database/demo.sqlite" && touch "$A/database/demo.sqlite"

cat > "$A/.env" <<EOF
APP_NAME="Lsky Pro+"
APP_ENV=production
APP_KEY=base64:$(openssl rand -base64 32)
APP_DEBUG=false
APP_URL=http://127.0.0.1:$PORT
APP_TIMEZONE=Asia/Shanghai
APP_SERVICE_API=http://127.0.0.1:9
APP_LOCALE=zh_CN
APP_FALLBACK_LOCALE=zh_CN
APP_FAKER_LOCALE=zh_CN
BCRYPT_ROUNDS=10
LOG_CHANNEL=single
LOG_LEVEL=warning
DB_CONNECTION=sqlite
DB_DATABASE=$A/database/demo.sqlite
SESSION_DRIVER=file
SESSION_LIFETIME=1440
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
CACHE_STORE=file
EOF
sed -i '' 's/Drivers\\Imagick\\Driver/Drivers\\Gd\\Driver/' "$A/config/image.php"

echo "== 安装"
cd "$A"
art() { php -d error_reporting=0 artisan "$@"; }
art migrate --force
sqlite3 database/demo.sqlite "update settings set payload = '\"Intervention\\\\Image\\\\Drivers\\\\Gd\\\\Driver\"' where name = 'image_driver'"
art tinker --execute='app(App\Settings\AppSettings::class)->fill(["name" => "Lsky Pro+", "url" => config("app.url"), "license_key" => ""])->save();'
art db:seed --class='Database\Seeders\InitializeSeeder' --force
art tinker --execute='App\Facades\UserService::createDefaultSuperAdmin(["username" => "admin", "name" => "管理员", "email" => "admin@example.com", "password" => Illuminate\Support\Facades\Hash::make("admin123"), "email_verified_at" => now()]);'
art storage:link
art symlinks:rebuild
echo '本地演示环境' > storage/app/installed.lock

echo "== 演示数据"
php -d error_reporting=0 "$HERE/seed-demo.php" "$W/photos"

echo "== 启动（端口 $PORT）"
# 内置服务器的路由脚本按当前目录找 index.php，要在 public 中启动；PHP 8.5 的弃用提示不输出到页面
cd "$A/public"
PHP_CLI_SERVER_WORKERS=4 nohup php -d display_errors=0 -S 127.0.0.1:$PORT ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php > "$W/server.log" 2>&1 &
pid=$!
sleep 2
echo "$pid $(pgrep -P $pid | tr '\n' ' ')" > "$W/server.pids"
echo "已启动：http://127.0.0.1:$PORT（PID：$(cat "$W/server.pids")）"
