# 缓存 {#cache}

程序基于 [Laravel](https://laravel.com) 开发，可以把配置、路由、视图等缓存起来，减少每次请求的加载时间。以下命令请在程序安装完成后、在程序根目录中执行。

## 缓存后台管理页面图标 {#cache-admin-icon}

后台基于 [Filament](https://filamentphp.com) 开发，缓存它的组件和图标后，后台页面加载更快：

```shell
php artisan filament:optimize
```

升级程序后请重新执行。使用 Docker 安装时，容器启动时会自动执行这个命令。

## 缓存配置、事件、路由和视图 {#cache-all}

```shell
php artisan optimize
```

这个命令会同时缓存配置、事件、路由、视图，以及上面的后台组件和图标。清除全部缓存：

```shell
php artisan optimize:clear
```

::: warning 注意
- 缓存配置后，修改 `.env` 不会立即生效，需要再执行一次 `php artisan optimize`（或 `php artisan config:clear` 清除配置缓存）
- 程序版本变化后，启动时会自动清除配置、路由、事件等缓存，但视图和后台组件的缓存不会清除。建议升级前先执行 `php artisan optimize:clear`，升级完成后再重新缓存
:::

使用 Docker 安装时，容器每次启动都会清除缓存，不会执行 `php artisan optimize`。

## OPcache 拓展 <Badge type="tip" text="推荐使用" /> {#opcache}

PHP 的 [OPcache](https://www.php.net/manual/zh/book.opcache.php) 扩展把编译后的 PHP 代码保存在内存中，可以明显提升性能，建议在生产环境中开启。

如果把 `opcache.validate_timestamps` 设为 `0`（不检查文件是否修改），升级或修改程序文件后需要重启 PHP，否则仍会运行旧的代码。
