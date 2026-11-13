# 分离部署 {#separate-deploy}

默认安装是混合部署：前端界面（默认主题）已经构建好放在程序中，与后端使用同一个域名，不需要另外配置，原理见[修改默认主题](./theme#edit-default-theme)。如果希望把前端放到单独的域名、服务器或 CDN 上，可以按本页把前端单独构建和部署。

前端源码在安装包的 `web` 目录中。Docker 镜像中没有这个目录，需要时请在授权中心下载安装包取得。构建需要 [Node.js](https://nodejs.org) 22.13 或以上版本。

## 修改构建脚本 {#change-build-script}

默认的构建命令会把构建结果移动到程序的默认主题目录中。分离部署时不需要这一步，打开 `web/package.json`，把 `build` 改为只构建：

```json
"scripts": {
    "build": "run-p type-check \"build-only {@}\" -- && run-s pre-build post-build", // [!code --]
    "build": "run-p type-check \"build-only {@}\"", // [!code ++]
}
```

然后修改 `web/.env.production`。这个文件中的标题、图标等默认是由后端渲染的模板表达式，分离部署时需要改为实际的值，并把接口地址改为后端的完整地址：

```ini
VITE_APP_TITLE="Lsky Pro+" # 站点标题
VITE_APP_API_URL="https://api.example.com/api/v2" # 后端接口地址
VITE_APP_ICON_URL="/favicon.ico" # 站点图标地址
VITE_APP_KEYWORDS="图床, 图片上传, 图片外链" # 网站关键词
VITE_APP_DESCRIPTION="在线图床服务，支持图片上传、储存与外链分享。" # 网站描述
VITE_APP_DEFAULT_LOCALE=zh-CN # 默认语言
```

## 构建前端代码 {#build}

在 `web` 目录中安装依赖并构建：

::: code-group

```shell [npm]
npm install
npm run build
```

```shell [Yarn]
yarn
yarn build
```

:::

## 部署 {#deploy}

构建结果在 `web/dist` 目录中，把其中的所有文件上传到前端站点的运行目录即可。

前端使用 HTML5 History 路由，刷新页面时需要由 Web 服务器返回 `index.html`，否则会显示 404。Nginx 的配置示例：

```nginx configuration
location / {
    try_files $uri $uri/ /index.html;
}
```

## 后端设置 {#backend-settings}

前端部署完成后，在后端的管理后台中修改以下设置：

- **前端地址**：在「系统设置」→「常规设置」中填写前端的域名，例如 `https://img.example.com`。分享链接、第三方登录完成后的跳转都会使用这个地址
- **第三方登录**：GitHub、QQ 等需要修改第三方平台中登记的回调地址，见[第三方登录 - 分离部署](../guide/login#separate-deploy)
- **关闭原站点的前端（可选）**：在「系统设置」→「控制中心」中关闭「是否启用站点」后，后端域名的前台页面会显示 404，接口和管理后台不受影响

前端使用令牌访问接口，后端默认允许所有来源跨域请求接口，一般不需要另外配置跨域。

:::warning
程序升级时只会更新后端和内置的默认主题，单独部署的前端不会随之更新。每次升级后，请用新安装包中的 `web` 目录重新构建并部署前端，否则前端可能与新版本的接口不兼容。
:::
