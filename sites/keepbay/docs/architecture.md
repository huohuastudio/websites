# 技术架构 {#architecture}

本页说明 Keepbay 内部怎么工作：进程和数据怎么组织、一个请求经过哪些检查、文件夹怎么扫描和建立索引、文件操作怎么保证不丢文件、AI 调用受哪些限制。

日常使用不需要了解这些，排查问题或评估是否适合您的环境时可以参考。

## 总体结构 {#overview}

一个进程、一个数据目录、一个 SQLite 数据库。前端页面编译在程序里，不需要另外部署 Web 服务器或数据库。

```mermaid
graph TB
    browser["浏览器<br/>React 单页应用"]
    cli["命令行<br/>keepbay status 等"]

    subgraph keepbay["Keepbay 进程"]
        http["HTTP 层<br/>认证 · 跨站检查 · 限流 · 访问记录"]
        svc["业务模块<br/>权限检查 · 功能门控"]
        fsx["fsx<br/>唯一的文件系统入口"]
        lib["扫描与监听<br/>fsnotify · 定期补扫"]
        jobs["任务队列<br/>io · media · model · remote"]
        gw["AI Gateway"]
        ctl["控制通道<br/>keepbay.sock"]
    end

    worker["媒体子进程<br/>keepbay worker<br/>seccomp + Landlock"]
    db[("SQLite<br/>WAL · FTS5 · sqlite-vec")]
    disk[("您的文件夹<br/>原样不动")]
    ai["本地模型 · Ollama · 云端 AI"]

    browser -->|HTTP / SSE| http
    cli --> ctl
    http --> svc
    ctl --> svc
    svc --> fsx
    svc --> db
    lib --> fsx
    lib --> db
    jobs --> worker
    jobs --> gw
    fsx --> disk
    gw --> ai
```

代码遵守几条原则。

所有文件访问都经过 fsx 这一个模块。其他代码拿不到原始路径，不能绕过路径校验和只读限制。

所有 AI 调用都经过 AI Gateway。其他代码拿不到模型本身，不能绕过功能开关、授权和花费上限。

接口和网址里只用 ID，不用路径，路径只在服务端使用。这样也避开了一个问题：不是 UTF-8 的文件名（比如老 Windows 留下的 GBK 文件名）没法在 JSON 和网址里原样表示。

另外，Keepbay 只有一个进程，数据目录加了锁，同一时间只有它打开数据库。分布式系统需要的任务租约、心跳都不需要，代码因此简单很多。

### 技术栈 {#stack}

| 部分 | 使用 |
|---|---|
| 后端 | Go，HTTP 框架 Huma（同时生成 OpenAPI 描述） |
| 数据库 | SQLite（mattn/go-sqlite3），迁移用 goose，查询代码由 sqlc 生成 |
| 搜索 | SQLite FTS5（文件名、全文），sqlite-vec（向量） |
| 前端 | React、TanStack Router、TanStack Query、Zustand、Tailwind CSS、Base UI |
| 图片 | libvips（带 libraw、librsvg），在受限子进程中运行 |
| 视频、HEIC | 系统中的 ffmpeg（不随程序附带），同样在受限环境中运行 |
| PDF | PDFium 的 WebAssembly 版本，在内存安全的沙箱中运行 |
| 本地 AI | ONNX Runtime |
| 云端 AI | 按 OpenAI 兼容接口调用 |
| 哈希 | BLAKE3 |

## 请求的处理 {#request}

网页上的每个操作都是对 `/api/v1` 的一次请求，经过以下几层：

```mermaid
graph LR
    req["HTTP 请求"] --> proxy["真实 IP<br/>只信任可信代理"]
    proxy --> mw["中间件<br/>会话 · 跨站检查 · 限流"]
    mw --> handler["Handler<br/>参数校验"]
    handler --> service["Service<br/>权限 · 功能门控 · 业务逻辑"]
    service --> fsx["fsx<br/>安全打开文件"]
    service --> store["数据库"]
    service --> log["访问记录"]

    style mw fill:#f0f4ff,stroke:#4a6cf7
    style handler fill:#f0f4ff,stroke:#4a6cf7
    style service fill:#fff4e6,stroke:#f59e0b
    style fsx fill:#ecfdf5,stroke:#10b981
    style store fill:#ecfdf5,stroke:#10b981
```

权限检查放在 Service 层，而不是网页请求的入口。

后台任务、操作恢复、撤销调用的也是同一个 Service，所以它们执行时会重新检查一遍权限。成员排了一个复制任务，执行前被收回了权限，这个任务就不会执行。

成员请求无权访问的文件或标签时，得到的回答和"不存在"一模一样，没法借报错的差别来探测。

专业版功能的检查（功能门控）在三处各做一次：接口调用、AI Gateway、后台任务执行时。前端只根据结果显示或隐藏入口，不作为判断依据，改前端代码解锁不了任何东西。

网页上的实时变化靠 `/api/v1/events` 的 SSE 推送：任务进度、文件夹变化、通知。

事件只是一句"该刷新了"，带着递增的序号。前端发现断线或者序号接不上，就重新获取当前页面的状态，不会漏掉什么。

每 25 秒一次心跳，经过反向代理也不会因为长时间没数据被断开。

## 数据库 {#database}

SQLite 用 WAL 模式，读写互不阻塞。读连接池的大小取 CPU 核数，至少 4 个。

写连接只有一个，并且用 `synchronous=FULL`：文件操作的记录必须在动文件之前真正写到磁盘上，断电也不能丢。代价是每次提交多一次刷盘，我们靠批量提交把它摊薄。

扫描、索引这类后台写入每批约 500 行，批次之间把写连接让出来。十万个文件的首次扫描在后台慢慢写，您在网页上改个名字不用排在它后面等。

文件记录只存父目录的 ID 和自己的名字，不存完整路径。这样在同一个文件夹里改名或移动一个目录只需要改一行，不用把它下面成千上万个文件的路径都改一遍。

API Key、两步验证密钥、通知渠道和代理的密码用数据目录中的 `secret.key` 加密（AES-GCM）后存储，见[隐私与安全](./privacy#encryption)。

## 扫描与索引 {#scan}

Keepbay 以文件夹为准：文件原样留在磁盘上，数据库只是索引。所有变化最终都调用同一个函数——**核对一个目录**：

```mermaid
flowchart TD
    subgraph triggers["触发来源"]
        first["首次扫描"]
        rescan["定期补扫<br/>默认 6 小时"]
        notify["fsnotify 通知<br/>按目录合并"]
        open["打开文件夹"]
        cli["index:rescan"]
    end

    triggers --> gen["记下目录的代次"]
    gen --> read["在事务外读取目录内容<br/>与数据库比较"]
    read --> move{"新出现的项能与<br/>缺失的记录配对？<br/>（设备号 + inode）"}
    move -->|能| reuse["复用旧记录<br/>标签、AI 结果都保留"]
    move -->|不能| new["新建记录"]
    reuse & new --> tx["事务中写入差异<br/>提交前代次没变？"]
    tx -->|变了| gen
    tx -->|没变| done["完成，推送 SSE"]
```

本地磁盘用 fsnotify（Linux 上是 inotify）监听，每个目录一个监听。

通知按目录合并：目录安静 3 秒后核对；有人在持续写大文件时，最多等 30 秒也核对一次。

inotify 的监听数量有上限（`fs.inotify.max_user_watches`），用完后其余目录靠定期补扫，见[常见问题](./faq#inotify)。

SMB、NFS 等网络磁盘根本收不到通知，同样靠定期补扫，间隔可以按文件夹设置。

在 Keepbay 之外改名、移动的文件，只要还在同一个添加的文件夹、同一块磁盘里，会按设备号和 inode 与原来的记录配对，沿用原来的 ID，打过的标签、AI 的结果都跟着走。

这是"以文件夹为准"必须解决的问题，否则在访达里拖动一下文件夹，之前的处理结果就丢了。

判断"文件没了"要格外小心。只有完整读取成功的目录才能得出这个结论，读取出错、权限不足、中途中断都不算。

缺失的记录先保留 30 天。一次扫描发现超过 20% 的文件不见了，Keepbay 会暂停清理，等所有者确认，因为这更像是硬盘没挂上，而不是您真的删了五分之一的文件。

同样的道理，文件夹和其中嵌套的每块磁盘都会单独检查：在不在、设备号变没变、是不是突然空了。

任何一项不对就标记为离线，停止核对和清理，也拒绝写入。否则上传的文件会写进挂载点下面那个空目录里，等硬盘重新挂上，它们就被盖住看不见了。

NAS 和操作系统的杂项（`@eaDir`、`#recycle`、`#snapshot`、`.DS_Store`、`Thumbs.db`、`$RECYCLE.BIN`、`lost+found` 等）始终跳过。

开发目录（`node_modules`、`.git` 等）、照片图库、其他应用的资料库、同步软件的缓存默认也跳过，免得搜索结果被大量无关的小文件占满。这几类可以在设置中打开。

## 内容处理流水线 {#pipeline}

文件建立记录后，按内容（哈希相同的文件共用一份内容）逐步处理：

```mermaid
flowchart LR
    scan["扫描<br/>建立文件记录"] --> id["识别<br/>BLAKE3 哈希 · 真实类型"]
    id --> media["基础信息<br/>尺寸 · 时长 · 小缩略图"]
    id --> text["提取文字<br/>文字层"]
    media --> ocr["识别图片中的文字<br/>OCR"]
    media --> img["图像向量<br/>以图搜图"]
    ocr --> text2["文字"]
    text --> text2
    text2 --> vec["文本向量<br/>语义搜索"]
    text2 --> tags["AI 标签"]
    text2 --> date["重要日期"]

    style id fill:#f0f4ff,stroke:#4a6cf7
    style media fill:#fff4e6,stroke:#f59e0b
    style text fill:#fff4e6,stroke:#f59e0b
    style ocr fill:#ecfdf5,stroke:#10b981
    style img fill:#ecfdf5,stroke:#10b981
    style vec fill:#ecfdf5,stroke:#10b981
    style tags fill:#ecfdf5,stroke:#10b981
    style date fill:#ecfdf5,stroke:#10b981
```

哈希用 BLAKE3。64 MiB 以内的文件直接算完整哈希。

更大的文件先算抽样哈希（文件大小加上头、中、尾各 64 KiB），只有遇到大小和抽样哈希都相同的文件时，才去补算完整哈希。把一部 50 GB 的电影从头读到尾只为了确认它没有重复，不划算。

识别时完整哈希相同的文件算同一份内容，共用缩略图、文字和 AI 结果。超过 64 MiB 的大文件各自处理，补算的完整哈希只用来找出重复的文件。

缩略图是 WebP。网格里用的小图短边 256px、长边最多 768px，扫描时生成；预览用的大图长边 2048px，第一次打开时才生成。它们按内容存放在数据目录的 `thumbs/` 中。

文字来自纯文本、Office 文档（docx、xlsx、pptx）和 PDF 的文字层，单个文件最多取 1 MiB，PDF 最多 2000 页。图片中的文字靠 OCR；没有文字层的扫描版 PDF 目前不做 OCR。

缺少依赖（比如没装 ffmpeg、没下载本地模型）时，对应的步骤记为跳过，装好后自动补做。

处理程序升级或者换了模型，只重新处理受影响的那一步，不会把整个流水线从头再跑一遍。

图中绿色的步骤用到 AI 模型，属于专业版功能，数据去向见[隐私与安全](./privacy#ai)。

## 任务队列 {#jobs}

扫描以外的处理都放进任务队列，存在数据库中，重启后继续。

| 资源类别 | 默认并发 | 做什么 |
|---|---|---|
| io | 4 | 扫描、识别、哈希、复制 |
| media | 2 | 缩略图、提取文字（子进程） |
| model | 1 | 本地模型推理：OCR、向量、AI 标签、日期提取 |
| remote | 4 | 下载模型、离线下载、发送通知 |

失败的任务 30 秒后重试，之后每次等待时间加倍（带一点随机抖动），最长 6 小时，默认最多 5 次。

云端 AI 被限流、超出了花费上限、还没有专业版授权，都不算失败，只是延后。激活专业版后，等着的任务自动继续，显示为"等待专业版授权"。

同一个文件连续改了好几次，排队中的任务只会更新成最新的输入，只处理最后一次。

任务执行时带着输入的版本（内容、处理程序版本、模型），写结果前核对一下。处理期间文件被改写了、或者换了模型，这次的结果直接丢掉，免得旧结果盖掉新文件。

进度按任务组和阶段计数，显示在侧栏的「后台任务」中，也可以用 `keepbay index:status` 查看。

## 文件操作 {#file-ops}

移动、复制、删除、改名都记录在操作记录中，**先落盘记录、再改动文件**，中途断电或崩溃都不会丢文件：

```mermaid
stateDiagram-v2
    [*] --> 准备中: 写入操作明细
    准备中 --> 准备完成: 提交并落盘
    准备中 --> [*]: 中断：直接取消，没碰过文件
    准备完成 --> 执行中: 逐项执行，记录每个对象的身份
    执行中 --> 完成
    执行中 --> 冲突: 身份对不上
    执行中 --> 执行中: 中断：启动时按记录核对后补完
    完成 --> 已撤销: 撤销（核对身份后反向执行）
    冲突 --> [*]: 保留所有文件，提示用户处理
```

Keepbay 从不覆盖文件。

支持 `renameat2(RENAME_NOREPLACE)` 的文件系统（ext4、btrfs、xfs 等）直接用它。不支持的（比如 NFS）用硬链接或占位目录来实现同样的效果，整个过程不按您能看到的名字删除任何东西。

恢复和撤销时，Keepbay 按记录下来的设备号、inode、大小、修改时间核对文件是不是当初那一个，而不只是看路径还在不在。

假如原来的位置上出现了一个同名的新文件，它不会被当成"待清理的旧文件"删掉。对不上的一律保留所有文件，把操作标记为冲突，交给您处理。

跨磁盘移动时，先复制到目标位置的临时文件。全部复制成功、源文件期间也没被改过，才把源文件移进回收站。

复制到一半断电，源文件还是完整的，没复制完的临时文件在下次启动恢复时重新处理。

回收站在文件夹根目录的 `.keepbay-trash/` 中（文件夹里嵌套了别的磁盘时，那块磁盘有自己的回收站）。它和文件在同一块磁盘上，删除就是改个名，再大的文件夹也很快，默认保留 30 天。

编辑保存、上传时选择替换，也是先写临时文件，替换前再核对一次旧文件没被别处改过，旧文件进回收站。

## AI 调用 {#ai-gateway}

所有 AI 调用都经过 AI Gateway，按顺序检查，任何一项不通过都不会发出请求：

```mermaid
flowchart TD
    call["AI 调用<br/>功能 · 发起人 · 涉及的文件"] --> f1{"所有者开启了<br/>这项功能？"}
    f1 -->|是| f2{"专业版授权？"}
    f2 -->|是| f3{"涉及的文件都允许<br/>AI 处理？"}
    f3 -->|是| model["按功能选定模型"]
    model --> local{"本地模型？"}
    local -->|是| run["调用"]
    local -->|否：云端| c1{"后台功能用云端<br/>已单独允许？"}
    c1 -->|是| c2{"成员有<br/>云端 AI 权限？"}
    c2 -->|是| c3{"未超出每月花费上限<br/>和每分钟请求数？"}
    c3 -->|是| run
    c3 -->|否| later["延后执行"]
    run --> rec["写入 AI 调用记录"]

    f1 & f2 & f3 & c1 & c2 -->|否| deny["拒绝"]

    style run fill:#ecfdf5,stroke:#10b981
    style deny fill:#fff4e6,stroke:#f59e0b
    style later fill:#fff4e6,stroke:#f59e0b
```

本地还是云端按接口地址判断，不让人勾选。

回环地址、局域网地址、不带点的主机名、`.local` 等后缀算本地，比如本机或局域网里的 Ollama；其余都算云端，必须用 HTTPS。

本地模型目前有三个，通过 ONNX Runtime 运行：

- bge-small-zh-v1.5：文本向量
- Chinese-CLIP ViT-B/16：图像向量
- PP-OCRv5 mobile：文字识别

模型清单用 ed25519 签名，下载后核对 SHA256。

云端厂商预设了 OpenAI、DeepSeek、通义千问、豆包、Kimi、智谱、硅基流动、OpenRouter、Gemini、Ollama，也可以自定义，全部按 OpenAI 兼容接口调用。

每次实际发出的调用都记在调用记录中，不保存内容本身，见[隐私与安全](./privacy#ai)。

## 媒体处理的隔离 {#sandbox}

libvips、libraw 等解码库用 C 编写，恶意构造的图片可能触发内存错误。

只限制资源不够，被利用的解码器仍能读写文件、读取密钥、联网。因此解码在受限的子进程中进行：

```mermaid
sequenceDiagram
    participant M as 主进程
    participant W as 子进程 keepbay worker
    M->>M: 经 fsx 安全打开文件（只读）
    M->>W: 启动，清空环境变量
    W->>W: 初始化解码库，各格式预热一次
    W->>W: 安装 seccomp 过滤器（所有线程）<br/>叠加 Landlock（内核支持时）
    M->>W: 传入只读的文件描述符
    W->>W: 解码、生成缩略图
    W-->>M: 结果经管道返回
    Note over W: 不能打开任何文件、不能联网<br/>不能写文件、不能执行其他程序
```

seccomp 过滤器禁止打开文件、建立网络连接、删除、改名、修改权限、执行其他程序、调试其他进程。内核 7.0 及以上再叠加 Landlock，作为第二层。

子进程的地址空间上限 4 GiB，不能写普通文件。每个任务 2 分钟超时，处理 500 个任务后换一个新的子进程。子进程崩溃只会让这一个文件处理失败。

ffmpeg 是外部程序，启动时要加载自己的动态库，没法禁止它打开文件。我们给它装一个宽一些的过滤器：只能以只读方式打开文件，不能写入、联网、建进程，输入从标准输入传进去。

PDF 则用 PDFium 的 WebAssembly 版本在主进程里解析，不挂载任何宿主目录，每个实例最多 256 MiB 内存。

内核不支持 seccomp 时，Keepbay 不会在没有隔离的情况下解码照片和视频。浏览器能直接显示的图片和视频不经过解码，照样能预览，见[安装](./install#nas)。

这是纵深防御，用来大幅提高利用的难度，不承诺绝对隔离。

## 授权验证 {#license}

专业版的授权证书是 `base64url(内容).base64url(ed25519 签名)`，公钥编译在程序中，**验证在本地离线完成**：

```mermaid
sequenceDiagram
    participant K as Keepbay
    participant C as 授权中心 huohuastudio.com
    K->>C: 联网激活：授权码 + 安装 ID
    C-->>K: 签发证书
    K->>K: 验签，写入 license.cert
    Note over K: 之后每次启动都在本地验签<br/>不联网
    K->>C: 有期限的授权：到期前 7 天自动续期
```

激活后验证在本地完成，不能上网的设备可以直接导入证书文件。安装 ID 是什么、什么时候会联网续期，见[隐私与安全](./privacy#outbound)。

有期限的授权到期后有 7 天宽限期，之后降级为免费版。

已有的标签、提醒、向量都保留，重新激活后立即可用，您的文件不受任何影响。
