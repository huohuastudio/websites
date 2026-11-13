# 第三方登录 {#login}

第三方登录让用户使用 GitHub、QQ 或企业自己的身份认证系统登录和注册，已有账号的用户也可以在个人资料中绑定第三方账号。

在管理后台的「社会化登录」页面，点击「新建」按钮创建登录驱动。创建的所有驱动都会显示在登录和注册页面上。

「接入方式」有两种：

- **直连**：直接对接 GitHub、QQ 或通用 OAuth2 / OIDC 身份提供商，在「登录网关」中选择
- **聚合登录**：通过彩虹聚合登录平台接入微信、支付宝、微博等更多平台，见[聚合登录](#rainbow)

## 回调地址 {#callback-url}

直连方式需要在第三方平台登记回调地址。创建驱动时，表单中的「回调地址」会根据后台「系统设置」→「常规设置」中的「应用网址」自动生成，复制后填到第三方平台即可：

| 登录网关 | 回调地址 |
|---|---|
| Github | 站点域名，例如 `https://example.com` |
| QQ | 三个地址，分别是 `站点域名/login`、`站点域名/register`、`站点域名/user/profile`，在 QQ 互联中用 `;` 分隔填写 |
| 通用 OAuth2 / OIDC | `站点域名/api/v2/oauth/callback` |

:::warning
请先确认「应用网址」与用户实际访问的地址一致（包括 `https://`），否则第三方平台会拒绝回调。前后端分离部署时的设置见[分离部署](#separate-deploy)。
:::

## GitHub {#github}

1. 在 GitHub 的 [Developer settings](https://github.com/settings/developers) 中点击「New OAuth App」
2. 「Homepage URL」填写站点域名，「Authorization callback URL」填写表单中显示的回调地址
3. 创建后复制 Client ID，再点击「Generate a new client secret」生成 Client Secret
4. 在图床后台创建驱动，「登录网关」选择「Github」，填写 Client ID 和 Client Secret 并保存

## QQ {#qq}

1. 在 [QQ 互联](https://connect.qq.com)创建网站应用，审核通过后取得 APP ID 和 APP Key
2. 在应用的回调地址中填写表单中显示的三个地址
3. 在图床后台创建驱动，「登录网关」选择「QQ」，Client ID 填写 APP ID，Client Secret 填写 APP Key

## 通用 OAuth2 / OIDC {#oauth2}

用于对接支持 OAuth2 或 OpenID Connect 的身份提供商，例如 Keycloak、Authentik、Casdoor、Logto、GitLab、Gitea。

先在身份提供商中创建应用（客户端），回调地址（Redirect URI）填写 `站点域名/api/v2/oauth/callback`，取得 Client ID 和 Client Secret。然后在图床后台创建驱动，「登录网关」选择「通用 OAuth2 / OIDC」：

| 字段 | 说明 |
|---|---|
| Client ID、Client Secret | 身份提供商分配的客户端凭据 |
| OIDC 发现地址 | 可选。填写 Issuer 或 `.well-known/openid-configuration` 地址后，点击右侧的「读取发现文档并填充」，自动填写下面三个地址 |
| 授权地址、令牌地址、用户信息地址 | 身份提供商的三个端点，没有发现地址时手动填写 |
| 授权范围（Scope） | 多个用空格分隔，默认 `openid profile email` |
| 令牌端点认证方式 | `client_secret_post` 或 `client_secret_basic`，换取令牌失败时可以尝试切换 |
| 启用 PKCE | 默认开启（S256），身份提供商不支持时关闭 |
| 用户信息字段映射 | 用户信息接口中各字段的名称，见下表 |
| 按钮图标 | 可选，登录按钮上显示的图标地址 |

「用户信息字段映射」的默认值按 OIDC 标准填写，身份提供商返回的字段不同时需要修改。字段在嵌套对象中时，用 `.` 表示路径，例如 `data.user.id`。

| 字段 | 默认值 |
|---|---|
| 用户 ID 字段 | `sub`（必填） |
| 用户名字段 | `preferred_username` |
| 昵称字段 | `name` |
| 邮箱字段 | `email` |
| 头像字段 | `picture` |

:::tip
GitLab、Gitea 等使用 OAuth2 而非 OIDC 时，用户信息接口通常返回 `id`、`username` 而不是 `sub`、`preferred_username`，请按实际返回的字段修改映射。
:::

## 聚合登录 {#rainbow}

聚合登录通过彩虹聚合登录平台接入 QQ、微信、支付宝、新浪微博、百度、抖音、华为、小米、Google、Microsoft、Twitter、钉钉、Gitee、GitHub 等平台，不需要分别申请各平台的开发者账号。

1. 在管理后台的「系统设置」→「聚合登录」页面，打开「启用聚合登录」，填写聚合登录平台的「API 地址」「AppID」和「AppKey」
2. 在「社会化登录」页面新建驱动，「接入方式」选择「聚合登录」，在「登录平台」中选择要接入的平台
3. 需要接入多个平台时，每个平台创建一个驱动

## 分离部署 {#separate-deploy}

前端与后端使用不同的域名部署时（见[分离部署](../advanced/separate-deploy)）：

- 在「系统设置」→「常规设置」中填写「前端地址」，否则通用 OAuth2 / OIDC 和聚合登录完成后无法跳回前端
- GitHub、QQ 授权后直接回到前端页面，在 GitHub 和 QQ 互联中登记的回调地址要把站点域名换成前端域名；后台表单中显示的回调地址仍按「应用网址」生成，不用理会
- 通用 OAuth2 / OIDC 的回调地址由后端接收，仍然使用后端的域名
