# 云处理 {#process}

云处理在访问图片时，按网址中的参数实时生成不同尺寸和样式的图片，原图保持不变，例如 `photo.jpg?w=400` 输出宽 400 像素的图片。所有储存都可以使用云处理，生成的图片缓存在程序所在的服务器上，再次访问时直接读取缓存。

云处理基于 [Glide](https://glide.thephpleague.com) 实现。如果需要直接修改原图（例如统一加水印），请使用[图片处理](./handle)。

## 如何使用云处理 {#usage}

1. 在管理后台的「云处理」页面，点击「新建」按钮创建云处理驱动器，填写「云处理缓存目录」，并在「预设版本」或「支持参数」中配置可用的处理方式
2. 在[储存](./storage#what-is-the-processor)的「处理器」标签页中关联这个云处理驱动器，并填写「访问前缀」
3. 把储存的「访问 URL」填写为程序的域名（或指向程序的 CDN 域名）

开启云处理后，该储存的图片链接形如 `https://example.com/uploads/20260101/photo.jpg`，请求由程序处理：程序通过访问前缀 `uploads` 找到储存，从储存中读取原图，按参数处理后输出。

「基础」标签页中的字段：

| 字段 | 说明 |
|---|---|
| 云处理缓存目录 | 处理后的图片缓存在这个目录中，默认为程序的 `storage/app/cache`。必须是程序所在服务器上的绝对路径，并且有写入权限 |
| 云处理文件输出方式 | 「StreamedResponse」由程序读取缓存后输出；「X-Sendfile」由 Nginx 直接输出缓存文件，见[使用 X-Sendfile](#x-sendfile) |

图片被删除或[重新处理](./handle#rehandle)时，程序会清除它的缓存。修改预设版本的参数后，新的请求会按新参数重新生成缓存；旧的缓存文件不会自动删除，需要释放空间时可以手动清理缓存目录。

:::warning
如果站点的 Nginx 配置中有单独匹配图片扩展名的 `location`（例如宝塔面板默认添加的设置缓存时间的规则），且其中没有 `try_files`，图片请求不会交给程序，云处理的图片会返回 404。请删除这类规则，或按[配置伪静态](./install#configure-rewrite)改为带 `try_files` 的规则。需要删除的规则形如：

```nginx configuration
location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
{
    expires 30d;
}
```
:::

## 使用 X-Sendfile {#x-sendfile}

默认的 StreamedResponse 方式由 PHP 读取缓存文件再输出，访问量大时占用较多 PHP 进程。改用 X-Sendfile 后，程序只返回缓存文件的位置，由 Nginx 直接把文件发送给浏览器，速度更快。目前只支持 Nginx。

把「云处理文件输出方式」改为 X-Sendfile 后，页面会显示需要添加的 Nginx 配置，其中的目录就是您填写的云处理缓存目录，例如：

```nginx configuration
location /i {
    internal;
    alias /www/wwwroot/app.com/storage/app/cache;
}
```

把页面中显示的配置复制到站点的伪静态配置末尾（或 Nginx 的站点配置中），然后重载 Nginx。`/i` 是程序固定使用的内部路径，请不要修改。

## 预设版本和支持参数 {#preset-and-parameters}

### 预设版本 {#preset}

预设版本是一组命名的处理参数。例如创建一个名为 `small` 的预设，参数设置 `w` 为 `200`、`h` 为 `400`，访问 `photo.jpg?p=small` 时输出的图片会缩放到 200×400 以内并保持原比例；需要正好 200×400 时，再加上参数 `fit` 为 `crop`。

- 多个预设用逗号分隔，按顺序应用：`photo.jpg?p=small,gray`
- 预设名称只能包含字母、数字、`-` 和 `_`
- 勾选「是否为默认预设」的预设（只能有一个）会应用到该储存的所有图片，不需要在网址中指定

### 支持参数 {#parameters}

「支持参数」中勾选的参数，任何访客都可以直接在网址中使用，例如勾选了 `w` 后，`photo.jpg?w=1000` 会输出宽 1000 像素的图片。没有勾选的参数会被忽略，只有 `p`（预设版本）始终可用。

::: danger 请谨慎选择支持参数
建议只使用预设版本，「支持参数」默认全部不勾选。勾选后，他人可以用大量随机参数请求图片，程序会不断生成新的图片，占用 CPU、内存和磁盘空间。
:::

## 处理规则 {#rules}

以下参数可以在预设版本中使用，勾选为支持参数后也可以直接在网址中使用。

| 名称 | 参数 | 说明 | |
|---|---|---|---|
| 方向 | `or` | 旋转图像 | [详细](#or) |
| 翻转 | `flip` | 翻转图像 | [详细](#flip) |
| 裁剪 | `crop` | 裁剪图像到指定尺寸 | [详细](#crop) |
| 宽度 | `w` | 设置图像的宽度（像素） | [详细](#w) |
| 高度 | `h` | 设置图像的高度（像素） | [详细](#h) |
| 适配 | `fit` | 设置图像如何适配目标尺寸 | [详细](#fit) |
| 设备像素比 | `dpr` | 按比例放大输出尺寸 | [详细](#dpr) |
| 亮度 | `bri` | 调整图像亮度 | [详细](#bri) |
| 对比度 | `con` | 调整图像对比度 | [详细](#con) |
| 伽马 | `gam` | 调整图像伽马值 | [详细](#gam) |
| 锐化 | `sharp` | 锐化图像 | [详细](#sharp) |
| 模糊 | `blur` | 为图像添加模糊效果 | [详细](#blur) |
| 像素化 | `pixel` | 为图像添加像素化效果 | [详细](#pixel) |
| 滤镜 | `filt` | 为图像应用滤镜效果 | [详细](#filt) |
| 背景色 | `bg` | 设置图像的背景颜色 | [详细](#bg) |
| 边框 | `border` | 为图像添加边框 | [详细](#border) |
| 质量 | `q` | 设置输出质量 | [详细](#q) |
| 格式 | `fm` | 转换输出格式 | [详细](#fm) |

### 方向 {#or}

旋转图像。可选值为 `auto`、`0`、`90`、`180`、`270`，默认为 `auto`，即根据图片的 EXIF 信息自动校正方向。

```html
<img src="photo.jpg?h=500&or=90">
```

### 翻转 {#flip}

翻转图像。可选值为 `v`（上下翻转）、`h`（左右翻转）、`both`（同时翻转）。

```html
<img src="photo.jpg?h=500&flip=v">
```

### 裁剪 {#crop}

`fit=crop` 先缩放图像直到填满宽高，再裁掉多出的部分。输出的图片符合指定的宽高，不会变形。

```html
<img src="photo.jpg?w=300&h=300&fit=crop">
```

#### 裁剪位置 {#crop-position}

指定保留图像的哪个部分。可选值为 `crop-top-left`、`crop-top`、`crop-top-right`、`crop-left`、`crop-center`、`crop-right`、`crop-bottom-left`、`crop-bottom`、`crop-bottom-right`，默认为 `crop-center`，与 `crop` 相同。

```html
<img src="photo.jpg?w=300&h=300&fit=crop-left">
```

#### 裁剪焦点 {#crop-focus}

用两个百分比指定裁剪的中心点：`crop-x%-y%`。

```html
<img src="photo.jpg?w=300&h=300&fit=crop-25-75">
```

还可以加第三个值放大焦点区域，取值 1 到 100，每增加 1 相当于放大 100%（例如 `2` 表示以 200% 的比例查看），建议使用 1 到 10。

```html
<img src="photo.jpg?w=300&h=300&fit=crop-25-75-2">
```

#### 裁剪 `crop` {#crop-crop}

在其他尺寸调整之前，先把图像裁剪为指定区域，格式为 `宽,高,x,y`。

```html
<img src="photo.jpg?crop=100,100,915,155">
```

### 宽度 {#w}

设置图像的宽度，单位为像素。

```html
<img src="photo.jpg?w=500">
```

### 高度 {#h}

设置图像的高度，单位为像素。

```html
<img src="photo.jpg?h=333">
```

### 适配 {#fit}

设置图像如何适配 `w` 和 `h` 指定的尺寸。

#### 可选值 {#fit-accepts}

- `contain`：默认值。缩放到宽高范围以内，不裁剪、不变形，保持原比例
- `max`：与 `contain` 相同，但图片小于目标尺寸时不放大
- `fill`：缩放到宽高范围以内，剩余的空间用背景色填满，输出尺寸等于目标尺寸。图片小于目标尺寸时不放大
- `fill-max`：与 `fill` 相同，但图片小于目标尺寸时会放大
- `stretch`：拉伸到目标尺寸，不保持原比例
- `crop`：缩放直到填满宽高，裁掉多出的部分，见[裁剪](#crop)。`cover` 与 `crop` 相同

```html
<img src="photo.jpg?w=300&h=300&fit=stretch">
```

### 设备像素比 {#dpr}

把输出尺寸乘以设备像素比，用于在 Retina 等高分辨率屏幕上显示清晰的图片。需要同时指定宽度或高度才会生效。默认为 `1`，最大为 `8`。

```html
<img src="photo.jpg?w=250&dpr=2">
```

### 亮度 {#bri}

调整图像亮度，取值 `-100` 到 `100`，`0` 表示不变。

```html
<img src="photo.jpg?w=500&bri=-25">
```

### 对比度 {#con}

调整图像对比度，取值 `-100` 到 `100`，`0` 表示不变。

```html
<img src="photo.jpg?w=500&con=25">
```

### 伽马 {#gam}

调整图像伽马值，取值 `0.1` 到 `9.99`。

```html
<img src="photo.jpg?w=500&gam=1.5">
```

### 锐化 {#sharp}

锐化图像，取值 `0` 到 `100`。

```html
<img src="photo.jpg?w=500&sharp=15">
```

### 模糊 {#blur}

为图像添加模糊效果，取值 `0` 到 `100`。

```html
<img src="photo.jpg?w=500&blur=5">
```

### 像素化 {#pixel}

为图像添加像素化效果，取值 `0` 到 `1000`。

```html
<img src="photo.jpg?w=500&pixel=5">
```

### 滤镜 {#filt}

为图像应用滤镜，可选值为 `greyscale`（灰度）、`sepia`（复古褐色）。

```html
<img src="photo.jpg?w=500&filt=sepia">
```

### 背景色 {#bg}

设置图像的背景色，颜色格式见[支持的颜色](#colors)。

```html
<img src="logo.png?w=400&bg=black">
```

### 边框 {#border}

为图像添加边框，格式为 `宽度,颜色,方式`。

```html
<img src="photo.jpg?w=500&border=10,5000,overlay">
```

#### 宽度 {#border-width}

边框宽度，单位为像素，也可以使用[相对尺寸](#relative-dimensions)。

#### 颜色 {#border-color}

边框颜色，颜色格式见[支持的颜色](#colors)。

#### 方式 {#border-modes}

- `overlay`：默认值。边框覆盖在图像上
- `shrink`：图像缩小到边框以内，画布尺寸不变
- `expand`：扩大画布以容纳边框

```html
<img src="photo.jpg?w=500&border=10,FFCC33,expand">
```

### 质量 {#q}

设置输出质量，取值 `0` 到 `100`，默认为 `85`。只对 `jpg`、`pjpg`、`webp`、`avif`、`tiff`、`heic` 格式有效。

```html
<img src="photo.jpg?w=500&q=25">
```

### 格式 {#fm}

转换输出格式，可选值为 `jpg`、`pjpg`（渐进式 JPEG）、`png`、`gif`、`webp`、`avif`、`tiff`、`heic`。不指定时保持原图的格式（原格式不在以上列表中时输出 `jpg`）。能否输出某种格式，还取决于服务器的图片处理器是否支持。

```html
<img src="photo.jpg?w=500&fm=webp">
```

## 相对尺寸 {#relative-dimensions}

相对尺寸用图片宽度或高度的百分比表示长度，适合边框等需要随图片大小变化的场景。写法为 0 到 100 之间的数字加上 `w`（宽度）或 `h`（高度），例如 `5w` 表示宽度的 5%。这里的宽高是执行到这一步时图片的尺寸：边框在缩放之后执行，下例中图片先缩放到宽 500 像素，边框宽 25 像素。

```html
<img src="photo.jpg?w=500&border=5w,black,expand">
```

## 支持的颜色 {#colors}

支持十六进制颜色和 140 种颜色名称。

### 十六进制 {#color-hexadecimal}

- 3 位 RGB：`CCC`
- 4 位 ARGB（带透明度）：`5CCC`
- 6 位 RGB：`CCCCCC`
- 8 位 ARGB（带透明度）：`55CCCCCC`

### 颜色名称 {#color-names}

- aliceblue
- antiquewhite
- aqua
- aquamarine
- azure
- beige
- bisque
- black
- blanchedalmond
- blue
- blueviolet
- brown
- burlywood
- cadetblue
- chartreuse
- chocolate
- coral
- cornflowerblue
- cornsilk
- crimson
- cyan
- darkblue
- darkcyan
- darkgoldenrod
- darkgray
- darkgreen
- darkkhaki
- darkmagenta
- darkolivegreen
- darkorange
- darkorchid
- darkred
- darksalmon
- darkseagreen
- darkslateblue
- darkslategray
- darkturquoise
- darkviolet
- deeppink
- deepskyblue
- dimgray
- dodgerblue
- firebrick
- floralwhite
- forestgreen
- fuchsia
- gainsboro
- ghostwhite
- gold
- goldenrod
- gray
- green
- greenyellow
- honeydew
- hotpink
- indianred
- indigo
- ivory
- khaki
- lavender
- lavenderblush
- lawngreen
- lemonchiffon
- lightblue
- lightcoral
- lightcyan
- lightgoldenrodyellow
- lightgray
- lightgreen
- lightpink
- lightsalmon
- lightseagreen
- lightskyblue
- lightslategray
- lightsteelblue
- lightyellow
- lime
- limegreen
- linen
- magenta
- maroon
- mediumaquamarine
- mediumblue
- mediumorchid
- mediumpurple
- mediumseagreen
- mediumslateblue
- mediumspringgreen
- mediumturquoise
- mediumvioletred
- midnightblue
- mintcream
- mistyrose
- moccasin
- navajowhite
- navy
- oldlace
- olive
- olivedrab
- orange
- orangered
- orchid
- palegoldenrod
- palegreen
- paleturquoise
- palevioletred
- papayawhip
- peachpuff
- peru
- pink
- plum
- powderblue
- purple
- rebeccapurple
- red
- rosybrown
- royalblue
- saddlebrown
- salmon
- sandybrown
- seagreen
- seashell
- sienna
- silver
- skyblue
- slateblue
- slategray
- snow
- springgreen
- steelblue
- tan
- teal
- thistle
- tomato
- turquoise
- violet
- wheat
- white
- whitesmoke
- yellow
- yellowgreen
