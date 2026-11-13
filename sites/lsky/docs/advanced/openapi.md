# 接口文档 {#openapi}

程序提供 100 多个接口，可以用来开发客户端、对接其他系统。最新的接口说明见[在线文档](https://lsky-pro.apifox.cn)。

接口的定义文件在安装包的 `web/openapi.json` 中，格式遵循 OpenAPI 规范，可以导入 Postman、Apifox 等接口工具，也可以用来生成各种语言的客户端代码。Docker 镜像中没有 `web` 目录，需要时请在授权中心下载安装包取得。

## 认证 {#authentication}

接口地址以 `站点域名/api/v2` 开头。需要登录的接口使用令牌认证：用户在用户中心的「API令牌」页面创建令牌，可以设置有效期和权限（不指定权限时拥有账号的全部权限），然后在请求头中携带：

```http
Authorization: Bearer 您的令牌
Accept: application/json
```
