# 常用命令 {#command}

以下命令都在程序根目录中执行。执行 `php artisan` 可以查看全部命令，`php artisan help 命令名` 查看某个命令的参数。

:::warning
请使用 Web 服务器的运行用户（如 `www`）执行命令，例如 `sudo -u www php artisan ...`。用 `root` 执行时，命令生成的文件 Web 服务器可能无法读写。使用 Docker 安装时，在容器中执行，例如 `docker exec -it 容器名 php artisan ...`。
:::

## 重置用户密码（包括管理员） {#reset-user-password}

```bash
php artisan app:reset-user-password
```

按提示输入用户邮箱和新密码（至少 6 位）。也可以用参数直接指定，不再询问：

```bash
php artisan app:reset-user-password --email=admin@example.com --password=新密码 --password_confirmation=新密码
```

## 生成缩略图 {#gen-thumbnails}

```bash
php artisan app:thumbnail
```

为所有缺少缩略图的图片生成缩略图，已有缩略图的图片会跳过。

::: warning 注意
所在储存关闭了「生成缩略图」的图片会被跳过。
:::

## 重新执行图片处理 {#handle-photos}

```bash
php artisan app:handle-photos              # 按提示选择图片处理驱动，处理所有图片
php artisan app:handle-photos --driver=1   # 指定图片处理驱动 ID
php artisan app:handle-photos --storage=2  # 只处理指定储存 ID 中的图片
```

对已有图片重新执行图片处理，处理结果覆盖原图，无法撤销。执行前会显示图片数量并要求确认。任务在消息队列中执行，请确保队列正常运行。详见[重新处理](../guide/handle#rehandle)。

## 删除会员到期用户的图片 {#delete-expired-member-photos}

```bash
php artisan app:delete-expired-member-photos
```

对开启了「会员到期后删除图片」的角色组，删除会员已到期并超过保留时长的用户在该组期间上传的图片。计划任务每小时自动执行一次，一般不需要手动执行。详见[会员到期后删除图片](../guide/group#delete-photos-after-expiry)。

## 清理已删除图片的残留文件 {#clean-orphan-files}

```bash
php artisan app:clean-orphan-files
```

删除图片时，程序先删除图片记录，再在消息队列中删除储存中的文件。如果删除文件失败（例如储存连接失败、储存被删除），文件会残留在储存中。这个命令会重新删除所有已删除图片的文件，成功后彻底删除图片记录。仍被其他图片使用的文件会保留。

## 缓存后台组件和图标 {#cache-admin-icon}

```bash
php artisan filament:optimize
```

详见[缓存](./cache#cache-admin-icon)。

## 查看失败的队列任务 {#query-queue-failed}

```bash
php artisan queue:failed
```

## 清除失败的队列任务 {#clean-queue}

```bash
php artisan queue:flush
```

::: warning
失败的任务中可能有删除图片文件的任务。清除后这些任务不会再执行，文件会残留在储存中，可以执行 [`app:clean-orphan-files`](#clean-orphan-files) 清理。
:::

## 重试失败的队列任务 {#retry-queue}

```bash
php artisan queue:retry all     # 重试所有失败的任务
php artisan queue:retry 任务ID   # 重试指定的任务，ID 见 queue:failed 的输出
```

## 创建公共储存的符号链接 {#gen-symlink}

```bash
php artisan storage:link
```

创建 `public/storage` 符号链接，指向 `storage/app/public`。缩略图、头像、主题上传的文件等都通过它访问，这个链接丢失时这些图片会无法显示。

## 删除公共储存的符号链接 {#remove-symlink}

```bash
php artisan storage:unlink
```

## 重建主题和本地储存的符号链接 {#gen-app-symlink}

```bash
php artisan symlinks:rebuild
```

重新创建当前主题的静态资源链接（`public/assets`），以及所有本地储存以访问前缀命名的链接。迁移服务器、复制站点文件后符号链接丢失时执行。

## 升级和修复程序 {#upgrade}

```bash
php artisan app:update                   # 下载最新版本的安装包
php artisan app:update --repair          # 下载当前版本的安装包，用于修复
php artisan app:upgrade                  # 使用 storage/app/upgrade.zip 升级
php artisan app:upgrade /root/v2.5.2.zip # 使用指定的安装包升级，适合服务器无法联网时
php artisan app:upgrade --repair         # 修复模式
php artisan app:upgrade --web-user=www   # 指定网站运行用户，用于生成权限修复命令
```

- **`app:update`**：只下载安装包，不升级
- **`app:upgrade`**：校验安装包、检查文件权限和磁盘空间，通过后写入文件并执行数据库迁移。不允许降级
- **`--repair`**：所有程序文件都与安装包比对，缺失或被修改的文件恢复为官方文件。对程序文件的自定义修改会被覆盖

详细步骤见[离线升级](../guide/upgrade#offline)和[修复安装](../guide/upgrade#repair)。

## 从旧版本导入数据 {#import}

```bash
php artisan app:import
```

把付费版 1.7.x 的数据导入到新安装的 2.x 中，按提示输入旧数据库的连接信息。导入会清空当前的数据，只能在刚安装、还没有任何数据时执行，详见[从旧版本导入](../guide/import)。

## 创建主题模板 {#make-theme}

```bash
php artisan make:theme
```

按提示填写主题信息，在 `themes/` 目录中生成主题模板，详见[创建新的主题](./theme#create-theme)。
